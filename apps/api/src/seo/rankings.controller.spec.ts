import { UnauthorizedException } from '@nestjs/common';
import { RankingsController } from './rankings.controller';

describe('RankingsController', () => {
  const rankingsService = {
    checkRankings: jest.fn(),
    getRankings: jest.fn(),
    getRankingSummary: jest.fn(),
  };

  const controller = new RankingsController(rankingsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects rankings access without organization context', async () => {
    await expect(controller.getRankings('project-1', {}, {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes the authenticated organization into ranking checks', async () => {
    await controller.checkRankings(
      'project-1',
      { projectId: 'project-1', keywordIds: ['kw-1'] },
      { user: { organizationId: 'org-1' } },
    );

    expect(rankingsService.checkRankings).toHaveBeenCalledWith(
      'project-1',
      'org-1',
      ['kw-1'],
    );
  });
});
