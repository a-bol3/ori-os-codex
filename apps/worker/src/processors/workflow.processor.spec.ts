import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowProcessor } from './workflow.processor';
import { PrismaService } from '@ori-os/db/nestjs';
import { getQueueToken } from '@nestjs/bullmq';

const mockJob = (data: any) => ({
    id: 'job-1',
    name: 'workflow-run',
    data,
});

describe('WorkflowProcessor', () => {
    let processor: WorkflowProcessor;
    let prisma: any;
    const mockEmailQueue = { add: jest.fn() };
    const mockWorkflowQueue = { add: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WorkflowProcessor,
                {
                    provide: PrismaService,
                    useValue: {
                        workflow: {
                            findUnique: jest.fn(),
                        },
                        workflowRun: {
                            create: jest.fn(),
                            update: jest.fn(),
                            findUnique: jest.fn(),
                        },
                        workflowRunStep: {
                            create: jest.fn(),
                        },
                        task: {
                            create: jest.fn(),
                        },
                        deal: {
                            update: jest.fn(),
                        },
                        segmentMember: {
                            create: jest.fn(),
                        }
                    },
                },
                {
                    provide: getQueueToken('email-send'),
                    useValue: mockEmailQueue,
                },
                {
                    provide: getQueueToken('workflow-run'),
                    useValue: mockWorkflowQueue,
                },
            ],
        }).compile();

        processor = module.get(WorkflowProcessor);
        prisma = module.get(PrismaService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should throw if workflow is not found', async () => {
        prisma.workflow.findUnique.mockResolvedValue(null);
        const job = mockJob({ workflowId: 'wf-1', triggerPayload: {} }) as any;
        const result = await processor.process(job);
        expect(result.error).toBe('WORKFLOW_INACTIVE');
    });

    it('should create a task when action.create.task node executes', async () => {
        prisma.workflow.findUnique.mockResolvedValue({
            id: 'wf-1',
            status: 'active',
            organizationId: 'org-1',
            definitionJson: {
                nodes: [
                    {
                        id: 'n1',
                        type: 'action.create.task',
                        config: {
                            title: 'Follow up',
                        },
                        next: [],
                    },
                ],
                triggers: []
            },
        });
        prisma.workflowRun.create.mockResolvedValue({ id: 'run-1', organizationId: 'org-1' });
        prisma.workflowRun.update.mockResolvedValue({});
        prisma.workflowRunStep.create.mockResolvedValue({});
        prisma.task.create.mockResolvedValue({ id: 'task-1' });

        const job = mockJob({
            workflowId: 'wf-1',
            triggerPayload: { contactId: 'c-1' },
            nodeId: 'n1'
        }) as any;

        await processor.process(job);

        expect(prisma.task.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: 'Follow up',
                }),
            }),
        );
    });

    it('should stop execution after 100 steps', async () => {
        const job = mockJob({
            workflowId: 'wf-1',
            triggerPayload: {},
            stepCount: 101,
        }) as any;

        const result = await processor.process(job);
        expect(result.error).toBe('MAX_STEPS_EXCEEDED');
    });
});
