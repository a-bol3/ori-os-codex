import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs'; // Added for fs.existsSync

dotenv.config({
  path: path.join(
    process.cwd(),
    fs.existsSync(path.join(process.cwd(), '.env')) ? '.env' : '../../.env',
  ),
});

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { validateEnv } from './env.schema';
import { initSentry } from './sentry';

async function bootstrap() {
  try {
    const env = validateEnv();
    const { AppModule } = await import('./app.module');

    // Initialize Sentry
    initSentry();

    const app = await NestFactory.create(AppModule, {
      rawBody: true,
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Security
    app.use(helmet());
    const allowedOrigins =
      env.NODE_ENV === 'production'
        ? [env.FRONTEND_URL as string]
        : ['http://localhost:3000', env.FRONTEND_URL].filter(
            (origin): origin is string => Boolean(origin),
          );
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
    });

    const port = env.API_PORT || env.PORT;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 NestJS API is listening on http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Failed to bootstrap NestJS API:', error);
    process.exit(1);
  }
}
void bootstrap();
