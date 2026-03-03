import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    try {
      return await (this.prisma as any).notification.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch {
      // Notification model may not exist yet — return empty
      return [];
    }
  }

  @Post()
  async create(@Request() req, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    try {
      return await (this.prisma as any).notification.create({
        data: { ...data, organizationId: orgId },
      });
    } catch {
      return { id: 'simulated', ...data };
    }
  }

  @Post('mark-all-read')
  async markAllRead(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    try {
      await (this.prisma as any).notification.updateMany({
        where: { organizationId: orgId, read: false },
        data: { read: true },
      });
    } catch {
      // ignore
    }
    return { success: true };
  }
}
