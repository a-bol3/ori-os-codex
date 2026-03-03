import { Module } from '@nestjs/common';
import { PrismaModule } from '@ori-os/db/nestjs';
import { SeoProjectsController } from './seo-projects.controller';
import { SeoKeywordsController } from './seo-keywords.controller';
import { CrawlController } from './crawl.controller';
import { RankingsController } from './rankings.controller';
import { GSCController } from './gsc.controller';
import { ContentAnalysisController } from './content-analysis.controller';
import { BacklinksController } from './backlinks.controller';
import { CompetitorsController } from './competitors.controller';
import { AlertsController } from './alerts.controller';
import { SeoProjectsService } from './seo-projects.service';
import { SeoKeywordsService } from './seo-keywords.service';
import { CrawlService } from './crawl.service';
import { RankingsService } from './rankings.service';
import { ContentAnalysisService } from './content-analysis.service';
import { BacklinksService } from './backlinks.service';
import { CompetitorsService } from './competitors.service';
import { AlertsService } from './alerts.service';
import { GSCService } from './gsc.service';
import { GoogleAutocompleteProvider } from './providers/google-autocomplete.provider';
import { AiService } from '../ai.service';
import { BullModule } from '@nestjs/bullmq';
import { SEORankCheckProcessor } from './processors/rank-check.processor';
import { SEOCrawlProcessor } from './processors/crawl.processor';
import { SEOCompetitorProcessor } from './processors/competitor.processor';
import { SEOGSCSyncProcessor } from './processors/seo-gsc-sync.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue(
      { name: 'seo-rank-check' },
      { name: 'seo-crawl' },
      { name: 'seo-competitor' },
      { name: 'seo-gsc-sync' },
    ),
  ],
  controllers: [
    SeoProjectsController,
    SeoKeywordsController,
    CrawlController,
    RankingsController,
    GSCController,
    ContentAnalysisController,
    BacklinksController,
    CompetitorsController,
    AlertsController,
  ],
  providers: [
    SeoProjectsService,
    SeoKeywordsService,
    CrawlService,
    RankingsService,
    ContentAnalysisService,
    BacklinksService,
    CompetitorsService,
    AlertsService,
    GSCService,
    GoogleAutocompleteProvider,
    AiService,
    SEORankCheckProcessor,
    SEOCrawlProcessor,
    SEOCompetitorProcessor,
    SEOGSCSyncProcessor,
  ],
  exports: [
    SeoProjectsService,
    SeoKeywordsService,
    CrawlService,
    RankingsService,
    ContentAnalysisService,
    BacklinksService,
    CompetitorsService,
    AlertsService,
    GSCService,
  ],
})
export class SeoModule {}
