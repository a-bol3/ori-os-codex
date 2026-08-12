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
  UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BacklinksService } from './backlinks.service';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';
import {
  CreateBacklinkDto,
  UpdateBacklinkDto,
  GetBacklinksDto,
} from './dto/backlink.dto';

@Controller('seo/projects/:projectId/backlinks')
@UseGuards(JwtAuthGuard)
export class BacklinksController {
  constructor(@Inject(BacklinksService) private readonly backlinksService: BacklinksService) {}

  @Post()
  async createBacklink(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Body() dto: CreateBacklinkDto,
  ) {
    return this.backlinksService.createBacklink(
      projectId,
      requireOrganizationId(req),
      dto,
    );
  }

  @Get()
  async getBacklinks(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
    @Query() query: GetBacklinksDto,
  ) {
    return this.backlinksService.getBacklinks(
      projectId,
      requireOrganizationId(req),
      query,
    );
  }

  @Get('summary')
  async getBacklinkSummary(
    @Request() req: AuthenticatedRequest,
    @Param('projectId') projectId: string,
  ) {
    return this.backlinksService.getBacklinkSummary(
      projectId,
      requireOrganizationId(req),
    );
  }

  @Put(':backlinkId')
  async updateBacklink(
    @Request() req: AuthenticatedRequest,
    @Param('backlinkId') backlinkId: string,
    @Body() dto: UpdateBacklinkDto,
  ) {
    return this.backlinksService.updateBacklink(
      backlinkId,
      requireOrganizationId(req),
      dto,
    );
  }

  @Post(':backlinkId/verify')
  async verifyBacklink(
    @Request() req: AuthenticatedRequest,
    @Param('backlinkId') backlinkId: string,
  ) {
    return this.backlinksService.verifyBacklink(
      backlinkId,
      requireOrganizationId(req),
    );
  }

  @Delete(':backlinkId')
  async deleteBacklink(
    @Request() req: AuthenticatedRequest,
    @Param('backlinkId') backlinkId: string,
  ) {
    return this.backlinksService.deleteBacklink(
      backlinkId,
      requireOrganizationId(req),
    );
  }
}
