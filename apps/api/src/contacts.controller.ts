import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
  Inject,
  Query,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { WorkflowTriggerService } from './automation/workflow-trigger.service';
import { AuditLogService } from './common/audit-log.service';
import { normalizePagination } from './common/pagination';
import {
  AuthenticatedRequest,
  getOptionalUserId,
  requireOrganizationId,
} from './common/request-context';
import {
  BulkDeleteDto,
  CreateContactDto,
  CrmListQueryDto,
  ImportContactsDto,
  UpdateContactDto,
} from './crm/dto';

@Controller('crm/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WorkflowTriggerService) private readonly workflowTrigger: WorkflowTriggerService,
    private readonly auditLog: AuditLogService,
  ) { }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query() query: CrmListQueryDto,
  ) {
    const orgId = requireOrganizationId(req);

    const { limit, offset } = normalizePagination(query.limit, query.offset, {
      limit: 50,
      maxLimit: 100,
    });
    const search = query.search?.trim();
    const where = {
      organizationId: orgId,
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' as const } },
              {
                firstName: { contains: search, mode: 'insensitive' as const },
              },
              { lastName: { contains: search, mode: 'insensitive' as const } },
              {
                company: { name: { contains: search, mode: 'insensitive' as const } },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        include: { company: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + items.length < total,
    };
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateContactDto,
  ) {
    const orgId = requireOrganizationId(req);

    await this.assertCompanyBelongsToOrganization(orgId, data.companyId);

    const contact = await this.prisma.contact.create({
      data: { ...data, organizationId: orgId },
      include: { company: true },
    });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'CONTACT_CREATED',
      entityType: 'contact',
      entityId: contact.id,
      metadata: {
        email: contact.email,
        companyId: contact.companyId ?? null,
      },
    });

    try {
      await this.prisma.activity.create({
        data: {
          type: 'NOTE',
          organizationId: orgId,
          subject: 'New contact created',
          body: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          contactId: contact.id,
          metadataJson: {
            source: 'system',
            category: 'contact_created',
          },
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }

    try {
      await this.workflowTrigger.trigger('trigger.contact.created', orgId, contact);
    } catch (error) {
      console.error('Failed to trigger workflow:', error);
    }

    return contact;
  }

  @Post('import')
  async importContacts(
    @Request() req: AuthenticatedRequest,
    @Body() body: ImportContactsDto,
  ) {
    const orgId = requireOrganizationId(req);
    const userId = getOptionalUserId(req);
    const summary = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; email?: string; reason: string }>,
    };

    for (const [index, row] of body.rows.entries()) {
      const email = row.email.trim().toLowerCase();
      const firstName = row.firstName?.trim() || undefined;
      const lastName = row.lastName?.trim() || undefined;
      const companyName = row.companyName?.trim();

      try {
        let companyId: string | undefined;

        if (companyName) {
          const existingCompany = await this.prisma.company.findFirst({
            where: { organizationId: orgId, name: companyName },
            select: { id: true },
          });

          const company =
            existingCompany ??
            (await this.prisma.company.create({
              data: {
                organizationId: orgId,
                name: companyName,
              },
              select: { id: true },
            }));

          companyId = company.id;
        }

        const existing = await this.prisma.contact.findFirst({
          where: { organizationId: orgId, email },
          select: { id: true },
        });

        if (existing) {
          await this.prisma.contact.update({
            where: { id: existing.id },
            data: {
              firstName,
              lastName,
              phone: row.phone?.trim() || undefined,
              jobTitle: row.jobTitle?.trim() || undefined,
              country: row.country?.trim() || undefined,
              companyId,
            },
          });
          summary.updated += 1;
        } else {
          const contact = await this.prisma.contact.create({
            data: {
              organizationId: orgId,
              email,
              firstName,
              lastName,
              phone: row.phone?.trim() || undefined,
              jobTitle: row.jobTitle?.trim() || undefined,
              country: row.country?.trim() || undefined,
              companyId,
            },
          });

          await this.auditLog.record({
            organizationId: orgId,
            userId,
            action: 'CONTACT_IMPORTED',
            entityType: 'contact',
            entityId: contact.id,
            metadata: {
              email,
              companyName: companyName ?? null,
            },
          });

          summary.created += 1;
        }
      } catch (error) {
        summary.errors.push({
          row: index + 1,
          email,
          reason: error instanceof Error ? error.message : 'Unknown import error',
        });
      }
    }

    await this.auditLog.record({
      organizationId: orgId,
      userId,
      action: 'CONTACTS_IMPORTED',
      entityType: 'contact',
      entityId: 'bulk-import',
      metadata: summary as unknown as Prisma.InputJsonValue,
    });

    return summary;
  }

  @Post('bulk-delete')
  async bulkDelete(
    @Request() req: AuthenticatedRequest,
    @Body() body: BulkDeleteDto,
  ) {
    const orgId = requireOrganizationId(req);
    const userId = getOptionalUserId(req);
    const ids = [...new Set(body.ids.filter(Boolean))];

    const ownedContacts = await this.prisma.contact.findMany({
      where: { organizationId: orgId, id: { in: ids } },
      select: { id: true, email: true },
    });

    if (ownedContacts.length === 0) {
      return { deleted: 0 };
    }

    await this.prisma.contact.deleteMany({
      where: { organizationId: orgId, id: { in: ownedContacts.map((contact) => contact.id) } },
    });

    await Promise.all(
      ownedContacts.map((contact) =>
        this.auditLog.record({
          organizationId: orgId,
          userId,
          action: 'CONTACT_DELETED',
          entityType: 'contact',
          entityId: contact.id,
          metadata: { email: contact.email, bulk: true },
        }),
      ),
    );

    return { deleted: ownedContacts.length };
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);
    const [contact, auditLogs] = await Promise.all([
      this.prisma.contact.findFirst({
        where: { id, organizationId: orgId },
        include: {
          company: true,
          deals: {
            include: {
              company: true,
              stage: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          tasks: {
            orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
            take: 20,
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      }),
      this.prisma.auditLog.findMany({
        where: { organizationId: orgId, entityType: 'contact', entityId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return { ...contact, auditLogs };
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateContactDto,
  ) {
    const orgId = requireOrganizationId(req);

    const existing = await this.prisma.contact.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Contact not found');
    }

    await this.assertCompanyBelongsToOrganization(orgId, data.companyId);

    const updated = await this.prisma.contact.update({
      where: { id },
      data,
      include: { company: true },
    });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'CONTACT_UPDATED',
      entityType: 'contact',
      entityId: id,
      metadata: {
        changedFields: Object.keys(data),
      },
    });

    return updated;
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);

    const existing = await this.prisma.contact.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Contact not found');
    }

    const deleted = await this.prisma.contact.delete({ where: { id } });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'CONTACT_DELETED',
      entityType: 'contact',
      entityId: id,
      metadata: {
        email: deleted.email,
      },
    });

    return deleted;
  }

  private async assertCompanyBelongsToOrganization(
    organizationId: string,
    companyId?: string | null,
  ) {
    if (!companyId) {
      return;
    }

    const company = await this.prisma.company.findFirst({
      where: { id: companyId, organizationId },
      select: { id: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }
  }
}
