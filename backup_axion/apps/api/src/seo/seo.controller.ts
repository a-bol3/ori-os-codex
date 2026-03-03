import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseInterceptors,
} from '@nestjs/common';
import { SEOService } from './seo.service';
import { CreateSEOProjectDto, UpdateSEOProjectDto, CreateSEOKeywordDto } from './dto/seo.dto';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('seo')
@UseInterceptors(TenantInterceptor)
export class SEOController {
    constructor(private readonly seoService: SEOService) { }

    @Get('projects')
    async findAll() {
        const data = await this.seoService.findAllProjects();
        return { success: true, data };
    }

    @Get('projects/:id')
    async findOne(@Param('id') id: string) {
        const data = await this.seoService.findOneProject(id);
        return { success: true, data };
    }

    @Post('projects')
    async create(@Body() dto: CreateSEOProjectDto) {
        const data = await this.seoService.createProject(dto);
        return { success: true, data };
    }

    @Patch('projects/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateSEOProjectDto) {
        const data = await this.seoService.updateProject(id, dto);
        return { success: true, data };
    }

    @Delete('projects/:id')
    async remove(@Param('id') id: string) {
        await this.seoService.removeProject(id);
        return { success: true };
    }

    @Get('projects/:projectId/keywords')
    async findKeywords(@Param('projectId') projectId: string) {
        const data = await this.seoService.getProjectKeywords(projectId);
        return { success: true, data };
    }

    @Post('projects/:projectId/keywords')
    async addKeyword(
        @Param('projectId') projectId: string,
        @Body() dto: CreateSEOKeywordDto,
    ) {
        const data = await this.seoService.addKeyword(projectId, dto);
        return { success: true, data };
    }

    @Delete('keywords/:id')
    async removeKeyword(@Param('id') id: string) {
        await this.seoService.removeKeyword(id);
        return { success: true };
    }
}
