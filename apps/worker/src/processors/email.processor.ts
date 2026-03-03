import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

@Processor('email-send')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { to, from, subject, html, campaignId, contactId } = job.data;

        this.logger.log(`Processing job ${job.id} type=${job.name} to=${to}`);

        if (!process.env.RESEND_API_KEY) {
            this.logger.error('RESEND_API_KEY is not defined');
            throw new Error('RESEND_API_KEY is not defined');
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
            const { data, error } = await resend.emails.send({
                from,
                to,
                subject,
                html,
            });

            if (error) {
                throw error;
            }

            this.logger.log(`Email sent: ${data?.id}`);

            // Update CampaignRecipient status in DB
            await (this.prisma as any).campaignRecipient.update({
                where: {
                    campaignId_contactId: {
                        campaignId,
                        contactId,
                    },
                },
                data: { status: 'SENT' },
            });

            return { success: true, messageId: data?.id };
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);

            try {
                await (this.prisma as any).campaignRecipient.update({
                    where: {
                        campaignId_contactId: {
                            campaignId,
                            contactId,
                        },
                    },
                    // Using BOUNCED as FAILED is not in the schema enum
                    data: { status: 'BOUNCED' },
                });
            } catch (dbError) {
                this.logger.error(`Failed to update recipient status in DB: ${dbError.message}`);
            }

            throw error; // Let BullMQ retry
        }
    }
}
