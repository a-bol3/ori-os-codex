import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

@Processor('email-send')
export class EmailProcessor extends WorkerHost {
    private readonly logger = new Logger(EmailProcessor.name);
    private resend: Resend;

    constructor(private prisma: PrismaService) {
        super();
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { to, from, subject, html, campaignId, contactId, stepId } = job.data;
        this.logger.log(`Processing email job ${job.id} to ${to}`);

        try {
            const result = await this.resend.emails.send({
                from: from || 'onboarding@resend.dev',
                to,
                subject,
                html,
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            this.logger.log(`Email sent successfully: ${result.data?.id}`);

            // Record activity
            if (contactId) {
                // Note: organizationId should be in job data or looked up
                const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
                if (contact) {
                    await this.prisma.activity.create({
                        data: {
                            organizationId: contact.organizationId,
                            contactId: contact.id,
                            type: 'email_sent',
                            title: 'Email Sent',
                            description: `Campaign email: ${subject}`,
                            occurredAt: new Date(),
                        }
                    });
                }
            }

            return result.data;
        } catch (error: any) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`);
    }
}
