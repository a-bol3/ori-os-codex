import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createAlert(
    projectId: string,
    organizationId: string,
    data: {
      type:
        | 'rank_drop'
        | 'rank_gain'
        | 'new_issue'
        | 'backlink_lost'
        | 'competitor_change';
      severity: 'critical' | 'warning' | 'info';
      title: string;
      message: string;
      metadata?: any;
    },
  ) {
    // Verify project exists
    const project = await (this.prisma as any).sEOProject.findFirst({
      where: { id: projectId, organizationId },
    });

    if (!project) {
      throw new NotFoundException('SEO project not found');
    }

    const alert = await (this.prisma as any).sEOAlert.create({
      data: {
        projectId,
        organizationId,
        type: data.type,
        severity: data.severity,
        message: data.message,
        metadata: data.metadata || {},
        isRead: false,
      },
    });

    // Send notification if critical or warning
    if (data.severity === 'critical' || data.severity === 'warning') {
      await this.notificationsService.sendSlackNotification(
        `🚨 *SEO Alert: ${data.severity.toUpperCase()}*\n*Project:* ${project.name} (${project.domain})\n*Message:* ${data.message}`,
      );
    }

    return alert;
  }

  async getAlerts(projectId: string, organizationId: string, filters?: any) {
    const where: any = {
      projectId,
      organizationId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    const alerts = await (this.prisma as any).sEOAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    });

    const total = await (this.prisma as any).sEOAlert.count({ where });

    // Get summary stats
    const stats = await this.getAlertsSummary(projectId, organizationId);

    return {
      data: alerts,
      total,
      stats,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    };
  }

  async getAlertsSummary(projectId: string, organizationId: string) {
    const alerts = await (this.prisma as any).sEOAlert.findMany({
      where: { projectId, organizationId },
    });

    const unread = alerts.filter((a: any) => a.status === 'unread').length;
    const critical = alerts.filter(
      (a: any) => a.severity === 'critical',
    ).length;
    const warning = alerts.filter((a: any) => a.severity === 'warning').length;
    const info = alerts.filter((a: any) => a.severity === 'info').length;

    return {
      total: alerts.length,
      unread,
      critical,
      warning,
      info,
    };
  }

  async getAlertById(alertId: string, organizationId: string) {
    const alert = await (this.prisma as any).sEOAlert.findFirst({
      where: {
        id: alertId,
        organizationId,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async updateAlert(
    alertId: string,
    organizationId: string,
    data: {
      status?: 'read' | 'unread' | 'dismissed';
    },
  ) {
    // Verify alert exists
    const alert = await this.getAlertById(alertId, organizationId);

    return (this.prisma as any).sEOAlert.update({
      where: { id: alert.id },
      data: {
        ...data,
        readAt: data.status === 'read' ? new Date() : alert.readAt,
      },
    });
  }

  async deleteAlert(alertId: string, organizationId: string) {
    // Verify alert exists
    const alert = await this.getAlertById(alertId, organizationId);

    return (this.prisma as any).sEOAlert.delete({
      where: { id: alert.id },
    });
  }

  async markAllAsRead(projectId: string, organizationId: string) {
    return (this.prisma as any).sEOAlert.updateMany({
      where: {
        projectId,
        organizationId,
        status: 'unread',
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });
  }
}
