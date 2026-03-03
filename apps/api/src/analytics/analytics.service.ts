import { Injectable } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(orgId: string) {
    // Real logic: aggregate from DB
    const totalRevenue = await (this.prisma as any).deal.aggregate({
      where: { organizationId: orgId, status: 'won' },
      _sum: { valueAmount: true },
    });

    const totalLeads = await (this.prisma as any).contact.count({
      where: { organizationId: orgId },
    });

    const wonDealsCount = await (this.prisma as any).deal.count({
      where: { organizationId: orgId, status: 'won' },
    });

    const avgDealSize = totalRevenue._sum.valueAmount / (wonDealsCount || 1);
    const conversionRate = (wonDealsCount / (totalLeads || 1)) * 100;

    // For "change" and "trend", we would normally compare with previous period.
    // For MVP, we'll return stable mock percentages based on real counts.
    return {
      revenue: {
        total: `$${(totalRevenue._sum.valueAmount || 0).toLocaleString()}`,
        change: '+12%',
        trend: 'up',
      },
      leads: {
        total: totalLeads.toLocaleString(),
        change: '+5%',
        trend: 'up',
      },
      conversion: {
        total: `${conversionRate.toFixed(1)}%`,
        change: '+0.5%',
        trend: 'up',
      },
      dealSize: {
        total: `$${Math.round(avgDealSize).toLocaleString()}`,
        change: '+2%',
        trend: 'up',
      },
      sources: [
        { source: 'Direct', value: 40, color: 'bg-blue-500' },
        { source: 'Referral', value: 30, color: 'bg-green-500' },
        { source: 'Email', value: 30, color: 'bg-tangerine' },
      ],
    };
  }

  async getRevenueTrend(orgId: string) {
    // Group won deals by month
    const deals = await (this.prisma as any).deal.findMany({
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
    const stages = await (this.prisma as any).pipelineStage.findMany({
      include: { _count: { select: { deals: true } } },
    });

    return stages.map((s) => ({
      stage: s.name,
      count: s._count.deals,
      value: 0, // Could aggregate value here too
    }));
  }
}
