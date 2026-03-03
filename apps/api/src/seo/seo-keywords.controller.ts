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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SeoKeywordsService } from './seo-keywords.service';

@Controller('seo/keywords')
@UseGuards(JwtAuthGuard)
export class SeoKeywordsController {
  constructor(private readonly seoKeywordsService: SeoKeywordsService) {}

  @Get()
  async findAll(@Query('projectId') projectId: string, @Req() req: any) {
    const organizationId = req.user?.organizationId || 'default-org';
    return this.seoKeywordsService.findAll(projectId, organizationId);
  }

  @Get(':id/rankings')
  async getRankingHistory(
    @Param('id') id: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    const organizationId = req.user?.organizationId || 'default-org';
    const limitNum = limit ? parseInt(limit, 10) : 30;
    return this.seoKeywordsService.getRankingHistory(
      id,
      organizationId,
      limitNum,
    );
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const organizationId = req.user?.organizationId || 'default-org';

    return this.seoKeywordsService.create({
      projectId: body.projectId,
      organizationId,
      keyword: body.keyword,
      targetUrl: body.targetUrl,
      searchVolume: body.searchVolume,
      difficulty: body.difficulty,
      source: body.source,
      intent: body.intent,
    });
  }

  @Post('bulk')
  async bulkCreate(@Body() body: any, @Req() req: any) {
    const organizationId = req.user?.organizationId || 'default-org';

    return this.seoKeywordsService.bulkCreate(
      body.projectId,
      organizationId,
      body.keywords,
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const organizationId = req.user?.organizationId || 'default-org';

    return this.seoKeywordsService.update(id, organizationId, {
      targetUrl: body.targetUrl,
      tracked: body.tracked,
      intent: body.intent,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user?.organizationId || 'default-org';
    return this.seoKeywordsService.delete(id, organizationId);
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
    @Req() req: any,
  ) {
    const organizationId = req.user?.organizationId || 'default-org';
    return this.seoKeywordsService.clusterKeywords(
      body.projectId,
      organizationId,
      body.keywords,
    );
  }
}
