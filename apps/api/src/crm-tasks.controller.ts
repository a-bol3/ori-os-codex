import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuditLogService } from './common/audit-log.service';
import { normalizePagination } from './common/pagination';
import {
  AuthenticatedRequest,
  getOptionalUserId,
  requireOrganizationId,
} from './common/request-context';
import {
  CreateTaskDto,
  GetTasksQueryDto,
  UpdateTaskDto,
} from './crm/dto';

@Controller('crm/tasks')
@UseGuards(JwtAuthGuard)
export class CrmTasksController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: GetTasksQueryDto,
  ) {
    const organizationId = requireOrganizationId(req);
    const { limit, offset } = normalizePagination(query.limit, query.offset, {
      limit: 20,
      maxLimit: 100,
    });

    await this.assertLinkedEntitiesBelongToOrganization(organizationId, query);

    const where = {
      organizationId,
      ...(query.contactId ? { contactId: query.contactId } : {}),
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.dealId ? { dealId: query.dealId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search?.trim()
        ? {
            OR: [
              {
                title: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
              {
                description: {
                  contains: query.search.trim(),
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    };
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateTaskDto,
  ) {
    const organizationId = requireOrganizationId(req);
    await this.assertLinkedEntitiesBelongToOrganization(organizationId, data);

    const task = await this.prisma.task.create({
      data: {
        organizationId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status ?? 'pending',
        companyId: data.companyId ?? undefined,
        contactId: data.contactId ?? undefined,
        dealId: data.dealId ?? undefined,
      },
    });

    await this.prisma.activity.create({
      data: {
        organizationId,
        type: 'TASK',
        subject: `Task created: ${task.title}`,
        body: task.description ?? 'No description provided.',
        companyId: task.companyId ?? undefined,
        contactId: task.contactId ?? undefined,
        dealId: task.dealId ?? undefined,
        metadataJson: {
          taskId: task.id,
          status: task.status,
          source: 'system',
          category: 'task_created',
        },
      },
    });

    const target =
      task.dealId
        ? { entityType: 'deal' as const, entityId: task.dealId }
        : task.companyId
          ? { entityType: 'company' as const, entityId: task.companyId }
          : task.contactId
            ? { entityType: 'contact' as const, entityId: task.contactId }
            : null;

    if (target) {
      await this.auditLog.record({
        organizationId,
        userId: getOptionalUserId(req),
        action: 'TASK_CREATED',
        entityType: target.entityType,
        entityId: target.entityId,
        metadata: {
          taskId: task.id,
          title: task.title,
          status: task.status,
        },
      });
    }

    return task;
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateTaskDto,
  ) {
    const organizationId = requireOrganizationId(req);

    const existing = await this.prisma.task.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueDate:
          data.dueDate !== undefined
            ? data.dueDate
              ? new Date(data.dueDate)
              : null
            : undefined,
        status: data.status,
      },
    });

    if (data.status && data.status !== existing.status) {
      await this.prisma.activity.create({
        data: {
          organizationId,
          type: 'TASK',
          subject: `Task ${data.status === 'completed' ? 'completed' : 'updated'}: ${task.title}`,
          body: task.description ?? 'No description provided.',
          companyId: task.companyId ?? undefined,
          contactId: task.contactId ?? undefined,
          dealId: task.dealId ?? undefined,
          metadataJson: {
            taskId: task.id,
            status: task.status,
            source: 'system',
            category: data.status === 'completed' ? 'task_completed' : 'task_updated',
          },
        },
      });
    }

    const target =
      task.dealId
        ? { entityType: 'deal' as const, entityId: task.dealId }
        : task.companyId
          ? { entityType: 'company' as const, entityId: task.companyId }
          : task.contactId
            ? { entityType: 'contact' as const, entityId: task.contactId }
            : null;

    if (target) {
      await this.auditLog.record({
        organizationId,
        userId: getOptionalUserId(req),
        action: 'TASK_UPDATED',
        entityType: target.entityType,
        entityId: target.entityId,
        metadata: {
          taskId: task.id,
          changedFields: Object.keys(data),
          status: task.status,
        },
      });
    }

    return task;
  }

  private async assertLinkedEntitiesBelongToOrganization(
    organizationId: string,
    entityIds: {
      companyId?: string | null;
      contactId?: string | null;
      dealId?: string | null;
    },
  ) {
    if (entityIds.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: entityIds.companyId, organizationId },
        select: { id: true },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    if (entityIds.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: entityIds.contactId, organizationId },
        select: { id: true },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    if (entityIds.dealId) {
      const deal = await this.prisma.deal.findFirst({
        where: { id: entityIds.dealId, organizationId },
        select: { id: true },
      });

      if (!deal) {
        throw new NotFoundException('Deal not found');
      }
    }
  }
}
