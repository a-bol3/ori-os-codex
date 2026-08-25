import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { calculateWorkloadRisk } from '@ori-os/core';
import { Prisma } from '@ori-os/db';
import { PrismaService } from '@ori-os/db/nestjs';
import { Job } from 'bullmq';

const OPEN_STATUSES = ['pending', 'in_progress', 'blocked'];
const DAY_MS = 24 * 60 * 60 * 1000;

@Processor('operations-core')
export class OperationsProcessor extends WorkerHost {
  private readonly logger = new Logger(OperationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<Record<string, unknown>> {
    if (process.env.ENABLE_OPERATIONS_CORE !== 'true') {
      return { skipped: true, reason: 'feature_disabled' };
    }

    switch (job.name) {
      case 'scan-reminders':
        return this.scanReminders();
      case 'scan-stale-incidents':
        return this.scanStaleIncidents();
      case 'build-daily-summary':
        return this.buildDailySummaries();
      default:
        this.logger.warn(`Unknown Operations Core job: ${job.name}`);
        return { skipped: true, reason: 'unknown_job' };
    }
  }

  private async scanReminders() {
    const now = new Date();
    const reminderLimit = new Date(now.getTime() + DAY_MS);
    const bucket = this.utcDateKey(now);
    const commitments = await this.prisma.commitment.findMany({
      where: {
        status: { in: OPEN_STATUSES },
        dueAt: { lte: reminderLimit },
      },
      select: {
        id: true,
        organizationId: true,
        incidentId: true,
        title: true,
        dueAt: true,
      },
    });

    let created = 0;
    for (const commitment of commitments) {
      const overdue = commitment.dueAt < now;
      const signal = await this.createRiskSignalOnce({
        organizationId: commitment.organizationId,
        incidentId: commitment.incidentId,
        title: overdue
          ? `Overdue commitment: ${commitment.title}`
          : `Commitment due soon: ${commitment.title}`,
        description: `Due at ${commitment.dueAt.toISOString()}. Human review is required; no message was sent.`,
        severity: overdue ? 'high' : 'medium',
        source: 'commitment_monitor',
        idempotencyKey: `commitment:${commitment.id}:${bucket}`,
      });
      if (signal) created += 1;
    }

    return { scanned: commitments.length, created };
  }

  private async scanStaleIncidents() {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - DAY_MS);
    const bucket = this.utcDateKey(now);
    const incidents = await this.prisma.operationIncident.findMany({
      where: {
        status: { in: OPEN_STATUSES },
        lastActivityAt: { lte: staleBefore },
      },
      select: { id: true, organizationId: true, title: true, severity: true },
    });

    let created = 0;
    for (const incident of incidents) {
      const signal = await this.createRiskSignalOnce({
        organizationId: incident.organizationId,
        incidentId: incident.id,
        title: `Incident without update: ${incident.title}`,
        description: 'No activity was recorded during the last 24 hours.',
        severity: incident.severity === 'critical' ? 'critical' : 'high',
        source: 'stale_incident_monitor',
        idempotencyKey: `stale-incident:${incident.id}:${bucket}`,
      });
      if (signal) created += 1;
    }

    return { scanned: incidents.length, created };
  }

  private async buildDailySummaries() {
    const organizations = await this.prisma.organization.findMany({
      select: { id: true },
    });
    const snapshotDate = this.utcDayStart(new Date());
    const weekStart = new Date(snapshotDate.getTime() - 6 * DAY_MS);

    for (const organization of organizations) {
      const organizationId = organization.id;
      const [work, outsideHours, openIncidents, criticalIncidents, overdueCommitments] =
        await Promise.all([
          this.prisma.workLog.aggregate({
            where: { organizationId, startedAt: { gte: weekStart } },
            _sum: { minutes: true, travelMinutes: true },
          }),
          this.prisma.workLog.aggregate({
            where: {
              organizationId,
              startedAt: { gte: weekStart },
              outsideHours: true,
            },
            _sum: { minutes: true },
          }),
          this.prisma.operationIncident.count({
            where: { organizationId, status: { in: OPEN_STATUSES } },
          }),
          this.prisma.operationIncident.count({
            where: {
              organizationId,
              status: { in: OPEN_STATUSES },
              severity: 'critical',
            },
          }),
          this.prisma.commitment.count({
            where: {
              organizationId,
              status: { in: OPEN_STATUSES },
              dueAt: { lt: new Date() },
            },
          }),
        ]);

      const workedMinutes = work._sum.minutes ?? 0;
      const outsideHoursMinutes = outsideHours._sum.minutes ?? 0;
      const workload = calculateWorkloadRisk({
        workedMinutes,
        outsideHoursMinutes,
        criticalIncidents,
        overdueCommitments,
      });

      const snapshot = await this.prisma.workloadSnapshot.upsert({
        where: {
          organizationId_snapshotDate: { organizationId, snapshotDate },
        },
        create: {
          organizationId,
          snapshotDate,
          workedMinutes,
          outsideHoursMinutes,
          travelMinutes: work._sum.travelMinutes ?? 0,
          openIncidents,
          criticalIncidents,
          overdueCommitments,
          loadScore: workload.score,
          riskLevel: workload.level,
        },
        update: {
          workedMinutes,
          outsideHoursMinutes,
          travelMinutes: work._sum.travelMinutes ?? 0,
          openIncidents,
          criticalIncidents,
          overdueCommitments,
          loadScore: workload.score,
          riskLevel: workload.level,
        },
      });

      await this.prisma.auditLog.create({
        data: {
          organizationId,
          action: 'WORKLOAD_SNAPSHOT_UPDATED',
          entityType: 'workload_snapshot',
          entityId: snapshot.id,
          metadataJson: {
            snapshotDate: snapshotDate.toISOString(),
            loadScore: workload.score,
            riskLevel: workload.level,
          },
        },
      });
    }

    return { organizations: organizations.length, snapshotDate: snapshotDate.toISOString() };
  }

  private async createRiskSignalOnce(
    data: Prisma.RiskSignalUncheckedCreateInput,
  ) {
    try {
      const existing = await this.prisma.riskSignal.findFirst({
        where: {
          organizationId: data.organizationId,
          idempotencyKey: data.idempotencyKey,
        },
      });
      if (existing) return null;

      const signal = await this.prisma.riskSignal.create({ data });
      await this.prisma.auditLog.create({
        data: {
          organizationId: data.organizationId,
          action: 'RISK_SIGNAL_CREATED',
          entityType: 'risk_signal',
          entityId: signal.id,
          metadataJson: {
            source: data.source,
            severity: data.severity,
            externalActionExecuted: false,
          },
        },
      });
      return signal;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return null;
      }
      throw error;
    }
  }

  private utcDayStart(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private utcDateKey(date: Date) {
    return this.utcDayStart(date).toISOString().slice(0, 10);
  }
}
