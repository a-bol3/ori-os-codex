import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { GSCService } from '../gsc.service';

@Processor('seo-gsc-sync')
@Injectable()
export class SEOGSCSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SEOGSCSyncProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gscService: GSCService,
    @InjectQueue('seo-gsc-sync') private readonly queue: Queue,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { projectId, organizationId } = job.data;

    if (job.name === 'sync-all') {
      this.logger.log('🚀 Starting global GSC sync for all connected projects');
      const connectedProjects = await (this.prisma as any).sEOProject.findMany({
        where: { gscConnected: true },
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
      this.logger.log(`[GSC Sync] Syncing data for project ${projectId}`);
      try {
        const result = await this.gscService.syncProjectData(projectId);
        return { ...result };
      } catch (error) {
        this.logger.error(
          `[GSC Sync] Failed to sync project ${projectId}: ${error.message}`,
        );
        throw error;
      }
    }
  }
}
