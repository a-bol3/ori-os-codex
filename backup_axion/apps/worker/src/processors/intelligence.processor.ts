import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntelligenceService } from '../intelligence/intelligence.service';

@Processor('intelligence-enrich')
export class IntelligenceProcessor extends WorkerHost {
    private readonly logger = new Logger(IntelligenceProcessor.name);

    constructor(
        private prisma: PrismaService,
        private intelligenceService: IntelligenceService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { contactId, organizationId, type } = job.data;
        this.logger.log(`Processing enrichment job for contact ${contactId} (type: ${type})`);

        try {
            if (type === 'contact' || type === 'all') {
                await this.intelligenceService.enrichLead(contactId);
            }

            // Additional enrichment types can be added here

            return { success: true };
        } catch (error: any) {
            this.logger.error(`Enrichment job failed for contact ${contactId}: ${error.message}`);
            throw error;
        }
    }
}
