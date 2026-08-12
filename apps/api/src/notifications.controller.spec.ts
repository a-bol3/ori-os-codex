import { UnauthorizedException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  const prisma = {
    notification: {
      findMany: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const controller = new NotificationsController(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects notifications access without organization context', async () => {
    await expect(controller.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('passes tenant context into mark-all-read', async () => {
    await controller.markAllRead({ user: { organizationId: 'org-1' } });

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', read: false },
      data: { read: true },
    });
  });
});
