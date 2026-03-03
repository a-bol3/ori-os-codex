import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { IntelligenceService } from './intelligence.service';
import { IntelligenceController } from './intelligence.controller';
import { HunterProvider } from './providers/hunter.provider';
import { ApolloProvider } from './providers/apollo.provider';
import { WebsiteScraperProvider } from './providers/website-scraper.provider';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'intelligence-enrich',
        }),
    ],
    controllers: [IntelligenceController],
    providers: [
        IntelligenceService,
        HunterProvider,
        ApolloProvider,
        WebsiteScraperProvider,
        PrismaService,
    ],
    exports: [IntelligenceService, BullModule],
})
export class IntelligenceModule { }
