import { Module } from '@nestjs/common';
import { GmailController } from './gmail.controller';
import { GmailService } from './gmail.service';
import { BullModule } from '@nestjs/bullmq';

@Module({ imports: [BullModule.registerQueue({ name: 'gmail-sync' })], controllers: [GmailController], providers: [GmailService] })
export class GmailModule {}
