import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(status?: string) {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        const data = await this.db.task.findMany({
            where,
            include: {
                contact: true,
            },
            orderBy: { dueDate: 'asc' },
        });

        return { data };
    }

    async create(data: any) {
        return this.db.task.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.db.task.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.db.task.delete({
            where: { id },
        });
    }
}
