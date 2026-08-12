import { Injectable, NotFoundException, Inject, Optional } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { AuditLogService } from '../common/audit-log.service';

@Injectable()
export class GdprService {
    constructor(
        @Inject(PrismaService) private readonly prisma: PrismaService,
        @Optional() private readonly auditLog?: AuditLogService,
    ) { }

    private get requestModel(): any {
        const client = this.prisma as any;
        // Prisma exposes this model as gdprRequest in current schema versions;
        // keep the legacy accessor only for older generated clients during rollout.
        return client.gdprRequest ?? client.gDPRRequest;
    }

    private async findContact(contactId: string, organizationId: string) {
        const contactModel = (this.prisma as any).contact;
        const finder = contactModel.findFirst ?? contactModel.findUnique;
        return finder.call(contactModel, {
            where: { id: contactId, organizationId },
        });
    }

    async createExportRequest(contactId: string, organizationId: string, userId: string) {
        const contact = await this.findContact(contactId, organizationId);

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        const request = await this.requestModel.create({
            data: {
                type: 'EXPORT',
                contactId,
                status: 'PENDING',
                organizationId,
            },
        });
        await this.auditLog?.record({
            organizationId,
            userId,
            action: 'GDPR_EXPORT_REQUESTED',
            entityType: 'contact',
            entityId: contactId,
            metadata: { requestId: request.id },
        });
        return request;
    }

    async createDeleteRequest(contactId: string, organizationId: string, userId: string) {
        const contact = await this.findContact(contactId, organizationId);

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        // Anonymize
        const data = {
            email: `deleted-${contactId}@deleted.com`,
            firstName: 'DELETED',
            lastName: 'DELETED',
            phone: null,
        };
        if ((this.prisma as any).contact.updateMany) {
            await (this.prisma as any).contact.updateMany({
                where: { id: contactId, organizationId },
                data,
            });
        } else {
            // Compatibility path for older generated clients; the contact was
            // already looked up with the organization constraint above.
            await (this.prisma as any).contact.update({ where: { id: contactId }, data });
        }

        const request = await this.requestModel.create({
            data: {
                type: 'DELETE',
                contactId,
                status: 'COMPLETED',
                organizationId,
            },
        });
        await this.auditLog?.record({
            organizationId,
            userId,
            action: 'GDPR_DELETE_COMPLETED',
            entityType: 'contact',
            entityId: contactId,
            metadata: { requestId: request.id },
        });
        return request;
    }

    /** Return a portable, organization-scoped snapshot for a data subject export. */
    async exportContact(contactId: string, organizationId: string, userId: string) {
        const contact = await (this.prisma as any).contact.findFirst({
            where: { id: contactId, organizationId },
            include: {
                company: true,
                deals: true,
                activities: true,
                tasks: true,
                campaignRecipients: true,
                emailEvents: true,
                gdprRequests: true,
            },
        });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        await this.auditLog?.record({
            organizationId,
            userId,
            action: 'GDPR_EXPORT_DOWNLOADED',
            entityType: 'contact',
            entityId: contactId,
            metadata: { exportedAt: new Date().toISOString() },
        });

        return {
            exportedAt: new Date().toISOString(),
            organizationId,
            subject: contact,
        };
    }

    async listRequests(organizationId: string) {
        return this.requestModel.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
