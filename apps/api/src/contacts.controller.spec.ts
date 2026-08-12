import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ContactsController } from './contacts.controller';

describe('ContactsController', () => {
  const prisma = {
    contact: {
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
    activity: {
      create: jest.fn(),
    },
  };

  const workflowTrigger = {
    trigger: jest.fn(),
  };

  const auditLog = {
    record: jest.fn(),
  };

  const controller = new ContactsController(prisma as never, workflowTrigger as never, auditLog as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects contact listing without organization context', async () => {
    await expect(controller.findAll({}, {})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects contact creation when company belongs to another organization', async () => {
    prisma.company.findFirst.mockResolvedValue(null);

    await expect(
      controller.create(
        { user: { organizationId: 'org-1' } },
        { email: 'ada@example.com', firstName: 'Ada', companyId: 'company-2' },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('bulk deletes only contacts owned by the authenticated organization', async () => {
    prisma.contact.findMany.mockResolvedValue([
      { id: 'contact-1', email: 'one@example.com' },
      { id: 'contact-2', email: 'two@example.com' },
    ]);

    const result = await controller.bulkDelete(
      { user: { organizationId: 'org-1' } },
      { ids: ['contact-1', 'contact-2', 'contact-other-org'] },
    );

    expect(prisma.contact.deleteMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1', id: { in: ['contact-1', 'contact-2'] } },
    });
    expect(result).toEqual({ deleted: 2 });
  });
});
