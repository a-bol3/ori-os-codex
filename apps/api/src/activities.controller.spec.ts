import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';

describe('ActivitiesController', () => {
  const prisma = {
    activity: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const auditLog = {
    record: jest.fn(),
  };

  const controller = new ActivitiesController(prisma as never, auditLog as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects activities listing without organization context', async () => {
    await expect(controller.findAll({}, {})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects mark-as-read outside the authenticated organization', async () => {
    prisma.activity.findFirst.mockResolvedValue(null);

    await expect(
      controller.markAsRead({ user: { organizationId: 'org-1' } }, 'activity-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
