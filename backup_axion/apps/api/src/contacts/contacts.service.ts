import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(page = 1, limit = 20, search?: string, status?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.db.contact.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: { company: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.db.contact.count({ where }),
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
        return this.db.contact.findUnique({
            where: { id },
            include: { company: true },
        });
    }

    async create(data: any) {
        return this.db.contact.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.db.contact.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.db.contact.delete({
            where: { id },
        });
    }
}
