import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@ori-os/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }
}
