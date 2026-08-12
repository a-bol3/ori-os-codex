import { z } from 'zod';

const baseEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^\d+$/).optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  IMAP_HOST: z.string().optional(),
  IMAP_PORT: z.string().regex(/^\d+$/).optional(),
  IMAP_USER: z.string().email().optional(),
  IMAP_PASSWORD: z.string().optional(),
  IMAP_SECURE: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  ORI_AUTH_BYPASS: z.string().optional(),
  AUTH_BYPASS: z.string().optional(),
  ORI_DEV_USER_ID: z.string().optional(),
  ORI_DEV_ORGANIZATION_ID: z.string().optional(),
  ORI_DEV_USER_EMAIL: z.string().email().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  API_BASE_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
  API_PORT: z.string().regex(/^\d+$/).optional(),
  PORT: z.string().regex(/^\d+$/).default('3001'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  ENABLE_AI_SIMULATION: z.enum(['true', 'false']).default('false'),
  ENABLE_EMAIL_FIXTURES: z.enum(['true', 'false']).default('false'),
  ENABLE_BILLING_FIXTURES: z.enum(['true', 'false']).default('false'),
  ENABLE_SEO_FIXTURES: z.enum(['true', 'false']).default('false'),
  ENABLE_EXTERNAL_AI_PII: z.enum(['true', 'false']).default('false'),
  ENABLE_TEST_BENCH: z.enum(['true', 'false']).default('false'),
});

export const envSchema = baseEnvSchema.superRefine((data, ctx) => {
  if (data.NODE_ENV !== 'production') {
    return;
  }

  const requiredInProduction: Array<keyof z.infer<typeof baseEnvSchema>> = [
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRO_PRICE_ID',
    'API_BASE_URL',
    'FRONTEND_URL',
    'FROM_EMAIL',
    'RESEND_API_KEY',
    'IMAP_HOST',
    'IMAP_PORT',
    'IMAP_USER',
    'IMAP_PASSWORD',
  ];

  for (const key of requiredInProduction) {
    if (!data[key]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${key} is required in production`,
        path: [key],
      });
    }
  }

  for (const key of [
    'ENABLE_AI_SIMULATION',
    'ENABLE_EMAIL_FIXTURES',
    'ENABLE_BILLING_FIXTURES',
    'ENABLE_SEO_FIXTURES',
    'ENABLE_EXTERNAL_AI_PII',
    'ENABLE_TEST_BENCH',
  ] as const) {
    if (data[key] === 'true') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${key} must be false in production`,
        path: [key],
      });
    }
  }
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv = process.env): Env {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }

  return result.data;
}
