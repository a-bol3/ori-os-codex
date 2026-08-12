import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
  Request, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GSCService } from './gsc.service';
import { Response } from 'express';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

@Controller('seo/gsc')
export class GSCController {
  constructor(@Inject(GSCService) private readonly gscService: GSCService) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  async getAuthUrl(
    @Query('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.gscService.getAuthUrl(projectId, requireOrganizationId(req));
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const result = await this.gscService.handleCallback(code, state);
    return res.redirect(
      `/dashboard/seo/projects/${result.projectId}?gsc_connected=success`,
    );
  }

  @Get('sync-data')
  @UseGuards(JwtAuthGuard)
  async syncData(
    @Query('projectId') projectId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.gscService.syncProjectData(
      projectId,
      requireOrganizationId(req),
    );
  }
}
