# Production Environment Variables for ORI-OS
# Grouped by component

## Infrastructure
- `DATABASE_URL`: Full PostgreSQL connection string (Postgres 16+)
- `REDIS_URL`: Redis connection URL (Redis 7+)
- `MEILISEARCH_HOST`: URL for Meilisearch instance
- `MEILISEARCH_API_KEY`: Production master key
- `S3_ENDPOINT`: S3-compatible backend (MinIO or AWS S3)
- `S3_ACCESS_KEY`: Access credentials
- `S3_SECRET_KEY`: Secret credentials

## Web Application (@ori-os/web)
- `NEXT_PUBLIC_APP_URL`: e.g. https://ori-os.ori-craftlabs.com
- `NEXT_PUBLIC_API_URL`: e.g. https://api.ori-os.ori-craftlabs.com
- `NEXTAUTH_URL`: Same as APP_URL
- `NEXTAUTH_SECRET`: Used for session encryption
- `ORI_AUTH_BYPASS`: MUST be 0

## API & Worker (@ori-os/api, @ori-os/worker)
- `PORT`: 4000
- `JWT_SECRET`: Used for user authentication tokens
- `ENCRYPTION_KEY`: 32-byte hex for data-at-rest encryption
- `ENCRYPTION_MASTER_KEY`: 32-byte hex for master key derivation
- `WEBHOOK_SECRET`: For validating incoming webhooks (Stripe, etc.)

## Third-Party Credentials
- `GOOGLE_CLIENT_ID/SECRET`: Obtain from Google Cloud Console (OAuth)
- `STRIPE_SECRET_KEY`: Obtain from Stripe Dashboard (API Keys)
- `OPENAI_API_KEY`: Obtain from OpenAI Dashboard
- `SENTRY_DSN`: Obtain from Sentry.io Project Settings

## Credential Locations
- **Postgres/Redis**: Self-hosted or Managed (DigitalOcean/AWS)
- **Stripe**: [Dashboard](https://dashboard.stripe.com/test/apikeys)
- **Email**: [Resend](https://resend.com/api-keys) or [Mailgun](https://app.mailgun.com/app/dashboard)
- **Google**: [GCP Console](https://console.cloud.google.com/apis/credentials)
