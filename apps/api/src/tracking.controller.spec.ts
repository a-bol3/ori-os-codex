import { TrackingController } from './tracking.controller';

describe('TrackingController', () => {
  const originalEnv = process.env;
  const secret = 'test-open-secret';

  const prisma = {
    contact: {
      findFirst: jest.fn(),
    },
    emailEvent: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    campaignRecipient: {
      updateMany: jest.fn(),
    },
  };

  const controller = new TrackingController(prisma as never);

  function createResponseStub() {
    const headers: Record<string, unknown> = {};
    const response = {
      headers,
      statusCode: 0,
      setHeader: jest.fn((name: string, value: unknown) => {
        headers[name] = value;
        return response;
      }),
      status: jest.fn((code: number) => {
        response.statusCode = code;
        return response;
      }),
      end: jest.fn((body?: unknown) => body),
    };

    return response;
  }

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      OPEN_TRACKING_TOKEN_SECRET: secret,
    };

    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('records a campaign open and returns the tracking pixel', async () => {
    prisma.contact.findFirst.mockResolvedValue({ id: 'contact-1' });
    prisma.emailEvent.findFirst.mockResolvedValue(null);

    await (controller as never as {
      recordOpen(payload: {
        contactId: string;
        organizationId: string;
        campaignId?: string;
      }): Promise<void>;
    }).recordOpen({
      contactId: 'contact-1',
      organizationId: 'org-1',
      campaignId: 'campaign-1',
    });

    expect(prisma.contact.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'contact-1',
        organizationId: 'org-1',
      },
      select: { id: true },
    });
    expect(prisma.emailEvent.create).toHaveBeenCalledWith({
      data: {
        campaignId: 'campaign-1',
        contactId: 'contact-1',
        eventType: 'OPENED',
        rawPayloadJson: {
          source: 'tracking-pixel',
        },
      },
    });
    expect(prisma.campaignRecipient.updateMany).toHaveBeenCalledWith({
      where: {
        campaignId: 'campaign-1',
        contactId: 'contact-1',
      },
      data: {
        lastEventAt: expect.any(Date),
      },
    });
  });

  it('fails closed and still returns the pixel for invalid tokens', async () => {
    const res = createResponseStub();

    await controller.openPixel('invalid-token', res as never);

    expect(prisma.contact.findFirst).not.toHaveBeenCalled();
    expect(prisma.emailEvent.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'image/gif',
    );
  });
});
