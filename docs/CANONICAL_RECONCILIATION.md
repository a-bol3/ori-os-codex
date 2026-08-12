# ORI-OS canonical repository reconciliation

## Decision

As of 2026-08-12, `https://github.com/a-bol3/ori-os-codex` is the canonical
repository for ORI-OS. The previous repositories remain historical sources
until the migration has been verified.

## Canonical deployment source

- Local source: `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0`
- GitHub source: `a-bol3/ori-os-codex`
- VPS source: `/opt/orios-app`
- Public web: `https://orios.ori-craftlabs.com`
- Public API: `https://api.orios.ori-craftlabs.com`

## Migration rules

1. Only reviewed application, infrastructure, test, and canonical documentation
   files are migrated.
2. Environment files, credentials, database dumps, deployment archives, logs,
   and operator scratch files are excluded.
3. Every VPS deployment must record the exact Git commit and image/service
   versions used.
4. The previous repositories are not deleted as part of this migration.

## Current status

- The local working tree contains the August reconciliation changes.
- The new GitHub repository is reachable and currently has no advertised
  branch ref.
- GitHub CLI is not installed in the current environment; repository writes
  will use the authenticated Git remote when available, while pull-request
  creation remains a separate step.

## Required evidence before VPS cutover

- clean canonical commit;
- passing install, lint, build, and test checks;
- exact deployed commit recorded on the VPS;
- health and readiness checks passing;
- backup and restore evidence;
- rollback evidence;
- production smoke-test evidence.
