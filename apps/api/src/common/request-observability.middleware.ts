import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

@Injectable()
export class RequestObservabilityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const incomingId = request.header('x-request-id');
    const requestId = incomingId && REQUEST_ID_PATTERN.test(incomingId)
      ? incomingId
      : randomUUID();
    const startedAt = process.hrtime.bigint();

    response.setHeader('x-request-id', requestId);
    response.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      this.logger.log(JSON.stringify({
        event: 'http_request',
        requestId,
        method: request.method,
        path: request.path,
        statusCode: response.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
      }));
    });

    next();
  }
}
