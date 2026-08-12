import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import {  Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { GSCService } from '../gsc.service';

type GscSyncJobData = {
  projectId?: string;
  organizationId?: string;
};

@Processor('seo-gsc-sync')
@Injectable()
export class SEOGSCSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SEOGSCSyncProcessor.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(GSCService) private readonly gscService: GSCService,
    @InjectQueue('seo-gsc-sync') private readonly queue: Queue,
  ) {
    super();
  }

  async process(job: Job<GscSyncJobData>): Promise<unknown> {
    const { projectId, organizationId } = job.data;

    if (job.name === 'sync-all') {
      this.logger.log(
        'đźš€ Starting global GSC sync for all connected projects',
      );
      const connectedProjects = await this.prisma.sEOProject.findMany({
        where: { gscConnected: true },
        select: { id: true, organizationId: true },
      });

      for (const project of connectedProjects) {
        await this.queue.add('sync-project', {
          projectId: project.id,
          organizationId: project.organizationId,
        });
      }
      return { processed: connectedProjects.length };
    }

    if (job.name === 'sync-project') {
      if (!projectId || !organizationId) {
        throw new Error(
          'Project sync job requires projectId and organizationId',
        );
      }

      this.logger.log(`[GSC Sync] Syncing data for project ${projectId}`);
      try {
        const result = await this.gscService.syncProjectData(
          projectId,
          organizationId,
        );
        return { ...result };
      } catch (error) {
        this.logger.error(
          `[GSC Sync] Failed to sync project ${projectId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
        throw error;
      }
    }

    return { skipped: true };
  }
}
