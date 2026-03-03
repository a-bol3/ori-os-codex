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
import { ContactsService } from './contacts.service';
import { TenantInterceptor } from '../common/interceptors/tenant.interceptor';

@Controller('contacts')
@UseInterceptors(TenantInterceptor)
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        const result = await this.contactsService.findAll(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            search,
            status,
        );
        return { success: true, ...result };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.contactsService.findOne(id);
        return { success: true, data };
    }

    @Post()
    async create(@Body() createContactDto: any) {
        const data = await this.contactsService.create(createContactDto);
        return { success: true, data };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateContactDto: any) {
        const data = await this.contactsService.update(id, updateContactDto);
        return { success: true, data };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.contactsService.remove(id);
        return { success: true };
    }
}
