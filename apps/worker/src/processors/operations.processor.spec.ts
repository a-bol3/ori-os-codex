import { OperationsProcessor } from './operations.processor';

describe('OperationsProcessor', () => {
  const prisma = {
    commitment: { findMany: jest.fn(), count: jest.fn() },
    operationIncident: { findMany: jest.fn(), count: jest.fn() },
    riskSignal: { findFirst: jest.fn(), create: jest.fn() },
    organization: { findMany: jest.fn() },
    workLog: { aggregate: jest.fn() },
    workloadSnapshot: { upsert: jest.fn() },
    auditLog: { create: jest.fn() },
  };
  const originalFlag = process.env.ENABLE_OPERATIONS_CORE;
  let processor: OperationsProcessor;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ENABLE_OPERATIONS_CORE = 'true';
    processor = new OperationsProcessor(prisma as never);
  });

  afterAll(() => {
    if (originalFlag === undefined) delete process.env.ENABLE_OPERATIONS_CORE;
    else process.env.ENABLE_OPERATIONS_CORE = originalFlag;
  });

  it('does nothing while the feature is disabled', async () => {
    process.env.ENABLE_OPERATIONS_CORE = 'false';
    await expect(processor.process({ name: 'scan-reminders' } as never)).resolves.toEqual({
      skipped: true,
      reason: 'feature_disabled',
    });
    expect(prisma.commitment.findMany).not.toHaveBeenCalled();
  });

  it('does not duplicate reminder signals when a job is retried', async () => {
    prisma.commitment.findMany.mockResolvedValue([
      {
        id: 'commitment-1',
        organizationId: 'org-a',
        incidentId: null,
        title: 'Confirm shift',
        dueAt: new Date(Date.now() + 60_000),
      },
    ]);
    prisma.riskSignal.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'risk-1' });
    prisma.riskSignal.create.mockResolvedValue({ id: 'risk-1' });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    await processor.process({ name: 'scan-reminders' } as never);
    await processor.process({ name: 'scan-reminders' } as never);

    expect(prisma.riskSignal.create).toHaveBeenCalledTimes(1);
    expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
  });

  it('upserts one tenant-scoped workload snapshot per UTC day', async () => {
    prisma.organization.findMany.mockResolvedValue([{ id: 'org-a' }]);
    prisma.workLog.aggregate
      .mockResolvedValueOnce({ _sum: { minutes: 600, travelMinutes: 30 } })
      .mockResolvedValueOnce({ _sum: { minutes: 60 } });
    prisma.operationIncident.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    prisma.commitment.count.mockResolvedValue(1);
    prisma.workloadSnapshot.upsert.mockResolvedValue({ id: 'snapshot-1' });
    prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

    await processor.process({ name: 'build-daily-summary' } as never);

    expect(prisma.workloadSnapshot.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          organizationId_snapshotDate: {
            organizationId: 'org-a',
            snapshotDate: expect.any(Date),
          },
        },
      }),
    );
  });
});
