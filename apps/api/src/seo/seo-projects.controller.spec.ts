import { UnauthorizedException } from '@nestjs/common';
import { SeoProjectsController } from './seo-projects.controller';

describe('SeoProjectsController', () => {
  const seoProjectsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const controller = new SeoProjectsController(seoProjectsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects project listing without organization context', async () => {
    await expect(controller.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects project creation without user context', async () => {
    await expect(
      controller.create(
        { name: 'Site A', domain: 'example.com' },
        { user: { organizationId: 'org-1' } },
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('passes tenant and creator identity into project creation', async () => {
    await controller.create(
      {
        name: 'Site A',
        domain: 'example.com',
        maxPagesToCrawl: '25',
      },
      { user: { organizationId: 'org-1', userId: 'user-1' } },
    );

    expect(seoProjectsService.create).toHaveBeenCalledWith({
      organizationId: 'org-1',
      creatorId: 'user-1',
      name: 'Site A',
      domain: 'example.com',
      maxPagesToCrawl: 25,
    });
  });
});
