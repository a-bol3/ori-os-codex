import { Test, TestingModule } from '@nestjs/testing';
import { CampaignLaunchService } from './campaign-launch.service';
import { PrismaService } from '@ori-os/db/nestjs';
import { getQueueToken } from '@nestjs/bullmq';

describe('CampaignLaunchService', () => {
  let service: CampaignLaunchService;
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalApiBaseUrl = process.env.API_BASE_URL;
  let prisma: {
    campaign: {
      findUnique?: jest.Mock;
      findFirst?: jest.Mock;
      update: jest.Mock;
    };
    campaignRecipient: {
      update: jest.Mock;
    };
  };
  const mockQueue = { add: jest.fn() };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.API_BASE_URL = 'https://api.example.com';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignLaunchService,
        {
          provide: PrismaService,
          useValue: {
            campaign: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            campaignRecipient: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: getQueueToken('campaign-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get(CampaignLaunchService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
    process.env.API_BASE_URL = originalApiBaseUrl;
  });

  it('should throw if campaign is not found', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue(null);
    await expect(service.launch('org-1', '1')).rejects.toThrow();
  });

  it('should throw if campaign is not in DRAFT/SCHEDULED status', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      status: 'RUNNING',
    });
    await expect(service.launch('org-1', '1')).rejects.toThrow();
  });

  it('should reject a launch without pending recipients', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      name: 'Test campaign',
      status: 'DRAFT',
      fromEmail: 'test@example.com',
      sequenceSteps: [
        { order: 1, stepType: 'EMAIL', configJson: { body: 'Hello' } },
      ],
      recipients: [],
    });

    await expect(service.launch('org-1', '1')).rejects.toThrow(
      'at least one pending recipient',
    );
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('should reject a launch without a valid first email step', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      name: 'Test campaign',
      status: 'DRAFT',
      fromEmail: 'test@example.com',
      sequenceSteps: [
        { order: 2, stepType: 'EMAIL', configJson: { body: 'Hello' } },
      ],
      recipients: [{ id: 'r1' }],
    });

    await expect(service.launch('org-1', '1')).rejects.toThrow(
      'first step with order 1',
    );
    expect(mockQueue.add).not.toHaveBeenCalled();
  });

  it('should reject a launch without a configured sender', async () => {
    const previousFromEmail = process.env.FROM_EMAIL;
    delete process.env.FROM_EMAIL;
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      name: 'Test campaign',
      status: 'DRAFT',
      fromEmail: null,
      sequenceSteps: [
        { order: 1, stepType: 'EMAIL', configJson: { body: 'Hello' } },
      ],
      recipients: [{ id: 'r1' }],
    });

    await expect(service.launch('org-1', '1')).rejects.toThrow(
      'sender is not configured',
    );
    expect(mockQueue.add).not.toHaveBeenCalled();
    if (previousFromEmail === undefined) delete process.env.FROM_EMAIL;
    else process.env.FROM_EMAIL = previousFromEmail;
  });

  it('should enqueue one idempotent job per pending recipient and update status to RUNNING', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      status: 'DRAFT',
      fromEmail: 'test@example.com',
      sequenceSteps: [
        {
          order: 1,
          stepType: 'EMAIL',
          configJson: {
            subject: 'Quick Test',
            body: 'This is a quick test',
          },
          template: null,
        },
      ],
      recipients: [
        {
          id: 'r1',
          contact: { id: 'c1', email: 'a@example.com', optOut: false },
        },
        {
          id: 'r2',
          contact: { id: 'c2', email: 'b@example.com', optOut: false },
        },
      ],
    });
    prisma.campaignRecipient.update.mockResolvedValue({});
    prisma.campaign.update.mockResolvedValue({});
    mockQueue.add.mockResolvedValue({ id: 'job-1' });

    const result = await service.launch('org-1', '1');

    expect(mockQueue.add).toHaveBeenCalledTimes(2);
    const [jobName, firstJobData, firstJobOptions] = mockQueue.add.mock
      .calls[0] as [string, Record<string, unknown>, Record<string, unknown>];
    expect(jobName).toBe('process-step');
    expect(firstJobData).toEqual({
      campaignId: '1',
      recipientId: 'r1',
      stepOrder: 1,
    });
    expect(firstJobOptions).toEqual({
      jobId: 'campaign-1-recipient-r1-step-1',
    });
    expect(prisma.campaign.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { status: 'RUNNING' },
    });
    expect(result.enqueuedCount).toBe(2);
  });

  it('should enqueue only recipients returned by the pending-recipient query', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      status: 'DRAFT',
      fromEmail: 'test@example.com',
      sequenceSteps: [
        {
          order: 1,
          stepType: 'EMAIL',
          configJson: {
            subject: 'Quick Test',
            body: 'This is a quick test',
          },
          template: null,
        },
      ],
      recipients: [{ id: 'r2' }],
    });
    prisma.campaignRecipient.update.mockResolvedValue({});
    prisma.campaign.update.mockResolvedValue({});
    mockQueue.add.mockResolvedValue({ id: 'job-1' });

    const result = await service.launch('org-1', '1');

    expect(mockQueue.add).toHaveBeenCalledTimes(1);
    expect(prisma.campaignRecipient.update).toHaveBeenCalledWith({
      where: { id: 'r2' },
      data: {
        status: 'SCHEDULED',
        nextStepOrder: 1,
        nextStepAt: expect.any(Date),
      },
    });
    expect(result.enqueuedCount).toBe(1);
  });

  it('should use a deterministic job id for every recipient step', async () => {
    prisma.campaign.findFirst = jest.fn().mockResolvedValue({
      id: '1',
      status: 'DRAFT',
      fromEmail: 'test@example.com',
      sequenceSteps: [
        {
          order: 1,
          stepType: 'EMAIL',
          configJson: {
            subject: 'Fallback subject',
            body: 'Fallback body',
          },
          template: {
            subject: 'Template subject',
            bodyHtml: '<p>Template body</p>',
          },
        },
      ],
      recipients: [
        {
          id: 'r1',
          contact: { id: 'c1', email: 'a@example.com', optOut: false },
        },
      ],
    });
    prisma.campaignRecipient.update.mockResolvedValue({});
    prisma.campaign.update.mockResolvedValue({});
    mockQueue.add.mockResolvedValue({ id: 'job-1' });

    await service.launch('org-1', '1');

    const [, firstJobData, firstJobOptions] = mockQueue.add.mock
      .calls[0] as [string, Record<string, unknown>, Record<string, unknown>];
    expect(firstJobData).toEqual({
      campaignId: '1',
      recipientId: 'r1',
      stepOrder: 1,
    });
    expect(firstJobOptions).toEqual({
      jobId: 'campaign-1-recipient-r1-step-1',
    });
  });
});
