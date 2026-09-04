import { CampaignRecoveryService } from './campaign-recovery.service';

describe('CampaignRecoveryService', () => {
  const prisma = {
    campaign: { findMany: jest.fn() },
    campaignRecipient: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };
  const campaignQueue = {
    getJob: jest.fn(),
    add: jest.fn(),
  };

  let service: CampaignRecoveryService;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-04T10:00:00.000Z'));
    jest.clearAllMocks();
    service = new CampaignRecoveryService(prisma as never, campaignQueue as never);
    prisma.campaign.findMany.mockResolvedValue([
      {
        id: 'campaign-1',
        sequenceSteps: [{ order: 1 }, { order: 2 }, { order: 3 }],
      },
    ]);
    prisma.campaignRecipient.findMany.mockResolvedValue([]);
    campaignQueue.getJob.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('requeues a missing scheduled step with its deterministic recipient job id', async () => {
    const nextStepAt = new Date('2026-09-04T10:05:00.000Z');
    prisma.campaignRecipient.findMany.mockResolvedValue([
      {
        id: 'recipient-1',
        campaignId: 'campaign-1',
        lastStepOrder: 1,
        nextStepOrder: 2,
        nextStepAt,
        status: 'SCHEDULED',
      },
    ]);

    await (service as any).reconcileScheduledRecipients('startup');

    expect(campaignQueue.add).toHaveBeenCalledWith(
      'process-step',
      {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepOrder: 2,
      },
      {
        jobId: 'campaign-campaign-1-recipient-recipient-1-step-2',
        delay: 5 * 60 * 1000,
      },
    );
    expect(prisma.campaignRecipient.update).not.toHaveBeenCalled();
  });

  it('does not duplicate an active or waiting step already present in the queue', async () => {
    const existingJob = {
      getState: jest.fn().mockResolvedValue('waiting'),
    };
    campaignQueue.getJob.mockResolvedValue(existingJob);
    prisma.campaignRecipient.findMany.mockResolvedValue([
      {
        id: 'recipient-1',
        campaignId: 'campaign-1',
        lastStepOrder: 1,
        nextStepOrder: 2,
        nextStepAt: new Date('2026-09-04T10:05:00.000Z'),
        status: 'SCHEDULED',
      },
    ]);

    await (service as any).reconcileScheduledRecipients('interval');

    expect(existingJob.getState).toHaveBeenCalledTimes(1);
    expect(campaignQueue.add).not.toHaveBeenCalled();
  });

  it('removes a terminal stale job before requeuing the scheduled step', async () => {
    const existingJob = {
      getState: jest.fn().mockResolvedValue('completed'),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    campaignQueue.getJob.mockResolvedValue(existingJob);
    prisma.campaignRecipient.findMany.mockResolvedValue([
      {
        id: 'recipient-1',
        campaignId: 'campaign-1',
        lastStepOrder: 1,
        nextStepOrder: 2,
        nextStepAt: new Date('2026-09-04T10:05:00.000Z'),
        status: 'SCHEDULED',
      },
    ]);

    await (service as any).reconcileScheduledRecipients('startup');

    expect(existingJob.remove).toHaveBeenCalledTimes(1);
    expect(campaignQueue.add).toHaveBeenCalledTimes(1);
  });

  it('clears next-step metadata when the referenced step no longer exists', async () => {
    prisma.campaign.findMany.mockResolvedValue([
      { id: 'campaign-1', sequenceSteps: [{ order: 1 }] },
    ]);
    prisma.campaignRecipient.findMany.mockResolvedValue([
      {
        id: 'recipient-1',
        campaignId: 'campaign-1',
        lastStepOrder: 1,
        nextStepOrder: 2,
        nextStepAt: new Date('2026-09-04T10:05:00.000Z'),
        status: 'SCHEDULED',
      },
    ]);

    await (service as any).reconcileScheduledRecipients('interval');

    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith({
      where: { id: 'recipient-1' },
      data: { nextStepOrder: null, nextStepAt: null },
    });
    expect(campaignQueue.getJob).not.toHaveBeenCalled();
    expect(campaignQueue.add).not.toHaveBeenCalled();
  });
});
