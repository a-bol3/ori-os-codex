import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@ori-os/db/nestjs';
import { AuditLogService } from './audit-log.service';
import { EncryptionService } from './encryption.service';
import { RolesGuard } from '../auth/roles.guard';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [EncryptionService, AuditLogService, RolesGuard],
  exports: [EncryptionService, AuditLogService, RolesGuard],
})
export class CommonModule {}
