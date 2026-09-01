# Staging Deployment Guide

This is the canonical staging procedure. Staging is a separate Compose
project and must never reuse production containers, volumes, network, ports or
environment files.

## Isolation contract

- Repository path: `/opt/orios-staging`.
- Compose project: `orios-staging`.
- Network: `orios-staging-network`.
- Volumes: `orios-staging-postgres-data`, `orios-staging-redis-data`,
  `orios-staging-meilisearch-data`, and `orios-staging-minio-data`.
- Local bindings: API `127.0.0.1:4200` and web `127.0.0.1:3200`.
- Environment file: `.env.staging`, never `.env.prod`.
- No Caddy container is included; staging routing belongs to the separately
  managed staging reverse proxy.

## One-time staging host setup

1. Provision an isolated staging host or isolated VM. Do not point this at the
   production VPS unless the volumes, Docker host and routing are separately
   isolated.
2. Clone the repository at `/opt/orios-staging` and check out `main`.
3. Copy `.env.staging.example` to `/opt/orios-staging/.env.staging`, replace
   every placeholder with staging-only values, and set mode `600`.
4. Install the restricted command for the staging operator:

   ```bash
   install -o root -g root -m 0750 scripts/orios-deploy-staging-release.sh \
     /usr/local/sbin/orios-deploy-staging-release
   ```

5. Configure the GitHub `staging` environment with dedicated
   `STAGING_VPS_*` secrets and the workflow's verified host key. Do not reuse
   the production SSH key.

## Release deployment

Publish the three images from the reviewed `main` commit, then dispatch
`Deploy staging` with the full commit SHA and all three full GHCR digest
references. The workflow synchronizes only `/opt/orios-staging` and invokes
the isolated command. The command pulls images before changing services,
runs migrations against the staging database, and checks local health and
readiness on ports 4200/3200.

For an authorized operator running locally on the staging host:

```bash
./scripts/deploy-staging.sh \
  --source <full-main-sha> \
  --api ghcr.io/a-bol3/ori-os-api@sha256:<64-hex> \
  --worker ghcr.io/a-bol3/ori-os-worker@sha256:<64-hex> \
  --web ghcr.io/a-bol3/ori-os-web@sha256:<64-hex>
```

## Post-deployment

Run the [Staging Smoke Test Checklist](./STAGING_SMOKE_TESTS.md), record the
commit, image digests and environment evidence, and only then promote the
same reviewed release to production.
