import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  UseGuards,
  Request,
  NotFoundException,
  Inject,
  Param,
  Query,
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
import { Prisma } from '@prisma/client';
import { CrmListQueryDto } from './crm/dto';

type ActivityWriteBody = {
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'NOTE' | 'TASK';
  userId?: string;
  companyId?: string;
  contactId?: string;
  dealId?: string;
  subject?: string;
  body?: string;
  metadataJson?: Prisma.InputJsonValue;
};

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: CrmListQueryDto,
  ) {
    const orgId = requireOrganizationId(req);
    const { limit, offset } = normalizePagination(query.limit, query.offset, {
      limit: 20,
      maxLimit: 100,
    });

    const items = await this.prisma.activity.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return items.map((activity) => ({
      id: activity.id,
      type: this.mapActivityType(activity),
      title: activity.subject || 'Activity logged',
      description: activity.body || 'No description provided.',
      createdAt: activity.createdAt.toISOString(),
      status:
        this.readMetadataValue(activity.metadataJson, 'read') === true
          ? 'read'
          : 'unread',
    }));
  }

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() data: ActivityWriteBody) {
    const orgId = requireOrganizationId(req);
    const activity = await this.prisma.activity.create({
      data: {
        ...data,
        organizationId: orgId,
        metadataJson: {
          ...(this.readMetadataObject(data.metadataJson) ?? {}),
          source: this.readMetadataValue(data.metadataJson, 'source') ?? 'user',
          category:
            this.readMetadataValue(data.metadataJson, 'category')
            ?? (data.type === 'NOTE' ? 'manual_note' : 'manual_activity'),
        },
      },
    });

    const target =
      data.dealId
        ? { entityType: 'deal' as const, entityId: data.dealId }
        : data.companyId
          ? { entityType: 'company' as const, entityId: data.companyId }
          : data.contactId
            ? { entityType: 'contact' as const, entityId: data.contactId }
            : null;

    if (target) {
      await this.auditLog.record({
        organizationId: orgId,
        userId: getOptionalUserId(req),
        action: data.type === 'NOTE' ? 'NOTE_ADDED' : 'ACTIVITY_ADDED',
        entityType: target.entityType,
        entityId: target.entityId,
        metadata: {
          activityId: activity.id,
          subject: activity.subject ?? null,
          type: activity.type,
        },
      });
    }

    return activity;
  }

  @Put(':id/read')
  async markAsRead(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);
    const activity = await this.prisma.activity.findFirst({
      where: { id, organizationId: orgId },
      select: { id: true, metadataJson: true },
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        metadataJson: {
          ...(this.readMetadataObject((activity as any).metadataJson) ?? {}),
          read: true,
        },
      },
    });
  }

  private mapActivityType(activity: { type: string; dealId?: string | null; contactId?: string | null }) {
    if (activity.type === 'TASK') {
      return 'task';
    }

    if (activity.dealId) {
      return 'deal';
    }

    if (activity.contactId) {
      return 'lead';
    }

    return 'system';
  }

  private readMetadataObject(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private readMetadataValue(value: unknown, key: string): unknown {
    const metadata = this.readMetadataObject(value);
    return metadata ? metadata[key] : undefined;
  }
}
