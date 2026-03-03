import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CampaignLaunchService {
    private readonly logger = new Logger(CampaignLaunchService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('email-send') private emailQueue: Queue,
    ) { }

    async launchCampaign(campaignId: string) {
        this.logger.log(`Launching campaign ${campaignId}`);

        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                    take: 1, // Start with first step
                },
            },
        });

        if (!campaign) throw new Error('Campaign not found');

        // Update status to active
        await this.prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'active', startedAt: new Date() },
        });

        // Get contacts in segment
        const contacts = await this.prisma.contact.findMany({
            where: {
                organizationId: campaign.organizationId,
                // In reality, we'd filter by segmentId filters here
            },
        });

        this.logger.log(`Enrolling ${contacts.length} contacts into campaign ${campaignId}`);

        // Create CampaignContacts and queue jobs
        for (const contact of contacts) {
            await this.prisma.campaignContact.create({
                data: {
                    campaignId,
                    contactId: contact.id,
                    status: 'pending',
                    currentStep: 0,
                },
            });

            if (campaign.steps[0]?.type === 'email') {
                await this.emailQueue.add('email-send', {
                    to: contact.email,
                    from: 'onboarding@resend.dev',
                    subject: campaign.steps[0].subject,
                    html: campaign.steps[0].bodyHtml,
                    campaignId,
                    contactId: contact.id,
                    stepId: campaign.steps[0].id,
                });
            }
        }

        return { enrolled: contacts.length };
    }
}
