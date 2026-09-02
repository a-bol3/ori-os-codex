import { ResendWebhookService } from './resend-webhook.service';

const mockVerify = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    webhooks: { verify: mockVerify },
  })),
}));

describe('ResendWebhookService', () => {
  const prisma = {
    emailEvent: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    campaignRecipient: {
      updateMany: jest.fn(),
    },
  } as any;

  let service: ResendWebhookService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_test';
    service = new ResendWebhookService(prisma);
  });

  afterEach(() => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    jest.restoreAllMocks();
  });

  it('persists delivered events and updates the matching recipient', async () => {
    mockVerify.mockReturnValue({
      type: 'email.delivered',
      created_at: '2026-09-02T08:00:00.000Z',
      data: { email_id: 'resend-message-1' },
    });
    prisma.emailEvent.findFirst.mockResolvedValue({
      campaignId: 'campaign-1',
      contactId: 'contact-1',
      mailboxId: 'mailbox-1',
    });
    prisma.emailEvent.create.mockResolvedValue({
      campaignId: 'campaign-1',
      contactId: 'contact-1',
    });
    prisma.campaignRecipient.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.handle(
      Buffer.from('{"type":"email.delivered"}'),
      { id: 'msg-1', timestamp: '1700000000', signature: 'v1,test' },
    );

    expect(result).toMatchObject({
      accepted: true,
      handled: true,
      duplicate: false,
      eventType: 'DELIVERED',
      matchedCampaign: true,
    });
    expect(prisma.emailEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerMessageId: 'resend-message-1',
        dedupeKey: 'resend-webhook:msg-1',
        eventType: 'DELIVERED',
      }),
    });
    expect(prisma.campaignRecipient.updateMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaign-1', contactId: 'contact-1' },
      data: { lastEventAt: expect.any(Date) },
    });
  });

  it('marks a recipient bounced and stops future sequence steps', async () => {
    mockVerify.mockReturnValue({
      type: 'email.bounced',
      created_at: '2026-09-02T08:00:00.000Z',
      data: { email_id: 'resend-message-2', bounce: { type: 'Permanent' } },
    });
    prisma.emailEvent.findFirst.mockResolvedValue({
      campaignId: 'campaign-2',
      contactId: 'contact-2',
      mailboxId: null,
    });
    prisma.emailEvent.create.mockResolvedValue({
      campaignId: 'campaign-2',
      contactId: 'contact-2',
    });
    prisma.campaignRecipient.updateMany.mockResolvedValue({ count: 1 });

    await service.handle(Buffer.from('{}'), {
      id: 'msg-2',
      timestamp: '1700000000',
      signature: 'v1,test',
    });

    expect(prisma.campaignRecipient.updateMany).toHaveBeenCalledWith({
      where: { campaignId: 'campaign-2', contactId: 'contact-2' },
      data: {
        status: 'BOUNCED',
        nextStepOrder: null,
        nextStepAt: null,
        lastEventAt: expect.any(Date),
      },
    });
  });

  it('treats a duplicate webhook delivery as a harmless replay', async () => {
    mockVerify.mockReturnValue({
      type: 'email.delivered',
      created_at: '2026-09-02T08:00:00.000Z',
      data: { email_id: 'resend-message-3' },
    });
    prisma.emailEvent.findFirst.mockResolvedValue({
      campaignId: 'campaign-3',
      contactId: 'contact-3',
      mailboxId: null,
    });
    prisma.emailEvent.create.mockRejectedValue({ code: 'P2002' });
    prisma.emailEvent.findUnique.mockResolvedValue({
      campaignId: 'campaign-3',
      contactId: 'contact-3',
    });
    prisma.campaignRecipient.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.handle(Buffer.from('{}'), {
      id: 'msg-3',
      timestamp: '1700000000',
      signature: 'v1,test',
    });

    expect(result).toMatchObject({ duplicate: true, matchedCampaign: true });
    expect(prisma.emailEvent.create).toHaveBeenCalledTimes(1);
    expect(prisma.campaignRecipient.updateMany).toHaveBeenCalledTimes(1);
  });

  it('acknowledges unrelated verified event types without mutating campaign state', async () => {
    mockVerify.mockReturnValue({
      type: 'email.opened',
      created_at: '2026-09-02T08:00:00.000Z',
      data: { email_id: 'resend-message-4' },
    });

    const result = await service.handle(Buffer.from('{}'), {
      id: 'msg-4',
      timestamp: '1700000000',
      signature: 'v1,test',
    });

    expect(result).toMatchObject({
      accepted: true,
      handled: false,
      eventType: 'email.opened',
    });
    expect(prisma.emailEvent.create).not.toHaveBeenCalled();
    expect(prisma.campaignRecipient.updateMany).not.toHaveBeenCalled();
  });
});
