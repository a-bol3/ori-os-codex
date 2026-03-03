import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SeoProjectsService {
    private readonly logger = new Logger(SeoProjectsService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('seo-crawl') private seoQueue: Queue,
    ) { }

    async createProject(data: { name: string; domain: string; organizationId: string }) {
        this.logger.log(`Creating SEO project for ${data.domain}`);

        const project = await this.prisma.sEOProject.create({
            data: {
                name: data.name,
                domain: data.domain,
                organizationId: data.organizationId,
                status: 'pending',
            },
        });

        // Trigger initial crawl
        await this.seoQueue.add('seo-crawl', {
            projectId: project.id,
            domain: data.domain,
        });

        return project;
    }

    async getProjectWithStats(id: string) {
        return this.prisma.sEOProject.findUnique({
            where: { id },
            include: {
                crawls: {
                    include: { issues: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                keywords: true,
            },
        });
    }

    async listProjects(organizationId: string) {
        return this.prisma.sEOProject.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
