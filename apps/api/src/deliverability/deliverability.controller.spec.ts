import { UnauthorizedException } from '@nestjs/common';
import { DeliverabilityController } from './deliverability.controller';

describe('DeliverabilityController', () => {
  const service = {
    createDomain: jest.fn(),
    getDomains: jest.fn(),
    verifyDns: jest.fn(),
    createMailbox: jest.fn(),
    getMailboxes: jest.fn(),
    updateMailbox: jest.fn(),
  };

  const controller = new DeliverabilityController(service as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects domain access without organization context', () => {
    expect(() => controller.getDomains({})).toThrow(UnauthorizedException);
  });

  it('passes the authenticated organization to tenant-scoped mutations', () => {
    controller.updateMailbox(
      { user: { organizationId: 'org-1' } },
      'mailbox-1',
      { isActive: true },
    );

    expect(service.updateMailbox).toHaveBeenCalledWith('org-1', 'mailbox-1', {
      isActive: true,
    });
  });
});
