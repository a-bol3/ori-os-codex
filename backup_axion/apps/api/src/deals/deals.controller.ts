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
import { DealsService } from './deals.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('deals')
@UseInterceptors(TenantInterceptor)
export class DealsController {
    constructor(private readonly dealsService: DealsService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('stage') stage?: string,
        @Query('status') status?: string,
    ) {
        const result = await this.dealsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            stage,
            status,
        );
        return { success: true, ...result };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.dealsService.findOne(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createDealDto: any) {
        const data = await this.dealsService.create(createDealDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateDealDto: any) {
        const data = await this.dealsService.update(id, updateDealDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.dealsService.remove(id);
        return { success: true };
    }
}
