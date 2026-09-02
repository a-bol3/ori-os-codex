import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { CreateCampaignDto, UpdateCampaignDto, CampaignStatus } from './dto/campaign.dto';
import { EmailService } from './email.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

type CampaignSummary = {
  id: string;
  status: CampaignStatus;
};

type CampaignWithCounts = CampaignSummary & {
  [key: string]: unknown;
};

type CampaignRecipientRecord = {
  id: string;
  lastStepOrder?: number;
  nextStepOrder?: number | null;
  nextStepAt?: Date | null;
  status?: string;
};

type EngagementModels = {
  campaign: {
    create: (args: unknown) => Promise<CampaignSummary>;
    findMany: (args: unknown) => Promise<CampaignWithCounts[]>;
    findFirst: (args: unknown) => Promise<(CampaignSummary & { recipients?: unknown[] }) | null>;
    update: (args: unknown) => Promise<CampaignSummary>;
    delete: (args: unknown) => Promise<unknown>;
  };
  emailEvent: {
    count: (args: unknown) => Promise<number>;
  };
  campaignRecipient: {
    createMany: (args: unknown) => Promise<unknown>;
    deleteMany: (args: unknown) => Promise<{ count: number }>;
    findMany: (args: unknown) => Promise<CampaignRecipientRecord[]>;
    update: (args: unknown) => Promise<unknown>;
  };
};

