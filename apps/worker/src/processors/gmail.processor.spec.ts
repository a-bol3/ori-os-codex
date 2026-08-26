import { GmailProcessor } from './gmail.processor';

describe('GmailProcessor', () => {
  const prisma = {
    integration: { findFirst: jest.fn() },
    gmailSyncState: { upsert: jest.fn(), update: jest.fn() },
  };
  const processor = new GmailProcessor(prisma as never);

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
});
