import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GdprService {
    private readonly logger = new Logger(GdprService.name);

    constructor(private prisma: PrismaService) { }

    async createRequest(data: {
        contactId: string;
        contactEmail: string;
        organizationId: string;
        type: 'export' | 'delete';
    }) {
        this.logger.log(`Creating GDPR request for contact ${data.contactId}`);

        return this.prisma.gDPRRequest.create({
            data: {
                contactId: data.contactId,
                contactEmail: data.contactEmail,
                organizationId: data.organizationId,
                type: data.type,
                status: 'pending',
            },
        });
    }

    async getRequestStatus(id: string) {
        return this.prisma.gDPRRequest.findUnique({
            where: { id },
        });
    }
}
