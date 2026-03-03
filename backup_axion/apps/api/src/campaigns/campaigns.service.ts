import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignsService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(page = 1, limit = 20, status?: string) {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.db.campaign.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    steps: true,
                    _count: {
                        select: { campaignContacts: true }
                    }
                },
                orderBy: { updatedAt: 'desc' },
            }),
            this.db.campaign.count({ where }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        return this.db.campaign.findUnique({
            where: { id },
            include: {
                steps: { orderBy: { order: 'asc' } },
                campaignContacts: {
                    take: 10,
                    include: { contact: true }
                }
            },
        });
    }

    async create(data: any) {
        const { steps, ...campaignData } = data;
        return this.db.campaign.create({
            data: {
                ...campaignData,
                steps: steps ? {
                    create: steps.map((step: any, index: number) => ({
                        ...step,
                        order: index,
                    })),
                } : undefined,
            },
            include: { steps: true },
        });
    }

    async update(id: string, data: any) {
        const { steps, ...campaignData } = data;

        // Simple update for now. Proper step management would involve upserts/deletes.
        return this.db.campaign.update({
            where: { id },
            data: campaignData,
        });
    }

    async remove(id: string) {
        return this.db.campaign.delete({
            where: { id },
        });
    }
}
