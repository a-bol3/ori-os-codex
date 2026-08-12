import { UnauthorizedException } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';

describe('IntelligenceController', () => {
  const service = {
    createIcpProfile: jest.fn(),
    getIcpProfiles: jest.fn(),
    updateIcpProfile: jest.fn(),
    deleteIcpProfile: jest.fn(),
    searchLeads: jest.fn(),
    enqueueEnrichment: jest.fn(),
    getEnrichmentJobs: jest.fn(),
  };

  const controller = new IntelligenceController(service as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects ICP listing without organization context', async () => {
    await expect(controller.getIcps({})).rejects.toThrow(UnauthorizedException);
  });

  it('passes tenant context into ICP updates', async () => {
    await controller.updateIcp(
      { user: { organizationId: 'org-1' } },
      'icp-1',
      { name: 'ICP A' } as never,
    );

    expect(service.updateIcpProfile).toHaveBeenCalledWith(
      'org-1',
      'icp-1',
      { name: 'ICP A' },
    );
  });
});
