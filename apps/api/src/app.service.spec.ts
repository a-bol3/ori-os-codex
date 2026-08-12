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

  it('reports ready when database is available and redis is not configured', async () => {
    prisma.$queryRaw.mockResolvedValue([1]);
    const service = new AppService(prisma as never);

    await expect(service.getReadiness()).resolves.toMatchObject({
      status: 'ready',
      dependencies: {
        database: 'ok',
        redis: 'skipped',
      },
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
