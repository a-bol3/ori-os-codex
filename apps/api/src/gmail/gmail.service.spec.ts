import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GmailService } from './gmail.service';

describe('GmailService OAuth safety', () => {
  const values: Record<string, string | undefined> = {
    ENABLE_GMAIL_INTEGRATION: 'true',
    GOOGLE_CLIENT_ID: 'client-id',
    GMAIL_REDIRECT_URI: 'http://localhost:4000/integrations/gmail/callback',
    ENCRYPTION_MASTER_KEY: 'test-secret',
  };
  const config = { get: jest.fn((key: string) => values[key]) };
  const prisma = { integration: { findFirst: jest.fn() } };
  const encryption = {};
  const audit = { record: jest.fn() };
  const queue = { add: jest.fn() };
  const service = new GmailService(config as never, prisma as never, encryption as never, audit as never, queue as never);

  beforeEach(() => jest.clearAllMocks());

  it('blocks connection when the feature flag is off', () => {
    values.ENABLE_GMAIL_INTEGRATION = 'false';
    expect(() => service.createAuthUrl('org-1', 'user-1')).toThrow(ForbiddenException);
    values.ENABLE_GMAIL_INTEGRATION = 'true';
  });

  it('creates a signed, expiring state with read-only scope', () => {
    const result = service.createAuthUrl('org-1', 'user-1');
    expect(result.scope).toBe('https://www.googleapis.com/auth/gmail.readonly');
    const state = new URL(result.authUrl).searchParams.get('state');
    expect(state).toBeTruthy();
    expect(service.decodeState(state!)).toMatchObject({ organizationId: 'org-1', userId: 'user-1' });
  });

  it('rejects a modified state', () => {
    const { authUrl } = service.createAuthUrl('org-1', 'user-1');
    const state = new URL(authUrl).searchParams.get('state')!;
    expect(() => service.decodeState(`${state}tampered`)).toThrow(BadRequestException);
  });

  it('never returns token material from status', async () => {
    prisma.integration.findFirst.mockResolvedValue({ id: 'integration-1', status: 'active', updatedAt: new Date() });
    const result = await service.status('org-1');
    expect(result).toEqual(expect.objectContaining({ enabled: true }));
    expect(JSON.stringify(result)).not.toContain('access_token');
  });
});
