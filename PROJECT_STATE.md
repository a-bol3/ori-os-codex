# ORI-OS Project State

> This file is the recovery starting point when a Codex, browser, VPS, or chat session is lost.

## Last verified

- Date: 2026-08-13
- Local repository: `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0`
- Canonical remote: `https://github.com/a-bol3/ori-os-codex.git`
- Local branch: `codex/foundation-canonicalization`
- Local and `origin/main` at last inspection: `a3a60e1`
- Public web: `https://orios.ori-craftlabs.com`
- Public API: `https://api.orios.ori-craftlabs.com`

## Current truth

| Area | State | Evidence / next proof |
|---|---|---|
| Source repository | Recoverable | Local Git history and canonical remote |
| Web availability | Passing | `/dashboard` redirects to `/login` |
| API health | Passing | `/health` returned HTTP 200 |
| API readiness | Passing | `/ready` returned DB and Redis `ok` |
| GitHub Actions | Failing | Run `31601187077`; local build/tests now pass, CI log still pending |
| VPS identity | Unknown | Confirm deployed commit and compose state |
| Backups | Not accepted | Perform a real restore drill |
| Production certification | Blocked | See `docs/PRODUCTION_READINESS_CHECKLIST.md` |

## Active blockers

1. Capture the complete GitHub Actions log and isolate checkout, build, lint, and test failures.
2. Confirm the commit actually deployed at `/opt/orios-app` on the VPS.
3. Verify PostgreSQL backup storage and restore into an isolated database.
4. Review firewall, SSH, CPU limitation, monitoring, and external backup posture.
5. Reconcile historical “ready” documents with the canonical beta-readiness documents.

## Local verification on 2026-08-13

- `npm ci`: passed.
- Prisma generation: passed.
- Build: passed across all 5 build tasks.
- Tests: passed across API, web, and worker (41 API suites, 5 web files, 4 worker suites).
- Lint: still failing on repository-wide Prettier line-ending differences and existing warnings/errors.

## GitHub Actions evidence

- Run 10 (`31601187077`) on `main` at `a3a60e1`: checkout, npm install, and Prisma generation passed.
- Run 10 failed at `Build all workspaces`; lint and tests were skipped.
- Runs 5, 6, 7, 8, 9, and 10 all failed at the same build step.
- The local build now passes after a clean `npm ci`; remote reproducibility still requires a pushed commit and a new run.

## Recovery points

See `docs/BLOCK_0_CANONICALIZATION.md` for the preserved Git bundle, working-tree archive, and SHA-256 hashes.

## Operating rule

The chat is not the source of truth. Git, this file, `OPERATIONS_LEDGER.md`, and evidence committed under `docs/EVIDENCE/` are the source of truth.
