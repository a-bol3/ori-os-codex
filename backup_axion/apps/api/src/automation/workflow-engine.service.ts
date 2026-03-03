import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkflowEngineService {
    private readonly logger = new Logger(WorkflowEngineService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('workflow-run') private workflowQueue: Queue,
    ) { }

    async triggerWorkflow(triggerType: string, organizationId: string, payload: any) {
        this.logger.log(`Triggering workflows for type: ${triggerType}`);

        const workflows = await this.prisma.workflow.findMany({
            where: {
                organizationId,
                triggerType,
                status: 'active',
            },
        });

        for (const workflow of workflows) {
            await this.workflowQueue.add('execute', {
                workflowId: workflow.id,
                organizationId,
                payload,
            });
        }
    }
}
