# ORI-OS protected production deployment

This document describes the controlled production path for ORI-OS on the
Hostinger VPS. The deployment is manual, pinned to immutable image digests,
and protected by the GitHub `production` environment.

## Protection model

- The workflow runs only when manually dispatched from `main`.
- It requires one full `main` commit SHA and one exact GHCR digest for each of
  API, worker and web.
- GitHub requires approval from the configured `production` environment
  reviewer before secrets are released to the job.
- The VPS accepts only the restricted `orios-deploy-release` command through
  `sudo -n`; the workflow cannot run arbitrary shell commands.
- The workflow does not build images, run migrations, alter firewall or SSH
  settings, reboot the VPS, or touch the other applications on the server.

## Required production environment secrets

Create these under **Settings → Environments → production → Environment
secrets**. Do not put private keys or VPS credentials in repository files.

| Secret | Value |
| --- | --- |
| `VPS_HOST` | `82.29.178.113` |
| `VPS_PORT` | `22` |
| `VPS_USER` | `orios-deploy` |
| `VPS_SSH_PRIVATE_KEY` | The complete private key for the dedicated GitHub Actions key |
| `VPS_SSH_KNOWN_HOSTS` | The verified `ssh-keyscan -H 82.29.178.113` output |

The private key must never be pasted into chat, a pull request, a log, or the
repository.

## Create and install the dedicated SSH key

Run these commands in Windows PowerShell on the authorized workstation:

```powershell
ssh-keygen -t ed25519 -C "github-actions-orios-production" -f "$env:USERPROFILE\.ssh\orios_github_actions"
Get-Content "$env:USERPROFILE\.ssh\orios_github_actions.pub"
ssh-keyscan -H 82.29.178.113
```

Copy only the public key into the VPS root web console. Do not copy the private
key there. In the VPS console, run:

```bash
install -d -m 700 -o orios-deploy -g orios-deploy /home/orios-deploy/.ssh
printf '%s\n' 'PASTE_PUBLIC_KEY_HERE' >> /home/orios-deploy/.ssh/authorized_keys
chown orios-deploy:orios-deploy /home/orios-deploy/.ssh/authorized_keys
chmod 600 /home/orios-deploy/.ssh/authorized_keys
```

Test the dedicated key locally before adding it to GitHub:

```powershell
ssh -i "$env:USERPROFILE\.ssh\orios_github_actions" `
  -o IdentitiesOnly=yes `
  orios-deploy@82.29.178.113 `
  "sudo -n /usr/local/sbin/orios-status"
```

The test must print the ORI-OS status and must not ask for a VPS password. If
it fails, stop and repair the key or sudo configuration before configuring the
workflow secrets.

## First deployment

1. Run **Actions → Publish release images → Run workflow** on `main`.
2. Record the resulting `main` SHA and the three `sha256:` digests shown by
   the API, worker and web jobs.
3. Run **Actions → Deploy production → Run workflow** from `main`.
4. Enter the full 40-character source SHA and the three complete image
   references, for example `ghcr.io/a-bol3/ori-os-api@sha256:...`.
5. Approve the `production` deployment when GitHub requests the configured
   reviewer.
6. Confirm the job output, then perform the browser smoke test and record the
   evidence in `OPERATIONS_LEDGER.md`.

Required smoke checks:

```bash
curl -fsS https://api.orios.ori-craftlabs.com/health
curl -fsS https://api.orios.ori-craftlabs.com/ready
curl -fsSI https://orios.ori-craftlabs.com/login
```

## Rollback

Use the same workflow with the previous reviewed source SHA and the previous
verified API, worker and web digests. Keep the database backup, previous
manifest and current evidence available before approving a rollback. The
restricted command does not perform destructive database rollback.

## Operating rule

The GitHub environment protects the workflow; it does not grant Codex or any
chat session access to your secrets. Secrets remain in GitHub, and the
deployment job receives them only after the environment approval gate passes.

