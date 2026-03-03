import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Queue } from 'bullmq';

@Injectable()
export class CrawlService {
  private crawlQueue: Queue;

  constructor(private readonly prisma: PrismaService) {
    // Initialize BullMQ queue
    this.crawlQueue = new Queue('seo-crawl', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });
  }

  async startCrawl(
    projectId: string,
    organizationId: string,
    maxPages?: number,
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

    // Create crawl record
    const crawl = await (this.prisma as any).sEOCrawl.create({
      data: {
        projectId,
        status: 'pending',
        pagesFound: 0,
        pagesCrawled: 0,
        issuesFound: 0,
        criticalIssues: 0,
        warnings: 0,
      },
    });

    // Queue crawl job
    await this.crawlQueue.add('crawl-site', {
      projectId,
      crawlId: crawl.id,
    });

    return crawl;
  }

  async getCrawls(projectId: string, organizationId: string, filters?: any) {
    const where: any = {
      projectId,
      project: {
        organizationId,
      },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    const crawls = await (this.prisma as any).sEOCrawl.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOCrawl.count({ where });

    return {
      data: crawls,
      total,
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    };
  }

  async getCrawlById(crawlId: string, organizationId: string) {
    const crawl = await (this.prisma as any).sEOCrawl.findFirst({
      where: {
        id: crawlId,
        project: {
          organizationId,
        },
      },
      include: {
        project: true,
      },
    });

    if (!crawl) {
      throw new NotFoundException('Crawl not found');
    }

    return crawl;
  }

  async getIssues(crawlId: string, organizationId: string, filters?: any) {
    // Verify crawl belongs to organization
    await this.getCrawlById(crawlId, organizationId);

    const where: any = {
      crawlId,
    };

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const issues = await (this.prisma as any).sEOIssue.findMany({
      where,
      orderBy: [
        { severity: 'desc' }, // critical first
        { createdAt: 'desc' },
      ],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOIssue.count({ where });

    // Group by severity for summary
    const summary = await (this.prisma as any).sEOIssue.groupBy({
      by: ['severity'],
      where: { crawlId },
      _count: true,
    });

    return {
      data: issues,
      total,
      summary: {
        critical:
          summary.find((s: any) => s.severity === 'critical')?._count || 0,
        warning:
          summary.find((s: any) => s.severity === 'warning')?._count || 0,
        info: summary.find((s: any) => s.severity === 'info')?._count || 0,
      },
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  async updateIssueStatus(
    issueId: string,
    organizationId: string,
    status: string,
  ) {
    // Verify issue exists and belongs to organization
    const issue = await (this.prisma as any).sEOIssue.findFirst({
      where: { id: issueId },
      include: {
        crawl: {
          include: { project: true },
        },
      },
    });

    if (!issue || issue.crawl.project.organizationId !== organizationId) {
      throw new NotFoundException('Issue not found');
    }

    return (this.prisma as any).sEOIssue.update({
      where: { id: issueId },
      data: { status },
    });
  }

  async getPages(crawlId: string, organizationId: string, filters?: any) {
    // Verify crawl belongs to organization
    await this.getCrawlById(crawlId, organizationId);

    const where: any = {
      crawlId,
    };

    if (filters?.statusCode) {
      where.statusCode = filters.statusCode;
    }

    const pages = await (this.prisma as any).sEOPage.findMany({
      where,
      orderBy: { url: 'asc' },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOPage.count({ where });

    return {
      data: pages,
      total,
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    };
  }
}
