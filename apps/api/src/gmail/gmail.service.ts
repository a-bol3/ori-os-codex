import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@ori-os/db/nestjs';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import axios from 'axios';
import { EncryptionService } from '../common/encryption.service';

const READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

@Injectable()
export class GmailService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  private enabled() {
    return this.config.get('ENABLE_GMAIL_INTEGRATION') === 'true';
  }

  private sign(value: string) {
    const secret = this.config.get<string>('ENCRYPTION_MASTER_KEY') || this.config.get<string>('ENCRYPTION_KEY');
    if (!secret) throw new Error('OAuth state signing key is not configured');
    return createHmac('sha256', secret).update(value).digest('base64url');
  }

  createAuthUrl(organizationId: string, userId: string) {
    if (!this.enabled()) throw new ForbiddenException('Gmail integration is disabled');
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.config.get<string>('GMAIL_REDIRECT_URI');
    if (!clientId || !redirectUri) throw new ForbiddenException('Gmail OAuth is not configured');
    const payload = Buffer.from(JSON.stringify({ organizationId, userId, nonce: randomBytes(16).toString('hex'), exp: Date.now() + 10 * 60_000 })).toString('base64url');
    const state = `${payload}.${this.sign(payload)}`;
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: READONLY_SCOPE, access_type: 'offline', prompt: 'consent', state });
    return { authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, scope: READONLY_SCOPE };
  }

  decodeState(state: string) {
    const [payload, signature] = state.split('.');
    if (!payload || !signature) throw new BadRequestException('Invalid OAuth state');
    const expected = this.sign(payload);
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new BadRequestException('Invalid OAuth state');
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { organizationId: string; userId: string; exp: number };
    if (!value.organizationId || !value.userId || value.exp < Date.now()) throw new BadRequestException('Expired OAuth state');
    return value;
  }

  async status(organizationId: string) {
    const integration = await (this.prisma as any).integration.findFirst({ where: { organizationId, type: 'gmail' }, select: { id: true, status: true, updatedAt: true } });
    return { enabled: this.enabled(), scope: READONLY_SCOPE, integration };
  }

  async handleCallback(code: string, state: string) {
    if (!this.enabled()) throw new ForbiddenException('Gmail integration is disabled');
    if (!code || code.length > 4096) throw new BadRequestException('Invalid OAuth code');
    const context = this.decodeState(state);
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('GMAIL_REDIRECT_URI');
    if (!clientId || !clientSecret || !redirectUri) throw new ForbiddenException('Gmail OAuth is not configured');

    try {
      const response = await axios.post<{ access_token: string; refresh_token?: string; expires_in?: number }>(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' }).toString(),
        { headers: { 'content-type': 'application/x-www-form-urlencoded' }, timeout: 10_000 },
      );
      if (!response.data.access_token) throw new Error('Google did not return an access token');
      const integration = await (this.prisma as any).integration.upsert({
        where: { organizationId_type: { organizationId: context.organizationId, type: 'gmail' } },
        create: { organizationId: context.organizationId, type: 'gmail', status: 'active', settingsJson: { scope: READONLY_SCOPE } },
        update: { status: 'active', settingsJson: { scope: READONLY_SCOPE } },
      });
      await (this.prisma as any).integrationToken.upsert({
        where: { integrationId: integration.id },
        create: { integrationId: integration.id, encryptedAccessToken: this.encryption.encrypt(response.data.access_token), encryptedRefreshToken: response.data.refresh_token ? this.encryption.encrypt(response.data.refresh_token) : null, expiresAt: response.data.expires_in ? new Date(Date.now() + response.data.expires_in * 1000) : null, scopes: READONLY_SCOPE },
        update: { encryptedAccessToken: this.encryption.encrypt(response.data.access_token), ...(response.data.refresh_token ? { encryptedRefreshToken: this.encryption.encrypt(response.data.refresh_token) } : {}), expiresAt: response.data.expires_in ? new Date(Date.now() + response.data.expires_in * 1000) : undefined, scopes: READONLY_SCOPE },
      });
      return { success: true, integrationId: integration.id, scope: READONLY_SCOPE };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to connect Gmail');
    }
  }
}
