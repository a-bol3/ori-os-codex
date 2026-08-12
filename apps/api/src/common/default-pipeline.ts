import { PrismaService } from '@ori-os/db/nestjs';

export const DEFAULT_PIPELINE_NAME = 'Sales Pipeline';

export const DEFAULT_PIPELINE_STAGES = [
  { name: 'Lead', order: 1 },
  { name: 'Qualified', order: 2 },
  { name: 'Proposal', order: 3 },
  { name: 'Negotiation', order: 4 },
  { name: 'Closed Won', order: 5 },
] as const;

export async function ensureDefaultPipeline(prisma: PrismaService, organizationId: string) {
  let pipeline = await prisma.pipeline.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'asc' },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        organizationId,
        name: DEFAULT_PIPELINE_NAME,
        stages: {
          create: DEFAULT_PIPELINE_STAGES.map((stage) => ({ ...stage })),
        },
      },
    });
  }

  const existingStages = await prisma.pipelineStage.findMany({
    where: { pipelineId: pipeline.id },
    orderBy: { order: 'asc' },
    select: { id: true, name: true, order: true },
  });

  const existingNames = new Set(existingStages.map((stage) => stage.name.toLowerCase()));
  const missingStages = DEFAULT_PIPELINE_STAGES.filter(
    (stage) => !existingNames.has(stage.name.toLowerCase()),
  );

  if (missingStages.length > 0) {
    await prisma.pipelineStage.createMany({
      data: missingStages.map((stage) => ({
        pipelineId: pipeline.id,
        name: stage.name,
        order: stage.order,
      })),
    });
  }

  return prisma.pipeline.findUniqueOrThrow({
    where: { id: pipeline.id },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });
}
