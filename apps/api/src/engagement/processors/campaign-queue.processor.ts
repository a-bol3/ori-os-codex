import { Inject, Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '@ori-os/db/nestjs';
import { EmailService } from '../../email.service';
import { StepType } from '../../dto/campaign.dto';
import { fixtureMode } from '@ori-os/core';

type CampaignSequenceStep = {
  id: string;
  order: number;
  stepType: StepType | string;
  configJson: Record<string, unknown> | null;
  template?: {
    subject?: string | null;
    bodyHtml?: string | null;
    bodyText?: string | null;
  } | null;
};

type CampaignContact = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  optOut?: boolean | null;
};

type CampaignRecipient = {
  id: string;
  campaignId: string;
  contactId: string;
  status: string;
  lastStepOrder: number;
  lastEventAt: Date | null;
  nextStepOrder: number | null;
  nextStepAt: Date | null;
  contact: CampaignContact | null;
};

type CampaignRecord = {
  id: string;
  name: string;
  organizationId: string;
  status: string;
  fromName?: string | null;
  fromEmail?: string | null;
  replyTo?: string | null;
  mailboxId?: string | null;
  sequenceSteps: CampaignSequenceStep[];
};

type ProcessStepJobData = {
  campaignId?: string;
  recipientId?: string;
  stepOrder?: number;
};

