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

@Controller('crm/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowTrigger: WorkflowTriggerService
  ) { }

  @Get()
  async findAll(@Request() req: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).contact.findMany({
      where: { organizationId: orgId },
      include: { company: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Request() req: any, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';

    const contact = await (this.prisma as any).contact.create({
      data: { ...data, organizationId: orgId },
    });

    try {
      await (this.prisma as any).activity.create({
        data: {
          type: 'NOTE',
          organizationId: orgId,
          subject: 'New contact created',
          body: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          contactId: contact.id,
        },
      });
    } catch (e) {
      console.error('Failed to log activity:', e);
    }

    try {
      await this.workflowTrigger.trigger('trigger.contact.created', orgId, contact);
    } catch (e) {
      console.error('Failed to trigger workflow:', e);
    }

    return contact;
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).contact.findFirst({
      where: { id, organizationId: orgId },
      include: { company: true },
    });
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    const orgId = req.user.organizationId || 'default-org-id';

    const existing = await (this.prisma as any).contact.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: 'Not found' };

    return (this.prisma as any).contact.update({ where: { id }, data });
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';

    const existing = await (this.prisma as any).contact.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: 'Not found' };

    return (this.prisma as any).contact.delete({ where: { id } });
  }
}
