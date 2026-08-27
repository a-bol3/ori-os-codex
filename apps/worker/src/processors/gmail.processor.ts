import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@ori-os/db/nestjs';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { GmailProvider } from '../providers/gmail.provider';

type GmailSyncJob = { integrationId: string; organizationId: string; pageToken?: string };

@Processor('gmail-sync')
export class GmailProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('gmail-sync') private readonly syncQueue: Queue,
  ) { super(); }

  async process(job: Job<GmailSyncJob>) {
    if (process.env.ENABLE_GMAIL_INTEGRATION !== 'true') return { skipped: true, reason: 'feature_disabled' };
    const integration = await (this.prisma as any).integration.findFirst({
      where: { id: job.data.integrationId, organizationId: job.data.organizationId, type: 'gmail', status: 'active' },
      select: { id: true, tokens: { select: { encryptedAccessToken: true, encryptedRefreshToken: true, expiresAt: true }, take: 1 } },
    });
    if (!integration) return { skipped: true, reason: 'integration_unavailable' };
    if (!integration.tokens[0]) return { skipped: true, reason: 'token_unavailable' };
    const state = await (this.prisma as any).gmailSyncState.upsert({
      where: { integrationId: integration.id },
      create: { integrationId: integration.id, status: 'running' },
      update: { status: 'running', errorCode: null },
    });
    try {
      const token = integration.tokens[0];
      let accessToken = this.decrypt(token.encryptedAccessToken);
      if (token.expiresAt && token.expiresAt.getTime() < Date.now() + 60_000 && token.encryptedRefreshToken) {
        const providerForRefresh = new GmailProvider(accessToken);
        const refreshed = await providerForRefresh.refreshAccessToken(process.env.GOOGLE_CLIENT_ID ?? '', process.env.GOOGLE_CLIENT_SECRET ?? '', this.decrypt(token.encryptedRefreshToken));
        accessToken = refreshed.access_token;
        await (this.prisma as any).integrationToken.update({ where: { integrationId: integration.id }, data: { encryptedAccessToken: this.encrypt(accessToken), expiresAt: refreshed.expires_in ? new Date(Date.now() + refreshed.expires_in * 1000) : null } });
      }
      const provider = new GmailProvider(accessToken);
      const page = await provider.listMessageIds(job.data.pageToken ?? state.pageToken ?? undefined);
      let stored = 0;
      for (const message of page.messages ?? []) {
        const full = await provider.getMessage(message.id);
        const headers = new Map((full.payload?.headers ?? []).map((h) => [h.name.toLowerCase(), h.value]));
        await (this.prisma as any).gmailMessage.upsert({
          where: { integrationId_providerId: { integrationId: integration.id, providerId: full.id } },
          create: { integrationId: integration.id, providerId: full.id, threadId: full.threadId, internalDate: full.internalDate ? new Date(Number(full.internalDate)) : null, subject: headers.get('subject') ?? null, sender: headers.get('from') ?? null, recipient: headers.get('to') ?? null, snippet: full.snippet ?? null, labelSummary: (full.payload?.labelIds ?? []).join(','), receivedAt: headers.get('date') ? new Date(headers.get('date')!) : null },
          update: { threadId: full.threadId, snippet: full.snippet ?? null, labelSummary: (full.payload?.labelIds ?? []).join(','), updatedAt: new Date() },
        });
        stored += 1;
      }
      await (this.prisma as any).gmailSyncState.update({ where: { id: state.id }, data: { status: page.nextPageToken ? 'running' : 'idle', pageToken: page.nextPageToken ?? null, historyId: page.historyId ?? state.historyId, lastSyncedAt: page.nextPageToken ? undefined : new Date() } });
      if (page.nextPageToken) {
        const tokenKey = createHash('sha256').update(page.nextPageToken).digest('hex').slice(0, 32);
        await this.syncQueue.add(
          'gmail-page-sync',
          { integrationId: integration.id, organizationId: job.data.organizationId, pageToken: page.nextPageToken },
          { jobId: `gmail-page-${integration.id}-${tokenKey}`, attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: 100, removeOnFail: 100 },
        );
      }
      await (this.prisma as any).auditLog.create({ data: { organizationId: job.data.organizationId, action: 'gmail_sync_completed', entityType: 'activity', entityId: integration.id, metadataJson: { listed: page.messages?.length ?? 0, stored } } });
      return { skipped: false, integrationId: integration.id, listed: page.messages?.length ?? 0, stored, hasNextPage: Boolean(page.nextPageToken) };
    } catch (error) {
      await (this.prisma as any).gmailSyncState.update({ where: { id: state.id }, data: { status: 'error', errorCode: error instanceof Error ? error.name : 'provider_error' } });
      throw error;
    }
  }

  private decrypt(value: string) {
    const rawKey = process.env.ENCRYPTION_MASTER_KEY || process.env.ENCRYPTION_KEY;
    if (!rawKey) throw new Error('Encryption key is not configured');
    const key = rawKey.length === 64 && /^[0-9a-f]+$/i.test(rawKey) ? Buffer.from(rawKey, 'hex') : createHash('sha256').update(rawKey).digest();
    const [ivHex, tagHex, encrypted] = value.split(':');
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }

  private encrypt(value: string) {
    const rawKey = process.env.ENCRYPTION_MASTER_KEY || process.env.ENCRYPTION_KEY;
    if (!rawKey) throw new Error('Encryption key is not configured');
    const key = rawKey.length === 64 && /^[0-9a-f]+$/i.test(rawKey) ? Buffer.from(rawKey, 'hex') : createHash('sha256').update(rawKey).digest();
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
  }
}
