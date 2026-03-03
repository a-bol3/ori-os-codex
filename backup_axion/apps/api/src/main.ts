import { APP_GUARD, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from '@ori-os/core';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { ClsService } from 'nestjs-cls';

async function bootstrap() {
    validateEnv(process.env as any);
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();

    // Enable trust proxy if behind Caddy/Nginx for correct rate limiting IP
    (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);

    const cls = app.get(ClsService);
    app.useGlobalInterceptors(new TenantInterceptor(cls));

    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
