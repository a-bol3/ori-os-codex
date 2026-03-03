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
import { WorkflowsService } from './workflows.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('workflows')
@UseInterceptors(TenantInterceptor)
export class WorkflowsController {
    constructor(private readonly workflowsService: WorkflowsService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('category') category?: string,
    ) {
        const result = await this.workflowsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            status,
            category,
        );
        return { success: true, ...result };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.workflowsService.findOne(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createWorkflowDto: any) {
        const data = await this.workflowsService.create(createWorkflowDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateWorkflowDto: any) {
        const data = await this.workflowsService.update(id, updateWorkflowDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.workflowsService.remove(id);
        return { success: true };
    }
}
