import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
  requireUserId,
} from '../common/request-context';
import { GdprService } from './gdpr.service';

/** Organization-scoped data-subject operations for administrators and support tools. */
@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
export class GdprController {
  constructor(private readonly gdpr: GdprService) {}

  @Get('requests')
  listRequests(@Request() req: AuthenticatedRequest) {
    return this.gdpr.listRequests(requireOrganizationId(req));
  }

  @Post('contacts/:contactId/export-request')
  requestExport(
    @Param('contactId') contactId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.gdpr.createExportRequest(
      contactId,
      requireOrganizationId(req),
      requireUserId(req),
    );
  }

  @Get('contacts/:contactId/export')
  exportContact(
    @Param('contactId') contactId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.gdpr.exportContact(
      contactId,
      requireOrganizationId(req),
      requireUserId(req),
    );
  }

  @Post('contacts/:contactId/delete-request')
  requestDelete(
    @Param('contactId') contactId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.gdpr.createDeleteRequest(
      contactId,
      requireOrganizationId(req),
      requireUserId(req),
    );
  }
}
