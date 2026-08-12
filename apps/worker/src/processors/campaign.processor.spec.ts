import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { PrismaService } from '@ori-os/db/nestjs';
import { CampaignProcessor } from './campaign.processor';

describe('CampaignProcessor', () => {
  let processor: CampaignProcessor;
  let prisma: {
    sequenceStep: { findFirst: jest.Mock };
    campaignRecipient: { findUnique: jest.Mock; update: jest.Mock };
    campaign: { findUnique: jest.Mock };
    workflow: { findMany: jest.Mock };
  };
  let emailQueue: { add: jest.Mock };
  let campaignQueue: { add: jest.Mock; getJob: jest.Mock };
  let workflowQueue: { add: jest.Mock };

  const baseRecipient = {
    id: 'recipient-1',
    campaignId: 'campaign-1',
    contactId: 'contact-1',
    contact: {
      id: 'contact-1',
      email: 'anna@folga.com.pl',
      firstName: 'Anna',
      name: 'Anna Kowalska',
    },
    campaign: {
      id: 'campaign-1',
      name: 'Folga Recruiter Re-Engagement',
      organizationId: 'org-1',
      fromEmail: 'business@ori-craftlabs.com',
      subject: 'Fallback subject',
      bodyHtml: '<p>Fallback body</p>',
      bodyText: 'Fallback body',
    },
  };

  beforeEach(async () => {
    emailQueue = { add: jest.fn() };
    campaignQueue = { add: jest.fn(), getJob: jest.fn().mockResolvedValue(null) };
    workflowQueue = { add: jest.fn() };
    prisma = {
      sequenceStep: { findFirst: jest.fn() },
      campaignRecipient: { findUnique: jest.fn(), update: jest.fn() },
      campaign: { findUnique: jest.fn() },
      workflow: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignProcessor,
        { provide: PrismaService, useValue: prisma },
        { provide: getQueueToken('email-send'), useValue: emailQueue },
        { provide: getQueueToken('campaign-queue'), useValue: campaignQueue },
        { provide: getQueueToken('workflow-run'), useValue: workflowQueue },
      ],
    }).compile();

    processor = module.get(CampaignProcessor);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('dispatches an email step immediately when inside the allowed send window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T10:00:00.000Z'));

    prisma.campaignRecipient.findUnique.mockResolvedValue(baseRecipient);
    prisma.sequenceStep.findFirst.mockResolvedValue({
      id: 'step-1',
      stepType: 'EMAIL',
      configJson: { subject: 'Step subject', body: '<p>Step body</p>' },
    });
    prisma.campaign.findUnique.mockResolvedValue({
      sendWindowJson: {
        days: [1, 2, 3, 4, 5],
        start: '08:00',
        end: '18:00',
        tz: 'UTC',
      },
    });

    const result = await processor.process({
      data: { campaignId: 'campaign-1', recipientId: 'recipient-1', stepOrder: 1 },
    } as never);

    expect(result).toMatchObject({ status: 'success', stepProcessed: 'step-1' });
    expect(emailQueue.add).toHaveBeenCalledWith(
      'email-send',
      expect.objectContaining({
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepId: 'step-1',
      }),
    );
    expect(campaignQueue.add).toHaveBeenCalledWith(
      'process-step',
      {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepOrder: 2,
      },
      expect.objectContaining({
        jobId: 'campaign-campaign-1-recipient-recipient-1-step-2',
        delay: 0,
      }),
    );
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recipient-1' },
        data: expect.objectContaining({
          status: 'SCHEDULED',
          lastStepOrder: 1,
          nextStepOrder: 2,
        }),
      }),
    );
  });

  it('prefers edited step content over template defaults when building campaign emails', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T10:00:00.000Z'));

    prisma.campaignRecipient.findUnique.mockResolvedValue(baseRecipient);
    prisma.sequenceStep.findFirst.mockResolvedValue({
      id: 'step-1',
      stepType: 'EMAIL',
      template: {
        subject: 'Hello!',
        bodyHtml: '<p>Hello!</p>',
        bodyText: 'Hello!',
      },
      configJson: {
        subject: 'Quick Test',
        body: '<p>This is a quick test</p>',
      },
    });
    prisma.campaign.findUnique.mockResolvedValue({
      sendWindowJson: {
        days: [1, 2, 3, 4, 5],
        start: '08:00',
        end: '18:00',
        tz: 'UTC',
      },
    });

    await processor.process({
      data: { campaignId: 'campaign-1', recipientId: 'recipient-1', stepOrder: 1 },
    } as never);

    expect(emailQueue.add).toHaveBeenCalledWith(
      'email-send',
      expect.objectContaining({
        subject: 'Quick Test',
        html: '<p>This is a quick test</p>',
      }),
    );
  });

  it('defers an email step until the next allowed send window when outside the configured window', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T20:15:00.000Z'));

    prisma.campaignRecipient.findUnique.mockResolvedValue(baseRecipient);
    prisma.sequenceStep.findFirst.mockResolvedValue({
      id: 'step-1',
      stepType: 'EMAIL',
      configJson: { subject: 'Step subject', body: '<p>Step body</p>' },
    });
    prisma.campaign.findUnique.mockResolvedValue({
      sendWindowJson: {
        days: [1, 2, 3, 4, 5],
        start: '09:00',
        end: '17:00',
        tz: 'UTC',
      },
    });

    const result = await processor.process({
      data: { campaignId: 'campaign-1', recipientId: 'recipient-1', stepOrder: 1 },
    } as never);

    expect(result).toMatchObject({ status: 'deferred' });
    expect(emailQueue.add).not.toHaveBeenCalled();
    expect(campaignQueue.add).toHaveBeenCalledWith(
      'process-step',
      {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepOrder: 1,
      },
      expect.objectContaining({
        jobId: 'campaign-campaign-1-recipient-recipient-1-step-1',
        delay: expect.any(Number),
      }),
    );
    const deferredUpdate = prisma.campaignRecipient.update.mock.calls.find(
      ([arg]) => arg?.data?.nextStepOrder === 1,
    )?.[0];
    expect(deferredUpdate?.data?.status).toBe('SCHEDULED');
    expect(deferredUpdate?.data?.nextStepAt).toBeInstanceOf(Date);
  });

  it('schedules the next step after the configured wait period', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-30T10:00:00.000Z'));

    prisma.campaignRecipient.findUnique.mockResolvedValue(baseRecipient);
    prisma.sequenceStep.findFirst.mockResolvedValue({
      id: 'step-wait',
      stepType: 'WAIT',
      configJson: { days: 1 },
    });

    const result = await processor.process({
      data: { campaignId: 'campaign-1', recipientId: 'recipient-1', stepOrder: 2 },
    } as never);

    expect(result).toMatchObject({ status: 'success', stepProcessed: 'step-wait' });
    expect(campaignQueue.add).toHaveBeenCalledWith(
      'process-step',
      {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepOrder: 3,
      },
      expect.objectContaining({
        jobId: 'campaign-campaign-1-recipient-recipient-1-step-3',
        delay: 24 * 60 * 60 * 1000,
      }),
    );
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recipient-1' },
        data: expect.objectContaining({
          status: 'SCHEDULED',
          lastStepOrder: 2,
          nextStepOrder: 3,
        }),
      }),
    );
  });

  it('defers a follow-up email step to the next allowed window after a wait step has elapsed', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T20:15:00.000Z'));

    prisma.campaignRecipient.findUnique.mockResolvedValue(baseRecipient);
    prisma.sequenceStep.findFirst.mockResolvedValue({
      id: 'step-3',
      stepType: 'EMAIL',
      configJson: { subject: 'Follow-up subject', body: '<p>Follow-up body</p>' },
    });
    prisma.campaign.findUnique.mockResolvedValue({
      sendWindowJson: {
        days: [1, 2, 3, 4, 5],
        start: '09:00',
        end: '17:00',
        tz: 'UTC',
      },
    });

    const result = await processor.process({
      data: { campaignId: 'campaign-1', recipientId: 'recipient-1', stepOrder: 3 },
    } as never);

    expect(result).toMatchObject({ status: 'deferred' });
    expect(emailQueue.add).not.toHaveBeenCalled();
    expect(campaignQueue.add).toHaveBeenCalledWith(
      'process-step',
      {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepOrder: 3,
      },
      expect.objectContaining({
        jobId: 'campaign-campaign-1-recipient-recipient-1-step-3',
        delay: expect.any(Number),
      }),
    );
    const deferredUpdate = prisma.campaignRecipient.update.mock.calls.find(
      ([arg]) => arg?.data?.nextStepOrder === 3,
    )?.[0];
    expect(deferredUpdate?.data?.status).toBe('SCHEDULED');
    expect(deferredUpdate?.data?.nextStepAt).toBeInstanceOf(Date);
  });

  it('marks the recipient flow as completed when no further steps remain', async () => {
    prisma.sequenceStep.findFirst.mockResolvedValue(null);
    prisma.campaignRecipient.findUnique.mockResolvedValue(baseRecipient);
    prisma.workflow.findMany.mockResolvedValue([]);

    const result = await processor.process({
      data: { campaignId: 'campaign-1', recipientId: 'recipient-1', stepOrder: 4 },
    } as never);

    expect(result).toMatchObject({ status: 'completed' });
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'recipient-1' },
        data: {
          nextStepOrder: null,
          nextStepAt: null,
        },
      }),
    );
    expect(emailQueue.add).not.toHaveBeenCalled();
    expect(campaignQueue.add).not.toHaveBeenCalled();
  });
});
