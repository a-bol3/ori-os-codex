import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Processor('workflow-run')
export class WorkflowProcessor extends WorkerHost {
    private readonly logger = new Logger(WorkflowProcessor.name);

    constructor(private prisma: PrismaService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { workflowId, organizationId, payload } = job.data;
        const contactId = payload?.contactId;
        this.logger.log(`Executing workflow ${workflowId} for contact ${contactId}`);

        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
        });

        if (!workflow || workflow.status !== 'active') {
            this.logger.warn(`Workflow ${workflowId} not found or inactive`);
            return;
        }

        const run = await this.prisma.workflowRun.create({
            data: {
                workflowId,
                organizationId: workflow.organizationId,
                status: 'running',
                triggerType: workflow.triggerType,
                startedAt: new Date(),
            },
        });

        try {
            const nodes = JSON.parse(workflow.nodes);

            // Simple linear execution for now as a restoration baseline
            for (const node of nodes) {
                this.logger.log(`Executing node ${node.id} (${node.type})`);

                await this.prisma.workflowRunStep.create({
                    data: {
                        workflowRunId: run.id,
                        nodeId: node.id,
                        nodeType: node.type,
                        status: 'completed',
                        startedAt: new Date(),
                        completedAt: new Date(),
                    },
                });

                // Add node-specific logic (Email, Task, etc.) here
                if (node.type === 'action.email') {
                    // Trigger email processor or call service
                }
            }

            await this.prisma.workflowRun.update({
                where: { id: run.id },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                },
            });

            return { success: true };
        } catch (error: any) {
            this.logger.error(`Workflow run ${run.id} failed: ${error.message}`);
            await this.prisma.workflowRun.update({
                where: { id: run.id },
                data: {
                    status: 'failed',
                    completedAt: new Date(),
                    error: error.message,
                },
            });
            throw error;
        }
    }
}
