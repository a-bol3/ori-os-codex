import { UnauthorizedException } from '@nestjs/common';
import { CrawlController } from './crawl.controller';

describe('CrawlController', () => {
  const crawlService = {
    startCrawl: jest.fn(),
    getCrawls: jest.fn(),
    getCrawlById: jest.fn(),
    getIssues: jest.fn(),
    updateIssueStatus: jest.fn(),
    getPages: jest.fn(),
  };

  const controller = new CrawlController(crawlService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects crawl listing without organization context', async () => {
    await expect(controller.getCrawls('project-1', {}, {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes tenant context into issue updates', async () => {
    await controller.updateIssue(
      'issue-1',
      { status: 'fixed' },
      { user: { organizationId: 'org-1' } },
    );

    expect(crawlService.updateIssueStatus).toHaveBeenCalledWith(
      'issue-1',
      'org-1',
      'fixed',
    );
  });
});
