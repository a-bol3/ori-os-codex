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
  NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

import { WorkflowTriggerService } from './automation/workflow-trigger.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';
import { Prisma } from '@prisma/client';

type WorkflowCreateBody = {
  name: string;
  triggerType: string;
  definitionJson: Prisma.InputJsonValue;
  description?: string;
  status?: string;
  createdBy?: string;
};
type WorkflowUpdateBody = Partial<WorkflowCreateBody>;
type WorkflowTestBody = { payload?: Record<string, unknown> };

@Controller('automations/workflows')
@UseGuards(JwtAuthGuard)
export class AutomationsController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkflowTriggerService) private readonly workflowTrigger: WorkflowTriggerService
  ) { }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    return this.prisma.workflow.findMany({
      where: { organizationId: orgId },
    });
  }

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() data: WorkflowCreateBody) {
    const orgId = requireOrganizationId(req);
    return this.prisma.workflow.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // IMPORTANT: static paths must come before ":id"
  @Get('runs')
  async getRuns(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    return this.prisma.workflowRun.findMany({
      where: { organizationId: orgId },
      include: {
        workflow: true,
        steps: true
      },
      orderBy: { startedAt: 'desc' },
      take: 20,
    });
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.getWorkflowOrThrow(requireOrganizationId(req), id);
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: WorkflowUpdateBody,
  ) {
    await this.getWorkflowOrThrow(requireOrganizationId(req), id);
    return this.prisma.workflow.update({ where: { id }, data });
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.getWorkflowOrThrow(requireOrganizationId(req), id);
    return this.prisma.workflow.delete({ where: { id } });
  }

  @Post(':id/test')
  async test(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: WorkflowTestBody,
  ) {
    const orgId = requireOrganizationId(req);
    const workflow = await this.getWorkflowOrThrow(orgId, id);

    // Start execution via trigger service
    await this.workflowTrigger.trigger(
      workflow.triggerType,
      orgId,
      body.payload || { test: true }
    );

    return { status: 'test_started' };
  }

  private async getWorkflowOrThrow(organizationId: string, id: string) {
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, organizationId },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }
}
