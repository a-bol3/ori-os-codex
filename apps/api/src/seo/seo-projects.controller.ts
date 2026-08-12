import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SeoProjectsService } from './seo-projects.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
  requireUserId,
} from '../common/request-context';

type CreateSeoProjectBody = {
  name: string;
  domain: string;
  description?: string;
  companyId?: string;
  crawlFrequency?: string;
  maxPagesToCrawl?: string | number;
};

type UpdateSeoProjectBody = {
  name?: string;
  description?: string;
  crawlFrequency?: string;
  maxPagesToCrawl?: number;
  gscConnected?: boolean;
  gscSiteUrl?: string;
};

@Controller('seo/projects')
@UseGuards(JwtAuthGuard)
export class SeoProjectsController {
  constructor(@Inject(SeoProjectsService) private readonly seoProjectsService: SeoProjectsService) {}

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.seoProjectsService.findAll(requireOrganizationId(req));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const organizationId = requireOrganizationId(req);
    return this.seoProjectsService.findOne(id, organizationId);
  }

  @Post()
  async create(
    @Body() body: CreateSeoProjectBody,
    @Req() req: AuthenticatedRequest,
  ) {
    const organizationId = requireOrganizationId(req);
    const creatorId = requireUserId(req);

    const createData: {
      organizationId: string;
      creatorId: string;
      name: string;
      domain: string;
      description?: string;
      companyId?: string;
      crawlFrequency?: string;
      maxPagesToCrawl?: number;
    } = {
      organizationId,
      creatorId,
      name: body.name,
      domain: body.domain,
    };

    if (body.description) createData.description = body.description;
    if (body.companyId) createData.companyId = body.companyId;
    if (body.crawlFrequency) createData.crawlFrequency = body.crawlFrequency;
    if (body.maxPagesToCrawl !== undefined) {
      createData.maxPagesToCrawl = Number(body.maxPagesToCrawl);
    }

    return this.seoProjectsService.create(createData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSeoProjectBody,
    @Req() req: AuthenticatedRequest,
  ) {
    const organizationId = requireOrganizationId(req);

    return this.seoProjectsService.update(id, organizationId, {
      name: body.name,
      description: body.description,
      crawlFrequency: body.crawlFrequency,
      maxPagesToCrawl: body.maxPagesToCrawl,
      gscConnected: body.gscConnected,
      gscSiteUrl: body.gscSiteUrl,
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const organizationId = requireOrganizationId(req);
    return this.seoProjectsService.delete(id, organizationId);
  }
}
