import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompetitorsService } from './competitors.service';
import {
  CreateCompetitorDto,
  GetCompetitorsDto,
  CheckCompetitorDto,
} from './dto/competitor.dto';

@Controller('seo/projects/:projectId/competitors')
@UseGuards(JwtAuthGuard)
export class CompetitorsController {
  constructor(private readonly competitorsService: CompetitorsService) {}

  @Post()
  async createCompetitor(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: CreateCompetitorDto,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.competitorsService.createCompetitor(projectId, orgId, dto);
  }

  @Get()
  async getCompetitors(
    @Request() req,
    @Param('projectId') projectId: string,
    @Query() query: GetCompetitorsDto,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.competitorsService.getCompetitors(projectId, orgId, query);
  }

  @Get(':competitorId')
  async getCompetitor(
    @Request() req,
    @Param('competitorId') competitorId: string,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.competitorsService.getCompetitorById(competitorId, orgId);
  }

  @Put(':competitorId')
  async updateCompetitor(
    @Request() req,
    @Param('competitorId') competitorId: string,
    @Body() dto: Partial<CreateCompetitorDto>,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.competitorsService.updateCompetitor(competitorId, orgId, dto);
  }

  @Delete(':competitorId')
  async deleteCompetitor(
    @Request() req,
    @Param('competitorId') competitorId: string,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.competitorsService.deleteCompetitor(competitorId, orgId);
  }

  @Post(':competitorId/check')
  async checkCompetitor(
    @Request() req,
    @Param('competitorId') competitorId: string,
  ) {
    const orgId = req.user?.organizationId || 'default-org-id';
    return this.competitorsService.checkCompetitorRankings(competitorId, orgId);
  }
}
