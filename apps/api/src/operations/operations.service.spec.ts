import { NotFoundException } from '@nestjs/common';
import { OperationsService } from './operations.service';

describe('OperationsService', () => {
  const audit = { record: jest.fn() };
  const prisma = {
    operationIncident: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    panicProtocolRun: { findFirst: jest.fn() },
    task: { findFirst: jest.fn(), create: jest.fn() },
    commitment: { findFirst: jest.fn(), create: jest.fn() },
    approvalRequest: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    workLog: { findFirst: jest.fn(), create: jest.fn() },
    integration: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  let service: OperationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OperationsService(prisma as never, audit as never);
  });

  it('replays an idempotent incident create without another write or audit event', async () => {
    const existing = { id: 'incident-1', organizationId: 'org-a' };
    prisma.operationIncident.findFirst.mockResolvedValue(existing);

    await expect(
      service.createIncident('org-a', 'user-1', {
        title: 'Duplicate',
        idempotencyKey: 'request-1',
      }),
    ).resolves.toBe(existing);
    expect(prisma.operationIncident.findFirst).toHaveBeenCalledWith({
      where: { organizationId: 'org-a', idempotencyKey: 'request-1' },
    });
    expect(prisma.operationIncident.create).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('cannot update an incident belonging to another organization', async () => {
    prisma.operationIncident.findFirst.mockResolvedValue(null);

    await expect(
      service.updateIncident('org-a', 'user-1', 'incident-from-org-b', {
        status: 'resolved',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.operationIncident.findFirst).toHaveBeenCalledWith({
      where: { id: 'incident-from-org-b', organizationId: 'org-a' },
    });
    expect(prisma.operationIncident.update).not.toHaveBeenCalled();
  });

  it('creates a task scoped to the organization and audits it', async () => {
    const task = { id: 'task-1', organizationId: 'org-a', priority: 'high' };
    prisma.task.findFirst.mockResolvedValue(null);
    prisma.task.create.mockResolvedValue(task);

    await expect(service.createTask('org-a', 'user-1', {
      title: 'Review blocker', priority: 'high', idempotencyKey: 'task-request-1',
    })).resolves.toBe(task);
    expect(prisma.task.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      organizationId: 'org-a', title: 'Review blocker', priority: 'high', source: 'operations',
    }) });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'OPERATION_TASK_CREATED' }));
  });

  it('creates a commitment with a normalized due date', async () => {
    const commitment = { id: 'commitment-1', organizationId: 'org-a', dueAt: new Date('2026-09-01T10:00:00.000Z') };
    prisma.commitment.findFirst.mockResolvedValue(null);
    prisma.commitment.create.mockResolvedValue(commitment);

    await expect(service.createCommitment('org-a', 'user-1', {
      title: 'Send proposal', dueAt: '2026-09-01T10:00:00.000Z', idempotencyKey: 'commitment-1',
    })).resolves.toBe(commitment);
    expect(prisma.commitment.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      organizationId: 'org-a', title: 'Send proposal', ownerUserId: 'user-1', dueAt: expect.any(Date),
    }) });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'COMMITMENT_CREATED' }));
  });

  it('creates a pending approval request without executing an external action', async () => {
    const request = { id: 'approval-1', organizationId: 'org-a', status: 'pending' };
    prisma.approvalRequest.findFirst.mockResolvedValue(null);
    prisma.approvalRequest.create.mockResolvedValue(request);

    await expect(service.createApprovalRequest('org-a', 'user-1', {
      actionType: 'send_message', summary: 'Draft response', payload: { channel: 'whatsapp' },
      idempotencyKey: 'approval-1',
    })).resolves.toBe(request);
    expect(prisma.approvalRequest.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      organizationId: 'org-a', actionType: 'send_message', requestedBy: 'user-1', payloadJson: { channel: 'whatsapp' },
    }) });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'APPROVAL_REQUEST_CREATED' }));
  });

  it('lists approvals only for the authenticated organization', async () => {
    prisma.approvalRequest.findMany.mockResolvedValue([]);
    await service.listApprovalRequests('org-a', { status: 'pending', limit: 10 });
    expect(prisma.approvalRequest.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-a', status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  });

  it('records an approval decision without executing the external action', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue({
      id: 'approval-1', organizationId: 'org-a', status: 'pending',
      actionType: 'gmail_reply', expiresAt: null,
    });
    prisma.approvalRequest.updateMany.mockResolvedValue({ count: 1 });
    prisma.approvalRequest.findFirst
      .mockResolvedValueOnce({
        id: 'approval-1', organizationId: 'org-a', status: 'pending',
        actionType: 'gmail_reply', expiresAt: null,
      })
      .mockResolvedValueOnce({
      id: 'approval-1', actionType: 'gmail_reply', status: 'approved',
      });
    await service.decideApprovalRequest('org-a', 'operator-1', 'approval-1', {
      decision: 'approved',
    });
    expect(prisma.approvalRequest.updateMany).toHaveBeenCalledWith({
      where: { id: 'approval-1', organizationId: 'org-a', status: 'pending' },
      data: expect.objectContaining({
        status: 'approved', reviewedBy: 'operator-1', reviewedAt: expect.any(Date),
      }),
    });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: 'APPROVAL_REQUEST_APPROVED',
      metadata: expect.objectContaining({ externalActionExecuted: false }),
    }));
  });

  it('cannot decide an approval from another organization', async () => {
    prisma.approvalRequest.findFirst.mockResolvedValue(null);
    await expect(service.decideApprovalRequest('org-a', 'operator-1', 'approval-b', {
      decision: 'rejected', reason: 'Not authorized',
    })).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.approvalRequest.update).not.toHaveBeenCalled();
  });

  it('creates a work log and rejects reversed time ranges', async () => {
    const workLog = { id: 'log-1', organizationId: 'org-a', minutes: 60 };
    prisma.workLog.findFirst.mockResolvedValue(null);
    prisma.workLog.create.mockResolvedValue(workLog);

    await expect(service.createWorkLog('org-a', 'user-1', {
      startedAt: '2026-08-27T09:00:00.000Z', endedAt: '2026-08-27T10:00:00.000Z',
      minutes: 60, travelMinutes: 10, idempotencyKey: 'log-1',
    })).resolves.toBe(workLog);
    expect(prisma.workLog.create).toHaveBeenCalledWith({ data: expect.objectContaining({
      organizationId: 'org-a', minutes: 60, travelMinutes: 10, createdBy: 'user-1',
    }) });
    await expect(service.createWorkLog('org-a', 'user-1', {
      startedAt: '2026-08-27T10:00:00.000Z', endedAt: '2026-08-27T09:00:00.000Z', minutes: 0,
    })).rejects.toThrow('endedAt must be after startedAt');
  });

  it('replays panic activation safely and does not run the transaction twice', async () => {
    const existing = { id: 'panic-1', incident: { id: 'incident-1' } };
    prisma.panicProtocolRun.findFirst.mockResolvedValue(existing);

    await expect(
      service.activatePanicProtocol('org-a', 'user-1', {
        title: 'Critical issue',
        category: 'operational',
        idempotencyKey: 'panic-request-1',
      }),
    ).resolves.toBe(existing);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(audit.record).not.toHaveBeenCalled();
  });

  it('activates only internal panic artifacts and records the safety audit', async () => {
    prisma.panicProtocolRun.findFirst.mockResolvedValue(null);
    const tx = {
      operationIncident: {
        create: jest.fn().mockResolvedValue({ id: 'incident-1', title: 'Site risk' }),
      },
      panicProtocolRun: {
        create: jest.fn().mockResolvedValue({
          id: 'panic-1',
          incidentId: 'incident-1',
          category: 'safety',
        }),
      },
      riskSignal: { create: jest.fn().mockResolvedValue({ id: 'risk-1' }) },
      task: { create: jest.fn().mockResolvedValue({ id: 'task-1' }) },
    };
    prisma.$transaction.mockImplementation(async (callback) => callback(tx));
    audit.record.mockResolvedValue({ id: 'audit-1' });

    await service.activatePanicProtocol('org-a', 'user-1', {
      title: 'Site risk',
      category: 'safety',
      facts: ['Worker reported an injury'],
      idempotencyKey: 'panic-request-2',
    });

    expect(tx.riskSignal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          organizationId: 'org-a',
          severity: 'critical',
        }),
      }),
    );
    expect(tx.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ source: 'panic_protocol' }),
      }),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PANIC_PROTOCOL_ACTIVATED',
        metadata: expect.objectContaining({ externalActionExecuted: false }),
      }),
    );
  });
});
