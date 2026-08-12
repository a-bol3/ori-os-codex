import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import axios from 'axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHmac, timingSafeEqual } from 'crypto';
import { fixtureMode } from '@ori-os/core';

type GscProjectRecord = {
  id: string;
  organizationId: string;
  domain: string;
  gscSiteUrl: string | null;
  gscConnected: boolean;
  gscAccessToken: string | null;
  gscRefreshToken: string | null;
  gscTokenExpiresAt: Date | null;
};

type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

type GscQueryRow = {
  keys: [string, string, string, string];
  clicks: number;
  impressions: number;
  ctr?: number;
  position?: number;
};

type GscOAuthState = {
  projectId: string;
  organizationId: string;
};

@Injectable()
export class GSCService {
  private readonly logger = new Logger(GSCService.name);
  private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  private readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  private readonly REDIRECT_URI =
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:3000/api/seo/gsc/callback';

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @InjectQueue('seo-gsc-sync') private readonly gscQueue: Queue,
  ) {}

  async triggerSync(projectId: string, organizationId: string) {
    await this.getProjectOrThrow(projectId, organizationId);

    return this.gscQueue.add('sync-project', {
      projectId,
      organizationId,
    });
  }

  async getAuthUrl(projectId: string, organizationId: string) {
    await this.getProjectOrThrow(projectId, organizationId);

    const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
    const state = this.encodeOAuthState({ projectId, organizationId });

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${encodeURIComponent(state)}`;

    return { authUrl };
  }

  async handleCallback(code: string, state: string) {
    const { projectId, organizationId } = this.decodeOAuthState(state);

    try {
      const tokenResponse = await axios.post<GoogleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.GOOGLE_CLIENT_ID,
          client_secret: this.GOOGLE_CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
          grant_type: 'authorization_code',
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      const project = await this.getProjectOrThrow(projectId, organizationId);

      await this.prisma.sEOProject.update({
        where: { id: project.id },
        data: {
          gscConnected: true,
          gscAccessToken: access_token,
          gscRefreshToken: refresh_token,
          gscTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      return {
        success: true,
        message: 'Google Search Console connected successfully',
        projectId: project.id,
      };
    } catch (error) {
      this.logger.error(
        'GSC OAuth callback error:',
        this.getErrorMessage(error),
      );
      throw new HttpException(
        'Failed to connect Google Search Console',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async syncProjectData(projectId: string, organizationId: string) {
    try {
      const project = await this.getProjectOrThrow(projectId, organizationId);

      if (!project.gscConnected) {
        throw new Error('Google Search Console not connected for this project');
      }

      if (!project.gscAccessToken || !project.gscTokenExpiresAt) {
        throw new Error('Google Search Console token state is incomplete');
      }

      let accessToken = project.gscAccessToken;
      if (new Date() >= new Date(project.gscTokenExpiresAt)) {
        accessToken = await this.refreshAccessToken(
          projectId,
          organizationId,
          project.gscRefreshToken,
        );
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const gscData = await this.fetchGSCData(
        accessToken,
        project.gscSiteUrl || project.domain,
        startDate,
        endDate,
      );

      for (const row of gscData) {
        await this.prisma.gSCQueryData.upsert({
          where: {
            projectId_query_page_date_device: {
              projectId: project.id,
              query: row.keys[0],
              page: row.keys[1],
              date: new Date(row.keys[3]),
              device: row.keys[2],
            },
          },
          update: {
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr || 0,
            position: row.position || 0,
          },
          create: {
            projectId: project.id,
            organizationId: project.organizationId,
            query: row.keys[0],
            page: row.keys[1],
            date: new Date(row.keys[3]),
            device: row.keys[2],
            country: 'US',
            clicks: row.clicks,
            impressions: row.impressions,
            ctr: row.ctr || 0,
            position: row.position || 0,
          },
        });
      }

      return {
        success: true,
        recordsSynced: gscData.length,
      };
    } catch (error) {
      this.logger.error(
        `GSC sync error for project ${projectId}:`,
        this.getErrorMessage(error),
      );
      throw error;
    }
  }

  private async refreshAccessToken(
    projectId: string,
    organizationId: string,
    refreshToken: string | null,
  ): Promise<string> {
    if (!refreshToken) {
      throw new Error('Missing Google Search Console refresh token');
    }

    try {
      const response = await axios.post<GoogleTokenResponse>(
        'https://oauth2.googleapis.com/token',
        {
          refresh_token: refreshToken,
          client_id: this.GOOGLE_CLIENT_ID,
          client_secret: this.GOOGLE_CLIENT_SECRET,
          grant_type: 'refresh_token',
        },
      );

      const { access_token, expires_in } = response.data;

      await this.getProjectOrThrow(projectId, organizationId);
      await this.prisma.sEOProject.update({
        where: { id: projectId },
        data: {
          gscAccessToken: access_token,
          gscTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        },
      });

      return access_token;
    } catch (error) {
      this.logger.error(
        `Failed to refresh GSC token for project ${projectId}:`,
        this.getErrorMessage(error),
      );
      throw new Error('Failed to refresh GSC access token');
    }
  }

  private async fetchGSCData(
    accessToken: string,
    siteUrl: string,
    startDate: Date,
    endDate: Date,
  ): Promise<GscQueryRow[]> {
    if (
      fixtureMode('ENABLE_SEO_FIXTURES') &&
      (process.env.GSC_SIMULATION === 'true' || accessToken === 'mock-token')
    ) {
      this.logger.log('đź§Ş Running GSC Sync in SIMULATION mode');
      return [
        {
          keys: [
            'seo studio',
            'https://example.com/',
            'desktop',
            startDate.toISOString(),
          ],
          clicks: 120,
          impressions: 1500,
          ctr: 0.08,
          position: 2.4,
        },
        {
          keys: [
            'ori os',
            'https://example.com/pricing',
            'mobile',
            startDate.toISOString(),
          ],
          clicks: 45,
          impressions: 800,
          ctr: 0.05,
          position: 5.1,
        },
        {
          keys: [
            'nextjs seo',
            'https://example.com/blog',
            'desktop',
            startDate.toISOString(),
          ],
          clicks: 12,
          impressions: 2000,
          ctr: 0.006,
          position: 12.3,
        },
        {
          keys: [
            'automated seo',
            'https://example.com/',
            'tablet',
            startDate.toISOString(),
          ],
          clicks: 5,
          impressions: 100,
          ctr: 0.05,
          position: 1.2,
        },
      ];
    }

    const formattedSiteUrl = siteUrl.startsWith('http')
      ? siteUrl
      : `https://${siteUrl}`;

    const response = await axios.post<{ rows?: GscQueryRow[] }>(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(formattedSiteUrl)}/searchAnalytics/query`,
      {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: ['query', 'page', 'device', 'date'],
        rowLimit: 5000,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.rows || [];
  }

  private async getProjectOrThrow(
    projectId: string,
    organizationId: string,
  ): Promise<GscProjectRecord> {
    const project = await this.prisma.sEOProject.findFirst({
      where: { id: projectId, organizationId },
      select: {
        id: true,
        organizationId: true,
        domain: true,
        gscSiteUrl: true,
        gscConnected: true,
        gscAccessToken: true,
        gscRefreshToken: true,
        gscTokenExpiresAt: true,
      },
    });

    if (!project) {
      throw new ForbiddenException(
        'SEO project not found for this organization',
      );
    }

    return project;
  }

  private encodeOAuthState(payload: GscOAuthState): string {
    const encodedPayload = Buffer.from(
      JSON.stringify(payload),
      'utf8',
    ).toString('base64url');
    const signature = createHmac('sha256', this.getStateSecret())
      .update(encodedPayload)
      .digest('base64url');

    return `${encodedPayload}.${signature}`;
  }

  private decodeOAuthState(state: string): GscOAuthState {
    const [encodedPayload, signature] = state.split('.');

    if (!encodedPayload || !signature) {
      throw new BadRequestException('Invalid Google Search Console state');
    }

    const expectedSignature = createHmac('sha256', this.getStateSecret())
      .update(encodedPayload)
      .digest('base64url');

    if (
      signature.length !== expectedSignature.length ||
      !timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8'),
      )
    ) {
      throw new BadRequestException('Invalid Google Search Console state');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Partial<GscOAuthState>;

    if (!payload.projectId || !payload.organizationId) {
      throw new BadRequestException('Invalid Google Search Console state');
    }

    return {
      projectId: payload.projectId,
      organizationId: payload.organizationId,
    };
  }

  private getStateSecret(): string {
    const secret = process.env.GSC_STATE_SECRET ?? process.env.JWT_SECRET;

    if (!secret) {
      throw new BadRequestException(
        'Google Search Console state secret is not configured',
      );
    }

    return secret;
  }

  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return JSON.stringify(error.response?.data ?? error.message);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
