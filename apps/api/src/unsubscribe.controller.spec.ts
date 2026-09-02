import { BadRequestException } from '@nestjs/common';
import { createUnsubscribeToken } from './common/unsubscribe-token';
import { UnsubscribeController } from './unsubscribe.controller';

describe('UnsubscribeController', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  const prisma = {
    contact: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    emailEvent: {
      create: jest.fn(),
    },
    campaignRecipient: {
      updateMany: jest.fn(),
    },
  };

  const controller = new UnsubscribeController(prisma as never);

  const createToken = (payload: {
    contactId: string;
    organizationId: string;
    campaignId?: string;
  }) => createUnsubscribeToken(payload, process.env.JWT_SECRET as string);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('rejects malformed unsubscribe tokens', async () => {
    await expect(controller.unsubscribe('bad-token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('marks a contact opted out and updates campaign recipient state', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'contact-1',
      organizationId: 'org-1',
      email: 'person@example.com',
      optOut: false,
      optOutTimestamp: null,
    });
    prisma.contact.update.mockResolvedValue({});
    prisma.emailEvent.create.mockResolvedValue({ id: 'event-1' });
    prisma.campaignRecipient.updateMany.mockResolvedValue({ count: 1 });

    const token = createToken({
      contactId: 'contact-1',
      organizationId: 'org-1',
      campaignId: 'campaign-1',
    });

    await controller.unsubscribe(token);

    const [updateArgs] = prisma.contact.update.mock.calls[0] as [unknown];

    expect(updateArgs).toMatchObject({
      where: { id: 'contact-1' },
      data: {
        optOut: true,
      },
    });
    const typedUpdateArgs = updateArgs as { data: { optOutTimestamp: Date } };
    expect(typedUpdateArgs.data.optOutTimestamp).toBeInstanceOf(Date);
    expect(prisma.campaignRecipient.updateMany).toHaveBeenCalledWith({
      where: {
        campaignId: 'campaign-1',
        contactId: 'contact-1',
      },
      data: {
        status: 'OPTED_OUT',
      },
    });
    expect(prisma.emailEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        campaignId: 'campaign-1',
        contactId: 'contact-1',
        dedupeKey: 'unsubscribe:org-1:contact-1',
        eventType: 'UNSUBSCRIBED',
      }),
    });
  });

  it('accepts an unsubscribe replay when the event already exists', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'contact-1',
      organizationId: 'org-1',
      email: 'person@example.com',
      optOut: true,
      optOutTimestamp: new Date('2026-09-02T09:00:00.000Z'),
    });
    prisma.contact.update.mockResolvedValue({});
    prisma.emailEvent.create.mockRejectedValue({ code: 'P2002' });
    prisma.campaignRecipient.updateMany.mockResolvedValue({ count: 1 });

    const token = createToken({
      contactId: 'contact-1',
      organizationId: 'org-1',
      campaignId: 'campaign-1',
    });

    await expect(controller.unsubscribe(token)).resolves.toMatchObject({
      success: true,
    });
    expect(prisma.emailEvent.create).toHaveBeenCalledTimes(1);
  });

  it('allows idempotent resubscribe through the signed token', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'contact-1',
      organizationId: 'org-1',
      email: 'person@example.com',
      optOut: true,
      optOutTimestamp: new Date('2026-09-02T09:00:00.000Z'),
    });
    prisma.contact.update.mockResolvedValue({});

    const token = createToken({
      contactId: 'contact-1',
      organizationId: 'org-1',
    });

    await controller.resubscribe(token);

    expect(prisma.contact.update).toHaveBeenCalledWith({
      where: { id: 'contact-1' },
      data: {
        optOut: false,
      },
    });
  });
});
