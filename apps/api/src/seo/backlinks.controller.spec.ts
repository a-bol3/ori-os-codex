import { UnauthorizedException } from '@nestjs/common';
import { BacklinksController } from './backlinks.controller';

describe('BacklinksController', () => {
  const backlinksService = {
    createBacklink: jest.fn(),
    getBacklinks: jest.fn(),
    getBacklinkSummary: jest.fn(),
    updateBacklink: jest.fn(),
    verifyBacklink: jest.fn(),
    deleteBacklink: jest.fn(),
  };

  const controller = new BacklinksController(backlinksService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects backlink access without organization context', async () => {
    await expect(controller.getBacklinks({}, 'project-1', {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes tenant context into backlink verification', async () => {
    await controller.verifyBacklink(
      { user: { organizationId: 'org-1' } },
      'backlink-1',
    );

    expect(backlinksService.verifyBacklink).toHaveBeenCalledWith(
      'backlink-1',
      'org-1',
    );
  });
});
