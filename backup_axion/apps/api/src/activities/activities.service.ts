import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivitiesService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(page = 1, limit = 20, type?: string) {
        const where: any = {};
        if (type) {
            where.type = type;
        }

        const [data, total] = await Promise.all([
            this.db.activity.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    contact: true,
                    company: true,
                    deal: true,
                },
                orderBy: { occurredAt: 'desc' },
            }),
            this.db.activity.count({ where }),
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

    async create(data: any) {
        return this.db.activity.create({
            data,
        });
    }
}
