import { validateEnv } from './env.schema';

describe('api env schema', () => {
  it('accepts a minimal development environment', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'https://database.example.com',
        NODE_ENV: 'development',
      }),
    ).not.toThrow();
  });

  it('rejects missing production secrets', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'https://database.example.com',
        NODE_ENV: 'production',
        JWT_SECRET: 'jwt-secret',
      }),
    ).toThrow('Invalid environment variables');
  });

  it('accepts a complete production environment', () => {
    expect(() =>
      validateEnv({
        DATABASE_URL: 'https://database.example.com',
        NODE_ENV: 'production',
        JWT_SECRET: 'jwt-secret',
        NEXTAUTH_SECRET: 'nextauth-secret',
        STRIPE_SECRET_KEY: 'sk_live_value',
        STRIPE_WEBHOOK_SECRET: 'whsec_live_value',
        STRIPE_PRO_PRICE_ID: 'price_live_value',
        API_BASE_URL: 'https://api.example.com',
        FRONTEND_URL: 'https://app.example.com',
        FROM_EMAIL: 'hello@example.com',
        RESEND_API_KEY: 're_live_value',
        IMAP_HOST: 'imap.hostinger.com',
        IMAP_PORT: '993',
        IMAP_USER: 'business@example.com',
        IMAP_PASSWORD: 'imap-password',
      }),
    ).not.toThrow();
  });
});
