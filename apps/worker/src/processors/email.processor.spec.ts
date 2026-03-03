import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

jest.mock('resend');

const mockJob = (data: any) => ({
    id: 'job-1',
    name: 'email-send',
    data,
});

describe('EmailProcessor', () => {
    let processor: EmailProcessor;
    let prisma: any;
    let mockResendSend: jest.Mock;

    beforeEach(async () => {
        mockResendSend = jest.fn();
        (Resend as jest.Mock).mockImplementation(() => ({
            emails: {
                send: mockResendSend,
            },
        }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailProcessor,
                {
                    provide: PrismaService,
                    useValue: {
                        campaignRecipient: {
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        processor = module.get(EmailProcessor);
        prisma = module.get(PrismaService);

        process.env.RESEND_API_KEY = 're_test_key';
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should update recipient status to BOUNCED when send throws', async () => {
        mockResendSend.mockResolvedValue({ data: null, error: new Error('Send failed') });

        const job = mockJob({
            to: 'test@example.com',
            from: 'sender@example.com',
            subject: 'Hello',
            html: '<p>Test</p>',
            campaignId: 'camp-1',
            contactId: 'cont-1',
        }) as any;

        await expect(processor.process(job)).rejects.toThrow('Send failed');

        expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    campaignId_contactId: {
                        campaignId: 'camp-1',
                        contactId: 'cont-1',
                    },
                },
                data: { status: 'BOUNCED' },
            }),
        );
    });

    it('should update recipient status to SENT on success', async () => {
        mockResendSend.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
        prisma.campaignRecipient.update.mockResolvedValue({});

        const job = mockJob({
            to: 'test@example.com',
            from: 'sender@example.com',
            subject: 'Hello',
            html: '<p>Test</p>',
            campaignId: 'camp-1',
            contactId: 'cont-1',
        }) as any;

        const result = await processor.process(job);
        expect(result.success).toBe(true);
        expect(prisma.campaignRecipient.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    campaignId_contactId: {
                        campaignId: 'camp-1',
                        contactId: 'cont-1',
                    },
                },
                data: { status: 'SENT' },
            }),
        );
    });
});
