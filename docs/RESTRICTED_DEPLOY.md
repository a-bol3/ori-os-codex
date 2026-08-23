# ORI-OS restricted deployment

This is the only delegated deployment path for the current ORI-OS private
beta. It deploys three immutable GHCR images to the existing Hostinger stack:
the API, worker and web services.

The command verifies that the VPS is on `main`, that the checked-out commit
matches both `origin/main` and the supplied full commit SHA, and that the
working tree is clean. It backs up the root-only `.env`, updates only the
three `ORI_OS_*_IMAGE` entries, pulls the exact digests, restarts only `api`,
`worker` and `web`, checks the containers, and verifies public `/health` and
`/ready`. It writes a non-secret release manifest under
`/var/lib/orios/release-manifests`.

It deliberately does not build images, run migrations, change firewall or SSH
settings, reboot the VPS, create or restore snapshots, touch PostgreSQL
backups, or operate the Folga project.

## One-time installation from the VPS root console

Run this only in the Hostinger web console while logged in as `root`, from the
canonical repository directory:

```bash
cd /opt/orios-codex
install -o root -g root -m 0750 scripts/orios-deploy-release.sh /usr/local/sbin/orios-deploy-release
install -o root -g root -m 0440 /dev/stdin /etc/sudoers.d/orios-deploy-orios-release <<'EOF'
orios-deploy ALL=(root) NOPASSWD: /usr/local/sbin/orios-deploy-release *
EOF
visudo -cf /etc/sudoers.d/orios-deploy-orios-release
/usr/local/sbin/orios-deploy-release --help
```

The installation changes only the new command and its narrowly scoped sudo
rule. It does not run a deployment.

## Delegated release invocation

From the authorized workstation PowerShell session, obtain the full commit
SHA from GitHub and pass the three exact image references from the successful
`Publish release images` workflow:

```powershell
$source = gh api repos/a-bol3/ori-os-codex/commits/main --jq .sha
ssh orios-vps "sudo -n /usr/local/sbin/orios-deploy-release --source $source --api <API_IMAGE@DIGEST> --worker <WORKER_IMAGE@DIGEST> --web <WEB_IMAGE@DIGEST>"
```

Replace each placeholder with a complete reference such as
`ghcr.io/a-bol3/ori-os-api@sha256:<64 hex characters>`. Never use `latest`, a
short SHA, a mutable tag, or a digest copied from a different workflow run.

If the command fails after `.env` is updated, it restores the previous
`.env` automatically and restarts only the ORI-OS API, worker and web
services. Preserve the printed backup path, inspect the failure, and use the
approved rollback procedure with a previously verified commit and image
digests if the release itself must be reverted.

After a successful run, record the source commit, three digests, backup path,
manifest path, health/readiness result and operator in `OPERATIONS_LEDGER.md`.

The older `scripts/deploy-host-nginx.sh` remains an operator-only historical
procedure because it builds locally and applies migrations. It is not part of
the delegated path.
