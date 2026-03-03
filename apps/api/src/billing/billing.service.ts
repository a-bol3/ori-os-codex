import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private stripe: Stripe;
  private readonly logger = new Logger(BillingService.name);

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
      apiVersion: '2025-01-27-preview' as any,
    });
  }

  async createCheckoutSession(organizationId: string, returnUrl: string) {
    const organization = await (this.prisma as any).organization.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    let customerId = organization.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        name: organization.name,
        metadata: { organizationId },
      });
      customerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID || 'price_dummy_pro_monthly',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: { organizationId },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret || 'whsec_dummy',
      );
    } catch (err) {
      this.logger.error(
        `❌ Webhook signature verification failed: ${err.message}`,
      );
      throw new Error(`Webhook Error: ${err.message}`);
    }

    this.logger.log(`🔔 Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        await this.updateSubscription(subscription);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async updateSubscription(stripeSubscription: Stripe.Subscription) {
    const customerId = stripeSubscription.customer as string;
    const customer = (await this.stripe.customers.retrieve(
      customerId,
    )) as Stripe.Customer;
    const organizationId = customer.metadata.organizationId;

    if (!organizationId) {
      this.logger.error(
        `❌ No organizationId found in Stripe customer metadata: ${customerId}`,
      );
      return;
    }

    await (this.prisma as any).subscription.upsert({
      where: { organizationId },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        status: stripeSubscription.status.toUpperCase() as any,
        currentPeriodEnd: new Date(
          (stripeSubscription as any).current_period_end * 1000,
        ),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      create: {
        organizationId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        status: stripeSubscription.status.toUpperCase() as any,
        currentPeriodEnd: new Date(
          (stripeSubscription as any).current_period_end * 1000,
        ),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });

    this.logger.log(`✅ Subscription synchronized for Org: ${organizationId}`);
  }

  async getBillingStatus(organizationId: string) {
    const subscription = await (this.prisma as any).subscription.findUnique({
      where: { organizationId },
    });

    return {
      isPro: subscription?.status === 'ACTIVE',
      plan: subscription?.status === 'ACTIVE' ? 'PRO' : 'FREE',
      status: subscription?.status || 'NONE',
      currentPeriodEnd: subscription?.currentPeriodEnd,
    };
  }
}
