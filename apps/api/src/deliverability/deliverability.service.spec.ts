import { NotFoundException } from '@nestjs/common';
import { DeliverabilityService } from './deliverability.service';

describe('DeliverabilityService', () => {
  const prisma = {
    domain: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    mailbox: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const service = new DeliverabilityService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects mailbox updates outside the authenticated organization', async () => {
    prisma.mailbox.findFirst.mockResolvedValue(null);

    await expect(
      service.updateMailbox('org-1', 'mailbox-1', { isActive: false }),
    ).rejects.toThrow(NotFoundException);
  });

  it('looks up domains with organization scoping before verification', async () => {
    prisma.domain.findFirst.mockResolvedValue(null);

    await expect(service.verifyDns('org-1', 'domain-1')).rejects.toThrow(
      NotFoundException,
    );

    expect(prisma.domain.findFirst).toHaveBeenCalledWith({
      where: { id: 'domain-1', organizationId: 'org-1' },
    });
  });
});
