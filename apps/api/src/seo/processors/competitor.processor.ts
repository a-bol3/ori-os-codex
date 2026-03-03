import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AlertsService } from '../alerts.service';
import * as cheerio from 'cheerio';

@Processor('seo-competitor')
@Injectable()
export class SEOCompetitorProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { competitorId } = job.data;
    console.log(`[SEO Competitor] Checking competitor ${competitorId}`);

    try {
      const competitor = await (this.prisma as any).sEOCompetitor.findUnique({
        where: { id: competitorId },
        include: { project: true },
      });

      if (!competitor) throw new Error('Competitor not found');

      // 1. Fetch content
      const response = await fetch(competitor.domain);
      if (!response.ok)
        throw new Error(
          `Failed to fetch ${competitor.domain}: ${response.statusText}`,
        );
      const html = await response.text();

      // 2. Parse content
      const $ = cheerio.load(html);
      const title = $('title').text();
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      const wordCount = text.split(' ').length;

      // Detect RSS Feed
      let rssUrl =
        $('link[type="application/rss+xml"]').attr('href') ||
        $('link[type="application/atom+xml"]').attr('href');
      if (rssUrl && !rssUrl.startsWith('http')) {
        const baseUrl = new URL(competitor.domain);
        rssUrl = new URL(rssUrl, baseUrl.origin).toString();
      }

      // 3. Compare with previous state
      const changes: string[] = [];
      if (
        competitor.metadata &&
        competitor.metadata.lastTitle &&
        competitor.metadata.lastTitle !== title
      ) {
        changes.push(
          `Title changed: "${competitor.metadata.lastTitle}" -> "${title}"`,
        );
      }

      // 4. Update Competitor Record
      await (this.prisma as any).sEOCompetitor.update({
        where: { id: competitorId },
        data: {
          lastCrawledAt: new Date(),
          metadata: {
            ...(competitor.metadata || {}),
            lastTitle: title,
            wordCount,
            rssUrl,
          },
        },
      });

      // 5. Trigger Alerts if significant changes
      // For now, alert if we detect a new RSS feed or title change
      if (changes.length > 0) {
        await this.alertsService.createAlert(
          competitor.projectId,
          competitor.project.organizationId,
          {
            type: 'competitor_change',
            severity: 'info',
            title: 'Competitor Update',
            message: `Competitor ${competitor.domain} updated: ${changes.join(', ')}`,
            metadata: {
              competitorId,
              domain: competitor.domain,
              changes,
            },
          },
        );
      }

      return { success: true, changes };
    } catch (error) {
      console.error(
        `[SEO Competitor] Error processing ${competitorId}:`,
        error,
      );
      throw error;
    }
  }
}
