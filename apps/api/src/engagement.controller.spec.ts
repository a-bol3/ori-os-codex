import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CampaignsController, InboxController } from './engagement.controller';

describe('CampaignsController', () => {
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    createCampaign: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
    addRecipients: jest.fn(),
    processRunningCampaigns: jest.fn(),
  };

  const launchService = {
    launch: jest.fn(),
  };

  const controller = new CampaignsController(
    service as never,
    launchService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects campaign listing without organization context', async () => {
    await expect(controller.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('passes tenant context into campaign launch', async () => {
    await controller.launch({ user: { organizationId: 'org-1' } }, 'campaign-1');

    expect(launchService.launch).toHaveBeenCalledWith('org-1', 'campaign-1');
  });
});

describe('InboxController', () => {
  const prisma = {
    emailEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const email = {
    sendEmail: jest.fn(),
  };

  const controller = new InboxController(prisma as never, email as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects inbox listing without organization context', async () => {
    await expect(controller.findAll({})).rejects.toThrow(UnauthorizedException);
  });

  it('rejects replies to events outside the authenticated organization', async () => {
    prisma.emailEvent.findUnique.mockResolvedValue({
      contact: { email: 'user@example.com' },
      campaign: { organizationId: 'org-2' },
    });

    await expect(
      controller.reply(
        { user: { organizationId: 'org-1' } },
        'event-1',
        { content: 'Hello' },
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
