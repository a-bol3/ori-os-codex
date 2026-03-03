import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '@ori-os/db/nestjs';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout')
  async createCheckout(@Req() req, @Body('returnUrl') returnUrl: string) {
    const organizationId = req.user.organizationId;
    return this.billingService.createCheckoutSession(organizationId, returnUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Req() req) {
    const organizationId = req.user.organizationId;
    return this.billingService.getBillingStatus(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(@Req() req) {
    const organizationId = req.user.organizationId;

    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { organizationId },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (isPro) {
      return {
        isPro: true,
        unlimited: true,
        message: 'PRO subscription - unlimited usage',
      };
    }

    // Free tier usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const emailCount = await (this.prisma as any).emailEvent.count({
      where: {
        campaign: { organizationId },
        eventType: 'SENT',
        createdAt: { gte: startOfMonth },
      },
    });

    const FREE_TIER_EMAIL_LIMIT = 100;

    return {
      isPro: false,
      emailsUsed: emailCount,
      emailsRemaining: Math.max(0, FREE_TIER_EMAIL_LIMIT - emailCount),
      emailLimit: FREE_TIER_EMAIL_LIMIT,
      periodStart: startOfMonth,
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }
    // req.rawBody contains the buffer if RawBody is enabled in main.ts
    return this.billingService.handleWebhook(signature, (req as any).rawBody);
  }
}
