
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Processor('campaign-queue')
export class CampaignProcessor extends WorkerHost {
    private readonly logger = new Logger(CampaignProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('email-queue') private readonly emailQueue: Queue,
        @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
        @InjectQueue('workflow-run') private readonly workflowQueue: Queue
    ) {
        super();
    }
    Joe

    async process(job: Job<any, any, string>): Promise<any> {
        const { campaignId, recipientId, stepOrder } = job.data;
        this.logger.log(`Processing campaign ${campaignId} for recipient ${recipientId} at step ${stepOrder}`);

        // 1. Fetch the campaign step
        const step = await (this.prisma as any).sequenceStep.findFirst({
            where: { campaignId, order: stepOrder }
        });

        if (!step) {
            this.logger.log(`No more steps for recipient ${recipientId} in campaign ${campaignId}`);

            // 1. Mark recipient as completed
            await (this.prisma as any).campaignRecipient.update({
                where: { id: recipientId },
                data: { status: 'COMPLETED' }
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
            this.logger.log(`Dispatching EMAIL for recipient ${recipientId}`);

            // Enqueue email job
            await this.emailQueue.add('send-email', {
                campaignId,
                recipientId,
                templateId: step.templateId,
                stepId: step.id
            });

            // Schedule the NEXT step immediately (next order)
            await this.campaignQueue.add('process-step', {
                campaignId,
                recipientId,
                stepOrder: stepOrder + 1
            });

        } else if (step.stepType === 'WAIT') {
            const delayDays = step.configJson?.days || 1;
            this.logger.log(`Recipient ${recipientId} entering WAIT for ${delayDays} days`);

            // Schedule the NEXT step with a delay
            await this.campaignQueue.add('process-step', {
                campaignId,
                recipientId,
                stepOrder: stepOrder + 1
            }, {
                delay: delayDays * 24 * 60 * 60 * 1000
            });
        }

        // Update recipient last step
        await (this.prisma as any).campaignRecipient.update({
            where: { id: recipientId },
            data: { lastStepOrder: stepOrder }
        });

        return { status: 'success', stepProcessed: step.id };
    }
}
