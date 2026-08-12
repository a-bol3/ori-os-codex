import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankingsService } from './rankings.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';
import {
  CheckRankingsDto,
  GetRankingsDto,
  GetRankingSummaryDto,
} from './dto/ranking.dto';

@Controller('seo/projects/:projectId/rankings')
@UseGuards(JwtAuthGuard)
export class RankingsController {
  constructor(@Inject(RankingsService) private readonly rankingsService: RankingsService) {}

  @Post('check')
  async checkRankings(
    @Param('projectId') projectId: string,
    @Body() dto: CheckRankingsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.rankingsService.checkRankings(
      projectId,
      requireOrganizationId(req),
      dto.keywordIds,
    );
  }

  @Get()
  async getRankings(
    @Param('projectId') projectId: string,
    @Query() query: GetRankingsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.rankingsService.getRankings(
      projectId,
      requireOrganizationId(req),
      query,
    );
  }

  @Get('summary')
  async getSummary(
    @Param('projectId') projectId: string,
    @Query() query: GetRankingSummaryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.rankingsService.getRankingSummary(
      projectId,
      requireOrganizationId(req),
      query.days,
    );
  }
}
