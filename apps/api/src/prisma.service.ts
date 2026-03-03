import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@ori-os/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully.');
    } catch (error) {
      console.error('❌ Database connection failed. Running in partial mode.');
    }
  }
}
