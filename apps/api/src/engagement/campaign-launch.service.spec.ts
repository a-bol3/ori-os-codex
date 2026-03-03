import { Test, TestingModule } from '@nestjs/testing';
import { CampaignLaunchService } from './campaign-launch.service';
import { PrismaService } from '@ori-os/db/nestjs';
import { getQueueToken } from '@nestjs/bullmq';

describe('CampaignLaunchService', () => {
    let service: CampaignLaunchService;
    let prisma: any;
    const mockQueue = { add: jest.fn() };

    beforeEach(async () => {
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
                    provide: getQueueToken('email-send'),
                    useValue: mockQueue,
                },
            ],
        }).compile();

        service = module.get(CampaignLaunchService);
        prisma = module.get(PrismaService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should throw if campaign is not found', async () => {
        prisma.campaign.findUnique.mockResolvedValue(null);
        await expect(service.launch('1')).rejects.toThrow();
    });

    it('should throw if campaign is not in DRAFT/SCHEDULED status', async () => {
        prisma.campaign.findUnique.mockResolvedValue({
            id: '1',
            status: 'RUNNING',
        });
        await expect(service.launch('1')).rejects.toThrow();
    });

    it('should enqueue one job per recipient and update status to RUNNING', async () => {
        prisma.campaign.findUnique.mockResolvedValue({
            id: '1',
            status: 'DRAFT',
            subject: 'Hello',
            fromEmail: 'test@example.com',
            recipients: [
                { id: 'r1', contact: { id: 'c1', email: 'a@example.com' } },
                { id: 'r2', contact: { id: 'c2', email: 'b@example.com' } },
            ],
        });
        prisma.campaignRecipient.update.mockResolvedValue({});
        prisma.campaign.update.mockResolvedValue({});
        mockQueue.add.mockResolvedValue({ id: 'job-1' });

        const result = await service.launch('1');

        expect(mockQueue.add).toHaveBeenCalledTimes(2);
        expect(prisma.campaign.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { status: 'RUNNING' },
        });
        expect(result.enqueuedCount).toBe(2);
    });
});
