import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import axios from 'axios';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class GSCService {
  private readonly logger = new Logger(GSCService.name);
  private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  private readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  private readonly REDIRECT_URI =
    process.env.GOOGLE_REDIRECT_URI ||
    'http://localhost:3000/api/seo/gsc/callback';

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('seo-gsc-sync') private readonly gscQueue: Queue,
  ) {}

  async triggerSync(projectId: string, organizationId: string) {
    return this.gscQueue.add('sync-project', {
      projectId,
      organizationId,
    });
  }

  getAuthUrl(projectId: string) {
    const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${projectId}`;

    return { authUrl };
  }

  async handleCallback(code: string, projectId: string) {
    try {
      const tokenResponse = await axios.post(
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

      await (this.prisma as any).sEOProject.update({
        where: { id: projectId },
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
        projectId,
      };
    } catch (error) {
      this.logger.error(
        'GSC OAuth callback error:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to connect Google Search Console',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async syncProjectData(projectId: string) {
    try {
      const project = await (this.prisma as any).sEOProject.findUnique({
        where: { id: projectId },
      });

      if (!project || !project.gscConnected) {
        throw new Error('Google Search Console not connected for this project');
      }

      let accessToken = project.gscAccessToken;
      if (new Date() >= new Date(project.gscTokenExpiresAt)) {
        accessToken = await this.refreshAccessToken(
          projectId,
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
        await (this.prisma as any).gSCQueryData.upsert({
          where: {
            projectId_query_page_date_device: {
              projectId: project.id,
              query: row.keys[0], // Query is first dimension
              page: row.keys[1], // Page is second
              date: new Date(row.keys[3]), // Date is fourth
              device: row.keys[2], // Device is third
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
            country: 'US', // Default or extract from separate dim if needed
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
        error.message,
      );
      throw error;
    }
  }

  private async refreshAccessToken(
    projectId: string,
    refreshToken: string,
  ): Promise<string> {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        refresh_token: refreshToken,
        client_id: this.GOOGLE_CLIENT_ID,
        client_secret: this.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
      });

      const { access_token, expires_in } = response.data;

      await (this.prisma as any).sEOProject.update({
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
        error.response?.data || error.message,
      );
      throw new Error('Failed to refresh GSC access token');
    }
  }

  private async fetchGSCData(
    accessToken: string,
    siteUrl: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    if (process.env.GSC_SIMULATION === 'true' || accessToken === 'mock-token') {
      this.logger.log('🧪 Running GSC Sync in SIMULATION mode');
      // Return some mock rows
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

    // Ensure siteUrl has protocol for GSC API
    const formattedSiteUrl = siteUrl.startsWith('http')
      ? siteUrl
      : `https://${siteUrl}`;

    const response = await axios.post(
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
}
