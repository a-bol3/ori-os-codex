import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
    constructor(private readonly prisma: PrismaService) { }

    async getHealth() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'UP',
                timestamp: new Date().toISOString(),
                services: {
                    api: 'UP',
                    database: 'UP'
                }
            };
        } catch (error) {
            return {
                status: 'DEGRADED',
                timestamp: new Date().toISOString(),
                services: {
                    api: 'UP',
                    database: 'DOWN'
                }
            };
        }
    }
}
