
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { fixtureMode } from '@ori-os/core';

type CampaignSendWindow = {
    days?: number[];
    start?: string;
    end?: string;
    tz?: string;
};

type CampaignSequenceStepConfig = Record<string, unknown> | null | undefined;

@Processor('campaign-queue')
export class CampaignProcessor extends WorkerHost {
    private readonly logger = new Logger(CampaignProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('email-send') private readonly emailQueue: Queue,
        @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
        @InjectQueue('workflow-run') private readonly workflowQueue: Queue
        ) {
        super();
    }

    private buildStepJobId(campaignId: string, recipientId: string, stepOrder: number) {
        return `campaign-${campaignId}-recipient-${recipientId}-step-${stepOrder}`;
    }

    private buildEmailJobId(campaignId: string, recipientId: string, stepOrder: number) {
        return `email-${campaignId}-recipient-${recipientId}-step-${stepOrder}`;
    }

    private parseWaitDays(configJson: CampaignSequenceStepConfig) {
        const raw =
            configJson?.days ??
            configJson?.delayDays ??
            configJson?.waitDays ??
            configJson?.durationDays;
        const parsed = Number(raw);

        return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }

    private getStepString(configJson: CampaignSequenceStepConfig, key: string) {
        const value = configJson?.[key];
        return typeof value === 'string' && value.trim() ? value.trim() : null;
    }

    private buildCampaignEmailContent(step: any, campaign: any) {
        const configJson = step?.configJson ?? {};
        const fixture = fixtureMode('ENABLE_EMAIL_FIXTURES');
        const subject =
            this.getStepString(configJson, 'subject') ??
            this.getStepString(configJson, 'title') ??
            (typeof step?.template?.subject === 'string' && step.template.subject.trim()
                ? step.template.subject.trim()
                : null) ??
            campaign?.name;

        const rawHtml =
            this.getStepString(configJson, 'html') ??
            this.getStepString(configJson, 'body') ??
            this.getStepString(configJson, 'bodyHtml') ??
            this.getStepString(configJson, 'text') ??
            (typeof step?.template?.bodyHtml === 'string' && step.template.bodyHtml.trim()
                ? step.template.bodyHtml.trim()
                : null) ??
            (typeof step?.template?.bodyText === 'string' && step.template.bodyText.trim()
                ? step.template.bodyText.trim()
                : null) ??
            (fixture ? '<p>ORI-OS fixture email</p>' : undefined);

        if (!subject || !rawHtml) {
            throw new Error(`EMAIL_CONTENT_MISSING: campaign ${campaign?.id ?? 'unknown'} requires subject and body`);
        }

        return { subject, html: rawHtml };
    }

    private async enqueueCampaignStep(
        campaignId: string,
        recipientId: string,
        stepOrder: number,
        delay = 0
    ) {
        const jobId = this.buildStepJobId(campaignId, recipientId, stepOrder);
        const existingJob = await this.campaignQueue.getJob(jobId);

        if (existingJob) {
            const state = await existingJob.getState();
            if (state === 'completed' || state === 'failed') {
                await existingJob.remove();
            } else {
                return existingJob;
            }
        }

        return this.campaignQueue.add(
            'process-step',
            {
                campaignId,
                recipientId,
                stepOrder
            },
            {
                jobId,
                delay: Math.max(delay, 0)
            }
        );
    }

    private parseTimeToMinutes(value?: string, fallback = 0): number {
        if (!value || typeof value !== 'string') {
            return fallback;
        }

        const [hourRaw, minuteRaw] = value.split(':');
        const hour = Number.parseInt(hourRaw, 10);
        const minute = Number.parseInt(minuteRaw ?? '0', 10);

        if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return fallback;
        }

