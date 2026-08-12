import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Request,
  UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentAnalysisService } from './content-analysis.service';
import { AnalyzeContentDto, GetContentAnalysesDto } from './dto/content.dto';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

@Controller('seo/projects/:projectId/content')
@UseGuards(JwtAuthGuard)
export class ContentAnalysisController {
  constructor(@Inject(ContentAnalysisService) private readonly contentService: ContentAnalysisService) {}

  @Post('analyze')
  async analyzeContent(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body() dto: AnalyzeContentDto,
  ) {
    return this.contentService.analyzeContent(
      projectId,
      requireOrganizationId(req),
      dto.pageUrl,
      dto.targetKeyword,
      dto.includeCompetitors,
    );
  }

  @Get()
  async getAnalyses(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Query() query: GetContentAnalysesDto,
  ) {
    return this.contentService.getAnalyses(
      projectId,
      requireOrganizationId(req),
      query,
    );
  }

  @Get(':analysisId')
  async getAnalysis(
    @Request() req: AuthenticatedRequest,
    @Param('analysisId') analysisId: string,
  ) {
    return this.contentService.getAnalysisById(
      analysisId,
      requireOrganizationId(req),
    );
  }
}
