import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Resend, WebhookEventPayload } from 'resend';

type ResendEmailPayload = Extract<
  WebhookEventPayload,
  { type: 'email.delivered' | 'email.bounced' }
>;

type EmailEventRecord = {
  id: string;
  campaignId: string | null;
  contactId: string | null;
  mailboxId: string | null;
  providerMessageId: string | null;
  eventType: string;
};

type EmailEventModel = {
  findFirst: (args: unknown) => Promise<EmailEventRecord | null>;
  findUnique: (args: unknown) => Promise<EmailEventRecord | null>;
  create: (args: unknown) => Promise<EmailEventRecord>;
};

type CampaignRecipientModel = {
  updateMany: (args: unknown) => Promise<{ count: number }>;
};

@Injectable()
export class ResendWebhookService {
  private readonly logger = new Logger(ResendWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(
    rawPayload: Buffer,
    headers: { id?: string; timestamp?: string; signature?: string },
  ) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new ServiceUnavailableException(
        'RESEND_WEBHOOK_SECRET is not configured; Resend webhooks are unavailable.',
      );
    }

    if (!headers.id || !headers.timestamp || !headers.signature) {
      throw new BadRequestException('Missing Resend webhook signature headers');
    }

    let payload: WebhookEventPayload;
    try {
      payload = new Resend(
        process.env.RESEND_API_KEY ?? 're_webhook_verification_only',
      ).webhooks.verify({
        payload: rawPayload.toString('utf8'),
        headers: {
          id: headers.id,
          timestamp: headers.timestamp,
          signature: headers.signature,
        },
        webhookSecret,
      });
    } catch {
      throw new BadRequestException('Invalid Resend webhook signature');
    }

    if (
      payload.type !== 'email.delivered' &&
      payload.type !== 'email.bounced'
    ) {
      return {
        accepted: true,
        handled: false,
        eventType: payload.type,
        webhookId: headers.id,
      };
    }

    return this.persistEmailEvent(
      payload,
      headers.id,
      rawPayload.toString('utf8'),
    );
  }

  private async persistEmailEvent(
    payload: ResendEmailPayload,
    webhookId: string,
    rawPayload: string,
  ) {
    const providerMessageId = payload.data.email_id;
    const eventType =
      payload.type === 'email.delivered' ? 'DELIVERED' : 'BOUNCED';
    const dedupeKey = `resend-webhook:${webhookId}`;
    const emailEventModel = this.emailEventModel;

    const sentEvent = await emailEventModel.findFirst({
      where: {
        providerMessageId,
        eventType: 'SENT',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        campaignId: true,
        contactId: true,
        mailboxId: true,
      },
    });

    let event: EmailEventRecord | null = null;
    let duplicate = false;

    try {
      event = await emailEventModel.create({
        data: {
          campaignId: sentEvent?.campaignId ?? null,
          contactId: sentEvent?.contactId ?? null,
          mailboxId: sentEvent?.mailboxId ?? null,
          providerMessageId,
          dedupeKey,
          eventType,
          rawPayloadJson: JSON.parse(rawPayload),
        },
      });
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      duplicate = true;
      event = await emailEventModel.findUnique({
        where: { dedupeKey },
      });
    }

    const campaignId = event?.campaignId ?? sentEvent?.campaignId ?? null;
    const contactId = event?.contactId ?? sentEvent?.contactId ?? null;

    if (campaignId && contactId) {
      await this.updateRecipient(campaignId, contactId, eventType);
    } else {
      this.logger.warn(
        `Received ${payload.type} for provider message ${providerMessageId} without a matching campaign SENT event`,
      );
    }

    return {
      accepted: true,
      handled: true,
      duplicate,
      eventType,
      providerMessageId,
      matchedCampaign: Boolean(campaignId && contactId),
      webhookId,
    };
  }

  private async updateRecipient(
    campaignId: string,
    contactId: string,
    eventType: 'DELIVERED' | 'BOUNCED',
  ) {
    const data =
      eventType === 'BOUNCED'
        ? {
            status: 'BOUNCED',
            nextStepOrder: null,
            nextStepAt: null,
            lastEventAt: new Date(),
          }
        : { lastEventAt: new Date() };

    await this.campaignRecipientModel.updateMany({
      where: { campaignId, contactId },
      data,
    });
  }

  private get emailEventModel() {
    return (this.prisma as unknown as { emailEvent: EmailEventModel })
      .emailEvent;
  }

  private get campaignRecipientModel() {
    return (
      this.prisma as unknown as {
        campaignRecipient: CampaignRecipientModel;
      }
    ).campaignRecipient;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'P2002'
    );
  }
}
