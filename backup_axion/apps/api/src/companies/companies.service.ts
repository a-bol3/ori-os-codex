import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(page = 1, limit = 20, search?: string, status?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { domain: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.db.company.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    _count: {
                        select: { contacts: true, deals: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.db.company.count({ where }),
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
        return this.db.company.findUnique({
            where: { id },
            include: {
                contacts: true,
                deals: true,
                activities: {
                    take: 10,
                    orderBy: { occurredAt: 'desc' }
                }
            },
        });
    }

    async create(data: any) {
        return this.db.company.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.db.company.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.db.company.delete({
            where: { id },
        });
    }
}
