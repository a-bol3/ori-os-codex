import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@ori-os/db/nestjs';
import { EmailProcessor } from './processors/email.processor';
import { CampaignProcessor } from './processors/campaign.processor';
import { SeoProcessor } from './processors/seo.processor';
import { IntelligenceProcessor } from './processors/intelligence.processor';
import { WorkflowProcessor } from './processors/workflow.processor';
import { OperationsProcessor } from './processors/operations.processor';
import { GmailProcessor } from './processors/gmail.processor';
import { HunterProvider } from './providers/hunter.provider';
import { ApolloProvider } from './providers/apollo.provider';
import { WebsiteScraperProvider } from './providers/website-scraper.provider';
import { CampaignRecoveryService } from './services/campaign-recovery.service';

const redisConnection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

@Module({
    imports: [
        PrismaModule,
        BullModule.forRoot({ connection: redisConnection }),
        BullModule.registerQueue(
            { name: 'campaign-queue', connection: redisConnection },
            { name: 'email-send', connection: redisConnection },
            { name: 'workflow-run', connection: redisConnection },
            { name: 'seo-crawl', connection: redisConnection },
            { name: 'intelligence-job', connection: redisConnection },
            { name: 'operations-core', connection: redisConnection },
            { name: 'gmail-sync', connection: redisConnection },
        ),
    ],
    providers: [
        EmailProcessor,
        CampaignProcessor,
        SeoProcessor,
        IntelligenceProcessor,
        WorkflowProcessor,
        OperationsProcessor,
        GmailProcessor,
        CampaignRecoveryService,
        HunterProvider,
        ApolloProvider,
        WebsiteScraperProvider,
    ],
})
export class AppModule { }
