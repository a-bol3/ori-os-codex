import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './prisma/prisma.module';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { DealsModule } from './deals/deals.module';
import { ActivitiesModule } from './activities/activities.module';
import { TasksModule } from './tasks/tasks.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { SEOModule } from './seo/seo.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { APP_GUARD } from '@nestjs/core';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
        }),
        ClsModule.forRoot({
            global: true,
            middleware: { mount: true },
        }),
        PrismaModule,
        ContactsModule,
        CompaniesModule,
        DealsModule,
        ActivitiesModule,
        TasksModule,
        CampaignsModule,
        WorkflowsModule,
        SEOModule,
    ],
    controllers: [AppController, DashboardController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
