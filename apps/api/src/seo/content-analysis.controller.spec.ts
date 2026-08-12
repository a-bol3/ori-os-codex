import { UnauthorizedException } from '@nestjs/common';
import { ContentAnalysisController } from './content-analysis.controller';

describe('ContentAnalysisController', () => {
  const contentService = {
    analyzeContent: jest.fn(),
    getAnalyses: jest.fn(),
    getAnalysisById: jest.fn(),
  };

  const controller = new ContentAnalysisController(contentService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects content analysis access without organization context', async () => {
    await expect(
      controller.getAnalyses({}, 'project-1', {}),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('passes the authenticated organization into content analysis', async () => {
    await controller.analyzeContent(
      { user: { organizationId: 'org-1' } },
      'project-1',
      {
        projectId: 'project-1',
        pageUrl: 'https://example.com',
        targetKeyword: 'seo audit',
        includeCompetitors: true,
      },
    );

    expect(contentService.analyzeContent).toHaveBeenCalledWith(
      'project-1',
      'org-1',
      'https://example.com',
      'seo audit',
      true,
    );
  });
});
