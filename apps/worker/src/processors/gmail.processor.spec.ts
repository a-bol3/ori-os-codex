import { GmailProcessor } from './gmail.processor';

describe('GmailProcessor', () => {
  const prisma = {
    integration: { findFirst: jest.fn() },
    gmailSyncState: { upsert: jest.fn(), update: jest.fn() },
    auditLog: { create: jest.fn() },
    gmailMessage: { upsert: jest.fn() },
    riskSignal: { upsert: jest.fn() },
  };
  const syncQueue = { add: jest.fn() };
  const processor = new GmailProcessor(prisma as never, syncQueue as never);

  afterEach(() => { jest.clearAllMocks(); });

  it('does nothing when disabled', async () => {
    process.env.ENABLE_GMAIL_INTEGRATION = 'false';
    await expect(processor.process({ data: { integrationId: 'i', organizationId: 'o' } } as never)).resolves.toEqual({ skipped: true, reason: 'feature_disabled' });
    expect(prisma.integration.findFirst).not.toHaveBeenCalled();
  });

  it('creates durable sync state only for the matching tenant integration', async () => {
    process.env.ENABLE_GMAIL_INTEGRATION = 'true';
    prisma.integration.findFirst.mockResolvedValue({ id: 'i', tokens: [] });
    await expect(processor.process({ data: { integrationId: 'i', organizationId: 'o' } } as never)).resolves.toEqual({ skipped: true, reason: 'token_unavailable' });
    expect(prisma.integration.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'i', organizationId: 'o', type: 'gmail', status: 'active' } }));
    expect(prisma.gmailSyncState.update).not.toHaveBeenCalled();
  });

  it('queues the next page with a deterministic id when Gmail returns a page token', async () => {
    process.env.ENABLE_GMAIL_INTEGRATION = 'true';
    process.env.ENCRYPTION_MASTER_KEY = 'test-secret';
    const encrypted = (processor as any).encrypt('access-token');
    prisma.integration.findFirst.mockResolvedValue({ id: 'i', tokens: [{ encryptedAccessToken: encrypted, encryptedRefreshToken: null, expiresAt: null }] });
    prisma.gmailSyncState.upsert.mockResolvedValue({ id: 'state-1', pageToken: null, historyId: null });
    prisma.gmailSyncState.update.mockResolvedValue({});
    jest.spyOn(require('../providers/gmail.provider'), 'GmailProvider').mockImplementation(() => ({
      listMessageIds: jest.fn().mockResolvedValue({ messages: [], nextPageToken: 'next-page-token', historyId: 'history-1' }),
      getMessage: jest.fn(),
    }) as never);

    await expect(processor.process({ data: { integrationId: 'i', organizationId: 'o' } } as never)).resolves.toMatchObject({ hasNextPage: true });
    expect(syncQueue.add).toHaveBeenCalledWith('gmail-page-sync', expect.objectContaining({ pageToken: 'next-page-token' }), expect.objectContaining({ jobId: expect.stringMatching(/^gmail-page-i-/), attempts: 5 }));
  });

  it('creates an idempotent risk signal from subject metadata without storing message content', async () => {
    process.env.ENABLE_GMAIL_INTEGRATION = 'true';
    process.env.ENCRYPTION_MASTER_KEY = 'test-secret';
    const encrypted = (processor as any).encrypt('access-token');
    prisma.integration.findFirst.mockResolvedValue({ id: 'i', tokens: [{ encryptedAccessToken: encrypted, encryptedRefreshToken: null, expiresAt: null }] });
    prisma.gmailSyncState.upsert.mockResolvedValue({ id: 'state-1', pageToken: null, historyId: null });
    prisma.gmailSyncState.update.mockResolvedValue({});
    jest.spyOn(require('../providers/gmail.provider'), 'GmailProvider').mockImplementation(() => ({
      listMessageIds: jest.fn().mockResolvedValue({ messages: [{ id: 'm1' }], historyId: 'history-1' }),
      getMessage: jest.fn().mockResolvedValue({ id: 'm1', threadId: 't1', payload: { headers: [{ name: 'Subject', value: 'Urgent deadline' }, { name: 'From', value: 'a@example.com' }], labelIds: ['INBOX'] }, snippet: 'must not be copied to risk metadata' }),
    }) as never);
    await processor.process({ data: { integrationId: 'i', organizationId: 'o' } } as never);
    expect(prisma.riskSignal.upsert).toHaveBeenCalledWith(expect.objectContaining({ create: expect.objectContaining({ organizationId: 'o', severity: 'critical', metadataJson: { providerId: 'm1', threadId: 't1', senderDomain: 'example.com', labels: 'INBOX' } }) }));
    expect(JSON.stringify(prisma.riskSignal.upsert.mock.calls[0])).not.toContain('must not be copied');
  });
});
