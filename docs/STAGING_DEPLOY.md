# Staging Deployment Guide

This guide outlines the process for deploying Ori-OS to the staging environment.

## Prerequisites
- Docker and Docker Compose installed on the staging server.
- Proper DNS records for `staging.ori-craftlabs.com` and `staging-api.ori-craftlabs.com`.
- SSL certificates (managed by Caddy).

## Environment Setup
1. Copy `.env.staging.example` to `.env` on the staging server.
2. Update all secrets and URLs to match the staging infrastructure.

## Deployment Steps
Use the automated deployment script:
```bash
chmod +x ./scripts/deploy-staging.sh
./scripts/deploy-staging.sh
```

## Post-Deployment
After deployment, follow the [Staging Smoke Test Checklist](./STAGING_SMOKE_TESTS.md) to verify the build.
