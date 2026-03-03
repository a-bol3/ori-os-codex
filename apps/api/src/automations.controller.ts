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

@Controller('automations/workflows')
@UseGuards(JwtAuthGuard)
export class AutomationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowTrigger: WorkflowTriggerService
  ) { }

  @Get()
  async findAll(@Request() req: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).workflow.findMany({
      where: { organizationId: orgId },
    });
  }

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).workflow.create({
      data: { ...data, organizationId: orgId },
    });
  }

  // IMPORTANT: static paths must come before ":id"
  @Get('runs')
  async getRuns(@Request() req: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).workflowRun.findMany({
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
  async findOne(@Param('id') id: string) {
    return (this.prisma as any).workflow.findUnique({ where: { id } });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return (this.prisma as any).workflow.update({ where: { id }, data });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return (this.prisma as any).workflow.delete({ where: { id } });
  }

  @Post(':id/test')
  async test(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    const orgId = req.user.organizationId || 'default-org-id';

    const workflow = await (this.prisma as any).workflow.findUnique({
      where: { id },
    });
    if (!workflow) return { error: 'Workflow not found' };

    // Start execution via trigger service
    await this.workflowTrigger.trigger(
      workflow.triggerType,
      orgId,
      body.payload || { test: true }
    );

    return { status: 'test_started' };
  }
}
