# ORI-OS Release Process (canonical)

This is the canonical release process for the current Hostinger VPS topology.
The public reverse proxy is the **host nginx** shared by the ORI ecosystem;
ORI-OS must never bind its own proxy to ports 80 or 443.

## Source of truth

- Canonical repository: `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0` locally and
  `/opt/orios-codex` on the VPS.
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

Install the delegated command once from the VPS root console as documented in
[RESTRICTED_DEPLOY.md](./RESTRICTED_DEPLOY.md). From the authorized workstation,
invoke it only with a full `main` commit SHA and exact GHCR image digests:

```powershell
$source = (gh api repos/a-bol3/ori-os-codex/commits/main --jq .sha)
ssh orios-vps "sudo -n /usr/local/sbin/orios-deploy-release --source $source --api <API_IMAGE@DIGEST> --worker <WORKER_IMAGE@DIGEST> --web <WEB_IMAGE@DIGEST>"
```

The restricted command does not build images, run migrations, alter firewall/SSH,
reboot, create snapshots, or touch Folga. It backs up `.env`, downloads the
three pinned images before changing `.env`, restarts only `api`, `worker` and
`web`, performs public health/readiness checks, restores the previous `.env`
and restarts those three services if activation/checks fail, and writes a
release manifest. Record evidence in `OPERATIONS_LEDGER.md`.

Verify at minimum:

```bash
curl -fsS https://api.orios.ori-craftlabs.com/health
curl -fsS https://api.orios.ori-craftlabs.com/ready
curl -fsSI https://orios.ori-craftlabs.com/login
```

Then inspect only the ORI-OS services:

```bash
docker compose -p orios-app \
  -f docker-compose.prod.yml \
  -f docker-compose.prod.release.yml \
  -f docker-compose.host-nginx.yml ps api worker web
```

## Rollback

Rollback is currently a controlled operator procedure, not an automatic
command. Keep the previous reviewed commit, exact image digests, `.env` backup,
and database backup available. Restore only after recording failure, then
invoke the restricted command with the previous verified commit and image
digests and run smoke checks again. Database migrations are not performed by
the restricted command; destructive schema rollback remains unauthorized
without a tested restore.

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
