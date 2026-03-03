import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { SubscriptionGuard } from './subscription.guard';
import { PrismaModule } from '@ori-os/db/nestjs';

@Module({
  imports: [PrismaModule],
  providers: [BillingService, SubscriptionGuard],
  controllers: [BillingController],
  exports: [BillingService, SubscriptionGuard],
})
export class BillingModule {}
