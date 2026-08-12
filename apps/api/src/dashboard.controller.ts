import { Controller, Get, UseGuards, Req, Inject } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaService } from '@ori-os/db/nestjs';
import {
  DEFAULT_PIPELINE_STAGES,
  ensureDefaultPipeline,
} from './common/default-pipeline';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async getDashboardData(@Req() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // --- Contacts ---
    const totalContacts = await this.prisma.contact.count({
      where: { organizationId: orgId },
    });
    const contactsThisMonth = await this.prisma.contact.count({
      where: { organizationId: orgId, createdAt: { gte: startOfMonth } },
    });
    const contactsLastMonth = await this.prisma.contact.count({
      where: {
        organizationId: orgId,
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
      },
    });
    const contactGrowth =
      contactsLastMonth === 0 && contactsThisMonth === 0
        ? 0
        : contactsLastMonth === 0
          ? 100
          : Math.round(
              ((contactsThisMonth - contactsLastMonth) / contactsLastMonth) * 100,
            );

    // --- Companies ---
    const totalCompanies = await this.prisma.company.count({
      where: { organizationId: orgId },
    });
    const companiesThisMonth = await this.prisma.company.count({
      where: { organizationId: orgId, createdAt: { gte: startOfMonth } },
    });

    // --- Deals ---
    const totalDeals = await this.prisma.deal.count({
      where: { organizationId: orgId },
    });
    const dealValueRef = await this.prisma.deal.aggregate({
      where: { organizationId: orgId, status: 'open' },
      _sum: { valueAmount: true },
    });

    const pipeline = await ensureDefaultPipeline(this.prisma, orgId);
    const dealsForSummary = await this.prisma.deal.findMany({
      where: { organizationId: orgId },
      select: {
        valueAmount: true,
        stage: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const stageSummaries = new Map(
      pipeline.stages.map((stage) => [
        stage.name.toLowerCase(),
        { stageId: stage.id, stage: stage.name, count: 0, value: 0 },
      ]),
    );

    for (const fallbackStage of DEFAULT_PIPELINE_STAGES) {
      if (!stageSummaries.has(fallbackStage.name.toLowerCase())) {
        stageSummaries.set(fallbackStage.name.toLowerCase(), {
          stageId: fallbackStage.name.toLowerCase(),
          stage: fallbackStage.name,
          count: 0,
          value: 0,
        });
      }
    }

    for (const deal of dealsForSummary) {
      const key = deal.stage?.name?.toLowerCase() ?? 'lead';
      const existingStage = stageSummaries.get(key) ?? {
        stageId: deal.stage?.id ?? key,
        stage: deal.stage?.name ?? 'Lead',
        count: 0,
        value: 0,
      };

      existingStage.count += 1;
      existingStage.value += deal.valueAmount ?? 0;
      stageSummaries.set(key, existingStage);
    }

    const dealsByStage = Array.from(stageSummaries.values()).sort((left, right) => {
      const leftOrder = DEFAULT_PIPELINE_STAGES.findIndex((stage) => stage.name === left.stage);
      const rightOrder = DEFAULT_PIPELINE_STAGES.findIndex((stage) => stage.name === right.stage);

      const normalizedLeft = leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder;
      const normalizedRight = rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder;
      return normalizedLeft - normalizedRight;
    });

    // --- Campaigns ---
    const totalCampaigns = await this.prisma.campaign.count({
      where: { organizationId: orgId },
    });
    const activeCampaigns = await this.prisma.campaign.count({
      where: { organizationId: orgId, status: 'RUNNING' },
    });
    const emailsSent = await this.prisma.emailEvent.count({
      where: { eventType: 'SENT', campaign: { organizationId: orgId } },
    });
    const emailsOpened = await this.prisma.emailEvent.count({
      where: { eventType: 'OPENED', campaign: { organizationId: orgId } },
    });

    const lastEmailSent = await this.prisma.emailEvent.findFirst({
      where: { eventType: 'SENT', campaign: { organizationId: orgId } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    // --- Workflows ---
    const totalWorkflows = await this.prisma.workflow.count({
      where: { organizationId: orgId },
    });
    const activeWorkflows = await this.prisma.workflow.count({
      where: { organizationId: orgId, status: 'active' },
    });
    const workflowRuns = await this.prisma.workflowRun.count({
      where: { organizationId: orgId },
    });
    const lastWorkflowRun = await this.prisma.workflowRun.findFirst({
      where: { organizationId: orgId },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    });

    // --- Recent Activity & SEO ---
    const recentActivities = await this.prisma.activity.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const seoProjectCount = await this.prisma.sEOProject.count({
      where: { organizationId: orgId },
    });

    const gdprRequestsCount = await this.prisma.gdprRequest.count({
      where: { organizationId: orgId, status: 'pending' },
    });

    return {
      contacts: {
        total: totalContacts,
        thisMonth: contactsThisMonth,
        growth: contactGrowth,
      },
      companies: { total: totalCompanies, thisMonth: companiesThisMonth },
      deals: {
        total: totalDeals,
        value: dealValueRef._sum.valueAmount || 0,
        byStage: dealsByStage,
      },
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        sent: emailsSent,
        opened: emailsOpened,
        lastSendDate: lastEmailSent?.createdAt.toISOString() || null,
      },
      workflows: {
        total: totalWorkflows,
        active: activeWorkflows,
        runs: workflowRuns,
        lastRunDate: lastWorkflowRun?.startedAt.toISOString() || null,
      },
      seo: { projects: seoProjectCount },
      compliance: { gdprRequests: gdprRequestsCount },
      recentActivity: recentActivities.map((a) => ({
        id: a.id,
        title: a.subject || 'Activity logged',
        description: a.body || 'No description provided.',
        time: a.createdAt.toISOString(),
        type: a.type.toLowerCase(),
      })),
    };
  }
}
