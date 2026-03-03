import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BacklinksService } from './backlinks.service';
import {
  CreateBacklinkDto,
  UpdateBacklinkDto,
  GetBacklinksDto,
} from './dto/backlink.dto';

@Controller('seo/projects/:projectId/backlinks')
@UseGuards(JwtAuthGuard)
export class BacklinksController {
  constructor(private readonly backlinksService: BacklinksService) {}

  @Post()
  async createBacklink(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: CreateBacklinkDto,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.backlinksService.createBacklink(projectId, orgId, dto);
  }

  @Get()
  async getBacklinks(
    @Request() req,
    @Param('projectId') projectId: string,
    @Query() query: GetBacklinksDto,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.backlinksService.getBacklinks(projectId, orgId, query);
  }

  @Get('summary')
  async getBacklinkSummary(
    @Request() req,
    @Param('projectId') projectId: string,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.backlinksService.getBacklinkSummary(projectId, orgId);
  }

  @Put(':backlinkId')
  async updateBacklink(
    @Request() req,
    @Param('backlinkId') backlinkId: string,
    @Body() dto: UpdateBacklinkDto,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.backlinksService.updateBacklink(backlinkId, orgId, dto);
  }

  @Post(':backlinkId/verify')
  async verifyBacklink(
    @Request() req,
    @Param('backlinkId') backlinkId: string,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.backlinksService.verifyBacklink(backlinkId, orgId);
  }

  @Delete(':backlinkId')
  async deleteBacklink(
    @Request() req,
    @Param('backlinkId') backlinkId: string,
  ) {
    const orgId = req.user?.organizationId || 'mock-org-id';
    return this.backlinksService.deleteBacklink(backlinkId, orgId);
  }
}
