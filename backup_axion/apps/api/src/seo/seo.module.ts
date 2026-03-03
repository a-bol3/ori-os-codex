import { Module } from '@nestjs/common';
import { SEOService } from './seo.service';
import { SEOController } from './seo.controller';
import { SeoProjectsService } from './seo-projects.service';
import { SeoProjectsController } from './seo-projects.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'seo-crawl',
        }),
    ],
    controllers: [SEOController, SeoProjectsController],
    providers: [SEOService, SeoProjectsService],
    exports: [SEOService, SeoProjectsService],
})
export class SEOModule { }