@Injectable()
export class EngagementService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmailService) private readonly email: EmailService,
    @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
  ) { }

  private get models(): EngagementModels {
    return this.prisma as unknown as EngagementModels;
  }

  private buildStepJobId(campaignId: string, recipientId: string, stepOrder: number) {
    return `campaign-${campaignId}-recipient-${recipientId}-step-${stepOrder}`;
  }

  async createCampaign(orgId: string, userId: string, dto: CreateCampaignDto) {
    const { sequenceSteps, ...campaignData } = dto;

    const campaign = await this.models.campaign.create({
      data: {
        ...campaignData,
        organizationId: orgId,
        createdBy: userId,
        sequenceSteps: sequenceSteps
          ? {
            create: sequenceSteps.map((step) => ({
              ...step,
            })),
          }
          : undefined,
      },
      include: { sequenceSteps: true },
    });

    if (campaign.status === CampaignStatus.RUNNING) {
      await this.startCampaignExecution(orgId, campaign.id);
    }

    return campaign;
  }

  async findAll(orgId: string) {
    const campaigns = await this.models.campaign.findMany({
      where: { organizationId: orgId },
      include: {
        sequenceSteps: { orderBy: { order: 'asc' } },
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // In a real app, we'd use a more efficient way to get these counts (e.g. raw SQL or a metrics table)
    // For MVP, we'll fetch them per campaign or in a batch
    return Promise.all(
      campaigns.map(async (c) => {
        const [sent, opened, replies] = await Promise.all([
          this.models.emailEvent.count({
            where: { campaignId: c.id, eventType: 'SENT' },
          }),
          this.models.emailEvent.count({
            where: { campaignId: c.id, eventType: 'OPENED' },
          }),
          this.models.emailEvent.count({
            where: { campaignId: c.id, eventType: 'REPLY' },
          }),
        ]);
        return {
          ...c,
          sent,
          opened,
          replies,
        };
      }),
    );
  }

  async findOne(orgId: string, id: string) {
    const campaign = await this.models.campaign.findFirst({
      where: { id, organizationId: orgId },
      include: {
        sequenceSteps: { orderBy: { order: 'asc' } },
        recipients: { include: { contact: true } },
        mailbox: { include: { domain: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    const [sent, opened, replies] = await Promise.all([
      this.models.emailEvent.count({
        where: { campaignId: campaign.id, eventType: 'SENT' },
      }),
      this.models.emailEvent.count({
        where: { campaignId: campaign.id, eventType: 'OPENED' },
      }),
      this.models.emailEvent.count({
        where: { campaignId: campaign.id, eventType: 'REPLY' },
      }),
    ]);

    return {
      ...campaign,
      sent,
      opened,
      replies,
      recipientsCount: Array.isArray(campaign.recipients) ? campaign.recipients.length : 0,
    };
  }

  async updateCampaign(orgId: string, id: string, dto: UpdateCampaignDto) {
    const { sequenceSteps, ...campaignData } = dto;

    const oldCampaign = await this.findOne(orgId, id);

    const updatedCampaign = await this.models.campaign.update({
      where: { id },
      data: {
        ...campaignData,
        sequenceSteps: sequenceSteps
          ? {
            deleteMany: {},
            create: sequenceSteps.map((step) => ({
              ...step,
            })),
          }
          : undefined,
      },
      include: { sequenceSteps: true },
    });

    if (
      updatedCampaign.status === CampaignStatus.RUNNING &&
      oldCampaign.status !== CampaignStatus.RUNNING
    ) {
      await this.startCampaignExecution(orgId, updatedCampaign.id);
    }

    return updatedCampaign;
  }

  async deleteCampaign(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.models.campaign.delete({
      where: { id },
    });
  }

  async addRecipients(orgId: string, campaignId: string, contactIds: string[]) {
    await this.findOne(orgId, campaignId);

    const contacts = await this.prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        organizationId: orgId,
      },
      select: { id: true },
    });

    const validContactIds = contacts.map((contact) => contact.id);

    if (validContactIds.length === 0) {
      throw new NotFoundException('No valid contacts found for this organization');
    }

    const result = await this.models.campaignRecipient.createMany({
      data: validContactIds.map((contactId) => ({
        campaignId,
        contactId,
        status: 'PENDING',
      })),
      skipDuplicates: true,
    });

    const campaign = await this.findOne(orgId, campaignId);

    if (campaign && campaign.status === CampaignStatus.RUNNING) {
      await this.startCampaignExecution(orgId, campaignId);
    }

    return result;
  }

  async removeRecipient(orgId: string, campaignId: string, contactId: string) {
    await this.findOne(orgId, campaignId);

    const contact = await this.prisma.contact.findFirst({
      where: {
        id: contactId,
        organizationId: orgId,
      },
      select: { id: true },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found for this organization');
    }

    const deleted = await this.models.campaignRecipient.deleteMany({
      where: {
        campaignId,
        contactId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Recipient not found');
    }

    return { success: true };
  }

  // --- Execution Engine ---

  async startCampaignExecution(organizationId: string, campaignId: string) {
    console.log(`[CAMPAIGN] Starting execution for campaign ${campaignId}`);

    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId, organizationId },
      select: {
        sequenceSteps: {
          orderBy: { order: 'asc' },
          select: { order: true },
        },
      },
    });

    const availableOrders = new Set(
      (campaign?.sequenceSteps ?? []).map((step) => step.order),
    );

    const recipients = await this.models.campaignRecipient.findMany({
      where: {
        campaignId,
        campaign: { organizationId },
        status: 'PENDING',
      },
    });

    console.log(
      `[CAMPAIGN] Found ${recipients.length} pending recipients to enqueue`,
    );

    for (const recipient of recipients) {
      await this.models.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'SCHEDULED',
          nextStepOrder: 1,
          nextStepAt: new Date(),
        },
      });

      await this.campaignQueue.add(
        'process-step',
        {
          campaignId,
          recipientId: recipient.id,
          stepOrder: 1, // Start with the first step
        },
        {
          jobId: this.buildStepJobId(campaignId, recipient.id, 1),
        },
      );
    }

    const stuckRecipients =
      await this.prisma.campaignRecipient.findMany({
        where: {
          campaignId,
          campaign: { organizationId },
          status: 'SCHEDULED',
          OR: [{ nextStepOrder: null }, { nextStepAt: null }],
        },
        select: {
          id: true,
          lastStepOrder: true,
          nextStepOrder: true,
          nextStepAt: true,
        },
      });

    if (stuckRecipients.length > 0) {
      console.log(
        `[CAMPAIGN] Found ${stuckRecipients.length} scheduled recipients without next-step metadata`,
      );
    }

    for (const recipient of stuckRecipients) {
      const recoveredStepOrder =
        recipient.lastStepOrder && recipient.lastStepOrder > 0
          ? recipient.lastStepOrder + 1
          : 1;

      if (!availableOrders.has(recoveredStepOrder)) {
        await this.models.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            nextStepOrder: null,
            nextStepAt: null,
          },
        });
        continue;
      }

      await this.models.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          nextStepOrder: recoveredStepOrder,
          nextStepAt: new Date(),
        },
      });

      await this.campaignQueue.add(
        'process-step',
        {
          campaignId,
          recipientId: recipient.id,
          stepOrder: recoveredStepOrder,
        },
        {
          jobId: this.buildStepJobId(
            campaignId,
            recipient.id,
            recoveredStepOrder,
          ),
        },
      );
    }
  }

  /**
   * Manual trigger to ensure all running campaigns are actually being processed.
   * Useful if some jobs were lost or the system was down.
   */
  async processRunningCampaigns(organizationId: string) {
    const campaigns = await this.models.campaign.findMany({
      where: { organizationId, status: 'RUNNING' },
    });

    for (const campaign of campaigns) {
      await this.startCampaignExecution(organizationId, campaign.id);
    }
  }
}
