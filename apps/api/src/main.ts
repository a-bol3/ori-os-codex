import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { validateEnv } from './env.schema';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs'; // Added for fs.existsSync
import { initSentry } from './sentry';

async function bootstrap() {
  try {
    dotenv.config({
      path: path.join(
        process.cwd(),
        fs.existsSync(path.join(process.cwd(), '.env')) ? '.env' : '../../.env',
      ),
    });
    validateEnv();

    // Initialize Sentry
    initSentry();

    const app = await NestFactory.create(AppModule, {
      rawBody: true,
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security
    app.use(helmet());
    app.enableCors({
      origin: ['http://localhost:3000', 'https://ori-os.ori-craftlabs.com'],
      credentials: true,
    });

    const port = process.env.API_PORT || process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 NestJS API is listening on http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Failed to bootstrap NestJS API:', error);
    process.exit(1);
  }
}
bootstrap();
