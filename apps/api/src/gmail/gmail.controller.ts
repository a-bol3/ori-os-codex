import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest, requireOrganizationId, requireUserId } from '../common/request-context';
import { GmailService } from './gmail.service';

@Controller('integrations/gmail')
@UseGuards(JwtAuthGuard)
export class GmailController {
  constructor(private readonly gmail: GmailService) {}

  @Get('status')
  status(@Req() req: AuthenticatedRequest) { return this.gmail.status(requireOrganizationId(req)); }

  @Get('connect')
  connect(@Req() req: AuthenticatedRequest) { return this.gmail.createAuthUrl(requireOrganizationId(req), requireUserId(req)); }

  @Get('callback')
  callback(@Query('code') code: string, @Query('state') state: string) { return this.gmail.handleCallback(code, state); }
}
