import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('campaigns')
@UseInterceptors(TenantInterceptor)
export class CampaignsController {
    constructor(private readonly campaignsService: CampaignsService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        const result = await this.campaignsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            status,
        );
        return { success: true, ...result };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.campaignsService.findOne(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createCampaignDto: any) {
        const data = await this.campaignsService.create(createCampaignDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCampaignDto: any) {
        const data = await this.campaignsService.update(id, updateCampaignDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.campaignsService.remove(id);
        return { success: true };
    }
}
