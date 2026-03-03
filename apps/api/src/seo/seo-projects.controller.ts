import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SeoProjectsService } from './seo-projects.service';

@Controller('seo/projects')
@UseGuards(JwtAuthGuard)
export class SeoProjectsController {
  constructor(private readonly seoProjectsService: SeoProjectsService) { }

  @Get()
  async findAll(@Req() req: any): Promise<any> {
    console.log('[SEO DEBUG] Entering findAll');
    try {
      const organizationId = req.user?.organizationId || 'mock-org-id';
      console.log(`[SEO DEBUG] organizationId: ${organizationId}`);
      const results = await this.seoProjectsService.findAll(organizationId);
      console.log(`[SEO DEBUG] Found projects: ${results.length}`);
      return results;
    } catch (error) {
      console.error('[SEO DEBUG] Error in findAll:', error);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<any> {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.seoProjectsService.findOne(id, organizationId);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any): Promise<any> {
    console.log('[SEO DEBUG] Entering create');
    try {
      const organizationId = req.user?.organizationId || 'mock-org-id';
      const creatorId = req.user?.id || req.user?.userId || 'mock-user-id';

      console.log(
        `[SEO DEBUG] Creating project with org=${organizationId}, creator=${creatorId}`,
      );

      const createData: any = {
        organizationId,
        creatorId,
        name: body.name,
        domain: body.domain,
      };

      if (body.description) createData.description = body.description;
      if (body.companyId) createData.companyId = body.companyId;
      if (body.crawlFrequency) createData.crawlFrequency = body.crawlFrequency;
      if (body.maxPagesToCrawl)
        createData.maxPagesToCrawl = parseInt(body.maxPagesToCrawl);

      return await this.seoProjectsService.create(createData);
    } catch (error) {
      console.error('[SEO DEBUG] Error in create:', error);
      throw error;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any): Promise<any> {
    const organizationId = req.user?.organizationId || 'default-org';

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
  async delete(@Param('id') id: string, @Req() req: any): Promise<any> {
    const organizationId = req.user?.organizationId || 'default-org';
    return this.seoProjectsService.delete(id, organizationId);
  }
}
