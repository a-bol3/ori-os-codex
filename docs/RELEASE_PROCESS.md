# ORI-OS Release Process (canonical)

This is the canonical release process for the current Hostinger VPS topology.
The public reverse proxy is the **host nginx** shared by the ORI ecosystem;
ORI-OS must never bind its own proxy to ports 80 or 443.

## Source of truth

- Canonical repository: `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0` locally and
  `/opt/orios-app` on the VPS.
- Public web: `https://orios.ori-craftlabs.com`.
- Public API: `https://api.orios.ori-craftlabs.com`.
- Compose files: `docker-compose.prod.yml` plus
  `docker-compose.host-nginx.yml`.
- Deployment entrypoint: `scripts/deploy-host-nginx.sh`.
- Detailed VPS routing and recovery: [HOSTINGER_ORIOS_DEPLOY.md](./HOSTINGER_ORIOS_DEPLOY.md).

Do not deploy from the nested `ori-os/` directory. Do not run the base
production compose file by itself on the shared VPS.

## Release states

1. **Development**: local Compose and test data only.
2. **Staging**: isolated environment with its own `.env`, database, volumes,
   domains and deployment project. Staging is not production and must not
   share customer data.
3. **Beta/production candidate**: a reviewed, immutable Git commit with the
   release checks below recorded as evidence.

The repository currently has no supported `deploy-prod.sh` entrypoint. Any
older document that references it is historical and must not be used.

## Release checks

Before creating a release tag:

```bash
npm ci
npm run db:generate --workspace=@ori-os/db
npm run build
npm run lint
npm run test
```

The CI workflow is the first gate. A release is blocked when any command
fails, when the working tree contains unreviewed changes, or when the commit
does not have a reproducible lockfile.

## VPS deployment

From `/opt/orios-app` on the VPS, after confirming the reviewed commit is
checked out and a database backup exists:

```bash
./scripts/deploy-host-nginx.sh
```

The script starts the stack with both Compose files, applies migrations and
checks local and public endpoints. Verify at minimum:

```bash
curl -fsS https://api.orios.ori-craftlabs.com/health
curl -fsS https://api.orios.ori-craftlabs.com/ready
curl -fsSI https://orios.ori-craftlabs.com/login
```

Check the service state and recent logs before declaring success:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.host-nginx.yml ps
docker compose -f docker-compose.prod.yml -f docker-compose.host-nginx.yml logs --tail=100 api web worker
```

## Rollback

Rollback is currently a controlled operator procedure, not an automated
`deploy-prod.sh --version` command. Keep the previous reviewed commit and
database backup available. Stop and restore only after recording the failure,
then redeploy the previous commit using the same host-nginx command and run
the smoke checks again. Database migrations must be backward-compatible; a
destructive schema rollback is not authorized without a tested restore.

See [ROLLBACK_PLAN.md](./ROLLBACK_PLAN.md) for the evidence required before a
rollback is considered complete.

## Versioning

Use Semantic Versioning and annotate the reviewed commit with an annotated
tag, for example:

```bash
git tag -a v0.1.0-beta.1 <reviewed-commit> -m "ORI-OS beta candidate"
git push origin v0.1.0-beta.1
```

Production distribution remains blocked until the beta acceptance criteria,
backup restore drill, tenant isolation checks and credential-rotation gate
are all complete.
