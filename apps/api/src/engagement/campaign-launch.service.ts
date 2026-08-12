import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

type LaunchRecipient = {
  id: string;
};

type LaunchCampaign = {
  id: string;
  status: string;
  recipients: LaunchRecipient[];
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
    // Fetch all campaign contacts from Prisma
    const campaign = await this.campaignModel.findFirst({
      where: { id: campaignId, organizationId },
      include: {
        recipients: {
          where: { status: 'PENDING' },
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
}
