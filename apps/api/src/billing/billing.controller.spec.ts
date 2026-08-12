import { UnauthorizedException } from '@nestjs/common';
import { BillingController } from './billing.controller';

describe('BillingController', () => {
  const billingService = {
    createCheckoutSession: jest.fn(),
    getBillingStatus: jest.fn(),
  };

  const prisma = {
    subscription: {
      findUnique: jest.fn(),
    },
    emailEvent: {
      count: jest.fn(),
    },
  };

  const controller = new BillingController(
    billingService as never,
    prisma as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects billing status access without organization context', async () => {
    await expect(controller.getStatus({})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes the authenticated organization to checkout creation', async () => {
    await controller.createCheckout(
      { user: { organizationId: 'org-1' } },
      'https://app.ori-os.test/return',
    );

    expect(billingService.createCheckoutSession).toHaveBeenCalledWith(
      'org-1',
      'https://app.ori-os.test/return',
    );
  });
});
