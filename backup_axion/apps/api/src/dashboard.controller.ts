import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private prisma: PrismaService) { }

    @Get()
    async getDashboardData(@Query('organizationId') organizationId: string) {
        // In production, organizationId would come from the user's session
        const orgId = organizationId || 'default-org-id';

        const [
            contacts,
            thisMonthContacts,
            companies,
            thisMonthCompanies,
            deals,
            dealsValue,
            campaigns,
            activeCampaigns,
            sentEmails,
            openedEmails,
            workflows,
            activeWorkflows,
            recentActivity,
        ] = await Promise.all([
            this.prisma.contact.count({ where: { organizationId: orgId } }),
            this.prisma.contact.count({
                where: {
                    organizationId: orgId,
                    createdAt: { gte: new Date(new Date().setDate(1)) },
                },
            }),
            this.prisma.company.count({ where: { organizationId: orgId } }),
            this.prisma.company.count({
                where: {
                    organizationId: orgId,
                    createdAt: { gte: new Date(new Date().setDate(1)) },
                },
            }),
            this.prisma.deal.count({ where: { organizationId: orgId } }),
            this.prisma.deal.aggregate({
                where: { organizationId: orgId },
                _sum: { value: true },
            }),
            this.prisma.campaign.count({ where: { organizationId: orgId } }),
            this.prisma.campaign.count({ where: { organizationId: orgId, status: 'active' } }),
            this.prisma.campaign.aggregate({
                where: { organizationId: orgId },
                _sum: { sentCount: true },
            }),
            this.prisma.campaign.aggregate({
                where: { organizationId: orgId },
                _sum: { openedCount: true },
            }),
            this.prisma.workflow.count({ where: { organizationId: orgId } }),
            this.prisma.workflow.count({ where: { organizationId: orgId, status: 'active' } }),
            this.prisma.activity.findMany({
                where: { organizationId: orgId },
                take: 10,
                orderBy: { occurredAt: 'desc' },
                include: { contact: true },
            }),
        ]);

        // Calculate growth (simple mock calculation as we don't have full historical data tracking yet)
        const lastMonthContacts = contacts - thisMonthContacts;
        const growth = lastMonthContacts > 0 ? (thisMonthContacts / lastMonthContacts) * 100 : 0;

        return {
            contacts: {
                total: contacts,
                thisMonth: thisMonthContacts,
                growth: Math.round(growth),
            },
            companies: {
                total: companies,
                thisMonth: thisMonthCompanies,
            },
            deals: {
                total: deals,
                value: dealsValue._sum.value || 0,
                byStage: [], // To be implemented with group by
            },
            campaigns: {
                total: campaigns,
                active: activeCampaigns,
                sent: sentEmails._sum.sentCount || 0,
                opened: openedEmails._sum.openedCount || 0,
            },
            workflows: {
                total: workflows,
                active: activeWorkflows,
                runs: 0, // Should be fetched from workflow runs
            },
            recentActivity: recentActivity.map(a => ({
                id: a.id,
                title: a.title,
                description: a.description,
                time: a.occurredAt.toISOString(),
                type: a.type.split('_')[0], // e.g., 'email' from 'email_sent'
            })),
        };
    }
}
