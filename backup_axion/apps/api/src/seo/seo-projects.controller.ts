import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { SeoProjectsService } from './seo-projects.service';

@Controller('seo/projects')
export class SeoProjectsController {
    constructor(private readonly seoService: SeoProjectsService) { }

    @Get()
    async listProjects(@Query('organizationId') organizationId: string) {
        return this.seoService.listProjects(organizationId || 'default-org-id');
    }

    @Post()
    async createProject(@Body() data: { name: string; domain: string; organizationId?: string }) {
        return this.seoService.createProject({
            ...data,
            organizationId: data.organizationId || 'default-org-id',
        });
    }

    @Get(':id')
    async getProject(@Param('id') id: string) {
        return this.seoService.getProjectWithStats(id);
    }
}
