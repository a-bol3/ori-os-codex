import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AiService } from './ai.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';

type EmailTemplateRecord = {
  id: string;
  organizationId: string;
};

type EmailTemplateModel = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findFirst: (args: unknown) => Promise<EmailTemplateRecord | null>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
};

type EmailTemplateWriteBody = {
  name: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  language?: string;
  category?: string;
};

type GeneratedTemplateContent = {
  name?: string;
  content?: string;
};

@Controller('content/templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AiService) private readonly ai: AiService,
  ) {}

  private get emailTemplateModel(): EmailTemplateModel {
    return (this.prisma as unknown as { emailTemplate: EmailTemplateModel })
      .emailTemplate;
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.emailTemplateModel.findMany({
      where: { organizationId: requireOrganizationId(req) },
    });
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.emailTemplateModel.findFirst({
      where: { id, organizationId: requireOrganizationId(req) },
    });
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: Partial<EmailTemplateWriteBody>,
  ) {
    await this.findOne(req, id);
    return this.emailTemplateModel.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.findOne(req, id);
    return this.emailTemplateModel.delete({
      where: { id },
    });
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() data: EmailTemplateWriteBody,
  ) {
    return this.emailTemplateModel.create({
      data: {
        ...data,
        organizationId: requireOrganizationId(req),
      },
    });
  }

  @Post('generate')
  async generate(
    @Request() req: AuthenticatedRequest,
    @Body() body: { prompt: string; type: 'Email' | 'Social' },
  ) {
    const { prompt, type } = body;
    console.log(`[AI] Generating ${type} for prompt: ${prompt}`);

    const aiResult = (await this.ai.generateContent(
      prompt,
      type || 'Email',
    )) as GeneratedTemplateContent | null;

    const name = aiResult?.name || `AI Draft: ${prompt.substring(0, 20)}...`;
    const content = aiResult?.content || `Draft content for ${prompt}`;

    return this.emailTemplateModel.create({
      data: {
        name,
        subject: name, // Added subject as it's required in new schema or at least present
        bodyHtml: content,
        bodyText: content,
        language: 'en',
        organizationId: requireOrganizationId(req),
      },
    });
  }
}
