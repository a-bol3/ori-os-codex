import { UnauthorizedException } from '@nestjs/common';
import { SeoKeywordsController } from './seo-keywords.controller';

describe('SeoKeywordsController', () => {
  const seoKeywordsService = {
    findAll: jest.fn(),
    getRankingHistory: jest.fn(),
    create: jest.fn(),
    bulkCreate: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    discoverKeywords: jest.fn(),
    clusterKeywords: jest.fn(),
  };

  const controller = new SeoKeywordsController(seoKeywordsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects keyword listing without organization context', async () => {
    await expect(controller.findAll('project-1', {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes authenticated organization into keyword creation', async () => {
    await controller.create(
      {
        projectId: 'project-1',
        keyword: 'seo automation',
        targetUrl: 'https://example.com/seo',
      },
      { user: { organizationId: 'org-1' } },
    );

    expect(seoKeywordsService.create).toHaveBeenCalledWith({
      projectId: 'project-1',
      organizationId: 'org-1',
      keyword: 'seo automation',
      targetUrl: 'https://example.com/seo',
      searchVolume: undefined,
      difficulty: undefined,
      source: undefined,
      intent: undefined,
    });
  });

  it('passes authenticated organization into keyword clustering', async () => {
    await controller.cluster(
      { projectId: 'project-1', keywords: ['seo automation'] },
      { user: { organizationId: 'org-1' } },
    );

    expect(seoKeywordsService.clusterKeywords).toHaveBeenCalledWith(
      'project-1',
      'org-1',
      ['seo automation'],
    );
  });
});
