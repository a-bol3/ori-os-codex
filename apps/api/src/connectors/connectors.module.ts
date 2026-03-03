import { Module } from '@nestjs/common';
import { ConnectorsService } from './connectors.service';
import { ConnectorsController } from './connectors.controller';
import { EmailFallbackStrategy } from './strategies/email-fallback.strategy';

@Module({
  controllers: [ConnectorsController],
  providers: [ConnectorsService, EmailFallbackStrategy],
  exports: [ConnectorsService, EmailFallbackStrategy],
})
export class ConnectorsModule {}
