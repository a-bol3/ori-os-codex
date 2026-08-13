# ORI-OS Operations Ledger

Append one entry for every VPS, deployment, backup, rollback, or production configuration action.

## 2026-08-13 — baseline verification

- Operator: Codex with project owner
- Repository: `a-bol3/ori-os-codex`
- Local/reference commit: `a3a60e1`
- Public web: `/dashboard` redirected to `/login`
- API `/health`: HTTP 200
- API `/ready`: HTTP 200; database and Redis reported `ok`
- GitHub Actions: run `31601187077` failed during the quality job; full logs pending
- VPS panel evidence: running Ubuntu 24.04; CPU limitation alert; 34/50 GB disk; 2 snapshots/backups shown; firewall count shown as 0
- Deployment commit: not yet confirmed
- Backup restore: not yet tested
- Rollback: documented as controlled operator procedure, not automated
- Result: `NEEDS_REVIEW`
- Next action: capture CI logs and reconcile VPS commit/state

## 2026-08-13 — local reproducibility gate

- `npm ci`: passed; lockfile install completed with 43 audit findings
- Prisma client generation: passed
- `npm run build`: passed; all 5 build tasks completed
- `npm run test`: passed; API 41 suites / 102 tests, web 5 files / 12 tests, worker 4 suites / 18 tests
- `npm run lint`: failed; existing Prettier line-ending violations across the tree plus unused imports/warnings
- Fix applied: failed refresh-token lookup now falls back to the original visible 401 `ApiError`
- Fix applied: updated AuthService login test fixture for persisted sessions
- Result: `NEEDS_REVIEW`
- Next action: obtain GitHub Actions logs and decide whether to normalize line endings/configuration in a dedicated change

## 2026-08-13 — GitHub Actions pattern confirmed

- Public Actions API inspected for runs 5–10 on `main`.
- All six runs failed at `Build all workspaces`.
- Run 10 (`31601187077`) passed checkout, dependency installation, and Prisma generation; lint and tests were skipped after the build failure.
- This makes the remote build the primary CI blocker; the local clean-install build now passes and must be rechecked remotely on a new commit.

## 2026-08-13 — CI root cause and fix

- PR #1 run 11 (`31678856312`) failed in `apps/web` during Next.js page-data collection.
- Root cause: `apps/web/src/auth.ts` requires `AUTH_SECRET` or `NEXTAUTH_SECRET`; the CI environment only declared `NEXTAUTH_SECRET`, but the effective web build environment did not expose a usable secret.
- Evidence: `Error: AUTH_SECRET or NEXTAUTH_SECRET is required outside development` for `/api/auth/[...nextauth]`.
- Fix: add the same non-production placeholder as explicit `AUTH_SECRET` in `.github/workflows/ci.yml`.
- Local web build with CI variables: passed.
- Next action: push the workflow fix and verify the new PR run.
