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
  NotFoundException, Inject } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { CampaignLaunchService } from './engagement/campaign-launch.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import {
  AuthenticatedRequest,
  requireOrganizationId,
  requireUserId,
} from './common/request-context';

@Controller('engagement/campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(
    @Inject(EngagementService) private readonly service: EngagementService,
    @Inject(CampaignLaunchService) private readonly launchService: CampaignLaunchService,
  ) { }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.service.findAll(requireOrganizationId(req));
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.findOne(requireOrganizationId(req), id);
  }

  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() dto: CreateCampaignDto) {
    const orgId = requireOrganizationId(req);
    const userId = requireUserId(req);
    return this.service.createCampaign(orgId, userId, dto);
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.service.updateCampaign(requireOrganizationId(req), id, dto);
  }

  @Delete(':id')
  async delete(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.service.deleteCampaign(requireOrganizationId(req), id);
  }

  @Post(':id/recipients')
  async addRecipients(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { contactIds: string[] },
  ) {
    return this.service.addRecipients(
      requireOrganizationId(req),
      id,
      body.contactIds,
    );
  }

  @Delete(':id/recipients/:contactId')
  async removeRecipient(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('contactId') contactId: string,
  ) {
    return this.service.removeRecipient(
      requireOrganizationId(req),
      id,
      contactId,
    );
  }

  @Post('process')
  async processCampaigns() {
    await this.service.processRunningCampaigns();
    return { status: 'success', message: 'Campaign processing triggered' };
  }
  @Post(':id/launch')
  async launch(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.launchService.launch(requireOrganizationId(req), id);
  }
}

// Keeping InboxController in the same file as per previous structure or we could split
import { EmailService } from './email.service';
import { PrismaService } from '@ori-os/db/nestjs';

type EmailEventRecord = {
  contact: { email: string } | null;
  campaign: { organizationId: string } | null;
};

type EmailEventModel = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<EmailEventRecord | null>;
};

type SendEmailResult = {
  success: boolean;
  simulated?: boolean;
};

@Controller('engagement/inbox')
@UseGuards(JwtAuthGuard)
export class InboxController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmailService) private readonly email: EmailService,
  ) { }

  private get emailEventModel(): EmailEventModel {
    return (this.prisma as unknown as { emailEvent: EmailEventModel }).emailEvent;
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);
    return this.emailEventModel.findMany({
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
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    const orgId = requireOrganizationId(req);
    const event = await this.emailEventModel.findUnique({
      where: { id },
      include: { contact: true, campaign: true },
    });

    if (!event || !event.contact || event.campaign?.organizationId !== orgId) {
      throw new NotFoundException('Original message or contact not found');
    }

    const result = (await this.email.sendEmail(
      event.contact.email,
      `Re: Follow up`,
      body.content,
    )) as SendEmailResult;

    return {
      status: result.success ? 'success' : 'error',
      simulated: result.simulated,
    };
  }
}
