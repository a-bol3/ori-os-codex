import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { CreateCampaignDto, UpdateCampaignDto, CampaignStatus } from './dto/campaign.dto';
import { EmailService } from './email.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EngagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    @InjectQueue('campaign-queue') private readonly campaignQueue: Queue,
  ) { }

  async createCampaign(orgId: string, userId: string, dto: CreateCampaignDto) {
    const { sequenceSteps, ...campaignData } = dto;

    const campaign = await (this.prisma as any).campaign.create({
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
      await this.startCampaignExecution(campaign.id);
    }

    return campaign;
  }

  async findAll(orgId: string) {
    const campaigns = await (this.prisma as any).campaign.findMany({
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
      campaigns.map(async (c: any) => {
        const [sent, replies] = await Promise.all([
          (this.prisma as any).emailEvent.count({
            where: { campaignId: c.id, eventType: 'SENT' },
          }),
          (this.prisma as any).emailEvent.count({
            where: { campaignId: c.id, eventType: 'REPLY' },
          }),
        ]);
        return {
          ...c,
          sent,
          replies,
        };
      }),
    );
  }

  async findOne(orgId: string, id: string) {
    const campaign = await (this.prisma as any).campaign.findFirst({
      where: { id, organizationId: orgId },
      include: {
        sequenceSteps: { orderBy: { order: 'asc' } },
        recipients: { include: { contact: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async updateCampaign(orgId: string, id: string, dto: UpdateCampaignDto) {
    const { sequenceSteps, ...campaignData } = dto;

    const oldCampaign = await this.findOne(orgId, id);

    const updatedCampaign = await (this.prisma as any).campaign.update({
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
      await this.startCampaignExecution(updatedCampaign.id);
    }

    return updatedCampaign;
  }

  async deleteCampaign(orgId: string, id: string) {
    return (this.prisma as any).campaign.delete({
      where: { id, organizationId: orgId },
    });
  }

  async addRecipients(orgId: string, campaignId: string, contactIds: string[]) {
    const result = await (this.prisma as any).campaignRecipient.createMany({
      data: contactIds.map((contactId) => ({
        campaignId,
        contactId,
        status: 'PENDING',
      })),
      skipDuplicates: true,
    });

    const campaign = await (this.prisma as any).campaign.findUnique({
      where: { id: campaignId },
    });

    if (campaign && campaign.status === CampaignStatus.RUNNING) {
      await this.startCampaignExecution(campaignId);
    }

    return result;
  }

  // --- Execution Engine ---

  async startCampaignExecution(campaignId: string) {
    console.log(`[CAMPAIGN] Starting execution for campaign ${campaignId}`);

    const recipients = await (this.prisma as any).campaignRecipient.findMany({
      where: {
        campaignId,
        status: 'PENDING',
      },
    });

    console.log(
      `[CAMPAIGN] Found ${recipients.length} pending recipients to enqueue`,
    );

    for (const recipient of recipients) {
      await (this.prisma as any).campaignRecipient.update({
        where: { id: recipient.id },
        data: { status: 'SCHEDULED' },
      });

      await this.campaignQueue.add('process-step', {
        campaignId,
        recipientId: recipient.id,
        stepOrder: 1, // Start with the first step
      });
    }
  }

  /**
   * Manual trigger to ensure all running campaigns are actually being processed.
   * Useful if some jobs were lost or the system was down.
   */
  async processRunningCampaigns() {
    const campaigns = await (this.prisma as any).campaign.findMany({
      where: { status: 'RUNNING' },
    });

    for (const campaign of campaigns) {
      await this.startCampaignExecution(campaign.id);
    }
  }
}
