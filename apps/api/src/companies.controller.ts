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

@Controller('crm/companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).company.findMany({
      where: { organizationId: orgId },
      include: {
        _count: { select: { contacts: true } },
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@Request() req, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).company.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).company.findFirst({
      where: { id, organizationId: orgId },
      include: { contacts: true, deals: true },
    });
  }

  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    const existing = await (this.prisma as any).company.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: 'Not found' };
    return (this.prisma as any).company.update({ where: { id }, data });
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    const existing = await (this.prisma as any).company.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) return { error: 'Not found' };
    return (this.prisma as any).company.delete({ where: { id } });
  }
}
