import {
  Controller,
  Post,
  Body,
  Logger,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { EmailService } from './email.service';
import { NotificationsService } from './notifications.service';
import { IntelligenceService } from './intelligence.service';
import { PrismaService } from '@ori-os/db/nestjs';
import { AlertsService } from './seo/alerts.service';
import { CompetitorsService } from './seo/competitors.service';
import { GSCService } from './seo/gsc.service';

@Controller('test-bench')
export class TestBenchController {
  private readonly logger = new Logger(TestBenchController.name);

  constructor(
    private readonly ai: AiService,
    private readonly email: EmailService,
    private readonly notifications: NotificationsService,
    private readonly intelligence: IntelligenceService,
    private readonly prisma: PrismaService,
    private readonly alerts: AlertsService,
    private readonly competitors: CompetitorsService,
    private readonly gsc: GSCService,
  ) {}

  @Post('run-all')
  async runAllTests() {
    // ... existing tests ...
  }

  @Post('trigger-seo-alert')
  async triggerSeoAlert(@Body() body: { projectId: string; type: string }) {
    this.logger.log(
      `🧪 Triggering SEO Alert test for project ${body.projectId}`,
    );

    try {
      const orgId = 'mock-org-id'; // Use default mock org

      // Ensure project exists (or create mock if needed for test)
      let project = await (this.prisma as any).sEOProject.findUnique({
        where: { id: body.projectId },
      });

      if (!project) {
        // Create temp project for testing
        project = await (this.prisma as any).sEOProject.create({
          data: {
            id: body.projectId,
            organizationId: orgId,
            creatorId: 'mock-user-id', // Needs to be valid user ID ideally, but schema might be loose in dev
            name: 'Test Project',
            domain: 'test-domain.com',
          },
        });
      }

      if (body.type === 'rank_drop') {
        await this.alerts.createAlert(body.projectId, orgId, {
          type: 'rank_drop',
          severity: 'critical',
          title: 'Rank Drop Alert',
          message: '📉 Keyword "best widgets" dropped 10 positions (5 → 15)',
          metadata: { keyword: 'best widgets', change: -10 },
        });
      } else if (body.type === 'new_issue') {
        await this.alerts.createAlert(body.projectId, orgId, {
          type: 'new_issue',
          severity: 'warning',
          title: 'New Issues Detection',
          message: '⚠️ SEO Crawl found 5 new warnings',
          metadata: { issues: 5 },
        });
      } else if (body.type === 'competitor_change') {
        await this.alerts.createAlert(body.projectId, orgId, {
          type: 'competitor_change',
          severity: 'info',
          title: 'Competitor Update',
          message:
            '🔔 Competitor "CompetitorInc" published a new blog post: "10 SEO Tips"',
          metadata: {
            competitor: 'CompetitorInc',
            url: 'https://example.com/blog/10-seo-tips',
          },
        });
      }

      return { success: true, message: `Triggered ${body.type} alert` };
    } catch (error) {
      this.logger.error(`Failed to trigger alert: ${error.message} `);
      return { success: false, error: error.message };
    }
  }

  @Post('trigger-competitor-check')
  async triggerCompetitorCheck(
    @Body() body: { projectId: string; url: string },
  ) {
    this.logger.log(`🧪 Triggering Competitor Check for ${body.url}`);
    const orgId = 'mock-org-id';

    try {
      // Create competitor if not exists
      let competitor = await (this.prisma as any).sEOCompetitor.findFirst({
        where: { projectId: body.projectId, domain: body.url },
      });

      if (!competitor) {
        competitor = await this.competitors.createCompetitor(
          body.projectId,
          orgId,
          {
            domain: body.url,
          },
        );
      }

      // Trigger check
      const result = await this.competitors.checkCompetitorRankings(
        competitor.id,
        orgId,
      );
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('seed')
  async seedDatabase() {
    this.logger.log('🌱 Starting manual database seed via API...');

    try {
      // 1. Create/Ensure Organization
      const org = await (this.prisma as any).organization.upsert({
        where: { slug: 'ori-labs' },
        update: {},
        create: {
          id: 'mock-org-id', // Stable ID for dev bypass
          name: 'Ori Craft Labs',
          slug: 'ori-labs',
          complianceProfile: 'standard',
        },
      });

      this.logger.log(`✅ Organization ensured: ${org.slug} (${org.id})`);

      // 2. Companies (Realistic Names)
      const companiesData = [
        {
          name: 'TechCorp Solutions',
          domain: 'techcorp.com',
          industry: 'SaaS',
          sizeBand: '500-1000',
          country: 'US',
          city: 'San Francisco',
        },
        {
          name: 'GreenGrid Energy',
          domain: 'greengrid.io',
          industry: 'Renewables',
          sizeBand: '100-250',
          country: 'DE',
          city: 'Berlin',
        },
        {
          name: 'CloudScale AI',
          domain: 'cloudscale.ai',
          industry: 'AI/ML',
          sizeBand: '50-100',
          country: 'UK',
          city: 'London',
        },
        {
          name: 'BuildWise Construction',
          domain: 'buildwise.com',
          industry: 'Construction',
          sizeBand: '1000-5000',
          country: 'CA',
          city: 'Toronto',
        },
        {
          name: 'FinFlow Payments',
          domain: 'finflow.ch',
          industry: 'Fintech',
          sizeBand: '250-500',
          country: 'CH',
          city: 'Zurich',
        },
        {
          name: 'HealthPulse Systems',
          domain: 'healthpulse.org',
          industry: 'Healthcare',
          sizeBand: '100-250',
          country: 'US',
          city: 'Boston',
        },
        {
          name: 'SwiftLogistics',
          domain: 'swiftlog.com',
          industry: 'Logistics',
          sizeBand: '500-1000',
          country: 'NL',
          city: 'Amsterdam',
        },
        {
          name: 'EduTrack Learning',
          domain: 'edutrack.edu',
          industry: 'EdTech',
          sizeBand: '10-50',
          country: 'AU',
          city: 'Sydney',
        },
        {
          name: 'PureAqua Water',
          domain: 'pureaqua.eco',
          industry: 'Manufacturing',
          sizeBand: '50-100',
          country: 'SG',
          city: 'Singapore',
        },
        {
          name: 'CyberGuard Security',
          domain: 'cyberguard.net',
          industry: 'Cybersecurity',
          sizeBand: '250-500',
          country: 'IL',
          city: 'Tel Aviv',
        },
      ];

      const companies: any[] = [];
      for (const data of companiesData) {
        const company = await (this.prisma as any).company.upsert({
          where: { id: `mock - company - ${data.domain} ` },
          update: { ...data, organizationId: org.id },
          create: {
            ...data,
            id: `mock - company - ${data.domain} `,
            organizationId: org.id,
          },
        });
        companies.push(company);
      }
      this.logger.log(`✅ ${companies.length} Companies upserted.`);

      // 3. Contacts (50 Realistic Profiles)
      const jobTitles = [
        'CEO',
        'CTO',
        'VP of Sales',
        'Head of Marketing',
        'Operations Director',
        'Product Manager',
        'Lead Engineer',
        'HR Manager',
      ];
      const firstNames = [
        'James',
        'Mary',
        'Robert',
        'Patricia',
        'John',
        'Jennifer',
        'Michael',
        'Linda',
        'William',
        'Elizabeth',
        'David',
        'Barbara',
        'Richard',
        'Susan',
        'Joseph',
        'Jessica',
      ];
      const lastNames = [
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
        'Rodriguez',
        'Martinez',
        'Hernandez',
        'Lopez',
        'Gonzalez',
        'Wilson',
        'Anderson',
        'Thomas',
      ];

      const contactsData = Array.from({ length: 50 }).map((_, i) => {
        const company = companies[i % companies.length];
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()} @${company.domain} `;

        return {
          organizationId: org.id,
          companyId: company.id,
          firstName,
          lastName,
          email,
          jobTitle: jobTitles[i % jobTitles.length],
          country: company.country,
          emailStatus: 'VALID',
        };
      });

      for (const data of contactsData) {
        await (this.prisma as any).contact.upsert({
          where: {
            organizationId_email: { organizationId: org.id, email: data.email },
          },
          update: data,
          create: data,
        });
      }
      this.logger.log(`✅ ${contactsData.length} Contacts upserted.`);

      return {
        status: 'SUCCESS',
        message: `Seeded 10 companies and 50 contacts for Org: ${org.slug} `,
        organizationId: org.id,
      };
    } catch (error) {
      this.logger.error(`❌ Seeding failed: ${error.message} `, error.stack);
      return {
        status: 'ERROR',
        message: error.message,
        stack: error.stack,
      };
    }
  }

  @Get('debug-db')
  async debugDb() {
    return {
      databaseUrl: process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      cwd: process.cwd(),
    };
  }

  @Get('status')
  async getStatus() {
    return {
      status: 'Operational',
      simulationMode: true,
      dummyKeys: {
        openai: !!process.env.OPENAI_API_KEY,
        slack: !!process.env.SLACK_WEBHOOK_URL,
        resend: !!process.env.RESEND_API_KEY,
      },
    };
  }

  @Post('trigger-gsc-sync')
  async triggerGscSync(@Body() body: { projectId: string }) {
    const project = await (this.prisma as any).sEOProject.findUnique({
      where: { id: body.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Ensure GSC is "connected" for testing
    if (!project.gscConnected) {
      await (this.prisma as any).sEOProject.update({
        where: { id: body.projectId },
        data: {
          gscConnected: true,
          gscAccessToken: 'mock-token',
          gscRefreshToken: 'mock-refresh',
          gscTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        },
      });
    }

    const job = await this.gsc.triggerSync(
      body.projectId,
      project.organizationId,
    );

    return {
      message: 'GSC sync job queued',
      jobId: (job as any).id,
    };
  }
}
