import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Queue } from 'bullmq';

@Injectable()
export class RankingsService {
  private rankingQueue: Queue;

  constructor(private readonly prisma: PrismaService) {
    // Initialize BullMQ queue
    this.rankingQueue = new Queue('seo-rank-check', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });
  }

  async checkRankings(
    projectId: string,
    organizationId: string,
    keywordIds?: string[],
  ) {
    // Verify project exists and belongs to organization
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    // Queue ranking check job
    await this.rankingQueue.add('check-rankings', {
      projectId,
      keywordIds: keywordIds || [],
    });

    return {
      message: 'Ranking check queued successfully',
      projectId,
      keywordsToCheck: keywordIds?.length || 'all',
    };
  }

  async getRankings(projectId: string, organizationId: string, filters?: any) {
    // Verify project belongs to organization
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    const where: any = {
      projectId,
    };

    if (filters?.keywordIds && filters.keywordIds.length > 0) {
      where.keywordId = { in: filters.keywordIds };
    }

    if (filters?.device) {
      where.device = filters.device;
    }

    if (filters?.days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - filters.days);
      where.checkedAt = { gte: startDate };
    }

    const rankings = await (this.prisma as any).sEORanking.findMany({
      where,
      include: {
        keyword: {
          select: {
            id: true,
            keyword: true,
            targetUrl: true,
            priority: true,
          },
        },
      },
      orderBy: { checkedAt: 'desc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEORanking.count({ where });

    return {
      data: rankings,
      total,
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    };
  }

  async getRankingSummary(
    projectId: string,
    organizationId: string,
    days: number = 30,
  ) {
    // Verify project belongs to organization
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
      include: {
        keywords: {
          where: { tracked: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get latest rankings for each keyword
    const latestRankings = await (this.prisma as any).sEORanking.findMany({
      where: {
        projectId,
        checkedAt: { gte: startDate },
      },
      include: {
        keyword: true,
      },
      orderBy: { checkedAt: 'desc' },
    });

    // Group by keyword and get latest
    const rankingsByKeyword = new Map();
    for (const ranking of latestRankings) {
      if (!rankingsByKeyword.has(ranking.keywordId)) {
        rankingsByKeyword.set(ranking.keywordId, ranking);
      }
    }

    const rankings = Array.from(rankingsByKeyword.values());

    // Calculate summary stats
    const totalKeywords = project.keywords.length;
    const trackedKeywords = rankings.length;
    const avgPosition =
      rankings.length > 0
        ? rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length
        : 0;

    const top3Keywords = rankings.filter((r) => r.position <= 3).length;
    const top10Keywords = rankings.filter((r) => r.position <= 10).length;
    const top20Keywords = rankings.filter((r) => r.position <= 20).length;

    // Calculate improvements and declines
    const improved = rankings.filter(
      (r) => r.prevPosition && r.position < r.prevPosition,
    ).length;
    const declined = rankings.filter(
      (r) => r.prevPosition && r.position > r.prevPosition,
    ).length;
    const unchanged = rankings.filter(
      (r) => r.prevPosition && r.position === r.prevPosition,
    ).length;

    return {
      totalKeywords,
      trackedKeywords,
      avgPosition: Math.round(avgPosition * 10) / 10,
      distribution: {
        top3: top3Keywords,
        top10: top10Keywords,
        top20: top20Keywords,
        beyond20: trackedKeywords - top20Keywords,
      },
      changes: {
        improved,
        declined,
        unchanged,
      },
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    };
  }
}
