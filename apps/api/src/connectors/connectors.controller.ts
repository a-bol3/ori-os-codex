import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req, Inject } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { EmailFallbackStrategy } from './strategies/email-fallback.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

type ConnectorConfig = Record<string, unknown>;
type ConnectorBody = { type: string; label: string; config: ConnectorConfig };
type ConnectorUpdateBody = {
  label?: string;
  config?: ConnectorConfig;
  status?: string;
};

@Controller('connectors')
@UseGuards(JwtAuthGuard)
export class ConnectorsController {
  constructor(
    @Inject(ConnectorsService) private readonly connectorsService: ConnectorsService,
    @Inject(EmailFallbackStrategy) private readonly emailFallback: EmailFallbackStrategy,
  ) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: ConnectorBody,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.connectorsService.create(organizationId, body);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    const organizationId = requireOrganizationId(req);
    return this.connectorsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const organizationId = requireOrganizationId(req);
    return this.connectorsService.findOne(id, organizationId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: ConnectorUpdateBody,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.connectorsService.update(id, organizationId, body);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const organizationId = requireOrganizationId(req);
    return this.connectorsService.remove(id, organizationId);
  }

  @Post(':id/test')
  testConnection(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const organizationId = requireOrganizationId(req);
    return this.connectorsService.testConnection(id, organizationId);
  }

  @Post('email/send-test')
  sendTestEmail(
    @Req() req: AuthenticatedRequest,
    @Body() body: { to: string; subject: string; html: string },
  ) {
    const organizationId = requireOrganizationId(req);
    return this.emailFallback.sendWithFallback(organizationId, {
      from: { name: 'Support', email: 'support@ori-os.com' },
      to: [{ email: body.to }],
      subject: body.subject,
      html: body.html,
    });
  }
}
