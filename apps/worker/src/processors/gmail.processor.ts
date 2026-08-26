import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@ori-os/db/nestjs';
import { createDecipheriv, createHash } from 'crypto';
import { GmailProvider } from '../providers/gmail.provider';

type GmailSyncJob = { integrationId: string; organizationId: string };

@Processor('gmail-sync')
export class GmailProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) { super(); }

  async process(job: Job<GmailSyncJob>) {
    if (process.env.ENABLE_GMAIL_INTEGRATION !== 'true') return { skipped: true, reason: 'feature_disabled' };
    const integration = await (this.prisma as any).integration.findFirst({
      where: { id: job.data.integrationId, organizationId: job.data.organizationId, type: 'gmail', status: 'active' },
      select: { id: true, tokens: { select: { encryptedAccessToken: true }, take: 1 } },
    });
    if (!integration) return { skipped: true, reason: 'integration_unavailable' };
    if (!integration.tokens[0]) return { skipped: true, reason: 'token_unavailable' };
    const state = await (this.prisma as any).gmailSyncState.upsert({
      where: { integrationId: integration.id },
      create: { integrationId: integration.id, status: 'running' },
      update: { status: 'running', errorCode: null },
    });
    try {
      const provider = new GmailProvider(this.decrypt(integration.tokens[0].encryptedAccessToken));
      const page = await provider.listMessageIds(state.pageToken ?? undefined);
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
      await (this.prisma as any).gmailSyncState.update({ where: { id: state.id }, data: { status: 'idle', pageToken: page.nextPageToken ?? null, historyId: page.historyId ?? state.historyId, lastSyncedAt: new Date() } });
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
}
