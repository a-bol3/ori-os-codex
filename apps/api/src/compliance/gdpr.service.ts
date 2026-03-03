import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class GdprService {
    constructor(private readonly prisma: PrismaService) { }

    async createExportRequest(contactId: string, organizationId: string, userId: string) {
        const contact = await (this.prisma as any).contact.findUnique({
            where: { id: contactId },
        });

        if (!contact || contact.organizationId !== organizationId) {
            throw new NotFoundException('Contact not found');
        }

        return (this.prisma as any).gDPRRequest.create({
            data: {
                type: 'EXPORT',
                contactId,
                status: 'PENDING',
                organizationId,
                createdBy: userId,
            },
        });
    }

    async createDeleteRequest(contactId: string, organizationId: string, userId: string) {
        const contact = await (this.prisma as any).contact.findUnique({
            where: { id: contactId },
        });

        if (!contact || contact.organizationId !== organizationId) {
            throw new NotFoundException('Contact not found');
        }

        // Anonymize
        await (this.prisma as any).contact.update({
            where: { id: contactId },
            data: {
                email: `deleted-${contactId}@deleted.com`,
                firstName: 'DELETED',
                lastName: 'DELETED',
                phone: null,
            },
        });

        return (this.prisma as any).gDPRRequest.create({
            data: {
                type: 'DELETE',
                contactId,
                status: 'COMPLETED',
                organizationId,
                createdBy: userId,
            },
        });
    }
}
