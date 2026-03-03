import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { EmailProcessor } from './processors/email.processor';
import { SeoProcessor } from './processors/seo.processor';
import { IntelligenceProcessor } from './processors/intelligence.processor';
import { HunterProvider } from './providers/hunter.provider';
import { ApolloProvider } from './providers/apollo.provider';
import { WebsiteScraperProvider } from './providers/website-scraper.provider';

const redisConnection = {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

import { WorkflowProcessor } from './processors/workflow.processor';

@Module({
    imports: [
        PrismaModule,
        BullModule.forRoot({ connection: redisConnection }),
        BullModule.registerQueue(
            { name: 'email-send', connection: redisConnection },
            { name: 'workflow-run', connection: redisConnection },
            { name: 'seo-crawl', connection: redisConnection },
            { name: 'intelligence-job', connection: redisConnection },
        ),
    ],
    providers: [
        EmailProcessor,
        SeoProcessor,
        IntelligenceProcessor,
        WorkflowProcessor,
        HunterProvider,
        ApolloProvider,
        WebsiteScraperProvider,
    ],
})
export class AppModule { }