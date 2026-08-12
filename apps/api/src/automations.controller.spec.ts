import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AutomationsController } from './automations.controller';

describe('AutomationsController', () => {
  const prisma = {
    workflow: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workflowRun: {
      findMany: jest.fn(),
    },
  };

  const workflowTrigger = {
    trigger: jest.fn(),
  };

  const controller = new AutomationsController(
    prisma as never,
    workflowTrigger as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects workflow listing without organization context', async () => {
    await expect(controller.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects workflow reads outside the authenticated organization', async () => {
    prisma.workflow.findFirst.mockResolvedValue(null);

    await expect(
      controller.findOne({ user: { organizationId: 'org-1' } }, 'workflow-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
