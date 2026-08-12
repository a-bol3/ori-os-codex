import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request, Inject } from '@nestjs/common';
import { DeliverabilityService } from './deliverability.service';
import { CreateDomainDto } from './dto/domain.dto';
import { CreateMailboxDto, UpdateMailboxDto } from './dto/mailbox.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

@Controller('deliverability')
@UseGuards(JwtAuthGuard)
export class DeliverabilityController {
  constructor(@Inject(DeliverabilityService) private readonly service: DeliverabilityService) {}

  @Post('domains')
  createDomain(@Request() req: AuthenticatedRequest, @Body() dto: CreateDomainDto) {
    return this.service.createDomain(requireOrganizationId(req), dto);
  }

  @Get('domains')
  getDomains(@Request() req: AuthenticatedRequest) {
    return this.service.getDomains(requireOrganizationId(req));
  }

  @Post('domains/:id/verify')
  verifyDns(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.verifyDns(requireOrganizationId(req), id);
  }

  @Post('mailboxes')
  createMailbox(@Request() req: AuthenticatedRequest, @Body() dto: CreateMailboxDto) {
    return this.service.createMailbox(requireOrganizationId(req), dto);
  }

  @Get('mailboxes')
  getMailboxes(@Request() req: AuthenticatedRequest) {
    return this.service.getMailboxes(requireOrganizationId(req));
  }

  @Patch('mailboxes/:id')
  updateMailbox(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateMailboxDto,
  ) {
    return this.service.updateMailbox(requireOrganizationId(req), id, dto);
  }
}
