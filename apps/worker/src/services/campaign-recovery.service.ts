import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Queue } from 'bullmq';

type RecoverableRecipient = {
    id: string;
    campaignId: string;
    lastStepOrder: number;
    nextStepOrder: number | null;
    nextStepAt: Date | null;
    status: string;
};

@Injectable()
export class CampaignRecoveryService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CampaignRecoveryService.name);
    private reconciliationTimer: NodeJS.Timeout | null = null;
    private isReconciling = false;

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
    ) {}

    onModuleInit() {
        void this.reconcileScheduledRecipients('startup');

        const intervalMs = parseInt(process.env.CAMPAIGN_RECOVERY_INTERVAL_MS ?? '60000', 10);
        this.reconciliationTimer = setInterval(() => {
            void this.reconcileScheduledRecipients('interval');
        }, Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : 60000);
    }

    onModuleDestroy() {
        if (this.reconciliationTimer) {
            clearInterval(this.reconciliationTimer);
            this.reconciliationTimer = null;
        }
    }

    private buildStepJobId(campaignId: string, recipientId: string, stepOrder: number) {
        return `campaign-${campaignId}-recipient-${recipientId}-step-${stepOrder}`;
    }

    private async reconcileScheduledRecipients(reason: 'startup' | 'interval') {
        if (this.isReconciling) {
            return;
        }

        this.isReconciling = true;

        try {
            const runningCampaigns = await this.prisma.campaign.findMany({
                where: { status: 'RUNNING' },
                select: {
                    id: true,
                    sequenceSteps: {
                        select: {
                            order: true,
                        },
                    },
                },
            });

            if (runningCampaigns.length === 0) {
                return;
            }

            const sequenceOrderMap = new Map<string, Set<number>>();
            for (const campaign of runningCampaigns) {
                const orders = new Set<number>();

                for (const step of campaign.sequenceSteps) {
                    const order = typeof step?.order === 'number' ? step.order : null;
                    if (order && order > 0) {
                        orders.add(order);
                    }
                }

                sequenceOrderMap.set(campaign.id, orders);
            }

            const recoverableRecipients = (await (this.prisma as any).campaignRecipient.findMany({
                where: {
                    campaignId: { in: runningCampaigns.map((campaign) => campaign.id) },
                    status: 'SCHEDULED',
                },
                select: {
                    id: true,
                    campaignId: true,
                    lastStepOrder: true,
                    nextStepOrder: true,
                    nextStepAt: true,
                    status: true,
                },
            })) as RecoverableRecipient[];

            const now = Date.now();
            let requeuedCount = 0;

            for (const recipient of recoverableRecipients) {
                const availableOrders = sequenceOrderMap.get(recipient.campaignId) ?? new Set<number>();
                const expectedStepOrder =
                    recipient.nextStepOrder ??
                    (recipient.lastStepOrder > 0 ? recipient.lastStepOrder + 1 : 1);

                if (!availableOrders.has(expectedStepOrder)) {
                    if (recipient.nextStepOrder !== null || recipient.nextStepAt !== null) {
                        await (this.prisma as any).campaignRecipient.update({
                            where: { id: recipient.id },
                            data: {
                                nextStepOrder: null,
                                nextStepAt: null,
                            },
                        });
                    }
                    continue;
                }

                const recoveredNextStepAt =
                    recipient.nextStepAt && recipient.nextStepAt.getTime() > 0
                        ? recipient.nextStepAt
                        : new Date();

                if (recipient.nextStepOrder === null || recipient.nextStepAt === null) {
                    await (this.prisma as any).campaignRecipient.update({
                        where: { id: recipient.id },
                        data: {
                            nextStepOrder: expectedStepOrder,
                            nextStepAt: recoveredNextStepAt,
                        },
                    });
                }

                const delayMs = Math.max(recoveredNextStepAt.getTime() - now, 0);
                const jobId = this.buildStepJobId(
                    recipient.campaignId,
                    recipient.id,
                    expectedStepOrder
                );
                const existingJob = await this.campaignQueue.getJob(jobId);

                if (existingJob) {
                    const state = await existingJob.getState();
                    if (state === 'completed' || state === 'failed') {
                        await existingJob.remove();
                    } else {
                        continue;
                    }
                }

                await this.campaignQueue.add(
                    'process-step',
                    {
                        campaignId: recipient.campaignId,
                        recipientId: recipient.id,
                        stepOrder: expectedStepOrder,
                    },
                    {
                        jobId,
                        delay: delayMs,
                    },
                );

                requeuedCount += 1;
            }

            if (requeuedCount > 0) {
                this.logger.log(
                    `[RECOVERY:${reason}] Re-queued ${requeuedCount} scheduled campaign step(s) after reconciliation`,
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown reconciliation error';
            this.logger.error(`[RECOVERY:${reason}] ${message}`, error instanceof Error ? error.stack : undefined);
        } finally {
            this.isReconciling = false;
        }
    }
}
