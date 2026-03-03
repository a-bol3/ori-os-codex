import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class SeoProjectsService {
  constructor(private prisma: PrismaService) { }

  async findAll(organizationId: string): Promise<any> {
    return this.prisma.sEOProject.findMany({
      where: { organizationId },
      include: {
        company: true,
        creator: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            keywords: true,
            crawls: true,
            rankings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string): Promise<any> {
    return this.prisma.sEOProject.findFirst({
      where: { id, organizationId },
      include: {
        company: true,
        creator: { select: { id: true, name: true, email: true } },
        keywords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        crawls: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: {
    organizationId: string;
    creatorId: string;
    name: string;
    domain: string;
    description?: string;
    companyId?: string;
    crawlFrequency?: string;
    maxPagesToCrawl?: number;
  }): Promise<any> {
    return this.prisma.sEOProject.create({
      data,
      include: {
        company: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      description?: string;
      crawlFrequency?: string;
      maxPagesToCrawl?: number;
      gscConnected?: boolean;
      gscSiteUrl?: string;
    },
  ) {
    return this.prisma.sEOProject.updateMany({
      where: { id, organizationId },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    return this.prisma.sEOProject.deleteMany({
      where: { id, organizationId },
    });
  }
}
