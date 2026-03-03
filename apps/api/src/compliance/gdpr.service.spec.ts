import { Test, TestingModule } from '@nestjs/testing';
import { GdprService } from './gdpr.service';
import { PrismaService } from '@ori-os/db/nestjs';

describe('GdprService', () => {
    let service: GdprService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GdprService,
                {
                    provide: PrismaService,
                    useValue: {
                        gDPRRequest: {
                            create: jest.fn(),
                            update: jest.fn(),
                            findMany: jest.fn(),
                        },
                        contact: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get(GdprService);
        prisma = module.get(PrismaService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should create a GDPR export request record', async () => {
        prisma.contact.findUnique.mockResolvedValue({
            id: 'c1',
            email: 'test@example.com',
            organizationId: 'org-1',
        });
        prisma.gDPRRequest.create.mockResolvedValue({
            id: 'req-1',
            type: 'EXPORT',
            contactId: 'c1',
            status: 'PENDING',
        });

        const result = await service.createExportRequest('c1', 'org-1', 'user-1');
        expect(prisma.gDPRRequest.create).toHaveBeenCalled();
        expect(result.type).toBe('EXPORT');
    });

    it('should anonymize contact personal data on delete request', async () => {
        prisma.contact.findUnique.mockResolvedValue({
            id: 'c1',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            organizationId: 'org-1',
        });
        prisma.contact.update.mockResolvedValue({});
        prisma.gDPRRequest.create.mockResolvedValue({ id: 'req-1' });

        await service.createDeleteRequest('c1', 'org-1', 'user-1');

        expect(prisma.contact.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'c1' },
                data: expect.objectContaining({
                    email: expect.stringContaining('deleted'),
                    firstName: 'DELETED',
                    lastName: 'DELETED',
                }),
            }),
        );
    });
});
