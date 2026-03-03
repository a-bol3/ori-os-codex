import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { EmailProcessor } from './processors/email.processor';
import { SeoProcessor } from './processors/seo.processor';
import { WorkflowProcessor } from './processors/workflow.processor';
import { IntelligenceProcessor } from './processors/intelligence.processor';
import { IntelligenceService } from './intelligence/intelligence.service';
import { HunterProvider } from './intelligence/hunter.provider';
import { ApolloProvider } from './intelligence/apollo.provider';
import { WebsiteScraperProvider } from './intelligence/website-scraper.provider';

@Module({
    imports: [
        PrismaModule,
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
        }),
        BullModule.registerQueue(
            { name: 'email-send' },
            { name: 'seo-crawl' },
            { name: 'workflow-run' },
            { name: 'intelligence-enrich' }
        ),
    ],
    controllers: [],
    providers: [
        EmailProcessor,
        SeoProcessor,
        WorkflowProcessor,
        IntelligenceProcessor,
        IntelligenceService,
        HunterProvider,
        ApolloProvider,
        WebsiteScraperProvider
    ],
})
export class AppModule { }
