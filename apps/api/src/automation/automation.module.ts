import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AutomationsController } from '../automations.controller';
import { WorkflowTriggerService } from './workflow-trigger.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'workflow-run',
        }),
    ],
    controllers: [AutomationsController],
    providers: [WorkflowTriggerService],
    exports: [WorkflowTriggerService],
})
export class AutomationModule { }
