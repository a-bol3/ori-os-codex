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
import { CompaniesService } from './companies.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('companies')
@UseInterceptors(TenantInterceptor)
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        const result = await this.companiesService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            search,
            status,
        );
        return { success: true, ...result };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.companiesService.findOne(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createCompanyDto: any) {
        const data = await this.companiesService.create(createCompanyDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCompanyDto: any) {
        const data = await this.companiesService.update(id, updateCompanyDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.companiesService.remove(id);
        return { success: true };
    }
}
