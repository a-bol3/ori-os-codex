import { Test, TestingModule } from "@nestjs/testing";
import { getQueueToken } from "@nestjs/bullmq";
import { EmailProcessor } from "./email.processor";
import { PrismaService } from "@ori-os/db/nestjs";
import { Resend } from "resend";

jest.mock("resend");

const mockJob = (data: Record<string, unknown>) => ({
  id: "job-1",
  name: "email-send",
  data,
});

describe("EmailProcessor", () => {
  let processor: EmailProcessor;
  let prisma: {
    campaignRecipient: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    campaign: {
      findFirst: jest.Mock;
    };
    emailEvent: {
      create: jest.Mock;
    };
  };
  let campaignQueue: { add: jest.Mock };
  let mockResendSend: jest.Mock;

  beforeEach(async () => {
    mockResendSend = jest.fn();
    (Resend as jest.Mock).mockImplementation(() => ({
      emails: {
        send: mockResendSend,
      },
    }));
    campaignQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailProcessor,
        {
          provide: PrismaService,
          useValue: {
            campaignRecipient: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            campaign: {
              findFirst: jest.fn().mockResolvedValue(null),
            },
            emailEvent: {
              create: jest.fn(),
            },
          },
        },
        { provide: getQueueToken("campaign-queue"), useValue: campaignQueue },
      ],
    }).compile();

    processor = module.get(EmailProcessor);
    prisma = module.get(PrismaService);

    process.env.RESEND_API_KEY = "re_test_key";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("rejects jobs missing required fields", async () => {
    const job = mockJob({
      to: "test@example.com",
      subject: "Hello",
    }) as never;

    await expect(processor.process(job)).rejects.toThrow(
      "Email job is missing required fields",
    );
  });

  it("skips opted-out campaign recipients before sending", async () => {
    prisma.campaignRecipient.findUnique.mockResolvedValue({
      id: "recipient-1",
      status: "SCHEDULED",
      contact: {
        id: "cont-1",
        email: "test@example.com",
        optOut: true,
      },
    });

    const result = await processor.process(
      mockJob({
        to: "test@example.com",
        from: "sender@example.com",
        subject: "Hello",
        html: "<p>Test</p>",
        campaignId: "camp-1",
        contactId: "cont-1",
      }) as never,
    );

    expect(result).toMatchObject({
      success: true,
      skipped: true,
      reason: "OPTED_OUT",
    });
    expect(mockResendSend).not.toHaveBeenCalled();
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith({
      where: {
        campaignId_contactId: {
          campaignId: "camp-1",
          contactId: "cont-1",
        },
      },
      data: { status: "OPTED_OUT" },
    });
  });

  it("updates recipient status to BOUNCED when send throws", async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: new Error("Send failed"),
    });
    prisma.campaignRecipient.findUnique.mockResolvedValue({
      id: "recipient-1",
      status: "SCHEDULED",
      contact: {
        id: "cont-1",
        email: "test@example.com",
        optOut: false,
      },
    });

    const job = mockJob({
      to: "test@example.com",
      from: "sender@example.com",
      subject: "Hello",
      html: "<p>Test</p>",
      campaignId: "camp-1",
      contactId: "cont-1",
    }) as never;

    await expect(processor.process(job)).rejects.toThrow("Send failed");

    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          campaignId_contactId: {
            campaignId: "camp-1",
            contactId: "cont-1",
          },
        },
        data: { status: "BOUNCED" },
      }),
    );
    expect(prisma.emailEvent.create).toHaveBeenCalledWith({
      data: {
        campaignId: "camp-1",
        contactId: "cont-1",
        eventType: "BOUNCED",
        mailboxId: null,
        rawPayloadJson: {
          provider: "RESEND",
          error: "Send failed",
        },
      },
    });
  });

  it("updates recipient status to SENT and records an event on success", async () => {
    mockResendSend.mockResolvedValue({ data: { id: "msg-1" }, error: null });
    prisma.campaignRecipient.findUnique.mockResolvedValue({
      id: "recipient-1",
      status: "SCHEDULED",
      contact: {
        id: "cont-1",
        email: "test@example.com",
        optOut: false,
      },
    });
    prisma.campaignRecipient.update.mockResolvedValue({});

    const result = await processor.process(
      mockJob({
        to: "test@example.com",
        from: "sender@example.com",
        subject: "Hello",
        html: "<p>Test</p>",
        campaignId: "camp-1",
        contactId: "cont-1",
        unsubscribeUrl: "https://api.example.com/unsubscribe/token",
      }) as never,
    );

    expect(result).toMatchObject({ success: true, messageId: "msg-1" });
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          campaignId_contactId: {
            campaignId: "camp-1",
            contactId: "cont-1",
          },
        },
        data: { status: "SENT" },
      }),
    );
    expect(prisma.emailEvent.create).toHaveBeenCalledWith({
      data: {
        campaignId: "camp-1",
        contactId: "cont-1",
        mailboxId: null,
        providerMessageId: "msg-1",
        eventType: "SENT",
        rawPayloadJson: {
          provider: "RESEND",
          unsubscribeUrl: "https://api.example.com/unsubscribe/token",
        },
      },
    });
    expect(campaignQueue.add).not.toHaveBeenCalled();
  });

  it("updates recipient progression and queues the next step on campaign email success", async () => {
    mockResendSend.mockResolvedValue({ data: { id: "msg-3" }, error: null });
    prisma.campaignRecipient.findUnique.mockResolvedValue({
      id: "recipient-1",
      status: "SCHEDULED",
      contact: {
        id: "cont-1",
        email: "test@example.com",
        optOut: false,
      },
    });
    prisma.campaign.findFirst.mockResolvedValue({
      id: "camp-1",
      organizationId: "org-1",
      mailboxId: null,
      fromEmail: "business@ori-craftlabs.com",
      fromName: "ORI-OS",
      mailbox: null,
      sequenceSteps: [
        { id: "step-1", order: 1, stepType: "EMAIL" },
        { id: "step-2", order: 2, stepType: "WAIT" },
        { id: "step-3", order: 3, stepType: "EMAIL" },
      ],
    });
    prisma.campaignRecipient.update.mockResolvedValue({});

    const result = await processor.process(
      mockJob({
        to: "test@example.com",
        from: "sender@example.com",
        subject: "Hello",
        html: "<p>Test</p>",
        campaignId: "camp-1",
        contactId: "cont-1",
        stepId: "step-1",
        unsubscribeUrl: "https://api.example.com/unsubscribe/token",
      }) as never,
    );

    expect(result).toMatchObject({ success: true, messageId: "msg-3" });
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          campaignId_contactId: {
            campaignId: "camp-1",
            contactId: "cont-1",
          },
        },
        data: expect.objectContaining({
          status: "SCHEDULED",
          lastStepOrder: 1,
          nextStepOrder: 2,
        }),
      }),
    );
    expect(campaignQueue.add).toHaveBeenCalledWith(
      "process-step",
      {
        campaignId: "camp-1",
        recipientId: "recipient-1",
        stepOrder: 2,
      },
      expect.objectContaining({
        jobId: "campaign-camp-1-recipient-cont-1-step-2",
        delay: 0,
      }),
    );
  });

  it("allows direct emails without campaign metadata", async () => {
    mockResendSend.mockResolvedValue({ data: { id: "msg-2" }, error: null });

    const result = await processor.process(
      mockJob({
        to: "direct@example.com",
        from: "sender@example.com",
        subject: "Hello",
        html: "<p>Direct</p>",
      }) as never,
    );

    expect(result).toMatchObject({ success: true, messageId: "msg-2" });
    expect(prisma.campaignRecipient.findUnique).not.toHaveBeenCalled();
    expect(prisma.emailEvent.create).not.toHaveBeenCalled();
  });
});
