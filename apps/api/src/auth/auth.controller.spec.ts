import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const authService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    revokeSession: jest.fn(),
  };
  const controller = new AuthController(authService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('revokes the authenticated session in its organization', async () => {
    authService.revokeSession.mockResolvedValue({ success: true });
    const request = {
      user: {
        sessionId: 'session-1',
        userId: 'user-1',
        organizationId: 'org-1',
      },
    };

    await expect(controller.logout(request)).resolves.toEqual({
      success: true,
    });
    expect(authService.revokeSession).toHaveBeenCalledWith(
      'session-1',
      'user-1',
      'org-1',
    );
  });

  it('rejects logout without a session context', async () => {
    await expect(
      controller.logout({
        user: { userId: 'user-1', organizationId: 'org-1' },
      }),
    ).rejects.toThrow(new UnauthorizedException('Session context is required'));
    expect(authService.revokeSession).not.toHaveBeenCalled();
  });

  it('rejects logout without an organization context', async () => {
    await expect(
      controller.logout({
        user: { sessionId: 'session-1', userId: 'user-1' },
      }),
    ).rejects.toThrow(new UnauthorizedException('Organization context is required'));
    expect(authService.revokeSession).not.toHaveBeenCalled();
  });
});
