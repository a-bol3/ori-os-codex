import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
    constructor(private readonly prisma: PrismaService) { }

    private get db() {
        return this.prisma.tenantClient;
    }

    async findAll(page = 1, limit = 20, status?: string, category?: string) {
        const where: any = { isTemplate: false };
        if (status) where.status = status;
        if (category) where.category = category;

        const [data, total] = await Promise.all([
            this.db.workflow.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            this.db.workflow.count({ where }),
        ]);

        return {
            data: data.map((w: any) => ({
                ...w,
                nodes: w.nodes ? JSON.parse(w.nodes as string) : [],
                edges: w.edges ? JSON.parse(w.edges as string) : [],
                triggerConfig: w.triggerConfig ? JSON.parse(w.triggerConfig as string) : {},
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const w = await this.db.workflow.findUnique({
            where: { id },
            include: {
                runs: {
                    take: 10,
                    orderBy: { startedAt: 'desc' }
                }
            }
        });

        if (!w) return null;

        return {
            ...w,
            nodes: w.nodes ? JSON.parse(w.nodes as string) : [],
            edges: w.edges ? JSON.parse(w.edges as string) : [],
            triggerConfig: w.triggerConfig ? JSON.parse(w.triggerConfig as string) : {},
        };
    }

    async create(data: any) {
        const { nodes, edges, triggerConfig, ...rest } = data;
        return this.db.workflow.create({
            data: {
                ...rest,
                nodes: JSON.stringify(nodes || []),
                edges: JSON.stringify(edges || []),
                triggerConfig: JSON.stringify(triggerConfig || {}),
                isTemplate: false,
            }
        });
    }

    async update(id: string, data: any) {
        const { nodes, edges, triggerConfig, ...rest } = data;
        const updateData: any = { ...rest };
        if (nodes) updateData.nodes = JSON.stringify(nodes);
        if (edges) updateData.edges = JSON.stringify(edges);
        if (triggerConfig) updateData.triggerConfig = JSON.stringify(triggerConfig);

        return this.db.workflow.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(id: string) {
        return this.db.workflow.delete({
            where: { id },
        });
    }
}
