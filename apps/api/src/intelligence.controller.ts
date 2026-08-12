import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { SubscriptionGuard } from './billing/subscription.guard';
import {
  CreateIcpProfileDto,
  UpdateIcpProfileDto,
} from './dto/icp-profile.dto';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';

@Controller('intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(@Inject(IntelligenceService) private readonly service: IntelligenceService) { }

  // --- ICP Profiles ---

  @Post('icp')
  async createIcp(@Request() req: AuthenticatedRequest, @Body() dto: CreateIcpProfileDto) {
    return this.service.createIcpProfile(requireOrganizationId(req), dto);
  }

  @Get('icp')
  async getIcps(@Request() req: AuthenticatedRequest) {
    return this.service.getIcpProfiles(requireOrganizationId(req));
  }

  @Put('icp/:id')
  async updateIcp(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateIcpProfileDto,
  ) {
    return this.service.updateIcpProfile(requireOrganizationId(req), id, dto);
  }

  @Delete('icp/:id')
  async deleteIcp(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.deleteIcpProfile(requireOrganizationId(req), id);
  }

  // --- Lead Discovery ---

  @Get('search')
  async searchLeads(@Query('q') query: string = '') {
    // Call service to find leads
    return this.service.searchLeads(query);
  }

  // --- Enrichment (PRO Feature) ---

  @Post('enrich')
  @UseGuards(SubscriptionGuard)
  async enrich(
    @Request() req: AuthenticatedRequest,
    @Body() body: { contactId?: string; companyId?: string; domain?: string; type: 'enrich-contact' | 'enrich-company' | 'find-email' },
  ) {
    return this.service.enqueueEnrichment({
      ...body,
      orgId: requireOrganizationId(req),
    });
  }

  @Post('enrich/company')
  @UseGuards(SubscriptionGuard)
  async enrichCompany(
    @Request() req: AuthenticatedRequest,
    @Body() body: { domain: string; companyId?: string },
  ) {
    return this.service.enqueueEnrichment({
      domain: body.domain,
      companyId: body.companyId,
      type: 'enrich-company',
      orgId: requireOrganizationId(req),
    });
  }

  @Get('enrich/jobs')
  async getJobs(@Request() req: AuthenticatedRequest) {
    return this.service.getEnrichmentJobs(requireOrganizationId(req));
  }
}
