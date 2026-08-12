import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DealsController } from './deals.controller';

describe('DealsController', () => {
  const prisma = {
    deal: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    company: {
      findFirst: jest.fn(),
    },
    contact: {
      findFirst: jest.fn(),
    },
    pipeline: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    pipelineStage: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    activity: {
      create: jest.fn().mockResolvedValue(undefined),
    },
  };

  const workflowTrigger = {
    trigger: jest.fn(),
  };

  const auditLog = {
    record: jest.fn(),
  };

  const controller = new DealsController(prisma as never, workflowTrigger as never, auditLog as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects deal listing without organization context', async () => {
    await expect(controller.findAll({}, {})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects deal creation when contact belongs to another organization', async () => {
    prisma.company.findFirst.mockResolvedValue({ id: 'company-1' });
    prisma.contact.findFirst.mockResolvedValue(null);

    await expect(
      controller.create(
        { user: { organizationId: 'org-1' } },
        { name: 'Big Deal', companyId: 'company-1', contactId: 'contact-2' },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('bulk deletes only deals owned by the authenticated organization', async () => {
    prisma.deal.findMany.mockResolvedValue([
      { id: 'deal-1', name: 'Deal One', valueAmount: 1000 },
      { id: 'deal-2', name: 'Deal Two', valueAmount: 2000 },
    ]);

    const result = await controller.bulkDelete(
      { user: { organizationId: 'org-1' } },
      { ids: ['deal-1', 'deal-2', 'deal-other-org'] },
    );

    expect(prisma.deal.deleteMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', id: { in: ['deal-1', 'deal-2'] } },
    });
    expect(result).toEqual({ deleted: 2 });
  });
});
