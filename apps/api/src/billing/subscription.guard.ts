import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const organizationId = request.user?.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization not found');
    }

    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { organizationId },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (!isPro) {
      throw new ForbiddenException({
        message: 'This feature requires a PRO subscription',
        upgradeUrl: '/dashboard/billing',
      });
    }

    return true;
  }
}
