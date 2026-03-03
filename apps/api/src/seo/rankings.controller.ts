import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankingsService } from './rankings.service';
import {
  CheckRankingsDto,
  GetRankingsDto,
  GetRankingSummaryDto,
} from './dto/ranking.dto';

@Controller('seo/projects/:projectId/rankings')
@UseGuards(JwtAuthGuard)
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  @Post('check')
  async checkRankings(
    @Param('projectId') projectId: string,
    @Body() dto: CheckRankingsDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId || 'default-org-id';
    return this.rankingsService.checkRankings(
      projectId,
      organizationId,
      dto.keywordIds,
    );
  }

  @Get()
  async getRankings(
    @Param('projectId') projectId: string,
    @Query() query: GetRankingsDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId || 'default-org-id';
    return this.rankingsService.getRankings(projectId, organizationId, query);
  }

  @Get('summary')
  async getSummary(
    @Param('projectId') projectId: string,
    @Query() query: GetRankingSummaryDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId || 'default-org-id';
    return this.rankingsService.getRankingSummary(
      projectId,
      organizationId,
      query.days,
    );
  }
}
