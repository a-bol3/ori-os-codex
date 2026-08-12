import { UnauthorizedException } from '@nestjs/common';
import { GSCController } from './gsc.controller';

describe('GSCController', () => {
  const gscService = {
    getAuthUrl: jest.fn(),
    handleCallback: jest.fn(),
    syncProjectData: jest.fn(),
  };

  const controller = new GSCController(gscService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects auth-url generation without organization context', async () => {
    await expect(controller.getAuthUrl('project-1', {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes authenticated organization into auth-url generation', async () => {
    await controller.getAuthUrl('project-1', {
      user: { organizationId: 'org-1' },
    });

    expect(gscService.getAuthUrl).toHaveBeenCalledWith('project-1', 'org-1');
  });

  it('passes authenticated organization into data sync', async () => {
    await controller.syncData('project-1', {
      user: { organizationId: 'org-1' },
    });

    expect(gscService.syncProjectData).toHaveBeenCalledWith(
      'project-1',
      'org-1',
    );
  });
});
