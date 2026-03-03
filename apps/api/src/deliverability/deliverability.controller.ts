import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DeliverabilityService } from './deliverability.service';
import { CreateDomainDto, UpdateDomainDto } from './dto/domain.dto';
import { CreateMailboxDto, UpdateMailboxDto } from './dto/mailbox.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('deliverability')
@UseGuards(JwtAuthGuard)
export class DeliverabilityController {
  constructor(private readonly service: DeliverabilityService) {}

  @Post('domains')
  createDomain(@Request() req, @Body() dto: CreateDomainDto) {
    // Assuming req.user has organizationId or we get it from membership
    return this.service.createDomain(
      req.user.organizationId || 'default-org-id',
      dto,
    );
  }

  @Get('domains')
  getDomains(@Request() req) {
    return this.service.getDomains(req.user.organizationId || 'default-org-id');
  }

  @Post('domains/:id/verify')
  verifyDns(@Param('id') id: string) {
    return this.service.verifyDns(id);
  }

  @Post('mailboxes')
  createMailbox(@Request() req, @Body() dto: CreateMailboxDto) {
    return this.service.createMailbox(
      req.user.organizationId || 'default-org-id',
      dto,
    );
  }

  @Get('mailboxes')
  getMailboxes(@Request() req) {
    return this.service.getMailboxes(
      req.user.organizationId || 'default-org-id',
    );
  }

  @Patch('mailboxes/:id')
  updateMailbox(@Param('id') id: string, @Body() dto: UpdateMailboxDto) {
    return this.service.updateMailbox(id, dto);
  }
}
