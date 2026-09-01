import { RequestObservabilityMiddleware } from './request-observability.middleware';

describe('RequestObservabilityMiddleware', () => {
  it('propagates a safe request id and logs completion metadata', () => {
    const middleware = new RequestObservabilityMiddleware();
    const logger = jest
      .spyOn(
        (middleware as unknown as { logger: { log: (...args: unknown[]) => void } }).logger,
        'log',
      )
      .mockImplementation();
    const finishHandlers: Array<() => void> = [];
    const request = {
      method: 'GET',
      path: '/health',
      header: jest.fn().mockReturnValue('trace-123'),
    };
    const response = {
      statusCode: 200,
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        if (event === 'finish') finishHandlers.push(handler);
      }),
    };
    const next = jest.fn();

    middleware.use(request as never, response as never, next);
    finishHandlers[0]();

    expect(response.setHeader).toHaveBeenCalledWith('x-request-id', 'trace-123');
    expect(next).toHaveBeenCalled();
    expect(logger).toHaveBeenCalledWith(expect.stringContaining('"requestId":"trace-123"'));
    expect(logger).toHaveBeenCalledWith(expect.stringContaining('"statusCode":200'));
  });

  it('replaces an unsafe incoming request id', () => {
    const middleware = new RequestObservabilityMiddleware();
    const response = { statusCode: 200, setHeader: jest.fn(), on: jest.fn() };
    middleware.use(
      { method: 'GET', path: '/', header: jest.fn().mockReturnValue('bad id') } as never,
      response as never,
      jest.fn(),
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'x-request-id',
      expect.stringMatching(/^[0-9a-f-]{36}$/),
    );
  });
});
