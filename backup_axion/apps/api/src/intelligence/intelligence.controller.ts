import { Controller, Post, Body, Param } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('intelligence')
export class IntelligenceController {
    constructor(
        private readonly intelligenceService: IntelligenceService,
        @InjectQueue('intelligence-enrich') private enrichQueue: Queue,
    ) { }

    @Post('enrich/:contactId')
    async triggerEnrichment(@Param('contactId') contactId: string, @Body() body: any) {
        await this.enrichQueue.add('enrich', {
            contactId,
            organizationId: body.organizationId || 'default',
            type: body.type || 'all',
        });
        return { success: true, message: 'Enrichment job enqueued' };
    }
}
