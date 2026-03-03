import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('activities')
@UseInterceptors(TenantInterceptor)
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
    ) {
        const result = await this.activitiesService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            type,
        );
        return { success: true, ...result };
    }

    @Post()
    async create(@Body() createActivityDto: any) {
        const data = await this.activitiesService.create(createActivityDto);
        return { success: true, data };
    }
}
