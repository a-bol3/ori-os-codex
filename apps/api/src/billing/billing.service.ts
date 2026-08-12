import {  Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@ori-os/db/nestjs';
import { fixtureMode, ProviderConfigurationError } from '@ori-os/core';
import Stripe from 'stripe';

type BillingOrganizationRecord = {
  id: string;
  name: string;
  subscription: {
    stripeCustomerId?: string | null;
  } | null;
};

type BillingSubscriptionRecord = {
  status?: string | null;
  currentPeriodEnd?: Date | null;
};

type OrganizationModel = {
  findUnique: (args: unknown) => Promise<BillingOrganizationRecord | null>;
};

type SubscriptionModel = {
  upsert: (args: unknown) => Promise<unknown>;
  findUnique: (args: unknown) => Promise<BillingSubscriptionRecord | null>;
};

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;
  private readonly stripeConfigured: boolean;
  private readonly logger = new Logger(BillingService.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    this.stripeConfigured = Boolean(stripeSecretKey);

    if (!this.stripeConfigured && fixtureMode('ENABLE_BILLING_FIXTURES')) {
      this.logger.warn(
        'Stripe billing fixture mode is enabled (development/test only).',
      );
    }

    this.stripe = new Stripe(
      stripeSecretKey || 'sk_test_dev_placeholder_not_for_production',
      {
      apiVersion: '2025-01-27-preview' as never,
      },
    );
  }

  private get organizationModel(): OrganizationModel {
    return (this.prisma as unknown as { organization: OrganizationModel })
      .organization;
  }

  private get subscriptionModel(): SubscriptionModel {
    return (this.prisma as unknown as { subscription: SubscriptionModel })
      .subscription;
  }

  async createCheckoutSession(organizationId: string, returnUrl: string) {
    if (!this.stripeConfigured) {
      if (!fixtureMode('ENABLE_BILLING_FIXTURES')) {
        throw new ProviderConfigurationError(
          'Stripe',
          'STRIPE_SECRET_KEY is not configured; billing checkout is unavailable.',
        );
      }

      return {
        url: `${returnUrl}?billing_simulated=true&organizationId=${encodeURIComponent(
          organizationId,
        )}`,
        simulated: true,
      };
    }

    const organization = await this.organizationModel.findUnique({
      where: { id: organizationId },
      include: { subscription: true },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    let customerId = organization.subscription?.stripeCustomerId ?? undefined;

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
          price: this.requireEnv('STRIPE_PRO_PRICE_ID'),
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
    if (!this.stripeConfigured) {
      if (!fixtureMode('ENABLE_BILLING_FIXTURES')) {
        throw new ProviderConfigurationError(
          'Stripe',
          'STRIPE_SECRET_KEY is not configured; billing webhooks are unavailable.',
        );
      }

      this.logger.warn(
        'Received Stripe webhook in fixture mode without Stripe configuration. Ignoring payload.',
      );
      return { simulated: true };
    }

    const webhookSecret = this.requireEnv('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown webhook error';
      this.logger.error(`Webhook signature verification failed: ${message}`);
      throw new Error(`Webhook Error: ${message}`);
    }

    this.logger.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.updateSubscription(subscription);
        break;
      }
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
        `No organizationId found in Stripe customer metadata: ${customerId}`,
      );
      return;
    }

    const currentPeriodEnd = new Date(
      ((
        stripeSubscription as Stripe.Subscription & {
          current_period_end: number;
        }
      ).current_period_end ?? 0) * 1000,
    );

    await this.subscriptionModel.upsert({
      where: { organizationId },
      update: {
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        status: stripeSubscription.status.toUpperCase(),
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
      create: {
        organizationId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        stripePriceId: stripeSubscription.items.data[0]?.price.id,
        status: stripeSubscription.status.toUpperCase(),
        currentPeriodEnd,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    });

    this.logger.log(`Subscription synchronized for Org: ${organizationId}`);
  }

  async getBillingStatus(organizationId: string) {
    const subscription = await this.subscriptionModel.findUnique({
      where: { organizationId },
    });

    return {
      isPro: subscription?.status === 'ACTIVE',
      plan: subscription?.status === 'ACTIVE' ? 'PRO' : 'FREE',
      status: subscription?.status || 'NONE',
      currentPeriodEnd: subscription?.currentPeriodEnd,
    };
  }

  private requireEnv(
    name: 'STRIPE_SECRET_KEY' | 'STRIPE_PRO_PRICE_ID' | 'STRIPE_WEBHOOK_SECRET',
  ): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`${name} is required`);
    }

    return value;
  }
}
