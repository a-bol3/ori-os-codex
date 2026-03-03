# Production Setup Guide

This document outlines the necessary environment variables and the database migration strategy for deploying Ori-OS to production using Docker and Caddy.

## Required Environment Variables

Create a `.env.prod` file on your server. Ensure these are set with strong, unique values.

### Infrastructure
- `POSTGRES_USER`: Database username.
- `POSTGRES_PASSWORD`: Database password.
- `POSTGRES_DB`: Database name (e.g., `ori_os_prod`).
- `DATABASE_URL`: `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public`
- `REDIS_URL`: `redis://redis:6379`
- `MEILI_MASTER_KEY`: Master key for MeiliSearch.
- `MINIO_ROOT_USER`: Admin user for MinIO.
- `MINIO_ROOT_PASSWORD`: Admin password for MinIO.

### Web & API
- `APP_DOMAIN`: Your primary domain (e.g., `ori-craftlabs.com`).
- `ACME_EMAIL`: Email for Let's Encrypt SSL certificates.
- `NEXT_PUBLIC_APP_URL`: `https://${APP_DOMAIN}`
- `NEXT_PUBLIC_API_URL`: `https://api.${APP_DOMAIN}`
- `NEXTAUTH_URL`: `https://${APP_DOMAIN}`
- `NEXTAUTH_SECRET`: Generate using `openssl rand -base64 32`.
- `JWT_SECRET`: Generate using `openssl rand -base64 32`.
- `ENCRYPTION_KEY`: 32-byte hex key for sensitive data.
- `ENCRYPTION_MASTER_KEY`: 32-byte hex key.

### External (Optional but recommended)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For OAuth.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: For OAuth.
- `RESEND_API_KEY`: For transactional emails.

## Database Migration Strategy

In production, we use `prisma migrate deploy` to apply pending migrations without resetting the database.

### Initial Migration
When deploying for the first time:
```bash
docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @ori-os/db prisma migrate deploy
```

### Subsequent Updates
1. Deploy new code.
2. Run the migration command above to apply schema changes.

## Deployment Steps

1. **SSH into your VPS.**
2. **Clone the repository.**
3. **Configure `.env`**: Copy `.env.example` to `.env` and fill in the production values.
4. **Build and Start**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
5. **Verify**: Check `https://${APP_DOMAIN}/health` and logs.
