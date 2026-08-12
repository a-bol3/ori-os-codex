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
  Inject,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuditLogService } from './common/audit-log.service';
import { normalizePagination } from './common/pagination';
import {
  AuthenticatedRequest,
  getOptionalUserId,
  requireOrganizationId,
} from './common/request-context';
import {
  BulkDeleteDto,
  CreateCompanyDto,
  CrmListQueryDto,
  ImportCompaniesDto,
  UpdateCompanyDto,
} from './crm/dto';

@Controller('crm/companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

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
              { name: { contains: search, mode: 'insensitive' as const } },
              { domain: { contains: search, mode: 'insensitive' as const } },
              { industry: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        include: {
          _count: { select: { contacts: true } },
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
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
    @Body() data: CreateCompanyDto,
  ) {
    const orgId = requireOrganizationId(req);
    const company = await this.prisma.company.create({
      data: {
        ...data,
        organizationId: orgId,
      },
      include: {
        _count: { select: { contacts: true } },
      },
    });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'COMPANY_CREATED',
      entityType: 'company',
      entityId: company.id,
      metadata: {
        name: company.name,
        domain: company.domain ?? null,
      },
    });

    return company;
  }

  @Post('import')
  async importCompanies(
    @Request() req: AuthenticatedRequest,
    @Body() body: ImportCompaniesDto,
  ) {
    const orgId = requireOrganizationId(req);
    const userId = getOptionalUserId(req);
    const summary = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ row: number; name?: string; reason: string }>,
    };

    for (const [index, row] of body.rows.entries()) {
      const name = row.name.trim();
      const domain = row.domain?.trim() || undefined;

      try {
        const existing = domain
          ? await this.prisma.company.findFirst({
              where: { organizationId: orgId, domain },
              select: { id: true },
            })
          : await this.prisma.company.findFirst({
              where: { organizationId: orgId, name },
              select: { id: true },
            });

        if (existing) {
          await this.prisma.company.update({
            where: { id: existing.id },
            data: {
              name,
              domain,
              industry: row.industry?.trim() || undefined,
              sizeBand: row.sizeBand?.trim() || undefined,
              country: row.country?.trim() || undefined,
              city: row.city?.trim() || undefined,
              website: row.website?.trim() || undefined,
              linkedinUrl: row.linkedinUrl?.trim() || undefined,
            },
          });
          summary.updated += 1;
        } else {
          const company = await this.prisma.company.create({
            data: {
              organizationId: orgId,
              name,
              domain,
              industry: row.industry?.trim() || undefined,
              sizeBand: row.sizeBand?.trim() || undefined,
              country: row.country?.trim() || undefined,
              city: row.city?.trim() || undefined,
              website: row.website?.trim() || undefined,
              linkedinUrl: row.linkedinUrl?.trim() || undefined,
            },
          });

          await this.auditLog.record({
            organizationId: orgId,
            userId,
            action: 'COMPANY_IMPORTED',
            entityType: 'company',
            entityId: company.id,
            metadata: {
              name,
              domain: domain ?? null,
            },
          });

          summary.created += 1;
        }
      } catch (error) {
        summary.errors.push({
          row: index + 1,
          name,
          reason: error instanceof Error ? error.message : 'Unknown import error',
        });
      }
    }

    await this.auditLog.record({
      organizationId: orgId,
      userId,
      action: 'COMPANIES_IMPORTED',
      entityType: 'company',
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

    const ownedCompanies = await this.prisma.company.findMany({
      where: { organizationId: orgId, id: { in: ids } },
      select: { id: true, name: true, domain: true },
    });

    if (ownedCompanies.length === 0) {
      return { deleted: 0 };
    }

    await this.prisma.company.deleteMany({
      where: { organizationId: orgId, id: { in: ownedCompanies.map((company) => company.id) } },
    });

    await Promise.all(
      ownedCompanies.map((company) =>
        this.auditLog.record({
          organizationId: orgId,
          userId,
          action: 'COMPANY_DELETED',
          entityType: 'company',
          entityId: company.id,
          metadata: { name: company.name, domain: company.domain ?? null, bulk: true },
        }),
      ),
    );

    return { deleted: ownedCompanies.length };
  }

  @Get(':id')
  async findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    const orgId = requireOrganizationId(req);
    const [company, auditLogs] = await Promise.all([
      this.prisma.company.findFirst({
        where: { id, organizationId: orgId },
        include: {
          contacts: true,
          deals: true,
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
        where: { organizationId: orgId, entityType: 'company', entityId: id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return { ...company, auditLogs };
  }

  @Put(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateCompanyDto,
  ) {
    const orgId = requireOrganizationId(req);
    const existing = await this.prisma.company.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Company not found');
    }
    const updated = await this.prisma.company.update({
      where: { id },
      data,
      include: {
        _count: { select: { contacts: true } },
      },
    });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'COMPANY_UPDATED',
      entityType: 'company',
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
    const existing = await this.prisma.company.findFirst({
      where: { id, organizationId: orgId },
    });
    if (!existing) {
      throw new NotFoundException('Company not found');
    }
    const deleted = await this.prisma.company.delete({ where: { id } });

    await this.auditLog.record({
      organizationId: orgId,
      userId: getOptionalUserId(req),
      action: 'COMPANY_DELETED',
      entityType: 'company',
      entityId: id,
      metadata: {
        name: deleted.name,
        domain: deleted.domain ?? null,
      },
    });

    return deleted;
  }
}
