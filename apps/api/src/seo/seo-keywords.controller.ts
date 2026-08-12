import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SeoKeywordsService } from './seo-keywords.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

type SeoKeywordCreateBody = {
  projectId: string;
  keyword: string;
  targetUrl?: string;
  searchVolume?: number;
  difficulty?: number;
  source?: string;
  intent?: string;
};

type SeoKeywordBulkCreateBody = {
  projectId: string;
  keywords: Array<{
    keyword: string;
    targetUrl?: string;
    searchVolume?: number;
    difficulty?: number;
    source?: string;
    intent?: string;
  }>;
};

type SeoKeywordUpdateBody = {
  targetUrl?: string;
  tracked?: boolean;
  intent?: string;
};

@Controller('seo/keywords')
@UseGuards(JwtAuthGuard)
export class SeoKeywordsController {
  constructor(@Inject(SeoKeywordsService) private readonly seoKeywordsService: SeoKeywordsService) {}

  @Get()
  async findAll(
    @Query('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.seoKeywordsService.findAll(
      projectId,
      requireOrganizationId(req),
    );
  }

  @Get(':id/rankings')
  async getRankingHistory(
    @Param('id') id: string,
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 30;
    return this.seoKeywordsService.getRankingHistory(
      id,
      requireOrganizationId(req),
      limitNum,
    );
  }

  @Post()
  async create(
    @Body() body: SeoKeywordCreateBody,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.seoKeywordsService.create({
      projectId: body.projectId,
      organizationId: requireOrganizationId(req),
      keyword: body.keyword,
      targetUrl: body.targetUrl,
      searchVolume: body.searchVolume,
      difficulty: body.difficulty,
      source: body.source,
      intent: body.intent,
    });
  }

  @Post('bulk')
  async bulkCreate(
    @Body() body: SeoKeywordBulkCreateBody,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.seoKeywordsService.bulkCreate(
      body.projectId,
      requireOrganizationId(req),
      body.keywords,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: SeoKeywordUpdateBody,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.seoKeywordsService.update(id, requireOrganizationId(req), {
      targetUrl: body.targetUrl,
      tracked: body.tracked,
      intent: body.intent,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.seoKeywordsService.delete(id, requireOrganizationId(req));
  }

  @Post('discover')
  async discover(
    @Body() body: { query: string; lang?: string; country?: string },
  ) {
    return this.seoKeywordsService.discoverKeywords(
      body.query,
      body.lang,
      body.country,
    );
  }

  @Post('cluster')
  async cluster(
    @Body() body: { projectId: string; keywords: string[] },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.seoKeywordsService.clusterKeywords(
      body.projectId,
      requireOrganizationId(req),
      body.keywords,
    );
  }
}
