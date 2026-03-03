import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignLaunchService {
    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('email-send') private readonly emailQueue: Queue,
    ) { }

    async launch(campaignId: string) {
        // Fetch all campaign contacts from Prisma
        const campaign = await (this.prisma as any).campaign.findUnique({
            where: { id: campaignId },
            include: {
                recipients: {
                    where: { status: 'PENDING' },
                    include: { contact: true },
                },
            },
        });

        if (!campaign) {
            throw new NotFoundException('Campaign not found');
        }

        // Guard: Only DRAFT or SCHEDULED (as READY substitute) can be launched
        // Status enum: DRAFT, SCHEDULED, RUNNING, PAUSED, COMPLETED, ARCHIVED
        if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
            throw new Error(`Campaign cannot be launched in status ${campaign.status}`);
        }

        const fromEmail = campaign.fromEmail || process.env.FROM_EMAIL || 'onboarding@resend.dev';
        const fromName = campaign.fromName || 'ORI-OS';

        const jobs: string[] = [];
        for (const recipient of campaign.recipients) {
            if (!recipient.contact?.email) continue;

            const jobData = {
                to: recipient.contact.email,
                from: `${fromName} <${fromEmail}>`,
                subject: campaign.subject || 'Hello from ORI-OS',
                html: campaign.bodyHtml || campaign.bodyText || `<p>Hello ${recipient.firstName || ''}!</p>`,
                campaignId: campaign.id,
                contactId: recipient.contact.id,
            };

            // Enqueue job into email-send queue
            const job = await this.emailQueue.add('email-send', jobData);
            if (job.id) jobs.push(job.id);

            // Update recipient status to SCHEDULED
            await (this.prisma as any).campaignRecipient.update({
                where: { id: recipient.id },
                data: { status: 'SCHEDULED' },
            });
        }

        // Update campaign status to RUNNING (substitute for ACTIVE)
        await (this.prisma as any).campaign.update({
            where: { id: campaignId },
            data: { status: 'RUNNING' },
        });

        return {
            success: true,
            enqueuedCount: jobs.length,
            message: `Enqueued ${jobs.length} jobs for campaign launch.`,
        };
    }
}
