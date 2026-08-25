import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsSchedulerService } from './operations-scheduler.service';
import { OperationsService } from './operations.service';

@Module({
  imports: [BullModule.registerQueue({ name: 'operations-core' })],
  controllers: [OperationsController],
  providers: [OperationsService, OperationsSchedulerService],
  exports: [OperationsService],
})
export class OperationsModule {}

