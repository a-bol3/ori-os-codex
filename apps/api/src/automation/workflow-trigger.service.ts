import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class WorkflowTriggerService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('workflow-run') private workflowQueue: Queue,
    ) { }

    async trigger(triggerType: string, organizationId: string, payload: any) {
        // 1. Find all active workflows for this organization and trigger type
        const workflows = await this.prisma.workflow.findMany({
            where: {
                organizationId,
                triggerType,
                status: 'active',
            },
        });

        console.log(`Triggering ${workflows.length} workflows for ${triggerType} in org ${organizationId}`);

        // 2. Enqueue a run for each
        for (const workflow of workflows) {
            await this.workflowQueue.add('workflow-run', {
                workflowId: workflow.id,
                triggerPayload: payload,
            });
        }
    }
}
