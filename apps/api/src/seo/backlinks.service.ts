import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AlertsService } from './alerts.service';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class BacklinksService {
  private readonly logger = new Logger(BacklinksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {}

  async createBacklink(
    projectId: string,
    organizationId: string,
    data: {
      sourceUrl: string;
      targetUrl: string;
      linkType?: 'dofollow' | 'nofollow';
      domainAuthority?: number;
      anchorText?: string;
    },
  ) {
    // Verify project exists
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    return (this.prisma as any).sEOBacklink.create({
      data: {
        projectId,
        sourceUrl: data.sourceUrl,
        sourceDomain: new URL(data.sourceUrl).hostname,
        targetUrl: data.targetUrl,
        linkType: data.linkType || 'dofollow',
        domainRating: data.domainAuthority || 0,
        anchorText: data.anchorText || '',
        status: 'active',
        lastCheckedAt: new Date(),
      },
    });
  }

  async getBacklinks(projectId: string, organizationId: string, filters?: any) {
    const where: any = {
      projectId,
      project: {
        organizationId,
      },
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.linkType) {
      where.linkType = filters.linkType;
    }

    const backlinks = await (this.prisma as any).sEOBacklink.findMany({
      where,
      orderBy: [{ domainAuthority: 'desc' }, { firstSeen: 'desc' }],
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOBacklink.count({ where });

    // Calculate summary stats
    const stats = await this.getBacklinkSummary(projectId, organizationId);

    return {
      data: backlinks,
      total,
      stats,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  async getBacklinkSummary(projectId: string, organizationId: string) {
    const backlinks = await (this.prisma as any).sEOBacklink.findMany({
      where: {
        projectId,
        project: {
          organizationId,
        },
      },
    });

    const active = backlinks.filter((b: any) => b.status === 'active').length;
    const lost = backlinks.filter((b: any) => b.status === 'lost').length;
    const broken = backlinks.filter((b: any) => b.status === 'broken').length;
    const dofollow = backlinks.filter(
      (b: any) => b.linkType === 'dofollow',
    ).length;
    const nofollow = backlinks.filter(
      (b: any) => b.linkType === 'nofollow',
    ).length;

    const avgDA =
      backlinks.length > 0
        ? backlinks.reduce(
            (sum: number, b: any) => sum + (b.domainAuthority || 0),
            0,
          ) / backlinks.length
        : 0;

    return {
      total: backlinks.length,
      active,
      lost,
      broken,
      dofollow,
      nofollow,
      avgDomainAuthority: Math.round(avgDA * 10) / 10,
    };
  }

  async updateBacklink(
    backlinkId: string,
    organizationId: string,
    data: {
      status?: 'active' | 'lost' | 'broken';
      domainAuthority?: number;
    },
  ) {
    // Verify backlink exists
    const backlink = await (this.prisma as any).sEOBacklink.findFirst({
      where: { id: backlinkId },
      include: { project: true },
    });

    if (!backlink || backlink.project.organizationId !== organizationId) {
      throw new NotFoundException('Backlink not found');
    }

    const updatedBacklink = await (this.prisma as any).sEOBacklink.update({
      where: { id: backlinkId },
      data: {
        ...data,
        lastCheckedAt: new Date(),
      },
    });

    // Trigger alert if status changes to lost or broken
    if (data.status && data.status !== backlink.status) {
      if (data.status === 'lost') {
        await this.alertsService.createAlert(
          backlink.projectId,
          organizationId,
          {
            type: 'backlink_lost',
            severity: 'warning',
            title: 'Backlink Lost',
            message: `Backlink from ${backlink.sourceUrl} was lost`,
            metadata: {
              backlinkId,
              sourceUrl: backlink.sourceUrl,
              previousStatus: backlink.status,
              newStatus: 'lost',
            },
          },
        );
      } else if (data.status === 'broken') {
        await this.alertsService.createAlert(
          backlink.projectId,
          organizationId,
          {
            type: 'backlink_lost',
            severity: 'warning',
            title: 'Backlink Broken',
            message: `Backlink from ${backlink.sourceUrl} is broken`,
            metadata: {
              backlinkId,
              sourceUrl: backlink.sourceUrl,
              previousStatus: backlink.status,
              newStatus: 'broken',
            },
          },
        );
      }
    }

    return updatedBacklink;
  }

  async verifyBacklink(backlinkId: string, organizationId: string) {
    const backlink = await (this.prisma as any).sEOBacklink.findFirst({
      where: { id: backlinkId },
      include: { project: true },
    });

    if (!backlink || backlink.project.organizationId !== organizationId) {
      throw new NotFoundException('Backlink not found');
    }

    this.logger.log(
      `🔍 Verifying backlink from ${backlink.sourceUrl} targeting ${backlink.targetUrl}`,
    );

    try {
      const response = await axios.get(backlink.sourceUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'ORI-OS-SEO-Bot/1.0' },
      });
      const $ = cheerio.load(response.data);

      let found = false;
      let linkType = 'dofollow';
      let anchorText = '';

      $('a').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;

        // Normalize target URLs for comparison
        try {
          const absTarget = new URL(backlink.targetUrl).href;
          const absHref = new URL(href, backlink.sourceUrl).href;

          if (absHref === absTarget) {
            found = true;
            anchorText = $(el).text().trim();
            const rel = $(el).attr('rel') || '';
            linkType = rel.includes('nofollow') ? 'nofollow' : 'dofollow';
            return false; // Break loop
          }
        } catch (e) {
          // Invalid URL in href
        }
      });

      const newStatus = found ? 'active' : 'lost';

      if (newStatus !== backlink.status) {
        await this.updateBacklink(backlinkId, organizationId, {
          status: newStatus as any,
          // If active, update secondary data
          ...(found ? { anchorText, linkType } : {}),
        } as any);
      } else {
        // Just update checked timestamp
        await (this.prisma as any).sEOBacklink.update({
          where: { id: backlinkId },
          data: { lastCheckedAt: new Date() },
        });
      }

      return {
        id: backlinkId,
        status: newStatus,
        found,
        anchorText,
        linkType,
      };
    } catch (error) {
      this.logger.error(
        `Failed to verify backlink ${backlinkId}: ${error.message}`,
      );

      // If it's a 404 or connection error, mark as broken
      if (error.response?.status === 404 || error.code === 'ECONNABORTED') {
        await this.updateBacklink(backlinkId, organizationId, {
          status: 'broken',
        });
        return { id: backlinkId, status: 'broken', error: error.message };
      }

      return { id: backlinkId, status: backlink.status, error: error.message };
    }
  }

  async deleteBacklink(backlinkId: string, organizationId: string) {
    // Verify backlink exists
    const backlink = await (this.prisma as any).sEOBacklink.findFirst({
      where: { id: backlinkId },
      include: { project: true },
    });

    if (!backlink || backlink.project.organizationId !== organizationId) {
      throw new NotFoundException('Backlink not found');
    }

    return (this.prisma as any).sEOBacklink.delete({
      where: { id: backlinkId },
    });
  }
}
