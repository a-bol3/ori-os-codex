import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSEOProjectDto, UpdateSEOProjectDto, CreateSEOKeywordDto } from './dto/seo.dto';

@Injectable()
export class SEOService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    // Projects
    async findAllProjects() {
        return this.db.sEOProject.findMany({
            include: {
                _count: {
                    select: { keywords: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    async findOneProject(id: string) {
        return this.db.sEOProject.findUnique({
            where: { id },
            include: {
                keywords: {
                    include: {
                        rankings: {
                            take: 1,
                            orderBy: { date: 'desc' }
                        }
                    }
                }
            }
        });
    }

    async createProject(dto: CreateSEOProjectDto) {
        return this.db.sEOProject.create({
            data: dto
        });
    }

    async updateProject(id: string, dto: UpdateSEOProjectDto) {
        return this.db.sEOProject.update({
            where: { id },
            data: dto
        });
    }

    async removeProject(id: string) {
        return this.db.sEOProject.delete({
            where: { id }
        });
    }

    // Keywords
    async addKeyword(projectId: string, dto: CreateSEOKeywordDto) {
        return this.db.sEOKeyword.create({
            data: {
                ...dto,
                projectId
            }
        });
    }

    async removeKeyword(id: string) {
        return this.db.sEOKeyword.delete({
            where: { id }
        });
    }

    async getProjectKeywords(projectId: string) {
        return this.db.sEOKeyword.findMany({
            where: { projectId },
            include: {
                rankings: {
                    take: 7, // Last week
                    orderBy: { date: 'desc' }
                }
            }
        });
    }
}
