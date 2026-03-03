import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaService } from '@ori-os/db/nestjs';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getDashboardData(@Req() req) {
        const orgId = req.user.organizationId;
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
        const contactGrowth = contactsLastMonth === 0 ? 100 : Math.round(((contactsThisMonth - contactsLastMonth) / contactsLastMonth) * 100);

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
        const dealsByStage = await this.prisma.deal.groupBy({
            by: ['stageId'],
            where: { organizationId: orgId },
            _count: { _all: true },
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
            contacts: { total: totalContacts, thisMonth: contactsThisMonth, growth: contactGrowth },
            companies: { total: totalCompanies, thisMonth: companiesThisMonth },
            deals: { total: totalDeals, value: dealValueRef._sum.valueAmount || 0, byStage: dealsByStage },
            campaigns: {
                total: totalCampaigns,
                active: activeCampaigns,
                sent: emailsSent,
                opened: emailsOpened,
                lastSendDate: lastEmailSent?.createdAt.toISOString() || null
            },
            workflows: {
                total: totalWorkflows,
                active: activeWorkflows,
                runs: workflowRuns,
                lastRunDate: lastWorkflowRun?.startedAt.toISOString() || null
            },
            seo: { projects: seoProjectCount },
            compliance: { gdprRequests: gdprRequestsCount },
            recentActivity: recentActivities.map(a => ({
                id: a.id,
                title: a.subject || 'Activity logged',
                description: a.body || 'No description provided.',
                time: a.createdAt.toISOString(),
                type: a.type.toLowerCase(),
            }))
        };
    }
}
