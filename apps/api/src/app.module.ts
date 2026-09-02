import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '@ori-os/db/nestjs';
import { ConnectorsModule } from './connectors/connectors.module';
import { MediaModule } from './media/media.module';
import { AIModule } from './ai/ai.module';
import { DeliverabilityModule } from './deliverability/deliverability.module';
import { BillingModule } from './billing/billing.module';
import { UsageLimitMiddleware } from './billing/usage-limit.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CommonModule } from './common/common.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContactsController } from './contacts.controller';
import { CompaniesController } from './companies.controller';
import { AnalyticsModule } from './analytics/analytics.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { AutomationModule } from './automation/automation.module';
import { DealsController } from './deals.controller';
import { CrmPipelinesController } from './crm-pipelines.controller';
import { CrmTasksController } from './crm-tasks.controller';
import { NotificationsModule } from './notifications.module';
import { AiService } from './ai.service';
import { EmailService } from './email.service';
import { CampaignsController } from './engagement.controller';
import { InboxController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import { CampaignLaunchService } from './engagement/campaign-launch.service';
import { TemplatesController } from './templates.controller';
import { ActivitiesController } from './activities.controller';
import {
  isTestBenchEnabled,
  TestBenchController,
} from './test-bench.controller';
import { UnsubscribeController } from './unsubscribe.controller';
import { SeoModule } from './seo/seo.module';
import { NotificationsController } from './notifications.controller';
import { DashboardController } from './dashboard.controller';
import { ResendWebhookController } from './email-events/resend-webhook.controller';
import { ResendWebhookService } from './email-events/resend-webhook.service';
import { AuditLogService } from './common/audit-log.service';
import { ComplianceModule } from './compliance/compliance.module';
import { TrackingController } from './tracking.controller';
import { OperationsModule } from './operations/operations.module';
import { GmailModule } from './gmail/gmail.module';
import { RequestObservabilityMiddleware } from './common/request-observability.middleware';

// Do not mount test-bench routes in production (or when the opt-in flag is
// absent). The controller also checks this at runtime as defense in depth.
const testBenchControllers = isTestBenchEnabled()
  ? [TestBenchController]
  : [];

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AnalyticsModule,
    DeliverabilityModule,
    BillingModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    SeoModule,
    IntelligenceModule,
    AutomationModule,
    NotificationsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    CommonModule,
    ComplianceModule,
    ConnectorsModule,
    MediaModule,
    AIModule,
    OperationsModule,
    GmailModule,
    BullModule.registerQueue(
      { name: 'campaign-queue' },
      { name: 'email-queue' },
      { name: 'email-send' },
      { name: 'workflow-run' },
      { name: 'seo-queue' },
      { name: 'intelligence-job' },
      { name: 'gmail-sync' },
    ),
  ],
  controllers: [
    AppController,
    ContactsController,
    CompaniesController,
    DealsController,
    CrmPipelinesController,
    CrmTasksController,
    CampaignsController,
    InboxController,
    TemplatesController,
    ActivitiesController,
    ...testBenchControllers,
    UnsubscribeController,
    NotificationsController,
    DashboardController,
    ResendWebhookController,
    TrackingController,
  ],
  providers: [
    // ThrottlerModule only configures the policy; this global guard enforces
    // it for every API route unless a route explicitly opts out.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    AppService,
    AiService,
    EmailService,
    EngagementService,
    CampaignLaunchService,
    AuditLogService,
    UsageLimitMiddleware,
    ResendWebhookService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestObservabilityMiddleware).forRoutes('*');
    consumer.apply(UsageLimitMiddleware).forRoutes('engagement/campaigns');
  }
}
