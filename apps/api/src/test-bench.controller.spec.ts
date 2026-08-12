import { ForbiddenException } from '@nestjs/common';
import { isTestBenchEnabled, TestBenchController } from './test-bench.controller';

describe('TestBenchController', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  const controller = new TestBenchController(
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
  );

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('blocks status access outside development', async () => {
    process.env.NODE_ENV = 'production';

    await expect(controller.getStatus()).rejects.toThrow(ForbiddenException);
  });

  it('requires an explicit development opt-in', () => {
    expect(
      isTestBenchEnabled({ NODE_ENV: 'production', ENABLE_TEST_BENCH: 'true' }),
    ).toBe(false);
    expect(isTestBenchEnabled({ ENABLE_TEST_BENCH: 'true' })).toBe(false);
    expect(
      isTestBenchEnabled({ NODE_ENV: 'development', ENABLE_TEST_BENCH: 'true' }),
    ).toBe(true);
  });
});
