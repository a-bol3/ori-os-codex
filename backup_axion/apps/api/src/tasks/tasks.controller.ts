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
import { TasksService } from './tasks.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('tasks')
@UseInterceptors(TenantInterceptor)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    async findAll(@Query('status') status?: string) {
        const result = await this.tasksService.findAll(status);
        return { success: true, ...result };
    }

    @Post()
    async create(@Body() createTaskDto: any) {
        const data = await this.tasksService.create(createTaskDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTaskDto: any) {
        const data = await this.tasksService.update(id, updateTaskDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.tasksService.remove(id);
        return { success: true };
    }
}
