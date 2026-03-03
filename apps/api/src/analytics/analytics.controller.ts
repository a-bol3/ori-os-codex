import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Request() req) {
    const orgId = req.user.organizationId || 'mock-org-id';
    return this.analyticsService.getOverview(orgId);
  }

  @Get('revenue-trend')
  async getRevenueTrend(@Request() req) {
    const orgId = req.user.organizationId || 'mock-org-id';
    return this.analyticsService.getRevenueTrend(orgId);
  }

  @Get('funnel')
  async getFunnel(@Request() req) {
    const orgId = req.user.organizationId || 'mock-org-id';
    return this.analyticsService.getFunnel(orgId);
  }
}
