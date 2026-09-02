import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

type LaunchRecipient = {
  id: string;
};

type LaunchSequenceStep = {
  order: number;
  stepType: string;
  configJson?: Record<string, unknown> | null;
  template?: {
    subject?: string | null;
    bodyHtml?: string | null;
    bodyText?: string | null;
  } | null;
};

type LaunchCampaign = {
  id: string;
  organizationId: string;
  name: string;
  status: string;
  mailboxId?: string | null;
  fromEmail?: string | null;
  recipients: LaunchRecipient[];
  sequenceSteps: LaunchSequenceStep[];
  mailbox?: {
    id: string;
    organizationId: string;
    email: string;
    isActive: boolean;
  } | null;
};

type CampaignModel = {
  findFirst: (args: unknown) => Promise<LaunchCampaign | null>;
  update: (args: unknown) => Promise<unknown>;
};

type CampaignRecipientModel = {
  update: (args: unknown) => Promise<unknown>;
};

@Injectable()
export class CampaignLaunchService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
  ) {}

  private get campaignModel(): CampaignModel {
    return (this.prisma as unknown as { campaign: CampaignModel }).campaign;
  }

  private get campaignRecipientModel(): CampaignRecipientModel {
    return (
      this.prisma as unknown as { campaignRecipient: CampaignRecipientModel }
    ).campaignRecipient;
  }

  private buildStepJobId(campaignId: string, recipientId: string, stepOrder: number) {
    return `campaign-${campaignId}-recipient-${recipientId}-step-${stepOrder}`;
  }

  async launch(organizationId: string, campaignId: string) {
    const campaign = await this.campaignModel.findFirst({
      where: { id: campaignId, organizationId },
      include: {
        recipients: {
          where: { status: 'PENDING' },
        },
        sequenceSteps: {
          orderBy: { order: 'asc' },
          include: {
            template: {
              select: { subject: true, bodyHtml: true, bodyText: true },
            },
          },
        },
        mailbox: {
          select: {
            id: true,
            organizationId: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // Guard: Only DRAFT or SCHEDULED (as READY substitute) can be launched
    // Status enum: DRAFT, SCHEDULED, RUNNING, PAUSED, COMPLETED, ARCHIVED
    if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) {
      throw new Error(
        `Campaign cannot be launched in status ${campaign.status}`,
      );
    }

    this.validateLaunchReadiness(campaign, organizationId);

    const jobs: string[] = [];
    for (const recipient of campaign.recipients) {
      const job = await this.campaignQueue.add(
        'process-step',
        {
          campaignId: campaign.id,
          recipientId: recipient.id,
          stepOrder: 1,
        },
        {
          jobId: this.buildStepJobId(campaign.id, recipient.id, 1),
        },
      );
      if (job.id) jobs.push(job.id);

      await this.campaignRecipientModel.update({
        where: { id: recipient.id },
        data: {
          status: 'SCHEDULED',
          nextStepOrder: 1,
          nextStepAt: new Date(),
        },
      });
    }

    // Update campaign status to RUNNING (substitute for ACTIVE)
    await this.campaignModel.update({
      where: { id: campaignId },
      data: { status: 'RUNNING' },
    });

    return {
      success: true,
      enqueuedCount: jobs.length,
      message: `Enqueued ${jobs.length} jobs for campaign launch.`,
    };
  }

  private validateLaunchReadiness(
    campaign: LaunchCampaign,
    organizationId: string,
  ) {
    if (campaign.recipients.length === 0) {
      throw new BadRequestException(
        'Campaign must have at least one pending recipient before launch',
      );
    }

    if (
      campaign.mailboxId &&
      (!campaign.mailbox ||
        campaign.mailbox.organizationId !== organizationId ||
        !campaign.mailbox.isActive)
    ) {
      throw new BadRequestException(
        'The selected sending mailbox is not active for this organization',
      );
    }

    const senderEmail =
      campaign.fromEmail?.trim() ||
      campaign.mailbox?.email?.trim() ||
      process.env.FROM_EMAIL?.trim();
    if (!senderEmail) {
      throw new BadRequestException(
        'Campaign sender is not configured; select an active mailbox or configure FROM_EMAIL',
      );
    }

    const firstStep = campaign.sequenceSteps.find((step) => step.order === 1);
    if (!firstStep) {
      throw new BadRequestException(
        'Campaign sequence must contain a first step with order 1',
      );
    }

    const emailSteps = campaign.sequenceSteps.filter(
      (step) => step.stepType === 'EMAIL',
    );
    if (emailSteps.length === 0) {
      throw new BadRequestException(
        'Campaign sequence must contain at least one email step',
      );
    }

    for (const step of emailSteps) {
      const config = step.configJson ?? {};
      const subject =
        this.getString(config.subject) ||
        this.getString(config.title) ||
        this.getString(step.template?.subject) ||
        campaign.name.trim();
      const body =
        this.getString(config.html) ||
        this.getString(config.bodyHtml) ||
        this.getString(config.body) ||
        this.getString(config.text) ||
        this.getString(step.template?.bodyHtml) ||
        this.getString(step.template?.bodyText);

      if (!subject || !body) {
        throw new BadRequestException(
          `Email step ${step.order} must contain a subject and body before launch`,
        );
      }
    }
  }

  private getString(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
