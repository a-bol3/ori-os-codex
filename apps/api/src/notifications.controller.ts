import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request, Inject, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';

type NotificationModel = {
  findMany: (args: unknown) => Promise<unknown[]>;
  create: (args: unknown) => Promise<unknown>;
  updateMany: (args: unknown) => Promise<unknown>;
};

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get notificationModel(): NotificationModel {
    return (this.prisma as unknown as { notification: NotificationModel })
      .notification;
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    try {
      return await this.notificationModel.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch {
      // Notification model may not exist yet — return empty
      throw new ServiceUnavailableException(
        'Notifications storage is unavailable; no notification data was returned.',
      );
    }
  }

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() data: Record<string, unknown>) {
    const orgId = requireOrganizationId(req);
    try {
      return await this.notificationModel.create({
        data: { ...data, organizationId: orgId },
      });
    } catch {
      throw new ServiceUnavailableException(
        'Notifications storage is unavailable; notification was not created.',
      );
    }
  }

  @Post('mark-all-read')
  async markAllRead(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    try {
      await this.notificationModel.updateMany({
        where: { organizationId: orgId, read: false },
        data: { read: true },
      });
    } catch {
      throw new ServiceUnavailableException(
        'Notifications storage is unavailable; notifications were not updated.',
      );
    }
    return { success: true };
  }
}
