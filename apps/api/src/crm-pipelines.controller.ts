import { Controller, Get, Inject, Request, UseGuards } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ensureDefaultPipeline } from './common/default-pipeline';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from './common/request-context';

@Controller('crm/pipelines')
@UseGuards(JwtAuthGuard)
export class CrmPipelinesController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    const orgId = requireOrganizationId(req);

    const hydratedPipeline = await ensureDefaultPipeline(this.prisma, orgId);
    const stagesWithDeals = await this.prisma.pipelineStage.findMany({
      where: { pipelineId: hydratedPipeline.id },
      orderBy: { order: 'asc' },
      include: {
        deals: {
          where: { organizationId: orgId },
          select: { id: true, valueAmount: true },
        },
      },
    });

    return [
      {
        id: hydratedPipeline.id,
        name: hydratedPipeline.name,
        stages: stagesWithDeals.map((stage) => ({
          id: stage.id,
          name: stage.name,
          order: stage.order,
          dealsCount: stage.deals.length,
          dealsValue: stage.deals.reduce(
            (sum, deal) => sum + (deal.valueAmount ?? 0),
            0,
          ),
        })),
      },
    ];
  }
}
