import { CampaignQueueProcessor } from './campaign-queue.processor';

describe('CampaignQueueProcessor', () => {
  const prisma = {
    campaign: {
      findFirst: jest.fn(),
    },
    campaignRecipient: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    emailEvent: {
      create: jest.fn(),
    },
  };

  const emailService = {
    sendEmail: jest.fn(),
  };

  const queue = {
    add: jest.fn(),
  };

  const processor = new CampaignQueueProcessor(
    prisma as never,
    emailService as never,
    queue as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stops progression for replied recipients and clears any next step', async () => {
    prisma.campaign.findFirst.mockResolvedValue({
      id: 'campaign-1',
      organizationId: 'org-1',
      status: 'ACTIVE',
      name: 'Test campaign',
      sequenceSteps: [
        { id: 'step-1', order: 1, stepType: 'EMAIL', configJson: null, template: null },
        { id: 'step-2', order: 2, stepType: 'WAIT', configJson: { days: 1 }, template: null },
      ],
    });

    prisma.campaignRecipient.findFirst.mockResolvedValue({
      id: 'recipient-1',
      campaignId: 'campaign-1',
      contactId: 'contact-1',
      status: 'REPLIED',
      lastStepOrder: 1,
      lastEventAt: new Date('2026-08-07T10:00:00.000Z'),
      nextStepOrder: 2,
      nextStepAt: new Date('2026-08-08T10:00:00.000Z'),
      contact: {
        id: 'contact-1',
        email: 'abolanos@folga.com.pl',
        firstName: 'Abad',
        lastName: 'Bolaños',
      },
    });

    const result = await processor.process({
      name: 'process-step',
      data: {
        campaignId: 'campaign-1',
        recipientId: 'recipient-1',
        stepOrder: 2,
      },
    } as never);

    expect(result).toEqual({
      skipped: true,
      reason: 'Recipient already replied',
    });

    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith({
      where: { id: 'recipient-1' },
      data: {
        nextStepOrder: null,
        nextStepAt: null,
        lastStepOrder: 2,
        lastEventAt: expect.any(Date),
      },
    });
    expect(emailService.sendEmail).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });
});