        return hour * 60 + minute;
    }

    private getZonedParts(date: Date, timeZone: string) {
        const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'short',
            hour12: false
        });

        const entries = Object.fromEntries(
            formatter
                .formatToParts(date)
                .filter((part) => part.type !== 'literal')
                .map((part) => [part.type, part.value])
        );

        const weekdayMap: Record<string, number> = {
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6,
            Sun: 7
        };

        const hour = Number.parseInt(entries.hour ?? '0', 10);
        const minute = Number.parseInt(entries.minute ?? '0', 10);
        const second = Number.parseInt(entries.second ?? '0', 10);

        return {
            year: Number.parseInt(entries.year ?? '0', 10),
            month: Number.parseInt(entries.month ?? '1', 10),
            day: Number.parseInt(entries.day ?? '1', 10),
            weekday: weekdayMap[entries.weekday ?? 'Mon'] ?? 1,
            hour,
            minute,
            second,
            totalMinutes: hour * 60 + minute
        };
    }

    private getUtcDateForLocalParts(
        parts: { year: number; month: number; day: number },
        minutes: number,
        timeZone: string
    ): Date {
        const utcGuess = new Date(
            Date.UTC(
                parts.year,
                parts.month - 1,
                parts.day,
                Math.floor(minutes / 60),
                minutes % 60,
                0,
                0
            )
        );

        const zonedGuess = this.getZonedParts(utcGuess, timeZone);
        const guessedLocalMinutes =
            Date.UTC(
                zonedGuess.year,
                zonedGuess.month - 1,
                zonedGuess.day,
                zonedGuess.hour,
                zonedGuess.minute,
                zonedGuess.second,
                0
            ) / 60000;
        const desiredLocalMinutes =
            Date.UTC(
                parts.year,
                parts.month - 1,
                parts.day,
                Math.floor(minutes / 60),
                minutes % 60,
                0,
                0
            ) / 60000;

        return new Date(utcGuess.getTime() - (guessedLocalMinutes - desiredLocalMinutes) * 60000);
    }

    private calculateNextWindowStart(now: Date, sendWindow: CampaignSendWindow): Date | null {
        const timeZone = sendWindow.tz || 'UTC';
        const allowedDays = Array.isArray(sendWindow.days) && sendWindow.days.length > 0
            ? sendWindow.days
            : [1, 2, 3, 4, 5];
        const startMinutes = this.parseTimeToMinutes(sendWindow.start, 9 * 60);
        const endMinutes = this.parseTimeToMinutes(sendWindow.end, 17 * 60);

        if (endMinutes <= startMinutes) {
            return now;
        }

        for (let dayOffset = 0; dayOffset <= 14; dayOffset += 1) {
            const candidateDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
            const zoned = this.getZonedParts(candidateDate, timeZone);

            if (!allowedDays.includes(zoned.weekday)) {
                continue;
            }

            if (dayOffset === 0 && zoned.totalMinutes >= startMinutes && zoned.totalMinutes < endMinutes) {
                return now;
            }

            const localStart = this.getUtcDateForLocalParts(zoned, startMinutes, timeZone);
            if (localStart.getTime() > now.getTime()) {
                return localStart;
            }
        }

        return null;
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { campaignId, recipientId, stepOrder } = job.data;
        this.logger.log(`Processing campaign ${campaignId} for recipient ${recipientId} at step ${stepOrder}`);

        // 1. Fetch the campaign step
        const step = await (this.prisma as any).sequenceStep.findFirst({
            where: { campaignId, order: stepOrder }
        });

        if (!step) {
            this.logger.log(`No more steps for recipient ${recipientId} in campaign ${campaignId}`);

            await (this.prisma as any).campaignRecipient.update({
                where: { id: recipientId },
                data: {
                    nextStepOrder: null,
                    nextStepAt: null
                }
            });

            // 2. Trigger workflow.campaign.completed
            // Fetch campaign and recipient info for context
            const recipient = await (this.prisma as any).campaignRecipient.findUnique({
                where: { id: recipientId },
                include: { contact: true, campaign: true }
            });

            if (recipient) {
                const workflows = await (this.prisma as any).workflow.findMany({
                    where: {
                        organizationId: recipient.campaign.organizationId,
                        triggerType: 'trigger.campaign.completed',
                        status: 'active',
                    },
                });

                for (const workflow of workflows) {
                    await this.workflowQueue.add('workflow-run', {
                        workflowId: workflow.id,
                        triggerPayload: {
                            campaignId: recipient.campaignId,
                            campaignName: recipient.campaign.name,
                            contactId: recipient.contactId,
                            contactEmail: recipient.contact.email,
                            recipientId: recipient.id,
                        },
                    });
                }
            }

            return { status: 'completed' };
        }

        // 2. Execute step based on type
        if (step.stepType === 'EMAIL') {
            const campaign = await (this.prisma as any).campaign.findUnique({
                where: { id: campaignId },
                select: { sendWindowJson: true, name: true }
            });

            const sendWindow = campaign?.sendWindowJson as CampaignSendWindow | null | undefined;
            if (sendWindow) {
                const nextAllowedAt = this.calculateNextWindowStart(new Date(), sendWindow);

                if (nextAllowedAt && nextAllowedAt.getTime() > Date.now()) {
                    const delay = Math.max(nextAllowedAt.getTime() - Date.now(), 1000);
                    this.logger.log(
                        `Deferring EMAIL step ${step.id} for recipient ${recipientId} until ${nextAllowedAt.toISOString()}`
                    );

                    await (this.prisma as any).campaignRecipient.update({
                        where: { id: recipientId },
                        data: {
                            status: 'SCHEDULED',
                            nextStepOrder: stepOrder,
                            nextStepAt: nextAllowedAt
                        }
                    });

                    await this.enqueueCampaignStep(campaignId, recipientId, stepOrder, delay);

                    return { status: 'deferred', resumeAt: nextAllowedAt.toISOString() };
                }
            }

            this.logger.log(`Dispatching EMAIL for recipient ${recipientId}`);

            const { subject, html } = this.buildCampaignEmailContent(step, campaign);

            // Enqueue email job
            await this.emailQueue.add('email-send', {
                campaignId,
                recipientId,
                stepId: step.id,
                subject,
                html
            }, {
                jobId: this.buildEmailJobId(campaignId, recipientId, stepOrder)
            });

            // Progression is advanced by EmailProcessor only after the provider
            // confirms the send. This prevents a bounced email from unlocking
            // later sequence steps.

        } else if (step.stepType === 'WAIT') {
            const delayDays = this.parseWaitDays(step.configJson);
            this.logger.log(`Recipient ${recipientId} entering WAIT for ${delayDays} days`);

            // Schedule the NEXT step with a delay
            const nextStepAt = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);
            await this.enqueueCampaignStep(
                campaignId,
                recipientId,
                stepOrder + 1,
                delayDays * 24 * 60 * 60 * 1000
            );

            await (this.prisma as any).campaignRecipient.update({
                where: { id: recipientId },
                data: {
                    status: 'SCHEDULED',
                    lastStepOrder: stepOrder,
                    lastEventAt: new Date(),
                    nextStepOrder: stepOrder + 1,
                    nextStepAt
                }
            });
        }

        return { status: 'success', stepProcessed: step.id };
    }
}
