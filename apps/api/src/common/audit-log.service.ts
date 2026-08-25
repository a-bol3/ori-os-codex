import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Prisma } from '@prisma/client';

type AuditEntityType =
  | 'contact'
  | 'company'
  | 'deal'
  | 'task'
  | 'activity'
  | 'operation_incident'
  | 'commitment'
  | 'approval_request'
  | 'panic_protocol_run'
  | 'work_log';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    organizationId: string;
    userId?: string;
    action: string;
    entityType: AuditEntityType;
    entityId: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadataJson: params.metadata,
      },
    });
  }
}
