import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CompetitorsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('seo-competitor') private readonly competitorQueue: Queue,
  ) {}

  async createCompetitor(
    projectId: string,
    organizationId: string,
    data: {
      domain: string;
    },
  ) {
    console.log(
      `[CompetitorsService] Creating competitor for project ${projectId}, org ${organizationId}`,
    );

    // Verify project exists
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    try {
      const competitor = await (this.prisma as any).sEOCompetitor.create({
        data: {
          projectId,
          organizationId,
          domain: data.domain,
        },
      });
      console.log(
        `[CompetitorsService] Competitor created with ID: ${competitor.id}`,
      );
      return competitor;
    } catch (error) {
      console.error(
        `[CompetitorsService] Failed to create competitor: ${error.message}`,
      );
      throw error;
    }
  }

  async getCompetitors(
    projectId: string,
    organizationId: string,
    filters?: any,
  ) {
    const where = {
      projectId,
      organizationId,
    };

    const competitors = await (this.prisma as any).sEOCompetitor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOCompetitor.count({ where });

    return {
      data: competitors,
      total,
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    };
  }

  async getCompetitorById(competitorId: string, organizationId: string) {
    const competitor = await (this.prisma as any).sEOCompetitor.findFirst({
      where: {
        id: competitorId,
        organizationId,
      },
    });

    if (!competitor) {
      throw new NotFoundException('Competitor not found');
    }

    return competitor;
  }

  async updateCompetitor(
    competitorId: string,
    organizationId: string,
    data: {
      domain?: string;
    },
  ) {
    // Verify competitor exists
    const competitor = await this.getCompetitorById(
      competitorId,
      organizationId,
    );

    return (this.prisma as any).sEOCompetitor.update({
      where: { id: competitor.id },
      data,
    });
  }

  async deleteCompetitor(competitorId: string, organizationId: string) {
    // Verify competitor exists
    const competitor = await this.getCompetitorById(
      competitorId,
      organizationId,
    );

    return (this.prisma as any).sEOCompetitor.delete({
      where: { id: competitor.id },
    });
  }

  async checkCompetitorRankings(competitorId: string, organizationId: string) {
    // Verify competitor exists
    const competitor = await this.getCompetitorById(
      competitorId,
      organizationId,
    );

    // Add to queue
    await this.competitorQueue.add('check-competitor', {
      competitorId: competitor.id,
      url: competitor.domain,
    });

    return {
      competitorId: competitor.id,
      status: 'queued',
      message: 'Competitor check queued',
    };
  }
}
