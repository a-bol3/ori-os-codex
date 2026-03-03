import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AlertsService } from '../alerts.service';

@Processor('seo-rank-check')
@Injectable()
export class SEORankCheckProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { projectId, keywordIds } = job.data;

    console.log(
      `[SEO Rank Check] Checking ranks for project ${projectId}, ${keywordIds?.length || 'all'} keywords`,
    );

    try {
      // Get keywords to check
      const keywords = await (this.prisma as any).sEOKeyword.findMany({
        where: {
          projectId,
          ...(keywordIds && keywordIds.length > 0
            ? { id: { in: keywordIds } }
            : {}),
          tracked: true,
        },
      });

      console.log(
        `[SEO Rank Check] Found ${keywords.length} keywords to check`,
      );

      const results = [] as any[];

      for (const keyword of keywords) {
        try {
          // In production, this would make actual API calls to rank tracking services
          // For now, we'll simulate rank checking
          const rankData = await this.checkKeywordRank(keyword.keyword);

          // Create new ranking record
          const ranking = await (this.prisma as any).sEORanking.create({
            data: {
              projectId,
              keywordId: keyword.id,
              position: rankData.position,
              prevPosition: keyword.lastPosition || null,
              hasSnippet: rankData.hasSnippet,
              hasPAA: rankData.hasPAA,
              hasImages: rankData.hasImages,
              hasVideos: rankData.hasVideos,
              hasLocalPack: rankData.hasLocalPack,
              device: 'desktop',
              location: 'US',
              searchEngine: 'google',
            },
          });

          // Update keyword with last position
          await (this.prisma as any).sEOKeyword.update({
            where: { id: keyword.id },
            data: {
              lastPosition: rankData.position,
            },
          });

          // Check for significant rank changes and create alerts
          if (keyword.lastPosition) {
            const change = keyword.lastPosition - rankData.position;

            // Alert on significant drops (5+ positions)
            if (change < -5) {
              await this.createRankAlert(projectId, keyword, change, 'drop');
            }
            // Alert on positive changes (Entering top 3 or top 10)
            else if (change > 0) {
              if (rankData.position <= 3 && keyword.lastPosition > 3) {
                await this.createRankAlert(projectId, keyword, change, 'top3');
              } else if (rankData.position <= 10 && keyword.lastPosition > 10) {
                await this.createRankAlert(projectId, keyword, change, 'top10');
              }
            }
          }

          results.push({
            keywordId: keyword.id,
            keyword: keyword.keyword,
            position: rankData.position,
            change: keyword.lastPosition
              ? keyword.lastPosition - rankData.position
              : null,
          });

          // Add delay to avoid rate limiting in production
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(
            `[SEO Rank Check] Error checking keyword ${keyword.id}:`,
            error,
          );
        }
      }

      console.log(
        `[SEO Rank Check] Completed rank check for project ${projectId}`,
      );

      return {
        projectId,
        keywordsChecked: results.length,
        results,
      };
    } catch (error) {
      console.error(`[SEO Rank Check] Error in rank check job:`, error);
      throw error;
    }
  }

  private async checkKeywordRank(keyword: string): Promise<any> {
    // Mock implementation - in production, use actual rank tracking APIs
    // like SERPWatcher, AccuRanker, or custom Google Search API integration

    const position = Math.floor(Math.random() * 50) + 1; // Random position 1-50

    return {
      position,
      hasSnippet: Math.random() > 0.7,
      hasPAA: Math.random() > 0.5,
      hasImages: Math.random() > 0.6,
      hasVideos: Math.random() > 0.8,
      hasLocalPack: Math.random() > 0.9,
    };
  }

  private async createRankAlert(
    projectId: string,
    keyword: any,
    change: number,
    type: 'drop' | 'top3' | 'top10',
  ): Promise<void> {
    try {
      // Get organization ID from project first to verify it exists and we have the ID to pass to createAlert
      const project = await (this.prisma as any).sEOProject.findUnique({
        where: { id: projectId },
      });

      if (!project) return;

      let severity: 'critical' | 'warning' | 'info' = 'info';
      let message = '';
      let alertType: 'rank_drop' | 'rank_gain' = 'rank_gain';

      if (type === 'drop') {
        severity = change < -10 ? 'critical' : 'warning';
        message = `📉 Keyword "${keyword.keyword}" dropped ${Math.abs(change)} positions (${keyword.lastPosition} → ${keyword.lastPosition - change})`;
        alertType = 'rank_drop';
      } else if (type === 'top3') {
        severity = 'info';
        message = `🎉 Keyword "${keyword.keyword}" entered Top 3! (${keyword.lastPosition} → ${keyword.lastPosition - change})`;
        alertType = 'rank_gain';
      } else if (type === 'top10') {
        severity = 'info';
        message = `🚀 Keyword "${keyword.keyword}" entered Top 10! (${keyword.lastPosition} → ${keyword.lastPosition - change})`;
        alertType = 'rank_gain';
      }

      await this.alertsService.createAlert(projectId, project.organizationId, {
        type: alertType,
        severity,
        title: 'Rank Change',
        message,
        metadata: {
          keywordId: keyword.id,
          keyword: keyword.keyword,
          previousPosition: keyword.lastPosition,
          currentPosition: keyword.lastPosition - change,
          change,
        },
      });
    } catch (error) {
      console.error(`[SEO Rank Check] Error creating alert:`, error);
    }
  }
}
