import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  Inject,
  Query,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { WorkflowTriggerService } from './automation/workflow-trigger.service';
import { AuditLogService } from './common/audit-log.service';
import { ensureDefaultPipeline } from './common/default-pipeline';
import { normalizePagination } from './common/pagination';
import {
  AuthenticatedRequest,
  getOptionalUserId,
  requireOrganizationId,
} from './common/request-context';
import { BulkDeleteDto, CreateDealDto, CrmListQueryDto, UpdateDealDto } from './crm/dto';

@Controller('crm/deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkflowTriggerService) private readonly workflowTrigger: WorkflowTriggerService,
    private readonly auditLog: AuditLogService,
  ) { }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: CrmListQueryDto,
  ) {
    const orgId = requireOrganizationId(req);
    const { limit, offset } = normalizePagination(query.limit, query.offset, {
      limit: 50,
      maxLimit: 100,
    });
    const search = query.search?.trim();
    const where = {
      organizationId: orgId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { company: { name: { contains: search, mode: 'insensitive' as const } } },
              { contact: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: {
          company: true,
          contact: true,
          stage: true,
          pipeline: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      items: deals.map((deal) => this.serializeDeal(deal)),
      total,
      limit,
      offset,
      hasMore: offset + deals.length < total,
    };
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateDealDto,
  ) {
    const orgId = requireOrganizationId(req);
    const {
      companyId,
      contactId,
      name,
      valueAmount,
      value,
      valueCurrency,
      stageName,
      closeDate,
      status,
    } = data;

    await this.assertCompanyBelongsToOrganization(orgId, companyId);
    await this.assertContactBelongsToOrganization(orgId, contactId);

    const pipeline = await ensureDefaultPipeline(this.prisma, orgId);

    let stage =
      pipeline.stages.find((currentStage) => currentStage.name === stageName) ??
      pipeline.stages[0];

    if (!stage) {
      stage = await this.prisma.pipelineStage.create({
        data: {
          pipelineId: pipeline.id,
          name: stageName || 'Lead',
          order: pipeline.stages.length + 1,
        },
      });
    }

    const deal = await this.prisma.deal.create({
      data: {
        name,
        valueAmount: valueAmount ?? value ?? 0,
        valueCurrency: valueCurrency || 'USD',
        status: status || 'open',
        organizationId: orgId,
        companyId: companyId || undefined,
        contactId: contactId || undefined,
        pipelineId: pipeline.id,
        stageId: stage.id,
        closeDate: closeDate ? new Date(closeDate) : undefined,
      },
      include: { stage: true, company: true, contact: true, pipeline: true },
    });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'DEAL_CREATED',
      entityType: 'deal',
      entityId: deal.id,
      metadata: {
        name: deal.name,
        stage: deal.stage?.name ?? null,
        valueAmount: deal.valueAmount ?? 0,
      },
    });

    // Log Activity
    await this.prisma.activity
      .create({
        data: {
          type: 'NOTE',
          organizationId: orgId,
          subject: 'New Deal Created',
          body: `Deal "${deal.name}" worth ${deal.valueCurrency} ${deal.valueAmount} was added to the pipeline.`,
          dealId: deal.id,
          companyId: companyId || undefined,
          contactId: contactId || undefined,
          metadataJson: {
            source: 'system',
            category: 'deal_created',
          },
        },
      })
      .catch((error: unknown) => console.error('Activity creation failed', error));

    // Trigger Workflow
    try {
      await this.workflowTrigger.trigger('trigger.deal.created', orgId, deal);
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }

    return this.serializeDeal(deal);
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);
    const [deal, auditLogs] = await Promise.all([
      this.prisma.deal.findFirst({
        where: { id, organizationId: orgId },
        include: {
          company: true,
          contact: true,
          stage: true,
          pipeline: true,
          tasks: {
            orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
            take: 20,
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      }),
      this.prisma.auditLog.findMany({
        where: { organizationId: orgId, entityType: 'deal', entityId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    return { ...this.serializeDeal(deal), auditLogs };
  }

  @Post('bulk-delete')
  async bulkDelete(
    @Request() req: AuthenticatedRequest,
    @Body() body: BulkDeleteDto,
  ) {
    const orgId = requireOrganizationId(req);
    const userId = getOptionalUserId(req);
    const ids = [...new Set(body.ids.filter(Boolean))];

    const ownedDeals = await this.prisma.deal.findMany({
      where: { organizationId: orgId, id: { in: ids } },
      select: { id: true, name: true, valueAmount: true },
    });

    if (ownedDeals.length === 0) {
      return { deleted: 0 };
    }

    await this.prisma.deal.deleteMany({
      where: { organizationId: orgId, id: { in: ownedDeals.map((deal) => deal.id) } },
    });

    await Promise.all(
      ownedDeals.map((deal) =>
        this.auditLog.record({
          organizationId: orgId,
          userId,
          action: 'DEAL_DELETED',
          entityType: 'deal',
          entityId: deal.id,
          metadata: { name: deal.name, valueAmount: deal.valueAmount ?? 0, bulk: true },
        }),
      ),
    );

    return { deleted: ownedDeals.length };
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateDealDto,
  ) {
    const orgId = requireOrganizationId(req);
    const existing = await this.prisma.deal.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Deal not found');
    }

    await this.assertCompanyBelongsToOrganization(orgId, data.companyId);
    await this.assertContactBelongsToOrganization(orgId, data.contactId);

    const { stageName, value, closeDate, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };
    if (value !== undefined) updateData.valueAmount = value;
    if (closeDate !== undefined) {
      updateData.closeDate = closeDate ? new Date(closeDate) : null;
    }

    // If stageName provided, find the stage
    if (stageName) {
      const stage = await this.prisma.pipelineStage.findFirst({
        where: { pipelineId: existing.pipelineId, name: stageName },
      });
      if (stage) updateData.stageId = stage.id;
    }

    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateData,
      include: { company: true, contact: true, stage: true, pipeline: true },
    });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'DEAL_UPDATED',
      entityType: 'deal',
      entityId: id,
      metadata: {
        changedFields: [
          ...Object.keys(rest),
          ...(value !== undefined ? ['value'] : []),
          ...(stageName ? ['stageName'] : []),
          ...(closeDate !== undefined ? ['closeDate'] : []),
        ],
      },
    });

    return this.serializeDeal(deal);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);
    const existing = await this.prisma.deal.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Deal not found');
    }
    const deleted = await this.prisma.deal.delete({ where: { id } });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'DEAL_DELETED',
      entityType: 'deal',
      entityId: id,
      metadata: {
        name: deleted.name,
        valueAmount: deleted.valueAmount ?? 0,
      },
    });

    return deleted;
  }

  private serializeDeal(deal: any) {
    return {
      ...deal,
      stage: deal?.stage?.name ?? 'Unknown',
      stageName: deal?.stage?.name ?? 'Unknown',
      value: deal?.valueAmount ?? 0,
      probability: deal?.stage?.order ? Math.min(deal.stage.order * 20, 90) : 0,
    };
  }

  private async assertCompanyBelongsToOrganization(
    organizationId: string,
    companyId?: string | null,
  ) {
    if (!companyId) {
      return;
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, organizationId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }

  private async assertContactBelongsToOrganization(
    organizationId: string,
    contactId?: string | null,
  ) {
    if (!contactId) {
      return;
    }

    const contact = await this.prisma.contact.findFirst({
      where: { id: contactId, organizationId },
      select: { id: true },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
  }
}
