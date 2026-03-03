import { z } from 'zod';

export const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
    OPENAI_API_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    SLACK_WEBHOOK_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_PUBLIC_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRO_PRICE_ID: z.string().optional(),
    PORT: z.string().default('3001'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .refine(
    (data) => {
      // In production, require critical keys
      if (data.NODE_ENV === 'production') {
        const missingKeys: string[] = [];
        if (!data.STRIPE_SECRET_KEY) missingKeys.push('STRIPE_SECRET_KEY');
        if (!data.NEXTAUTH_SECRET) missingKeys.push('NEXTAUTH_SECRET');

        if (missingKeys.length > 0) {
          console.error(`❌ Production requires: ${missingKeys.join(', ')}`);
          return false;
        }
      }
      return true;
    },
    {
      message: 'Missing required production environment variables',
    },
  );

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    // In production, we might want to throw an error and stop
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
  }

  return result.data;
}