@Processor('campaign-queue')
@Injectable()
export class CampaignQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(CampaignQueueProcessor.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(EmailService) private readonly emailService: EmailService,
    @InjectQueue('campaign-queue') private readonly queue: Queue,
  ) {
    super();
  }

  async process(job: Job<ProcessStepJobData>): Promise<unknown> {
    if (job.name !== 'process-step') {
      return { skipped: true };
    }

    const campaignId = job.data.campaignId;
    const recipientId = job.data.recipientId;
    const requestedStepOrder = job.data.stepOrder;

    if (!campaignId || !recipientId || !requestedStepOrder) {
      throw new Error('Campaign step jobs require campaignId, recipientId and stepOrder');
    }

    const campaign = await this.prisma.campaign.findFirst({
      where: { id: campaignId },
      include: {
        sequenceSteps: {
          orderBy: { order: 'asc' },
          include: { template: true },
        },
      },
    }) as CampaignRecord | null;

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const recipient = await this.prisma.campaignRecipient.findFirst({
      where: { id: recipientId, campaignId },
      include: { contact: true },
    }) as CampaignRecipient | null;

    if (!recipient) {
      throw new Error(`Recipient ${recipientId} not found for campaign ${campaignId}`);
    }

    const currentStep = this.findStepByOrder(campaign.sequenceSteps, requestedStepOrder);

    if (!currentStep) {
      await this.completeRecipient(recipient.id);
      return { skipped: true, reason: 'Step not found' };
    }

    if (recipient.contact?.optOut) {
      await this.prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'OPTED_OUT',
          nextStepOrder: null,
          nextStepAt: null,
          lastStepOrder: currentStep.order,
          lastEventAt: new Date(),
        },
      });
      return { skipped: true, reason: 'Contact opted out' };
    }

    if (recipient.status === 'REPLIED' || recipient.status === 'BOUNCED') {
      await this.prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          nextStepOrder: null,
          nextStepAt: null,
          lastStepOrder: currentStep.order,
          lastEventAt: new Date(),
        },
      });
      return { skipped: true, reason: `Recipient already ${recipient.status.toLowerCase()}` };
    }

    if (currentStep.stepType === StepType.WAIT || currentStep.stepType === 'WAIT') {
      return this.processWaitStep(campaign, recipient, currentStep);
    }

    if (currentStep.stepType === StepType.CONDITION || currentStep.stepType === 'CONDITION') {
      return this.processConditionStep(campaign, recipient, currentStep);
    }

    return this.processEmailStep(campaign, recipient, currentStep);
  }

  private findStepByOrder(steps: CampaignSequenceStep[], order: number) {
    return steps.find((step) => step.order === order) ?? null;
  }

  private getNextStep(steps: CampaignSequenceStep[], currentOrder: number) {
    return (
      steps
        .filter((step) => step.order > currentOrder)
        .sort((left, right) => left.order - right.order)[0] ?? null
    );
  }

  private parseWaitDays(configJson: Record<string, unknown> | null | undefined) {
    const raw = configJson?.days ?? configJson?.delayDays ?? configJson?.waitDays ?? configJson?.durationDays;
    const days = Number(raw);
    return Number.isFinite(days) && days > 0 ? days : 1;
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private buildEmailContent(campaign: CampaignRecord, step: CampaignSequenceStep) {
    const template = step.template ?? null;
    const config = step.configJson ?? {};
    const fixture = fixtureMode('ENABLE_EMAIL_FIXTURES');
    const subject =
      String(config.subject ?? config.title ?? '').trim() ||
      template?.subject?.trim() ||
      String(campaign.name ?? '').trim();

    const rawHtml =
      (typeof config.html === 'string' ? config.html.trim() : '') ||
      (typeof config.body === 'string' ? config.body.trim() : '') ||
      (typeof config.bodyHtml === 'string' ? String(config.bodyHtml).trim() : '') ||
      template?.bodyHtml?.trim() ||
      template?.bodyText?.trim() ||
      '';

    const rawText =
      (typeof config.text === 'string' ? config.text.trim() : '') ||
      (typeof config.bodyText === 'string' ? String(config.bodyText).trim() : '') ||
      template?.bodyText?.trim() ||
      '';

    if (!subject && !fixture) {
      throw new Error(`EMAIL_CONTENT_MISSING: subject for campaign ${campaign.id}`);
    }
    if (!rawHtml && !rawText && !fixture) {
      throw new Error(`EMAIL_CONTENT_MISSING: body for campaign ${campaign.id}`);
    }
    const html =
      rawHtml.length > 0
        ? rawHtml
        : rawText.length > 0
          ? `<p>${this.escapeHtml(rawText).replace(/\n/g, '<br />')}</p>`
          : '<p>ORI-OS fixture email</p>';

    const text = rawText.length > 0 ? rawText : html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    return { subject, html, text };
  }

  private buildRecipientLabel(contact: CampaignContact | null | undefined) {
    const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ').trim();
    return name || contact?.name || contact?.email || 'recipient';
  }

  private async queueStep(campaignId: string, recipientId: string, stepOrder: number, delayMs = 0) {
    return this.queue.add(
      'process-step',
      { campaignId, recipientId, stepOrder },
      {
        jobId: `campaign-${campaignId}-recipient-${recipientId}-step-${stepOrder}`,
        delay: Math.max(0, delayMs),
      },
    );
  }

  private async updateRecipient(
    recipientId: string,
    data: Record<string, unknown>,
  ) {
    await this.prisma.campaignRecipient.update({
      where: { id: recipientId },
      data,
    });
  }

  private async completeRecipient(recipientId: string) {
    await this.updateRecipient(recipientId, {
      nextStepOrder: null,
      nextStepAt: null,
    });
  }

  private async processEmailStep(
    campaign: CampaignRecord,
    recipient: CampaignRecipient,
    currentStep: CampaignSequenceStep,
  ) {
    const contact = recipient.contact;

    if (!contact?.email) {
      throw new Error(`Recipient ${recipient.id} does not have an email address`);
    }

    const { subject, html, text } = this.buildEmailContent(campaign, currentStep);
    this.logger.log(
      `[CampaignQueue] Sending step ${currentStep.order} to ${this.buildRecipientLabel(contact)} for campaign ${campaign.id}`,
    );

    const sendResult = await this.emailService.sendEmail(contact.email, subject, html);

    if (!sendResult?.success) {
      throw new Error(
        `Failed to send campaign email: ${sendResult?.error ?? 'Unknown error'}`,
      );
    }

    await this.prisma.emailEvent.create({
      data: {
        campaignId: campaign.id,
        contactId: contact.id,
        mailboxId: campaign.mailboxId ?? null,
        providerMessageId: sendResult.id ?? null,
        eventType: 'SENT',
        rawPayloadJson: {
          campaignId: campaign.id,
          recipientId: recipient.id,
          stepOrder: currentStep.order,
          subject,
          text,
        },
      },
    });

    const nextStep = this.getNextStep(campaign.sequenceSteps, currentStep.order);

    if (!nextStep) {
      await this.updateRecipient(recipient.id, {
        status: 'SENT',
        lastStepOrder: currentStep.order,
        lastEventAt: new Date(),
        nextStepOrder: null,
        nextStepAt: null,
      });
      return {
        sent: true,
        currentStep: currentStep.order,
        nextStepOrder: null,
      };
    }

    const nextStepAt = new Date();
    await this.updateRecipient(recipient.id, {
      status: 'SCHEDULED',
      lastStepOrder: currentStep.order,
      lastEventAt: new Date(),
      nextStepOrder: nextStep.order,
      nextStepAt,
    });

    await this.queueStep(campaign.id, recipient.id, nextStep.order);

    return {
      sent: true,
      currentStep: currentStep.order,
      nextStepOrder: nextStep.order,
      nextStepAt,
    };
  }

  private async processWaitStep(
    campaign: CampaignRecord,
    recipient: CampaignRecipient,
    currentStep: CampaignSequenceStep,
  ) {
    const waitDays = this.parseWaitDays(currentStep.configJson);
    const nextStep = this.getNextStep(campaign.sequenceSteps, currentStep.order);

    if (!nextStep) {
      await this.updateRecipient(recipient.id, {
        status: 'SENT',
        lastStepOrder: currentStep.order,
        lastEventAt: new Date(),
        nextStepOrder: null,
        nextStepAt: null,
      });
      return {
        waited: true,
        waitDays,
        nextStepOrder: null,
      };
    }

    const nextStepAt = new Date(Date.now() + waitDays * 24 * 60 * 60 * 1000);

    await this.updateRecipient(recipient.id, {
      status: 'SCHEDULED',
      lastStepOrder: currentStep.order,
      lastEventAt: new Date(),
      nextStepOrder: nextStep.order,
      nextStepAt,
    });

    await this.queueStep(campaign.id, recipient.id, nextStep.order, waitDays * 24 * 60 * 60 * 1000);

    return {
      waited: true,
      waitDays,
      nextStepOrder: nextStep.order,
      nextStepAt,
    };
  }

  private async processConditionStep(
    campaign: CampaignRecord,
    recipient: CampaignRecipient,
    currentStep: CampaignSequenceStep,
  ) {
    this.logger.warn(
      `[CampaignQueue] CONDITION step ${currentStep.order} currently acts as pass-through for campaign ${campaign.id}`,
    );

    const nextStep = this.getNextStep(campaign.sequenceSteps, currentStep.order);

    if (!nextStep) {
      await this.updateRecipient(recipient.id, {
        status: 'SENT',
        lastStepOrder: currentStep.order,
        lastEventAt: new Date(),
        nextStepOrder: null,
        nextStepAt: null,
      });
      return { skipped: true, reason: 'No next step after condition' };
    }

    const nextStepAt = new Date();
    await this.updateRecipient(recipient.id, {
      status: 'SCHEDULED',
      lastStepOrder: currentStep.order,
      lastEventAt: new Date(),
      nextStepOrder: nextStep.order,
      nextStepAt,
    });

    await this.queueStep(campaign.id, recipient.id, nextStep.order);

    return {
      conditionPassed: true,
      nextStepOrder: nextStep.order,
      nextStepAt,
    };
  }
}
