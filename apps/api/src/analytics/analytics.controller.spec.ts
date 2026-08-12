import { UnauthorizedException } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';

describe('AnalyticsController', () => {
  const analyticsService = {
    getOverview: jest.fn(),
    getRevenueTrend: jest.fn(),
    getFunnel: jest.fn(),
  };

  const controller = new AnalyticsController(analyticsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects analytics access without organization context', async () => {
    await expect(controller.getOverview({})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes the authenticated organization to the funnel query', async () => {
    await controller.getFunnel({ user: { organizationId: 'org-1' } });

    expect(analyticsService.getFunnel).toHaveBeenCalledWith('org-1');
  });
});
