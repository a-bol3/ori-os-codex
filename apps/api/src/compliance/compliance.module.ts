import { Module } from '@nestjs/common';
import { PrismaModule } from '@ori-os/db/nestjs';
import { CommonModule } from '../common/common.module';
import { GdprController } from './gdpr.controller';
import { GdprService } from './gdpr.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [GdprController],
  providers: [GdprService],
  exports: [GdprService],
})
export class ComplianceModule {}
