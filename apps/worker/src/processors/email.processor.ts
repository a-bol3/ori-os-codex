import { InjectQueue, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job, Queue } from "bullmq";
import { PrismaService } from "@ori-os/db/nestjs";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { createHmac } from "crypto";
import { createOpenTrackingToken, fixtureMode } from "@ori-os/core";

type EmailJobData = {
  to?: string;
  from?: string;
  subject?: string;
  html?: string;
  campaignId?: string;
  contactId?: string;
  recipientId?: string;
  stepId?: string;
  unsubscribeUrl?: string;
};

type CampaignRecipientRecord = {
  id: string;
  status: string;
  contact: {
    id: string;
    email: string;
    optOut: boolean;
  } | null;
};

type CampaignMailboxRecord = {
  id: string;
  organizationId: string;
  mailboxId: string | null;
  fromEmail: string | null;
  fromName: string | null;
  mailbox: {
    id: string;
    email: string;
    provider: string;
    isActive: boolean;
  } | null;
};

type SequenceStepRecord = {
  id: string;
  campaignId: string;
  order: number;
  stepType: string;
  configJson: Record<string, unknown> | null;
  template: {
    subject: string | null;
    bodyHtml: string | null;
    bodyText: string | null;
  } | null;
};

type CampaignStepProgressRecord = {
  id: string;
  order: number;
  stepType: string;
};

type CampaignWithStepsRecord = CampaignMailboxRecord & {
  sequenceSteps: CampaignStepProgressRecord[];
};

type CampaignRecipientModel = {
  findUnique: (args: unknown) => Promise<CampaignRecipientRecord | null>;
  update: (args: unknown) => Promise<unknown>;
};

type EmailEventModel = {
  create: (args: unknown) => Promise<unknown>;
};

type CampaignModel = {
  findFirst: (args: unknown) => Promise<CampaignMailboxRecord | null>;
};

type SequenceStepModel = {
  findUnique: (args: unknown) => Promise<SequenceStepRecord | null>;
};

