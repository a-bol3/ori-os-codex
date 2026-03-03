import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CrawlService } from './crawl.service';
import {
  StartCrawlDto,
  UpdateIssueDto,
  GetCrawlsDto,
  GetIssuesDto,
  GetPagesDto,
} from './dto/crawl.dto';

@Controller('seo/projects/:projectId/crawl')
@UseGuards(JwtAuthGuard)
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Post()
  async startCrawl(
    @Param('projectId') projectId: string,
    @Body() dto: StartCrawlDto,
    @Request() req: any,
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.crawlService.startCrawl(
      projectId,
      organizationId,
      dto.maxPages,
    );
  }

  @Get()
  async getCrawls(
    @Param('projectId') projectId: string,
    @Query() query: GetCrawlsDto,
    @Request() req: any,
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.crawlService.getCrawls(projectId, organizationId, query);
  }

  @Get(':crawlId')
  async getCrawl(@Param('crawlId') crawlId: string, @Request() req: any) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.crawlService.getCrawlById(crawlId, organizationId);
  }

  @Get(':crawlId/issues')
  async getIssues(
    @Param('crawlId') crawlId: string,
    @Query() query: GetIssuesDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId || 'mock-org-id';
    return this.crawlService.getIssues(crawlId, organizationId, query);
  }

  @Put(':crawlId/issues/:issueId')
  async updateIssue(
    @Param('issueId') issueId: string,
    @Body() dto: UpdateIssueDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId || 'mock-org-id';
    return this.crawlService.updateIssueStatus(
      issueId,
      organizationId,
      dto.status,
    );
  }

  @Get(':crawlId/pages')
  async getPages(
    @Param('crawlId') crawlId: string,
    @Query() query: GetPagesDto,
    @Request() req: any,
  ) {
    const organizationId = req.user.organizationId || 'mock-org-id';
    return this.crawlService.getPages(crawlId, organizationId, query);
  }
}
