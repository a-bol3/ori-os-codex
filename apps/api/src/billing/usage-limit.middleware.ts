import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '@ori-os/db/nestjs';

@Injectable()
export class UsageLimitMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return next();
    }

    // Check subscription status
    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { organizationId },
    });

    const isPro = subscription?.status === 'ACTIVE';

    // Free tier limits
    if (!isPro) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Count emails sent this month
      const emailCount = await (this.prisma as any).emailEvent.count({
        where: {
          campaign: { organizationId },
          eventType: 'SENT',
          createdAt: { gte: startOfMonth },
        },
      });

      const FREE_TIER_EMAIL_LIMIT = 100;

      if (emailCount >= FREE_TIER_EMAIL_LIMIT) {
        throw new ForbiddenException({
          message: `Free tier limit reached (${FREE_TIER_EMAIL_LIMIT} emails/month). Upgrade to PRO for unlimited sending.`,
          upgradeUrl: '/dashboard/billing',
          currentUsage: emailCount,
          limit: FREE_TIER_EMAIL_LIMIT,
        });
      }

      // Attach usage info to request for logging
      (req as any).usageInfo = {
        isPro: false,
        emailsUsed: emailCount,
        emailsRemaining: FREE_TIER_EMAIL_LIMIT - emailCount,
      };
    } else {
      (req as any).usageInfo = {
        isPro: true,
        unlimited: true,
      };
    }

    next();
  }
}
