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
  UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompetitorsService } from './competitors.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';
import {
  CreateCompetitorDto,
  GetCompetitorsDto,
} from './dto/competitor.dto';

@Controller('seo/projects/:projectId/competitors')
@UseGuards(JwtAuthGuard)
export class CompetitorsController {
  constructor(@Inject(CompetitorsService) private readonly competitorsService: CompetitorsService) {}

  @Post()
  async createCompetitor(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body() dto: CreateCompetitorDto,
  ) {
    return this.competitorsService.createCompetitor(
      projectId,
      requireOrganizationId(req),
      dto,
    );
  }

  @Get()
  async getCompetitors(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Query() query: GetCompetitorsDto,
  ) {
    return this.competitorsService.getCompetitors(
      projectId,
      requireOrganizationId(req),
      query,
    );
  }

  @Get(':competitorId')
  async getCompetitor(
    @Request() req: AuthenticatedRequest,
    @Param('competitorId') competitorId: string,
  ) {
    return this.competitorsService.getCompetitorById(
      competitorId,
      requireOrganizationId(req),
    );
  }

  @Put(':competitorId')
  async updateCompetitor(
    @Request() req: AuthenticatedRequest,
    @Param('competitorId') competitorId: string,
    @Body() dto: Partial<CreateCompetitorDto>,
  ) {
    return this.competitorsService.updateCompetitor(
      competitorId,
      requireOrganizationId(req),
      dto,
    );
  }

  @Delete(':competitorId')
  async deleteCompetitor(
    @Request() req: AuthenticatedRequest,
    @Param('competitorId') competitorId: string,
  ) {
    return this.competitorsService.deleteCompetitor(
      competitorId,
      requireOrganizationId(req),
    );
  }

  @Post(':competitorId/check')
  async checkCompetitor(
    @Request() req: AuthenticatedRequest,
    @Param('competitorId') competitorId: string,
  ) {
    return this.competitorsService.checkCompetitorRankings(
      competitorId,
      requireOrganizationId(req),
    );
  }
}
