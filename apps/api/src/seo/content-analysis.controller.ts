import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContentAnalysisService } from './content-analysis.service';
import { AnalyzeContentDto, GetContentAnalysesDto } from './dto/content.dto';

@Controller('seo/projects/:projectId/content')
@UseGuards(JwtAuthGuard)
export class ContentAnalysisController {
  constructor(private readonly contentService: ContentAnalysisService) {}

  @Post('analyze')
  async analyzeContent(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: AnalyzeContentDto,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.contentService.analyzeContent(
      projectId,
      orgId,
      dto.pageUrl,
      dto.targetKeyword,
      dto.includeCompetitors,
    );
  }

  @Get()
  async getAnalyses(
    @Request() req,
    @Param('projectId') projectId: string,
    @Query() query: GetContentAnalysesDto,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.contentService.getAnalyses(projectId, orgId, query);
  }

  @Get(':analysisId')
  async getAnalysis(@Request() req, @Param('analysisId') analysisId: string) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.contentService.getAnalysisById(analysisId, orgId);
  }
}