@Processor("email-send")
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue("campaign-queue") private readonly campaignQueue: Queue,
  ) {
    super();
  }

  private get campaignRecipientModel(): CampaignRecipientModel {
    return (
      this.prisma as unknown as { campaignRecipient: CampaignRecipientModel }
    ).campaignRecipient;
  }

  private get emailEventModel(): EmailEventModel {
    return (this.prisma as unknown as { emailEvent: EmailEventModel })
      .emailEvent;
  }

  private get campaignModel(): CampaignModel {
    return (this.prisma as unknown as { campaign: CampaignModel }).campaign;
  }

  private get sequenceStepModel(): SequenceStepModel {
    return (this.prisma as unknown as { sequenceStep: SequenceStepModel })
      .sequenceStep;
  }

  async process(job: Job<EmailJobData, unknown, string>): Promise<unknown> {
    const data = await this.resolveJobData(job.data);
    const { to, from, subject, html, campaignId, contactId, stepId } = data;

    this.logger.log(
      `Processing job ${job.id} type=${job.name} to=${to} campaign=${campaignId ?? "direct"}`,
    );

    const recipient =
      campaignId && contactId
        ? await this.getCampaignRecipient(campaignId, contactId)
        : null;

    const campaign =
      campaignId != null ? await this.getCampaignMailbox(campaignId) : null;
    const mailbox = campaign?.mailbox ?? null;

    if (recipient?.contact?.optOut) {
      this.logger.warn(
        `Skipping send for opted-out contact ${contactId} in campaign ${campaignId}`,
      );
      await this.updateRecipientStatus(campaignId, contactId, {
        status: "OPTED_OUT",
      });
      return { success: true, skipped: true, reason: "OPTED_OUT" };
    }

    try {
      const response = await this.sendEmail({
        to,
        from,
        subject,
        html,
        mailbox,
      });

      this.logger.log(
        `Email sent via ${response.provider}: ${response.messageId ?? "unknown-message-id"}`,
      );

      if (campaignId && contactId) {
        await this.emailEventModel.create({
          data: {
            campaignId,
            contactId,
            mailboxId: mailbox?.id ?? null,
            providerMessageId: response.messageId ?? null,
            eventType: "SENT",
            rawPayloadJson: {
              provider: response.provider,
              unsubscribeUrl: data.unsubscribeUrl ?? null,
            },
          },
        });

        if (stepId) {
          await this.advanceCampaignProgression({
            campaignId,
            contactId,
            recipientId: recipient?.id ?? null,
            stepId,
          });
        } else {
          await this.updateRecipientStatus(campaignId, contactId, {
            status: "SENT",
          });
        }
      }

      return { success: true, messageId: response.messageId };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(`Failed to send email to ${to}: ${message}`);

      if (campaignId && contactId) {
        try {
          await this.updateRecipientStatus(campaignId, contactId, {
            status: "BOUNCED",
          });
          await this.emailEventModel.create({
            data: {
              campaignId,
              contactId,
              mailboxId: mailbox?.id ?? null,
              eventType: "BOUNCED",
              rawPayloadJson: {
                provider: mailbox?.provider ?? "RESEND",
                error: message,
              },
            },
          });
        } catch (dbError) {
          this.logger.error(
            `Failed to update recipient status in DB: ${
              dbError instanceof Error ? dbError.message : "Unknown DB error"
            }`,
          );
        }
      }

      throw error;
    }
  }

  private async sendEmail({
    to,
    from,
    subject,
    html,
    mailbox,
  }: {
    to: string;
    from: string;
    subject: string;
    html: string;
    mailbox: CampaignMailboxRecord["mailbox"] | null;
  }): Promise<{ messageId: string | null; provider: string }> {
    const provider = mailbox?.provider?.toUpperCase() ?? "RESEND";

    if (provider === "SMTP") {
      return this.sendViaSmtp({ to, from, subject, html, mailbox });
    }

    return this.sendViaResend({ to, from, subject, html });
  }

  private async sendViaResend({
    to,
    from,
    subject,
    html,
  }: {
    to: string;
    from: string;
    subject: string;
    html: string;
  }): Promise<{ messageId: string | null; provider: string }> {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not defined");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      throw error;
    }

    return {
      messageId: data?.id ?? null,
      provider: "RESEND",
    };
  }

  private async sendViaSmtp({
    to,
    from,
    subject,
    html,
    mailbox,
  }: {
    to: string;
    from: string;
    subject: string;
    html: string;
    mailbox: CampaignMailboxRecord["mailbox"] | null;
  }): Promise<{ messageId: string | null; provider: string }> {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const secure =
      (process.env.SMTP_SECURE ?? "").toLowerCase() === "true" || port === 465;

    if (!host || !user || !pass) {
      throw new Error(
        `SMTP mailbox ${mailbox?.email ?? from} is selected, but SMTP_HOST, SMTP_USER or SMTP_PASSWORD is missing.`,
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    return {
      messageId: info.messageId ?? null,
      provider: "SMTP",
    };
  }

  private validateJobData(
    data: EmailJobData,
  ): Required<Pick<EmailJobData, "to" | "from" | "subject" | "html">> &
    EmailJobData {
    if (!data.to || !data.from || !data.subject || !data.html) {
      throw new Error("Email job is missing required fields");
    }

    return {
      ...data,
      to: data.to,
      from: data.from,
      subject: data.subject,
      html: data.html,
    };
  }

  private async resolveJobData(data: EmailJobData) {
    if (data.to && data.from && data.subject && data.html) {
      return this.validateJobData(data);
    }

    if (!data.campaignId || !data.stepId) {
      throw new Error("Email job is missing required fields");
    }

    const campaign = await this.getCampaignMailbox(data.campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${data.campaignId} not found`);
    }

    const step = await this.sequenceStepModel.findUnique({
      where: { id: data.stepId },
      include: {
        template: {
          select: {
            subject: true,
            bodyHtml: true,
            bodyText: true,
          },
        },
      },
    });

    if (!step || step.stepType !== "EMAIL") {
      throw new Error(`Email step ${data.stepId} not found`);
    }

    const recipient =
      data.contactId != null
        ? await this.getCampaignRecipient(data.campaignId, data.contactId)
        : data.recipientId != null
          ? await this.campaignRecipientModel.findUnique({
              where: { id: data.recipientId },
              include: {
                contact: {
                  select: {
                    id: true,
                    email: true,
                    optOut: true,
                  },
                },
              },
            })
          : null;

    if (!recipient?.contact?.email) {
      throw new Error("Campaign recipient email not found");
    }

    const fixture = fixtureMode("ENABLE_EMAIL_FIXTURES");
    const subject =
      this.getString(step.template?.subject) ??
      this.getString(step.configJson?.subject) ??
      this.getString(step.configJson?.title) ??
      this.getString((campaign as { name?: unknown } | null)?.name);

    const rawBody =
      this.getString(step.template?.bodyHtml) ??
      this.getString(step.template?.bodyText) ??
      this.getString(step.configJson?.html) ??
      this.getString(step.configJson?.bodyHtml) ??
      this.getString(step.configJson?.body) ??
      this.getString(step.configJson?.text) ??
      (fixture ? "<p>ORI-OS fixture email</p>" : undefined);
    if (!subject || !rawBody) {
      throw new Error(`EMAIL_CONTENT_MISSING: campaign ${campaign.id} requires subject and body`);
    }

    const fromEmail =
      campaign.fromEmail || process.env.FROM_EMAIL || (fixture ? "onboarding@resend.dev" : undefined);
    if (!fromEmail) {
      throw new Error("EMAIL_SENDER_NOT_CONFIGURED: set a verified FROM_EMAIL");
    }
    const fromName = campaign.fromName || "ORI-OS";

    const unsubscribeUrl = this.buildUnsubscribeUrl(
      recipient.contact.id,
      campaign.organizationId,
      campaign.id,
    );
    const openTrackingPixelUrl = this.buildOpenTrackingPixelUrl(
      recipient.contact.id,
      campaign.organizationId,
      campaign.id,
    );

    return this.validateJobData({
      ...data,
      campaignId: campaign.id,
      contactId: recipient.contact.id,
      to: recipient.contact.email,
      from: `${fromName} <${fromEmail}>`,
      subject,
      html: this.appendOpenTrackingAndUnsubscribe(
        this.normalizeEmailHtml(rawBody),
        openTrackingPixelUrl,
        unsubscribeUrl,
      ),
      unsubscribeUrl,
    });
  }

  private async getCampaignRecipient(
    campaignId: string,
    contactId: string,
  ): Promise<CampaignRecipientRecord | null> {
    return this.campaignRecipientModel.findUnique({
      where: {
        campaignId_contactId: {
          campaignId,
          contactId,
        },
      },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            optOut: true,
          },
        },
      },
    });
  }

  private async getCampaignMailbox(
    campaignId: string,
  ): Promise<CampaignMailboxRecord | null> {
    return this.campaignModel.findFirst({
      where: { id: campaignId },
      select: {
        id: true,
        mailboxId: true,
        fromEmail: true,
        fromName: true,
        mailbox: {
          select: {
            id: true,
            email: true,
            provider: true,
            isActive: true,
          },
        },
      },
    });
  }

  private async updateRecipientStatus(
    campaignId: string,
    contactId: string,
    data: Record<string, unknown>,
  ) {
    await this.campaignRecipientModel.update({
      where: {
        campaignId_contactId: {
          campaignId,
          contactId,
        },
      },
      data,
    });
  }

  private async advanceCampaignProgression({
    campaignId,
    contactId,
    recipientId,
    stepId,
  }: {
    campaignId: string;
    contactId: string;
    recipientId: string | null;
    stepId: string;
  }) {
    const campaign = (await this.campaignModel.findFirst({
      where: { id: campaignId },
      select: {
        id: true,
        organizationId: true,
        mailboxId: true,
        fromEmail: true,
        fromName: true,
        mailbox: {
          select: {
            id: true,
            email: true,
            provider: true,
            isActive: true,
          },
        },
        sequenceSteps: {
          select: {
            id: true,
            order: true,
            stepType: true,
          },
          orderBy: { order: "asc" },
        },
      },
    })) as CampaignWithStepsRecord | null;

    if (!campaign?.sequenceSteps?.length) {
      this.logger.warn(
        `Campaign ${campaignId} has no sequenced steps when advancing recipient ${contactId}`,
      );
      await this.updateRecipientStatus(campaignId, contactId, {
        status: "SENT",
        lastStepOrder: null,
        lastEventAt: new Date(),
        nextStepOrder: null,
        nextStepAt: null,
      });
      return;
    }

    const currentStep = campaign.sequenceSteps.find((step) => step.id === stepId);
    if (!currentStep) {
      this.logger.warn(
        `Step ${stepId} not found in campaign ${campaignId}; marking recipient ${contactId} as sent`,
      );
      await this.updateRecipientStatus(campaignId, contactId, {
        status: "SENT",
        lastStepOrder: null,
        lastEventAt: new Date(),
        nextStepOrder: null,
        nextStepAt: null,
      });
      return;
    }

    const nextStep = campaign.sequenceSteps.find(
      (step) => step.order === currentStep.order + 1,
    );
    const now = new Date();

    if (nextStep) {
      if (!recipientId) {
        this.logger.warn(
          `Unable to queue follow-up step ${nextStep.order} for recipient ${contactId}: missing recipient id`,
        );
        await this.updateRecipientStatus(campaignId, contactId, {
          status: "SCHEDULED",
          lastStepOrder: currentStep.order,
          lastEventAt: now,
          nextStepOrder: nextStep.order,
          nextStepAt: now,
        });
        return;
      }

      await this.updateRecipientStatus(campaignId, contactId, {
        status: "SCHEDULED",
        lastStepOrder: currentStep.order,
        lastEventAt: now,
        nextStepOrder: nextStep.order,
        nextStepAt: now,
      });

      try {
        await this.campaignQueue.add(
          "process-step",
          {
            campaignId,
            recipientId,
            stepOrder: nextStep.order,
          },
          {
            jobId: this.buildCampaignStepJobId(
              campaignId,
              recipientId,
              nextStep.order,
            ),
            delay: 0,
          },
        );
      } catch (queueError) {
        this.logger.error(
          `Failed to queue follow-up step ${nextStep.order} for recipient ${contactId}: ${this.getErrorMessage(queueError)}`,
        );
      }
      return;
    }

    await this.updateRecipientStatus(campaignId, contactId, {
      status: "SENT",
      lastStepOrder: currentStep.order,
      lastEventAt: now,
      nextStepOrder: null,
      nextStepAt: null,
    });
  }

  private buildCampaignStepJobId(
    campaignId: string,
    recipientId: string,
    stepOrder: number,
  ) {
    return `campaign-${campaignId}-recipient-${recipientId}-step-${stepOrder}`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error";
    }
  }

  private getString(value: unknown) {
    return typeof value === "string" && value.trim() ? value : null;
  }

  private normalizeEmailHtml(value: string) {
    if (/<[a-z][\s\S]*>/i.test(value)) {
      return value;
    }

    const escaped = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r?\n/g, "<br />");

    return `<p>${escaped}</p>`;
  }

  private appendOpenTrackingAndUnsubscribe(
    html: string,
    openTrackingPixelUrl: string,
    unsubscribeUrl: string,
  ) {
    const trackingPixel = `<img src="${openTrackingPixelUrl}" alt="" width="1" height="1" style="display:none!important;width:1px;height:1px;opacity:0;overflow:hidden;border:0;margin:0;padding:0;" />`;
    const footer = `<hr />
<p style="font-size:12px;color:#666;">
  If you no longer want to receive these emails, you can
  <a href="${unsubscribeUrl}">unsubscribe here</a>.
</p>`;

    const withTracking = html.includes("</body>")
      ? html.replace("</body>", `${trackingPixel}</body>`)
      : `${html}${trackingPixel}`;

    return `${withTracking}
${footer}`;
  }

  private buildUnsubscribeUrl(
    contactId: string,
    organizationId: string,
    campaignId: string,
  ) {
    const secret =
      process.env.UNSUBSCRIBE_TOKEN_SECRET ?? process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("Unsubscribe token secret is not configured");
    }

    const baseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";

    const encodedPayload = Buffer.from(
      JSON.stringify({
        contactId,
        organizationId,
        campaignId,
      }),
      "utf8",
    ).toString("base64url");
    const signature = createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");
    const token = `${encodedPayload}.${signature}`;

    return `${baseUrl.replace(/\/$/, "")}/unsubscribe/${encodeURIComponent(
      token,
    )}`;
  }

  private buildOpenTrackingPixelUrl(
    contactId: string,
    organizationId: string,
    campaignId: string,
  ) {
    const secret =
      process.env.OPEN_TRACKING_TOKEN_SECRET ??
      process.env.UNSUBSCRIBE_TOKEN_SECRET ??
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("Open tracking token secret is not configured");
    }

    const baseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3001";

    const token = createOpenTrackingToken(
      {
        contactId,
        organizationId,
        campaignId,
      },
      secret,
    );

    return `${baseUrl.replace(/\/$/, "")}/tracking/open/${encodeURIComponent(
      token,
    )}.gif`;
  }
}
