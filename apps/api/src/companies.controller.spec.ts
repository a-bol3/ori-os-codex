import { UnauthorizedException } from '@nestjs/common';
import { CompaniesController } from './companies.controller';

describe('CompaniesController', () => {
  const prisma = {
    company: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const auditLog = {
    record: jest.fn(),
  };

  const controller = new CompaniesController(prisma as never, auditLog as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects company listing without organization context', async () => {
    await expect(controller.findAll({}, {})).rejects.toThrow(UnauthorizedException);
  });

  it('passes authenticated organization into company creation', async () => {
    prisma.company.create.mockResolvedValue({
      id: 'company-1',
      name: 'Acme Inc.',
      domain: null,
    });

    await controller.create(
      { user: { organizationId: 'org-1' } },
      { name: 'Acme Inc.' },
    );

    expect(prisma.company.create).toHaveBeenCalledWith({
      data: { name: 'Acme Inc.', organizationId: 'org-1' },
      include: {
        _count: { select: { contacts: true } },
      },
    });
  });

  it('bulk deletes only companies owned by the authenticated organization', async () => {
    prisma.company.findMany.mockResolvedValue([
      { id: 'company-1', name: 'Acme', domain: 'acme.com' },
      { id: 'company-2', name: 'Beta', domain: null },
    ]);

    const result = await controller.bulkDelete(
      { user: { organizationId: 'org-1' } },
      { ids: ['company-1', 'company-2', 'company-other-org'] },
    );

    expect(prisma.company.deleteMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', id: { in: ['company-1', 'company-2'] } },
    });
    expect(result).toEqual({ deleted: 2 });
  });
});
