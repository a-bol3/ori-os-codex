import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).activity.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  @Post()
  async create(@Request() req, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).activity.create({
      data: {
        ...data,
        organizationId: orgId,
      },
    });
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return (this.prisma as any).activity.update({
      where: { id },
      data: {
        metadataJson: { read: true }, // Assuming metadata for UI status
      },
    });
  }
}
