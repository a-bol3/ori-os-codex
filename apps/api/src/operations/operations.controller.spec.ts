import { ForbiddenException } from '@nestjs/common';
import { OperationsController } from './operations.controller';

describe('OperationsController', () => {
  const operations = {
    getDailySummary: jest.fn(),
    createIncident: jest.fn(),
  };
  const previousFlag = process.env.ENABLE_OPERATIONS_CORE;

  beforeAll(() => {
    process.env.ENABLE_OPERATIONS_CORE = 'true';
  });

  afterAll(() => {
    if (previousFlag === undefined) delete process.env.ENABLE_OPERATIONS_CORE;
    else process.env.ENABLE_OPERATIONS_CORE = previousFlag;
  });

  beforeEach(() => jest.clearAllMocks());

  it('passes the authenticated organization to summary queries', async () => {
    operations.getDailySummary.mockResolvedValue({ incidents: [] });
    const controller = new OperationsController(operations as never);
    const request = {
      user: { userId: 'user-1', organizationId: 'org-a', role: 'VIEWER' as const },
    };

    await controller.summary(request);
    expect(operations.getDailySummary).toHaveBeenCalledWith('org-a');
  });

  it('rejects write endpoints for a viewer', () => {
    const controller = new OperationsController(operations as never);
    const request = {
      user: { userId: 'user-1', organizationId: 'org-a', role: 'VIEWER' as const },
    };

    expect(() => controller.createIncident(request, { title: 'Blocked' })).toThrow(
      ForbiddenException,
    );
    expect(operations.createIncident).not.toHaveBeenCalled();
  });
});
