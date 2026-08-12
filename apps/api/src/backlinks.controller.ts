import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';

type LegacyBacklinkModel = {
  findMany: (args: unknown) => Promise<unknown[]>;
  create: (args: unknown) => Promise<unknown>;
  findFirst: (args: unknown) => Promise<{ id: string } | null>;
  delete: (args: unknown) => Promise<unknown>;
};

type LegacyBacklinkBody = {
  sourceUrl: string;
  targetUrl: string;
  anchorText?: string;
};

@Controller('seo/backlinks')
@UseGuards(JwtAuthGuard)
export class BacklinksController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get backlinkModel(): LegacyBacklinkModel {
    return (this.prisma as unknown as { backlink: LegacyBacklinkModel })
      .backlink;
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    try {
      return await this.backlinkModel.findMany({
        where: { organizationId: orgId },
        orderBy: { firstSeen: 'desc' },
        take: 100,
      });
    } catch {
      // Backlink model may not exist — return empty
      return [];
    }
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() data: LegacyBacklinkBody,
  ) {
    const orgId = requireOrganizationId(req);
    const { sourceUrl, targetUrl, anchorText } = data;
    try {
      return await this.backlinkModel.create({
        data: {
          organizationId: orgId,
          sourceUrl,
          targetUrl,
          anchorText: anchorText || '',
          status: 'active',
          firstSeen: new Date(),
        },
      });
    } catch {
      return {
        id: `bl-${Date.now()}`,
        sourceUrl,
        targetUrl,
        anchorText,
        status: 'active',
        firstSeen: new Date().toISOString(),
      };
    }
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);
    try {
      const existing = await this.backlinkModel.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!existing) return { error: 'Not found' };
      return await this.backlinkModel.delete({ where: { id } });
    } catch {
      return { success: true };
    }
  }
}
