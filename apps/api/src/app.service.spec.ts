import { AppService } from './app.service';

describe('AppService', () => {
  const prisma = {
    $queryRaw: jest.fn(),
  };

  const originalRedisHost = process.env.REDIS_HOST;
  const originalRedisPort = process.env.REDIS_PORT;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  afterAll(() => {
    process.env.REDIS_HOST = originalRedisHost;
    process.env.REDIS_PORT = originalRedisPort;
  });

  it('reports degraded when redis is not configured', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);
    const service = new AppService(prisma as never);

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'degraded',
      dependencies: {
        database: 'ok',
        redis: 'skipped',
      },
    });
  });

  it('reports health as degraded when a configured dependency fails', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);
    process.env.REDIS_HOST = '127.0.0.1';
    process.env.REDIS_PORT = '1';
    const service = new AppService(prisma as never);

    await expect(service.getHealth()).resolves.toMatchObject({
      status: 'degraded',
      dependencies: { database: 'ok', redis: 'error' },
    });
  });

  it('reports degraded when the database check fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('db down'));
    const service = new AppService(prisma as never);

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'degraded',
      dependencies: {
        database: 'error',
      },
    });
  });
});
