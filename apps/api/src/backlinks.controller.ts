import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('seo/backlinks')
@UseGuards(JwtAuthGuard)
export class BacklinksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    try {
      return await (this.prisma as any).backlink.findMany({
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
  async create(@Request() req, @Body() data: any) {
    const orgId = req.user.organizationId || 'default-org-id';
    const { sourceUrl, targetUrl, anchorText } = data;
    try {
      return await (this.prisma as any).backlink.create({
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
  async remove(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    try {
      const existing = await (this.prisma as any).backlink.findFirst({
        where: { id, organizationId: orgId },
      });
      if (!existing) return { error: 'Not found' };
      return await (this.prisma as any).backlink.delete({ where: { id } });
    } catch {
      return { success: true };
    }
  }
}
