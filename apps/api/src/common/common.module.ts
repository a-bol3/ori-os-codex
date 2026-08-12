import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@ori-os/db/nestjs';
import { AuditLogService } from './audit-log.service';
import { EncryptionService } from './encryption.service';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [EncryptionService, AuditLogService],
  exports: [EncryptionService, AuditLogService],
})
export class CommonModule {}
