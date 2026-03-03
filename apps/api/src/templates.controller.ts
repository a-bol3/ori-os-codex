import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AiService } from './ai.service';

@Controller('content/templates')
export class TemplatesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  @Get()
  async findAll() {
    return (this.prisma as any).emailTemplate.findMany();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return (this.prisma as any).emailTemplate.findUnique({
      where: { id },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return (this.prisma as any).emailTemplate.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return (this.prisma as any).emailTemplate.delete({
      where: { id },
    });
  }

  @Post()
  async create(@Body() data: any) {
    return (this.prisma as any).emailTemplate.create({
      data,
    });
  }

  @Post('generate')
  async generate(@Body() body: { prompt: string; type: 'Email' | 'Social' }) {
    const { prompt, type } = body;
    console.log(`[AI] Generating ${type} for prompt: ${prompt}`);

    const aiResult = await this.ai.generateContent(prompt, type || 'Email');

    const name = aiResult?.name || `AI Draft: ${prompt.substring(0, 20)}...`;
    const content = aiResult?.content || `Draft content for ${prompt}`;

    return (this.prisma as any).emailTemplate.create({
      data: {
        name,
        subject: name, // Added subject as it's required in new schema or at least present
        bodyHtml: content,
        bodyText: content,
        language: 'en',
        organizationId: 'default-org-id', // Needs orgId now!
      },
    });
  }
}
