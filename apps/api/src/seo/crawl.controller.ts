import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CrawlService } from './crawl.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';
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
  constructor(@Inject(CrawlService) private readonly crawlService: CrawlService) {}

  @Post()
  async startCrawl(
    @Param('projectId') projectId: string,
    @Body() dto: StartCrawlDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.crawlService.startCrawl(
      projectId,
      requireOrganizationId(req),
      dto.maxPages,
    );
  }

  @Get()
  async getCrawls(
    @Param('projectId') projectId: string,
    @Query() query: GetCrawlsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.crawlService.getCrawls(
      projectId,
      requireOrganizationId(req),
      query,
    );
  }

  @Get(':crawlId')
  async getCrawl(
    @Param('crawlId') crawlId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.crawlService.getCrawlById(
      crawlId,
      requireOrganizationId(req),
    );
  }

  @Get(':crawlId/issues')
  async getIssues(
    @Param('crawlId') crawlId: string,
    @Query() query: GetIssuesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.crawlService.getIssues(
      crawlId,
      requireOrganizationId(req),
      query,
    );
  }

  @Put(':crawlId/issues/:issueId')
  async updateIssue(
    @Param('issueId') issueId: string,
    @Body() dto: UpdateIssueDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.crawlService.updateIssueStatus(
      issueId,
      requireOrganizationId(req),
      dto.status,
    );
  }

  @Get(':crawlId/pages')
  async getPages(
    @Param('crawlId') crawlId: string,
    @Query() query: GetPagesDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.crawlService.getPages(
      crawlId,
      requireOrganizationId(req),
      query,
    );
  }
}
