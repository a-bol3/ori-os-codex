import {  Controller, Get, UseGuards, Request, Inject } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getOverview(requireOrganizationId(req));
  }

  @Get('revenue-trend')
  async getRevenueTrend(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getRevenueTrend(requireOrganizationId(req));
  }

  @Get('funnel')
  async getFunnel(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getFunnel(requireOrganizationId(req));
  }
}
