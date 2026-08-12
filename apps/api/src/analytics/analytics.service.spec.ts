import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  const prisma = {
    pipelineStage: {
      findMany: jest.fn(),
    },
  };

  const service = new AnalyticsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('scopes funnel stages by organization', async () => {
    prisma.pipelineStage.findMany.mockResolvedValue([]);

    await service.getFunnel('org-1');

    expect(prisma.pipelineStage.findMany).toHaveBeenCalledWith({
      where: { pipeline: { organizationId: 'org-1' } },
      select: {
        name: true,
        deals: { select: { id: true, valueAmount: true } },
      },
    });
  });
});
