import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '@ori-os/db/nestjs';
import { IntelligenceController } from '../intelligence.controller';
import { IntelligenceService } from '../intelligence.service';
import { HunterProvider } from './providers/hunter.provider';
import { ApolloProvider } from './providers/apollo.provider';
import { WebsiteScraperProvider } from './providers/website-scraper.provider';
import { AiService } from '../ai.service';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({ name: 'intelligence-job' }),
    ],
    controllers: [IntelligenceController],
    providers: [
        IntelligenceService,
        HunterProvider,
        ApolloProvider,
        WebsiteScraperProvider,
        AiService,
    ],
    exports: [IntelligenceService],
})
export class IntelligenceModule { }
