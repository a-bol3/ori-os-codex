import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { EmailFallbackStrategy } from './strategies/email-fallback.strategy';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('connectors')
@UseGuards(JwtAuthGuard)
export class ConnectorsController {
  constructor(
    private readonly connectorsService: ConnectorsService,
    private readonly emailFallback: EmailFallbackStrategy,
  ) {}

  @Post()
  create(
    @Req() req: any,
    @Body() body: { type: string; label: string; config: any },
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.connectorsService.create(organizationId, body);
  }

  @Get()
  findAll(@Req() req: any) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.connectorsService.findAll(organizationId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.connectorsService.findOne(id, organizationId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { label?: string; config?: any; status?: string },
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.connectorsService.update(id, organizationId, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.connectorsService.remove(id, organizationId);
  }

  @Post(':id/test')
  testConnection(@Req() req: any, @Param('id') id: string) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.connectorsService.testConnection(id, organizationId);
  }

  @Post('email/send-test')
  sendTestEmail(
    @Req() req: any,
    @Body() body: { to: string; subject: string; html: string },
  ) {
    const organizationId = req.user?.organizationId || 'mock-org-id';
    return this.emailFallback.sendWithFallback(organizationId, {
      from: { name: 'Support', email: 'support@ori-os.com' },
      to: [{ email: body.to }],
      subject: body.subject,
      html: body.html,
    });
  }
}
