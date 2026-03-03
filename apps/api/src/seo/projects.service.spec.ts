import { Test, TestingModule } from '@nestjs/testing';
import { SeoProjectsService } from './seo-projects.service';
import { PrismaService } from '@ori-os/db/nestjs';

describe('SeoProjectsService', () => {
    let service: SeoProjectsService;
    let prisma: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SeoProjectsService,
                {
                    provide: PrismaService,
                    useValue: {
                        sEOProject: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get(SeoProjectsService);
        prisma = module.get(PrismaService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should only return projects for the correct organization', async () => {
        prisma.sEOProject.findMany.mockResolvedValue([]);
        await service.findAll('org-1');
        expect(prisma.sEOProject.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { organizationId: 'org-1' },
            }),
        );
    });

    it('should create a project scoped to the correct organization', async () => {
        prisma.sEOProject.create.mockResolvedValue({
            id: 'p1',
            name: 'Test Project',
            domain: 'example.com',
            organizationId: 'org-1',
        });

        const result = await service.create({
            organizationId: 'org-1',
            creatorId: 'user-1',
            name: 'Test Project',
            domain: 'example.com',
        });

        expect(prisma.sEOProject.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    organizationId: 'org-1',
                    domain: 'example.com',
                }),
            }),
        );
        expect(result.id).toBe('p1');
    });
});
