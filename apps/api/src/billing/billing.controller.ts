import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards, Inject } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '@ori-os/db/nestjs';
import {
  AuthenticatedRequest,
  requireOrganizationId,
} from '../common/request-context';

function requireRawBody(req: RawBodyRequest<Request>): Buffer {
  const rawBody = req.rawBody;

  if (!rawBody) {
    throw new Error('Missing raw request body');
  }

  return Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody);
}

@Controller('billing')
export class BillingController {
  constructor(
    @Inject(BillingService) private readonly billingService: BillingService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-checkout')
  async createCheckout(
    @Req() req: AuthenticatedRequest,
    @Body('returnUrl') returnUrl: string,
  ) {
    const organizationId = requireOrganizationId(req);
    return this.billingService.createCheckoutSession(organizationId, returnUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Req() req: AuthenticatedRequest) {
    const organizationId = requireOrganizationId(req);
    return this.billingService.getBillingStatus(organizationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  async getUsage(@Req() req: AuthenticatedRequest) {
    const organizationId = requireOrganizationId(req);

    const subscription = await this.prisma.subscription.findUnique({
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

    const emailCount = await this.prisma.emailEvent.count({
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

    return this.billingService.handleWebhook(signature, requireRawBody(req));
  }
}
