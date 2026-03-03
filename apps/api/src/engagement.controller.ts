import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CampaignLaunchService } from './engagement/campaign-launch.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';

@Controller('engagement/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(
    private readonly service: EngagementService,
    private readonly launchService: CampaignLaunchService,
  ) { }

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    return this.service.findAll(orgId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    return this.service.findOne(orgId, id);
  }

  @Post()
  async create(@Request() req, @Body() dto: CreateCampaignDto) {
    const orgId = req.user.organizationId || 'default-org-id';
    const userId = req.user.userId;
    return this.service.createCampaign(orgId, userId, dto);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    const orgId = req.user.organizationId || 'default-org-id';
    return this.service.updateCampaign(orgId, id, dto);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const orgId = req.user.organizationId || 'default-org-id';
    return this.service.deleteCampaign(orgId, id);
  }

  @Post(':id/recipients')
  async addRecipients(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { contactIds: string[] },
  ) {
    const orgId = req.user.organizationId || 'default-org-id';
    return this.service.addRecipients(orgId, id, body.contactIds);
  }

  @Post('process')
  async processCampaigns() {
    await this.service.processRunningCampaigns();
    return { status: 'success', message: 'Campaign processing triggered' };
  }
  @Post(':id/launch')
  async launch(@Param('id') id: string) {
    return this.launchService.launch(id);
  }
}

// Keeping InboxController in the same file as per previous structure or we could split
import { EmailService } from './email.service';
import { PrismaService } from '@ori-os/db/nestjs';

@Controller('engagement/inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) { }

  @Get()
  async findAll(@Request() req) {
    const orgId = req.user.organizationId || 'default-org-id';
    return (this.prisma as any).emailEvent.findMany({
      where: {
        eventType: 'REPLY',
        campaign: { organizationId: orgId },
      },
      include: { contact: true, campaign: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post(':id/reply')
  async reply(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    const event = await (this.prisma as any).emailEvent.findUnique({
      where: { id },
      include: { contact: true },
    });

    if (!event || !event.contact)
      return {
        status: 'error',
        message: 'Original message or contact not found',
      };

    const result = await this.email.sendEmail(
      event.contact.email,
      `Re: Follow up`,
      body.content,
    );

    return {
      status: result.success ? 'success' : 'error',
      simulated: (result as any).simulated,
    };
  }
}
