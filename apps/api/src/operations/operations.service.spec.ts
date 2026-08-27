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
    approvalRequest: { findFirst: jest.fn(), create: jest.fn() },
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
