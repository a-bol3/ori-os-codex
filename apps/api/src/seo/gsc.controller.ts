import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GSCService } from './gsc.service';
import { Response } from 'express';

@Controller('seo/gsc')
@UseGuards(JwtAuthGuard)
export class GSCController {
  constructor(private readonly gscService: GSCService) {}

  @Get('auth-url')
  async getAuthUrl(@Query('projectId') projectId: string) {
    return this.gscService.getAuthUrl(projectId);
  }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') projectId: string,
    @Res() res: Response,
  ) {
    const result = await this.gscService.handleCallback(code, projectId);
    // Redirect back to the project page in frontend
    return res.redirect(
      `/dashboard/seo/projects/${result.projectId}?gsc_connected=success`,
    );
  }

  @Get('sync-data')
  async syncData(@Query('projectId') projectId: string) {
    return this.gscService.syncProjectData(projectId);
  }
}
