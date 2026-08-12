import { UnauthorizedException } from '@nestjs/common';
import { CompetitorsController } from './competitors.controller';

describe('CompetitorsController', () => {
  const competitorsService = {
    createCompetitor: jest.fn(),
    getCompetitors: jest.fn(),
    getCompetitorById: jest.fn(),
    updateCompetitor: jest.fn(),
    deleteCompetitor: jest.fn(),
    checkCompetitorRankings: jest.fn(),
  };

  const controller = new CompetitorsController(competitorsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects competitor access without organization context', async () => {
    await expect(
      controller.getCompetitors({}, 'project-1', {}),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('passes tenant context into competitor checks', async () => {
    await controller.checkCompetitor(
      { user: { organizationId: 'org-1' } },
      'competitor-1',
    );

    expect(competitorsService.checkCompetitorRankings).toHaveBeenCalledWith(
      'competitor-1',
      'org-1',
    );
  });
});
