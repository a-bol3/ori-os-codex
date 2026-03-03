import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '@ori-os/db/nestjs';
import { WorkflowDefinition, WorkflowNode } from '@ori-os/core';
import axios from 'axios';

@Processor('workflow-run')
export class WorkflowProcessor extends WorkerHost {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('email-send') private emailQueue: Queue,
        @InjectQueue('workflow-run') private workflowQueue: Queue,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { workflowId, triggerPayload, nodeId: startingNodeId, runId: existingRunId, stepCount = 0 } = job.data;

        console.log(`Processing workflow ${workflowId}, step ${stepCount}`);

        // 1. Safety limits
        if (stepCount > 100) {
            console.error(`Workflow ${workflowId} exceeded max steps (100)`);
            return { success: false, error: 'MAX_STEPS_EXCEEDED' };
        }

        // 2. Load workflow
        const workflow = await this.prisma.workflow.findUnique({
            where: { id: workflowId },
        });

        if (!workflow || workflow.status !== 'active' && !existingRunId) {
            console.log(`Workflow ${workflowId} not found or inactive`);
            return { success: false, error: 'WORKFLOW_INACTIVE' };
        }

        const definition = workflow.definitionJson as unknown as WorkflowDefinition;

        // 3. Create or load run
        let run = existingRunId
            ? await this.prisma.workflowRun.findUnique({ where: { id: existingRunId } })
            : await this.prisma.workflowRun.create({
                data: {
                    workflowId: workflow.id,
                    organizationId: workflow.organizationId,
                    status: 'running',
                    contextJson: triggerPayload,
                }
            });

        if (!run) return { success: false, error: 'RUN_NOT_FOUND' };

        // 4. Find current node
        const currentNode = startingNodeId
            ? definition.nodes.find(n => n.id === startingNodeId)
            : definition.triggers.find(t => t.type === workflow.triggerType && !startingNodeId);

        if (!currentNode) {
            await this.prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: 'completed', finishedAt: new Date() }
            });
            return { success: true };
        }

        // 5. Execute node
        console.log(`Executing node ${currentNode.id} (${currentNode.type})`);
        const stepResult = await this.executeNode(currentNode, triggerPayload, run.organizationId);

        // 6. Log step
        await this.prisma.workflowRunStep.create({
            data: {
                workflowRunId: run.id,
                nodeId: currentNode.id,
                status: stepResult.success ? 'completed' : 'failed',
                outputJson: stepResult.output || {},
                errorMessage: stepResult.error,
                finishedAt: new Date(),
            }
        });

        if (!stepResult.success) {
            await this.prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: 'failed', finishedAt: new Date() }
            });
            return { success: false, error: stepResult.error };
        }

        // 7. Handle special nodes (Delay)
        if (currentNode.type === 'delay') {
            const delayMs = (currentNode.config.duration || 60) * 1000;
            const nextNodeId = currentNode.next?.[0];
            if (nextNodeId) {
                await this.workflowQueue.add('workflow-run', {
                    workflowId,
                    triggerPayload,
                    nodeId: nextNodeId,
                    runId: run.id,
                    stepCount: stepCount + 1
                }, { delay: delayMs });
                return { success: true, delayed: true };
            }
        }

        // 8. Handle branching (Condition)
        let nextNodes = currentNode.next || [];
        if (currentNode.type === 'condition.if') {
            const conditionMet = this.evaluateCondition(currentNode.config, triggerPayload);
            // Assuming next[0] is TRUE, next[1] is FALSE
            nextNodes = conditionMet ? [currentNode.next?.[0]].filter(Boolean) as string[] : [currentNode.next?.[1]].filter(Boolean) as string[];
        }

        // 9. Queue next steps
        for (const nextId of nextNodes) {
            await this.workflowQueue.add('workflow-run', {
                workflowId,
                triggerPayload,
                nodeId: nextId,
                runId: run.id,
                stepCount: stepCount + 1
            });
        }

        // 10. Finalize if no more steps
        if (nextNodes.length === 0) {
            await this.prisma.workflowRun.update({
                where: { id: run.id },
                data: { status: 'completed', finishedAt: new Date() }
            });
        }

        return { success: true };
    }

    private async executeNode(node: WorkflowNode, payload: any, organizationId: string): Promise<{ success: boolean, output?: any, error?: string }> {
        try {
            switch (node.type) {
                case 'action.create.task':
                    const task = await this.prisma.task.create({
                        data: {
                            organizationId,
                            title: node.config.title || 'Automated Task',
                            description: node.config.description,
                            dueDate: node.config.dueInDays ? new Date(Date.now() + node.config.dueInDays * 86400000) : null,
                            contactId: payload.contactId,
                            dealId: payload.dealId,
                        }
                    });
                    return { success: true, output: task };

                case 'action.send.email':
                    await this.emailQueue.add('email-send', {
                        to: node.config.to || payload.email,
                        subject: node.config.subject,
                        html: node.config.html,
                        campaignId: node.config.campaignId,
                        organizationId,
                    });
                    return { success: true };

                case 'action.update.deal':
                    if (!payload.dealId) return { success: false, error: 'No dealId in payload' };
                    const deal = await this.prisma.deal.update({
                        where: { id: payload.dealId },
                        data: {
                            stageId: node.config.stageId,
                            status: node.config.status,
                        }
                    });
                    return { success: true, output: deal };

                case 'action.add.to.segment':
                    if (!payload.contactId || !node.config.segmentId) return { success: false, error: 'Missing contactId or segmentId' };
                    await this.prisma.segmentMember.create({
                        data: {
                            segmentId: node.config.segmentId,
                            contactId: payload.contactId,
                        }
                    });
                    return { success: true };

                case 'action.http.request':
                    const response = await axios.post(node.config.url, {
                        payload,
                        config: node.config.body
                    });
                    return { success: true, output: response.data };

                default:
                    return { success: true }; // Triggers or unhandled actions
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    private evaluateCondition(config: any, payload: any): boolean {
        // Simple property matching for now
        const { field, operator, value } = config;
        const actualValue = payload[field];

        switch (operator) {
            case 'equals': return actualValue === value;
            case 'contains': return String(actualValue).includes(String(value));
            case 'exists': return !!actualValue;
            default: return false;
        }
    }
}
