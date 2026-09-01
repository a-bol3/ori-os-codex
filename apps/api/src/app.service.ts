import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Socket } from 'net';

type DependencyStatus = 'ok' | 'error' | 'skipped';

type ReadinessDependencies = {
  database: DependencyStatus;
  redis: DependencyStatus;
};

@Injectable()
export class AppService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    const dependencies = await this.checkDependencies();
    return {
      status: this.isHealthy(dependencies) ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      dependencies,
    };
  }

  async getReadiness() {
    const dependencies = await this.checkDependencies();
    const status = this.isHealthy(dependencies) ? 'ready' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      dependencies,
    };
  }

  private async checkDependencies(): Promise<ReadinessDependencies> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);
    return { database, redis };
  }

  private isHealthy(dependencies: ReadinessDependencies): boolean {
    return dependencies.database === 'ok' && dependencies.redis === 'ok';
  }

  private async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<DependencyStatus> {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    if (!host || !port) {
      return 'skipped';
    }

    return new Promise<DependencyStatus>((resolve) => {
      const socket = new Socket();
      let settled = false;

      const finish = (status: DependencyStatus) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(status);
      };

      socket.setTimeout(1000);
      socket.once('connect', () => finish('ok'));
      socket.once('timeout', () => finish('error'));
      socket.once('error', () => finish('error'));
      socket.connect(parseInt(port, 10), host);
    });
  }
}
