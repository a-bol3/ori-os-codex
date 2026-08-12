# ORI-OS deployment on the existing Hostinger VPS

This guide is for the current VPS topology where:

- nginx on the host already owns ports 80 and 443
- `ori-craftlabs.com` and `app.ori-craftlabs.com` already exist
- ORI-OS must be isolated on:
  - `orios.ori-craftlabs.com`
  - `api.orios.ori-craftlabs.com`

## Deployment model

For release gates, tagging, smoke tests and rollback, use the canonical [RELEASE_PROCESS.md](./RELEASE_PROCESS.md). This guide is limited to the Hostinger VPS routing, compose overlays and recovery checks.

ORI-OS does **not** publish its own public reverse proxy on this VPS.

Instead:

- the ORI-OS web container listens on `127.0.0.1:3100`
- the ORI-OS api container listens on `127.0.0.1:4100`
- host nginx proxies the public domains to those local ports

## Files used

- `docker-compose.prod.yml`
- `docker-compose.host-nginx.yml`
- `.env.prod`
- `scripts/deploy-host-nginx.sh`

## Canonical source tree

Deploy only from the canonical repository root:

- `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0` locally
- `/opt/orios-app` on the VPS

Do **not** build or deploy from the nested `ori-os/` directory. That nested
tree is a non-canonical import source kept only for selective reconciliation
work. If you build there and deploy from here, web and API behavior can drift
and the result becomes hard to diagnose.

## Golden rule

On this VPS, do not deploy ORI-OS with `docker-compose.prod.yml` alone.

Always deploy with the host nginx override as well, because that override is
what publishes:

- `127.0.0.1:3100 -> web`
- `127.0.0.1:4100 -> api`

If those bindings are missing, nginx will return `502 Bad Gateway` even while
the containers themselves are healthy inside Docker.

## Recommended deploy command

From `/opt/orios-app` on the VPS:

```bash
./scripts/deploy-host-nginx.sh
```

This script builds the stack, starts it with the Hostinger override, runs
migrations, verifies local bindings, and then checks the public endpoints.

## Manual recovery for 502 on Hostinger

If `orios.ori-craftlabs.com` returns `502 Bad Gateway`, run:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.host-nginx.yml down
docker compose -f docker-compose.prod.yml -f docker-compose.host-nginx.yml up -d
```

Then verify:

```bash
docker inspect ori-os-web --format '{{json .NetworkSettings.Ports}}'
docker inspect ori-os-api --format '{{json .NetworkSettings.Ports}}'
curl -I http://127.0.0.1:3100/login
curl -I http://127.0.0.1:4100/health
```

Expected bindings:

- `3000/tcp -> 127.0.0.1:3100`
- `4000/tcp -> 127.0.0.1:4100`

## Admin credential recovery

If the admin can no longer sign in, run the reset script from the app root:

```bash
node scripts/reset-admin-password.mjs --email=admin@ori-os.com --password='replace-with-strong-password'
```

Optional:

```bash
node scripts/reset-admin-password.mjs --email=admin@ori-os.com --password='replace-with-strong-password' --org=ori-labs
```

## Required domains

- `orios.ori-craftlabs.com`
- `api.orios.ori-craftlabs.com`

## Required nginx routing

- `orios.ori-craftlabs.com` -> `http://127.0.0.1:3100`
- `api.orios.ori-craftlabs.com` -> `http://127.0.0.1:4100`

## Important

Do not expose ORI-OS caddy on ports 80 or 443 on this VPS.
