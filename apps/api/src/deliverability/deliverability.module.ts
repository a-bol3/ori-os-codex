import { Module } from '@nestjs/common';
import { DeliverabilityService } from './deliverability.service';
import { DeliverabilityController } from './deliverability.controller';
import { PrismaModule } from '@ori-os/db/nestjs';

@Module({
  imports: [PrismaModule],
  providers: [DeliverabilityService],
  controllers: [DeliverabilityController],
  exports: [DeliverabilityService],
})
export class DeliverabilityModule {}
