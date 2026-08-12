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
    });
    prisma.contact.update.mockResolvedValue({});
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
  });

  it('allows idempotent resubscribe through the signed token', async () => {
    prisma.contact.findFirst.mockResolvedValue({
      id: 'contact-1',
      organizationId: 'org-1',
      email: 'person@example.com',
      optOut: true,
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
