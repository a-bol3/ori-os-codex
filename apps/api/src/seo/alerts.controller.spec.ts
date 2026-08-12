import { UnauthorizedException } from '@nestjs/common';
import { AlertsController } from './alerts.controller';

describe('AlertsController', () => {
  const alertsService = {
    createAlert: jest.fn(),
    getAlerts: jest.fn(),
    getAlertsSummary: jest.fn(),
    getAlertById: jest.fn(),
    updateAlert: jest.fn(),
    deleteAlert: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  const controller = new AlertsController(alertsService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects alerts access without organization context', async () => {
    await expect(controller.getAlerts({}, 'project-1', {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('passes tenant context into mark-all-read', async () => {
    await controller.markAllAsRead(
      { user: { organizationId: 'org-1' } },
      'project-1',
    );

    expect(alertsService.markAllAsRead).toHaveBeenCalledWith(
      'project-1',
      'org-1',
    );
  });
});
