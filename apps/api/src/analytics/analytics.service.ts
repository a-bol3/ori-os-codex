import {  Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class AnalyticsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  private periodChange(current: number, previous: number) {
    if (previous === 0) {
      return { change: '—', trend: 'unknown' as const };
    }
    const delta = ((current - previous) / Math.abs(previous)) * 100;
    return {
      change: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`,
      trend: delta > 0 ? ('up' as const) : delta < 0 ? ('down' as const) : ('flat' as const),
    };
  }

  async getOverview(orgId: string) {
    const now = new Date();
    const currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const currentWindow = { gte: currentStart, lt: now };
    const previousWindow = { gte: previousStart, lt: currentStart };

    const [currentRevenue, previousRevenue, currentLeads, previousLeads,
      currentWonDeals, previousWonDeals, currentContacts, currentWonCount,
      previousContacts, previousWonCount] = await Promise.all([
      this.prisma.deal.aggregate({
        where: { organizationId: orgId, status: 'won', createdAt: currentWindow },
        _sum: { valueAmount: true },
      }),
      this.prisma.deal.aggregate({
        where: { organizationId: orgId, status: 'won', createdAt: previousWindow },
        _sum: { valueAmount: true },
      }),
      this.prisma.contact.count({ where: { organizationId: orgId, createdAt: currentWindow } }),
      this.prisma.contact.count({ where: { organizationId: orgId, createdAt: previousWindow } }),
      this.prisma.deal.count({ where: { organizationId: orgId, status: 'won', createdAt: currentWindow } }),
      this.prisma.deal.count({ where: { organizationId: orgId, status: 'won', createdAt: previousWindow } }),
      this.prisma.contact.count({ where: { organizationId: orgId, createdAt: currentWindow } }),
      this.prisma.deal.count({ where: { organizationId: orgId, status: 'won', createdAt: currentWindow } }),
      this.prisma.contact.count({ where: { organizationId: orgId, createdAt: previousWindow } }),
      this.prisma.deal.count({ where: { organizationId: orgId, status: 'won', createdAt: previousWindow } }),
    ]);

    const revenueTotal = Number(currentRevenue._sum.valueAmount ?? 0);
    const previousRevenueTotal = Number(previousRevenue._sum.valueAmount ?? 0);
    const avgDealSize = revenueTotal / (currentWonDeals || 1);
    const previousAvgDealSize = previousRevenueTotal / (previousWonDeals || 1);
    const conversionRate = (currentWonCount / (currentContacts || 1)) * 100;
    const previousConversionRate = (previousWonCount / (previousContacts || 1)) * 100;

    return {
      revenue: {
        total: `$${revenueTotal.toLocaleString()}`,
        ...this.periodChange(revenueTotal, previousRevenueTotal),
      },
      leads: {
        total: currentLeads.toLocaleString(),
        ...this.periodChange(currentLeads, previousLeads),
      },
      conversion: {
        total: `${conversionRate.toFixed(1)}%`,
        ...this.periodChange(conversionRate, previousConversionRate),
      },
      dealSize: {
        total: `$${Math.round(avgDealSize).toLocaleString()}`,
        ...this.periodChange(avgDealSize, previousAvgDealSize),
      },
      // Contact source is not yet a first-class field. Never invent attribution.
      sources: [],
      dataQuality: {
        attribution: 'not_configured',
        window: 'rolling_30_days',
        timezone: 'UTC',
      },
      metricDefinitions: [
        { key: 'revenue', definition: 'Won deal value created in the selected window' },
        { key: 'leads', definition: 'Contacts created in the selected window' },
        { key: 'conversion', definition: 'Won deals divided by contacts created in the selected window' },
        { key: 'dealSize', definition: 'Average value of won deals created in the selected window' },
      ],
    };
  }

  async getRevenueTrend(orgId: string) {
    // Group won deals by month
    const deals = await this.prisma.deal.findMany({
      where: { organizationId: orgId, status: 'won' },
      select: { valueAmount: true, createdAt: true },
    });

    // Simple aggregation logic for trend
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const trend = months.map((m) => ({ month: m, revenue: 0 }));

    deals.forEach((d) => {
      const m = d.createdAt.getMonth();
      trend[m].revenue += d.valueAmount;
    });

    return trend;
  }

  async getFunnel(orgId: string) {
    const stages = await this.prisma.pipelineStage.findMany({
      where: {
        pipeline: {
          organizationId: orgId,
        },
      },
      select: {
        name: true,
        deals: {
          select: {
            id: true,
            valueAmount: true,
          },
        },
      },
    });

    return stages.map((s) => ({
      stage: s.name,
      count: s.deals.length,
      value: s.deals.reduce((sum, deal) => sum + Number(deal.valueAmount ?? 0), 0),
    }));
  }
}
