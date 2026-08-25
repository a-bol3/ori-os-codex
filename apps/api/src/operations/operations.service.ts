import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '@ori-os/db/nestjs';
import {
  buildPanicChecklist,
  calculateWorkloadRisk,
  canTransitionOperationStatus,
  isOperationStatus,
  type IntegrationHealth,
  type OperationStatus,
} from '@ori-os/core';
import { AuditLogService } from '../common/audit-log.service';
import {
  ActivatePanicProtocolDto,
  CreateApprovalRequestDto,
  CreateCommitmentDto,
  CreateIncidentDto,
  CreateOperationsTaskDto,
  CreateWorkLogDto,
  OperationsListQueryDto,
  UpdateIncidentDto,
} from './operations.dto';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const OPEN_STATUSES = ['pending', 'in_progress', 'blocked'];

@Injectable()
export class OperationsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuditLogService) private readonly auditLog: AuditLogService,
  ) {}

  async listIncidents(
    organizationId: string,
    query: OperationsListQueryDto,
  ) {
    const incidents = await this.prisma.operationIncident.findMany({
      where: {
        organizationId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.severity ? { severity: query.severity } : {}),
      },
      include: {
        _count: { select: { tasks: true, commitments: true, riskSignals: true } },
      },
      orderBy: { lastActivityAt: 'desc' },
      take: 100,
    });
    return this.sortByPriority(incidents, 'severity').slice(0, query.limit ?? 50);
  }

  async createIncident(
    organizationId: string,
    userId: string | undefined,
    data: CreateIncidentDto,
  ) {
    const replay = await this.findIncidentReplay(organizationId, data.idempotencyKey);
    if (replay) return replay;

    let incident;
    try {
      incident = await this.prisma.operationIncident.create({
        data: {
          organizationId,
          title: data.title.trim(),
          description: data.description?.trim(),
          severity: data.severity ?? 'medium',
          category: data.category?.trim(),
          ownerUserId: userId,
          idempotencyKey: data.idempotencyKey,
        },
      });
    } catch (error) {
      return this.recoverIdempotentConflict(error, data.idempotencyKey, () =>
        this.findIncidentReplay(organizationId, data.idempotencyKey),
      );
    }

    await this.recordAudit(organizationId, userId, 'OPERATION_INCIDENT_CREATED', 'operation_incident', incident.id, {
      severity: incident.severity,
      status: incident.status,
    });
    return incident;
  }

  async updateIncident(
    organizationId: string,
    userId: string | undefined,
    incidentId: string,
    data: UpdateIncidentDto,
  ) {
    const existing = await this.requireIncident(organizationId, incidentId);
    if (data.status) {
      const current = existing.status as OperationStatus;
      if (!isOperationStatus(current) || !canTransitionOperationStatus(current, data.status)) {
        throw new BadRequestException(
          `Incident cannot transition from ${existing.status} to ${data.status}`,
        );
      }
    }

    const incident = await this.prisma.operationIncident.update({
      where: { id: existing.id },
      data: {
        title: data.title?.trim(),
        description: data.description?.trim(),
        status: data.status,
        severity: data.severity,
        lastActivityAt: new Date(),
        resolvedAt:
          data.status === 'resolved'
            ? new Date()
            : data.status
              ? null
              : undefined,
      },
    });

    await this.recordAudit(organizationId, userId, 'OPERATION_INCIDENT_UPDATED', 'operation_incident', incident.id, {
      changedFields: Object.keys(data),
      status: incident.status,
      severity: incident.severity,
    });
    return incident;
  }

  async createTask(
    organizationId: string,
    userId: string | undefined,
    data: CreateOperationsTaskDto,
  ) {
    if (data.incidentId) await this.requireIncident(organizationId, data.incidentId);
    if (data.idempotencyKey) {
      const existing = await this.prisma.task.findFirst({
        where: { organizationId, idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    let task;
    try {
      task = await this.prisma.task.create({
        data: {
          organizationId,
          title: data.title.trim(),
          description: data.description?.trim(),
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          priority: data.priority ?? 'medium',
          source: 'operations',
          operationIncidentId: data.incidentId,
          idempotencyKey: data.idempotencyKey,
        },
      });
    } catch (error) {
      return this.recoverIdempotentConflict(error, data.idempotencyKey, () =>
        this.prisma.task.findFirst({
          where: { organizationId, idempotencyKey: data.idempotencyKey },
        }),
      );
    }

    await this.touchIncident(data.incidentId);
    await this.recordAudit(organizationId, userId, 'OPERATION_TASK_CREATED', 'task', task.id, {
      incidentId: task.operationIncidentId,
      priority: task.priority,
    });
    return task;
  }

  async createCommitment(
    organizationId: string,
    userId: string | undefined,
    data: CreateCommitmentDto,
  ) {
    if (data.incidentId) await this.requireIncident(organizationId, data.incidentId);
    if (data.idempotencyKey) {
      const existing = await this.prisma.commitment.findFirst({
        where: { organizationId, idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    let commitment;
    try {
      commitment = await this.prisma.commitment.create({
        data: {
          organizationId,
          incidentId: data.incidentId,
          title: data.title.trim(),
          description: data.description?.trim(),
          dueAt: new Date(data.dueAt),
          ownerUserId: userId,
          idempotencyKey: data.idempotencyKey,
        },
      });
    } catch (error) {
      return this.recoverIdempotentConflict(error, data.idempotencyKey, () =>
        this.prisma.commitment.findFirst({
          where: { organizationId, idempotencyKey: data.idempotencyKey },
        }),
      );
    }

    await this.touchIncident(data.incidentId);
    await this.recordAudit(organizationId, userId, 'COMMITMENT_CREATED', 'commitment', commitment.id, {
      incidentId: commitment.incidentId,
      dueAt: commitment.dueAt.toISOString(),
    });
    return commitment;
  }

  async createApprovalRequest(
    organizationId: string,
    userId: string | undefined,
    data: CreateApprovalRequestDto,
  ) {
    if (data.incidentId) await this.requireIncident(organizationId, data.incidentId);
    if (data.idempotencyKey) {
      const existing = await this.prisma.approvalRequest.findFirst({
        where: { organizationId, idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    let request;
    try {
      request = await this.prisma.approvalRequest.create({
        data: {
          organizationId,
          incidentId: data.incidentId,
          actionType: data.actionType.trim(),
          summary: data.summary.trim(),
          payloadJson: (data.payload ?? {}) as Prisma.InputJsonValue,
          requestedBy: userId,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
          idempotencyKey: data.idempotencyKey,
        },
      });
    } catch (error) {
      return this.recoverIdempotentConflict(error, data.idempotencyKey, () =>
        this.prisma.approvalRequest.findFirst({
          where: { organizationId, idempotencyKey: data.idempotencyKey },
        }),
      );
    }

    await this.recordAudit(organizationId, userId, 'APPROVAL_REQUEST_CREATED', 'approval_request', request.id, {
      actionType: request.actionType,
      status: request.status,
    });
    return request;
  }

  async activatePanicProtocol(
    organizationId: string,
    userId: string | undefined,
    data: ActivatePanicProtocolDto,
  ) {
    if (data.idempotencyKey) {
      const existing = await this.prisma.panicProtocolRun.findFirst({
        where: { organizationId, idempotencyKey: data.idempotencyKey },
        include: { incident: true },
      });
      if (existing) return existing;
    }

    if (data.incidentId) await this.requireIncident(organizationId, data.incidentId);
    const checklist = buildPanicChecklist(data.category);

    let run;
    try {
      run = await this.prisma.$transaction(async (tx: TransactionClient) => {
      const incident = data.incidentId
        ? await tx.operationIncident.update({
            where: { id: data.incidentId },
            data: {
              severity: 'critical',
              status: 'in_progress',
              lastActivityAt: new Date(),
            },
          })
        : await tx.operationIncident.create({
            data: {
              organizationId,
              title: data.title.trim(),
              severity: 'critical',
              status: 'in_progress',
              category: data.category,
              ownerUserId: userId,
              source: 'panic_protocol',
              idempotencyKey: data.idempotencyKey
                ? `panic-incident:${data.idempotencyKey}`
                : undefined,
            },
          });

      const protocol = await tx.panicProtocolRun.create({
        data: {
          organizationId,
          incidentId: incident.id,
          category: data.category,
          factsJson: (data.facts ?? []) as Prisma.InputJsonValue,
          unknownsJson: (data.unknowns ?? []) as Prisma.InputJsonValue,
          checklistJson: checklist as Prisma.InputJsonValue,
          activatedBy: userId,
          idempotencyKey: data.idempotencyKey,
        },
        include: { incident: true },
      });

      await tx.riskSignal.create({
        data: {
          organizationId,
          incidentId: incident.id,
          title: `Critical protocol active: ${incident.title}`,
          description: 'Human review is required. No external action has been executed.',
          severity: 'critical',
          source: 'panic_protocol',
          idempotencyKey: `panic-risk:${protocol.id}`,
        },
      });

      await tx.task.create({
        data: {
          organizationId,
          operationIncidentId: incident.id,
          title: 'Review and assign the critical incident',
          description: checklist.join('\n'),
          priority: 'critical',
          source: 'panic_protocol',
          idempotencyKey: `panic-task:${protocol.id}`,
        },
      });

        return protocol;
      });
    } catch (error) {
      return this.recoverIdempotentConflict(error, data.idempotencyKey, () =>
        this.prisma.panicProtocolRun.findFirst({
          where: { organizationId, idempotencyKey: data.idempotencyKey },
          include: { incident: true },
        }),
      );
    }

    await this.recordAudit(organizationId, userId, 'PANIC_PROTOCOL_ACTIVATED', 'panic_protocol_run', run.id, {
      incidentId: run.incidentId,
      category: run.category,
      externalActionExecuted: false,
    });
    return run;
  }

  async createWorkLog(
    organizationId: string,
    userId: string | undefined,
    data: CreateWorkLogDto,
  ) {
    if (data.idempotencyKey) {
      const existing = await this.prisma.workLog.findFirst({
        where: { organizationId, idempotencyKey: data.idempotencyKey },
      });
      if (existing) return existing;
    }

    const startedAt = new Date(data.startedAt);
    const endedAt = data.endedAt ? new Date(data.endedAt) : undefined;
    if (endedAt && endedAt < startedAt) {
      throw new BadRequestException('endedAt must be after startedAt');
    }

    let workLog;
    try {
      workLog = await this.prisma.workLog.create({
        data: {
          organizationId,
          startedAt,
          endedAt,
          minutes: data.minutes,
          travelMinutes: data.travelMinutes ?? 0,
          outsideHours: data.outsideHours ?? false,
          category: data.category?.trim() || 'operations',
          notes: data.notes?.trim(),
          createdBy: userId,
          idempotencyKey: data.idempotencyKey,
        },
      });
    } catch (error) {
      return this.recoverIdempotentConflict(error, data.idempotencyKey, () =>
        this.prisma.workLog.findFirst({
          where: { organizationId, idempotencyKey: data.idempotencyKey },
        }),
      );
    }

    await this.recordAudit(organizationId, userId, 'WORK_LOG_CREATED', 'work_log', workLog.id, {
      minutes: workLog.minutes,
      outsideHours: workLog.outsideHours,
      travelMinutes: workLog.travelMinutes,
    });
    return workLog;
  }

  async getDailySummary(organizationId: string) {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [
      incidents,
      urgentTasks,
      commitments,
      alerts,
      pendingApprovals,
      workAggregate,
      criticalIncidents,
      overdueCommitments,
    ] =
      await Promise.all([
        this.prisma.operationIncident.findMany({
          where: { organizationId, status: { in: OPEN_STATUSES } },
          orderBy: { lastActivityAt: 'desc' },
          take: 100,
        }),
        this.prisma.task.findMany({
          where: {
            organizationId,
            source: { in: ['operations', 'panic_protocol', 'automation'] },
            status: { notIn: ['resolved', 'cancelled', 'completed'] },
            OR: [
              { priority: { in: ['critical', 'high'] } },
              { dueDate: { lte: dayEnd } },
            ],
          },
          orderBy: { dueDate: 'asc' },
          take: 100,
        }),
        this.prisma.commitment.findMany({
          where: { organizationId, status: { in: OPEN_STATUSES } },
          orderBy: { dueAt: 'asc' },
          take: 20,
        }),
        this.prisma.riskSignal.findMany({
          where: { organizationId, status: { in: OPEN_STATUSES } },
          orderBy: { detectedAt: 'desc' },
          take: 100,
        }),
        this.prisma.approvalRequest.count({
          where: { organizationId, status: 'pending' },
        }),
        this.prisma.workLog.aggregate({
          where: { organizationId, startedAt: { gte: weekStart } },
          _sum: { minutes: true, travelMinutes: true },
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
            dueAt: { lt: now },
          },
        }),
      ]);

    const outsideHours = await this.prisma.workLog.aggregate({
      where: {
        organizationId,
        startedAt: { gte: weekStart },
        outsideHours: true,
      },
      _sum: { minutes: true },
    });
    const workload = calculateWorkloadRisk({
      workedMinutes: workAggregate._sum.minutes ?? 0,
      outsideHoursMinutes: outsideHours._sum.minutes ?? 0,
      criticalIncidents,
      overdueCommitments,
    });

    return {
      generatedAt: now.toISOString(),
      integrationHealth: [
        this.disabledIntegration('Gmail', 'email', now),
        this.disabledIntegration('Calendar', 'other', now),
        this.disabledIntegration('WhatsApp', 'other', now),
      ],
      incidents: this.sortByPriority(incidents, 'severity').slice(0, 20),
      urgentTasks: this.sortByPriority(urgentTasks, 'priority').slice(0, 20),
      commitments,
      alerts: this.sortByPriority(alerts, 'severity').slice(0, 20),
      pendingApprovals,
      workload: {
        ...workload,
        workedMinutes: workAggregate._sum.minutes ?? 0,
        outsideHoursMinutes: outsideHours._sum.minutes ?? 0,
        travelMinutes: workAggregate._sum.travelMinutes ?? 0,
        overdueCommitments,
      },
    };
  }

  private async requireIncident(organizationId: string, incidentId: string) {
    const incident = await this.prisma.operationIncident.findFirst({
      where: { id: incidentId, organizationId },
    });
    if (!incident) throw new NotFoundException('Incident not found');
    return incident;
  }

  private async findIncidentReplay(organizationId: string, idempotencyKey?: string) {
    if (!idempotencyKey) return null;
    return this.prisma.operationIncident.findFirst({
      where: { organizationId, idempotencyKey },
    });
  }

  private async touchIncident(incidentId?: string) {
    if (!incidentId) return;
    await this.prisma.operationIncident.update({
      where: { id: incidentId },
      data: { lastActivityAt: new Date() },
    });
  }

  private async recordAudit(
    organizationId: string,
    userId: string | undefined,
    action: string,
    entityType:
      | 'operation_incident'
      | 'task'
      | 'commitment'
      | 'approval_request'
      | 'panic_protocol_run'
      | 'work_log',
    entityId: string,
    metadata: Prisma.InputJsonValue,
  ) {
    await this.auditLog.record({
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      metadata,
    });
  }

  private disabledIntegration(
    provider: string,
    kind: IntegrationHealth['kind'],
    checkedAt: Date,
  ): IntegrationHealth {
    return {
      provider,
      kind,
      status: 'disabled',
      checkedAt: checkedAt.toISOString(),
      message: 'Phase 1 has no real account connection or external action path.',
    };
  }

  private sortByPriority<T extends Record<K, string>, K extends keyof T>(
    items: T[],
    key: K,
  ): T[] {
    const rank: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };
    return [...items].sort(
      (left, right) => (rank[right[key]] ?? 0) - (rank[left[key]] ?? 0),
    );
  }

  private async recoverIdempotentConflict<T>(
    error: unknown,
    idempotencyKey: string | undefined,
    findReplay: () => Promise<T | null>,
  ): Promise<T> {
    if (
      idempotencyKey &&
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const replay = await findReplay();
      if (replay) return replay;
    }
    throw error;
  }
}
