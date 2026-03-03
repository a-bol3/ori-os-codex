import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(page = 1, limit = 20, stage?: string, status?: string) {
        const where: any = {};
        if (stage) {
            where.stage = stage;
        }
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.db.deal.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    company: true,
                    primaryContact: true
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.db.deal.count({ where }),
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
        return this.db.deal.findUnique({
            where: { id },
            include: {
                company: true,
                primaryContact: true,
                activities: {
                    take: 10,
                    orderBy: { occurredAt: 'desc' }
                }
            },
        });
    }

    async create(data: any) {
        return this.db.deal.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.db.deal.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.db.deal.delete({
            where: { id },
        });
    }
}
