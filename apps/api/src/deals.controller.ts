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
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { WorkflowTriggerService } from './automation/workflow-trigger.service';

@Controller('crm/deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowTrigger: WorkflowTriggerService
  ) { }

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    const deals = await (this.prisma as any).deal.findMany({
      where: { organizationId: orgId },
      include: {
        company: true,
        contact: true,
        stage: true,
        pipeline: true,
        runs: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Normalize for frontend: stage as string, value as number
    return deals.map((d: any) => ({
      ...d,
      stage: d.stage?.name ?? 'Unknown',
      stageName: d.stage?.name ?? 'Unknown',
      value: d.valueAmount ?? 0,
      probability: d.stage?.order ? Math.min(d.stage.order * 20, 90) : 0,
    }));
  }

  @Post()
  async create(@Request() req, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    const {
      companyId,
      contactId,
      name,
      valueAmount,
      valueCurrency,
      stageName,
    } = data;

    // Auto-create or find a default pipeline + stage for this org
    let pipeline = await (this.prisma as any).pipeline.findFirst({
      where: { organizationId: orgId },
    });
    if (!pipeline) {
      pipeline = await (this.prisma as any).pipeline.create({
        data: {
          organizationId: orgId,
          name: 'Sales Pipeline',
          stages: {
            create: [
              { name: 'Lead', order: 1 },
              { name: 'Qualified', order: 2 },
              { name: 'Proposal', order: 3 },
              { name: 'Negotiation', order: 4 },
              { name: 'Closed Won', order: 5 },
            ],
          },
        },
        include: { stages: true },
      });
    }

    // Find the matching stage by name, or use first stage
    const stages = await (this.prisma as any).pipelineStage.findMany({
      where: { pipelineId: pipeline.id },
      orderBy: { order: 'asc' },
    });
    let stage = stages.find((s: any) => s.name === stageName) ?? stages[0];

    if (!stage) {
      stage = await (this.prisma as any).pipelineStage.create({
        data: { pipelineId: pipeline.id, name: stageName || 'Lead', order: 1 },
      });
    }

    const deal = await (this.prisma as any).deal.create({
      data: {
        name,
        valueAmount: valueAmount || 0,
        valueCurrency: valueCurrency || 'USD',
        status: 'open',
        organizationId: orgId,
        companyId: companyId || undefined,
        contactId: contactId || undefined,
        pipelineId: pipeline.id,
        stageId: stage.id,
      },
      include: { stage: true, company: true },
    });

    // Log Activity
    await (this.prisma as any).activity
      .create({
        data: {
          type: 'NOTE',
          organizationId: orgId,
          subject: 'New Deal Created',
          body: `Deal "${deal.name}" worth ${deal.valueCurrency} ${deal.valueAmount} was added to the pipeline.`,
          dealId: deal.id,
          companyId: companyId || undefined,
          contactId: contactId || undefined,
        },
      })
      .catch((err: any) => console.error('Activity creation failed', err));

    // Trigger Workflow
    try {
      await this.workflowTrigger.trigger('trigger.deal.created', orgId, deal);
    } catch (e) {
      console.error('Failed to trigger workflow:', e);
    }

    return {
      ...deal,
      stage: deal.stage?.name ?? 'Unknown',
      value: deal.valueAmount,
    };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    const deal = await (this.prisma as any).deal.findFirst({
      where: { id, organizationId: orgId },
      include: { company: true, contact: true, stage: true, pipeline: true },
    });
    if (!deal) return null;
    return {
      ...deal,
      stage: deal.stage?.name ?? 'Unknown',
      value: deal.valueAmount,
    };
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    const existing = await (this.prisma as any).deal.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: 'Not found' };

    const { stageName, value, ...rest } = data;
    const updateData: any = { ...rest };
    if (value !== undefined) updateData.valueAmount = value;

    // If stageName provided, find the stage
    if (stageName) {
      const stage = await (this.prisma as any).pipelineStage.findFirst({
        where: { pipelineId: existing.pipelineId, name: stageName },
      });
      if (stage) updateData.stageId = stage.id;
    }

    return (this.prisma as any).deal.update({
      where: { id },
      data: updateData,
    });
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    const existing = await (this.prisma as any).deal.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: 'Not found' };
    return (this.prisma as any).deal.delete({ where: { id } });
  }
}
