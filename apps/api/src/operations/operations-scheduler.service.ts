import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { isOperationsCoreEnabled } from './operations-feature';

@Injectable()
export class OperationsSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(OperationsSchedulerService.name);

  constructor(
    @InjectQueue('operations-core') private readonly operationsQueue: Queue,
  ) {}

  async onModuleInit() {
    if (!isOperationsCoreEnabled()) return;

    try {
      await Promise.all([
        this.operationsQueue.add(
          'scan-reminders',
          {},
          {
            jobId: 'operations-scan-reminders',
            repeat: { every: 15 * 60 * 1000 },
            removeOnComplete: 20,
            removeOnFail: 50,
          },
        ),
        this.operationsQueue.add(
          'scan-stale-incidents',
          {},
          {
            jobId: 'operations-scan-stale-incidents',
            repeat: { every: 60 * 60 * 1000 },
            removeOnComplete: 20,
            removeOnFail: 50,
          },
        ),
        this.operationsQueue.add(
          'build-daily-summary',
          {},
          {
            jobId: 'operations-build-daily-summary',
            repeat: { pattern: '5 6 * * *' },
            removeOnComplete: 30,
            removeOnFail: 50,
          },
        ),
      ]);
      this.logger.log('Operations Core background schedules registered');
    } catch (error) {
      this.logger.error(
        `Operations schedules could not be registered: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

