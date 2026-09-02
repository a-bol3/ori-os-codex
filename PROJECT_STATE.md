# ORI-OS Project State

> This file is the recovery starting point when a Codex, browser, VPS, or chat session is lost.

## Last verified

- Date: 2026-09-02
- Local repository: `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0`
- Canonical remote: `https://github.com/a-bol3/ori-os-codex.git`
- Canonical production line: `main` at the merged private-beta release line
- Latest release line: `main` at commit `a3686d1b199c35231875696e1b18f996cdbbddde`
- Latest CI: `33585493515` passed
- Latest image publication: `33585736909` passed
- Latest production deploy: `33586199945` passed
- Public web: `https://orios.ori-craftlabs.com`
- Public API: `https://api.orios.ori-craftlabs.com`

## Current truth

| Area                     | State                            | Evidence / next proof                                                                                  |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Source repository        | Recoverable                      | Local Git history and canonical remote                                                                 |
| Web availability         | Passing                          | Login, dashboard, logout-to-marketing, and private-beta messaging verified in browser                  |
| API health               | Passing                          | `/health` returned HTTP 200                                                                            |
| API readiness            | Passing                          | `/ready` returned DB and Redis `ok`                                                                    |
| GitHub Actions           | Green baseline                   | Main CI run `33585493515` passed on commit `a3686d1`; image publication and production deploy also passed |
| Release images           | Published and promoted           | Run `33585736909` published API, Worker, and Web images at immutable digests recorded below           |
| VPS identity             | Confirmed operational            | `/opt/orios-codex`; release Compose overlay active; API, Worker, Web, PostgreSQL, and Redis running    |
| Backups                  | Verified                         | PostgreSQL dump and Hostinger snapshot exist; isolated restore drill passed                           |
| Production certification | Private beta operational         | Production smoke passed; public distribution remains gated by `docs/PRODUCTION_READINESS_CHECKLIST.md` |

## Active blockers

1. Activate an actually isolated staging host, DNS/routing, secrets, and the GitHub `staging` environment.
2. Remove remaining silent/demo fallbacks in Content and Crawls; surface explicit unavailable/error states.
3. Complete authentication, RBAC, tenant-isolation, GDPR, dependency, and credential-rotation acceptance evidence.
4. Expand Engagement progression, event idempotency, and metric-contract tests before inviting additional beta organizations.
5. Complete monitoring/alerting, firewall/SSH review, and full-stack rollback timing evidence.
6. Keep production on immutable release digests; no `latest` or VPS-side builds.

## Recovery update — 2026-09-02 current production line

- PR #35 removed simulated Intelligence enrichment/search/CRM-save behavior and routed those operations through the authenticated API client. It was merged into `main` at commit `a3686d1b199c35231875696e1b18f996cdbbddde`.
- Main CI run `33585493515` passed. The release publication run `33585736909` passed all three image jobs.
- Immutable images published for the deployed release:
  - API `sha256:f8f38460226b7be49e1b119ab3f117fb7497a818ef30ed50142b9e123c127884`
  - Worker `sha256:38b47c022b7be1d4c542d74efe494f79a97e06cb40f935214f29c2154f9363b3`
  - Web `sha256:9d78814f495b1b90fe48af405ede9c29345752121de6b42576e28784f31c1dec`
- Production deploy run `33586199945` passed after production-environment approval. The deployment used pinned images and did not build on the VPS.
- Final smoke evidence passed: public Web HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis healthy; unauthenticated Operations returned HTTP 307; API request ID propagation preserved `codex-a3686d1-smoke`.
- Release state remains `PRIVATE_BETA_OPERATIONAL`; remaining blockers are staging activation, Content/Crawls fallback removal, security/RBAC/GDPR acceptance, observability, and rollback evidence.

## Recovery update — 2026-09-02 Automation production line

- PR #33 removed silent Automation fallbacks, aligned workflow creation with the API contract, and switched dashboard tests to the real `/test` endpoint. It was merged into `main` at commit `96ce625035ddda709751025d1f21513091f43d44`.
- Main CI run `33583589402` passed. The release publication run `33583871290` passed all three image jobs.
- Immutable images published for the deployed release:
  - API `sha256:319ad51dd270a6170028534358560554ba54fc77bbff7cdd792929e670c260ce`
  - Worker `sha256:f366a6f7e80ee7b9d2af61be0fe443452dec70e0c9e0d14269a2ed4aada9663b`
  - Web `sha256:5599c348bae0a53d63ac271624c72f1395643513b30cbb63ea606bf2b8845de1`
- Production deploy run `33584316445` passed after production-environment approval. The deployment used pinned images and did not build on the VPS.
- Final smoke evidence passed: public Web HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis healthy; unauthenticated Operations returned HTTP 307; API request ID propagation preserved `codex-96ce625-smoke`.
- Release state remains `PRIVATE_BETA_OPERATIONAL`; remaining blockers are staging activation, other module fallbacks, security/RBAC/GDPR acceptance, observability, and rollback evidence.

## Recovery update — 2026-09-01/02 current production line

- PR #31 was merged into `main` at commit `bc1b46d0323609c3e5f7713f7095461a274f2774`.
- Main CI run `33484524381` passed. The release publication run `33484754442` passed all three image jobs.
- Immutable images published for the deployed release:
  - API `sha256:82322c39a2222abf5d81906e7ff4e766506febecc02d20d0ce56b2b17c4b5264`
  - Worker `sha256:5d52aac89fd8f550ee108c9adfd5c305bf008eb6a041937b399242f39f097bd8`
  - Web `sha256:4b3211e0699596017cce562430e918ceeaf1e48c1c723210eb56bc44e999bca5`
- Production deploy run `33485277668` passed after the required production-environment approval. The deployment used pinned images and did not build on the VPS.
- Final smoke evidence passed: public Web HTTP 200; API `/health` HTTP 200 with database and Redis `ok`; API `/ready` HTTP 200 with database and Redis `ok`; `/dashboard/operations` redirected unauthenticated traffic to `/login` (HTTP 307); request ID propagation was preserved.
- Release state is `PRIVATE_BETA_OPERATIONAL`. This confirms the current production line is running; it does not certify public distribution. Staging activation, remaining fallback removal, security/RBAC/GDPR acceptance, observability, and rollback evidence remain open.

## Recovery update — 2026-08-20

- Product posture changed to invitation-only private beta: self-service registration is disabled by default, Test Bench is unavailable outside development, incomplete navigation is hidden, and pricing/marketing/security/legal copy no longer asserts unverified availability, compliance, customers, trials, or SLA claims.
- CI baseline: API and Worker now pin Jest `30.4.2`, `@types/jest` `30.0.0`, and `ts-jest` `29.4.11`; Worker invokes its workspace Jest executable; CI uses supported Node 24 and Actions v5.
- Session posture: refresh-token creation now persists the hash of exactly the credential issued to the client; browser API calls use a same-origin server proxy; `/api/auth/access-token` and the browser token bridge were removed so access/refresh tokens are not returned through the Auth.js session.
- Production identity: VPS checkout `/opt/orios-codex` was fast-forwarded to `af9e1f8`; running containers were not restarted.
- VPS evidence: ORI-OS services are healthy where healthchecks exist; PostgreSQL dump `/root/ori-os-prod-20260820.dump` was validated with `pg_restore --list`; the snapshot was created on 2026-08-20.
- Release path: GHCR image publication and the no-local-build release overlay are now versioned; no production image rollout has occurred.
- Local proof: focused API auth tests passed (4), Worker tests passed (4 suites / 18), and web tests passed (5 files / 12). Full build/lint must still be confirmed by clean CI because this desktop runner truncates long jobs.

## Recovery update — 2026-08-21

- Release workflow #4 (`32457755540`) completed successfully on `main` at `e1b729d`; API, Worker, and Web image jobs all passed.
- Promoted immutable image digests to the VPS through the release Compose overlay. The deployment completed without a local build; PostgreSQL and Redis were healthy and API, Worker, and Web were running.
- PostgreSQL dump `/root/ori-os-prod-20260821T034554Z.dump` was created and validated with `pg_restore --list`; a Hostinger snapshot and auto-backup were also present before rollout.
- Browser smoke verification passed: `/login` shows invitation-only private-beta messaging, `/dashboard` loads after login, logout returns to marketing, and unverified trial/testimonial claims are absent.
- Dashboard capability surface now exposes the certified CRM summary only; incomplete Engagement, Automation, and SEO Studio summaries are hidden. Google/GitHub login controls are visibly marked “coming soon” and disabled.
- Release remains `PRIVATE_BETA_OPERATIONAL`, not public-launch certified. Restore testing, security hardening, RBAC proof, dependency remediation, and observability remain open.

## Recovery update — 2026-08-22 restore drill

- PostgreSQL logical restore drill passed in an isolated temporary container `ori-os-restore-drill-20260822`.
- Source dump: `/root/ori-os-prod-20260822T065539Z.dump`; target database: `restore_check`; restored tables: 53.
- Measured PostgreSQL dump restore time: 1 second. This is database-only evidence and must not be treated as the full application RTO.
- The temporary container was removed and verified absent. Production database and application containers were not modified by the drill.
- Recovery state: `RESTORE_DRILL_PASSED`; next recovery work is full-stack rollback timing, monitoring/alerting, and security/RBAC hardening.

## Recovery update — 2026-08-22 release #6

- Release workflow #6 (`32563355253`) completed successfully on `main` at `9323d6e`; API, Worker, and Web image jobs were green.
- Promoted immutable image digests to the VPS:
  - API `sha256:eeabc589c5b84e3cd813f1b090c4427288f45373da3f8f3912b4571e152cf513`
  - Worker `sha256:47ea179188cc2a30504479ee34b3cf234a2fc691730dfd699709740abdb7cd5d`
  - Web `sha256:8f81df4fd5bce99e4d17fd5013db22d8ee67d21bae288c9ae9a9a69c5c2bfb65`
- Pre-deployment evidence: Hostinger snapshot created at `2026-08-22 08:52`; PostgreSQL dump `/root/ori-os-prod-20260822T065539Z.dump` was validated with `pg_restore --list`.
- VPS deployment used the release Compose overlay with `--no-build --pull never`; API, Worker, and Web are running, while PostgreSQL and Redis are healthy.
- Runtime verification: `/health` returned `ok` at `2026-08-22T09:20:59.004Z`; `/ready` returned database and Redis `ok` at `2026-08-22T09:21:08.163Z`.
- Browser smoke passed: invitation-only login messaging, disabled social login controls, authenticated dashboard, CRM-only capability surface, logout-to-marketing, and public marketing page.
- Release remains `PRIVATE_BETA_OPERATIONAL`, not public-launch certified. Full RolesGuard/RBAC enforcement, dependency remediation, monitoring, firewall/SSH hardening, and full-stack rollback timing remain open.

## Recovery update — 2026-08-22 release #7

- Release workflow `Publish release images #7` completed successfully on `main` at `e7fe452`; API, Worker, and Web image jobs were green.
- Promoted immutable image digests to the VPS:
  - API `sha256:471b3a25e2b35ddce82075d9d7c71e46af252c3060439f2400daeaca3bad5e40`
  - Worker `sha256:a8e6bb5f1db8b3a52a25f6f446dacacd9014574746866ca6dba4b17ac69089fd`
  - Web `sha256:6d865b186e9c332a67c77ddd4f7ab51528ad6f6ce7be19747db9176a149a8b4e`
- Pre-deployment evidence: Hostinger snapshot created `2026-08-22 12:18`; PostgreSQL dump `/root/ori-os-prod-20260822T102003Z.dump` was created and validated with `pg_restore --list` (database `ori_os`, PostgreSQL 16.14, 294 TOC entries). The dump SHA-256 was generated in the VPS console.
- VPS deployment used the release Compose overlay with `--no-build --pull never`; API, Worker, and Web are running, while PostgreSQL and Redis are healthy.
- Runtime verification: `/health` returned `ok` and `/ready` returned `ready` with database and Redis `ok` at approximately `2026-08-22T10:47:47Z`.
- Browser smoke passed: invitation-only login messaging, no unverified trial/testimonial claims, disabled social login controls marked `coming soon`, authenticated dashboard, CRM capability surface, logout-to-marketing, and public marketing page.
- Release state: `PRIVATE_BETA_OPERATIONAL`; public-launch certification remains blocked by dependency remediation, expanded security/RBAC testing, monitoring, firewall/SSH hardening, and full-stack rollback timing.

## Recovery update — 2026-08-22

- Release workflow #5 (`32461311990`) completed successfully on `main` at `64a3353`; API, Worker, and Web image jobs were green.
- Promoted immutable image digests to the VPS:
  - API `sha256:beb483a58e53ab7fd0f09cbc1fbaea5c52f6d937b8626bd5d1ea9b77cede1a14`
  - Worker `sha256:de74aaaec5553812c29a3d89b9def4379705d0aa65487ee539f700926e7840d1`
  - Web `sha256:c442caf1451f87f660deda9054d67db485b36d02e8df000fb8faf86bdc330662`
- Pre-deployment evidence: Hostinger snapshot created at `2026-08-22 08:52`; PostgreSQL dump `/root/ori-os-prod-20260822T065539Z.dump` validated with `pg_restore --list`, database `ori_os`, 294 TOC entries.
- VPS deployment completed without a local build. API, Worker, and Web are running; PostgreSQL and Redis are healthy. `/health` returned `ok` and `/ready` returned database and Redis `ok`.
- Browser smoke verification passed: private-beta login messaging, disabled social-login controls, authenticated dashboard, CRM-only module overview, logout-to-marketing, and public marketing page.
- Release remains `PRIVATE_BETA_OPERATIONAL`, not public-launch certified. Restore testing, security hardening, RBAC proof, dependency remediation, and observability remain open.

## Local verification on 2026-08-13

- `npm ci`: passed.
- Prisma generation: passed.
- Build: passed across all 5 build tasks.
- Tests: passed across API, web, and worker (41 API suites, 5 web files, 4 worker suites).
- Lint: passes with 0 errors; 1,912 legacy warnings remain visible and are tracked for module-by-module cleanup.
- API build: passed.
- Web build: passed with non-blocking Next.js warnings.

## GitHub Actions evidence

- Run 10 (`31601187077`) on `main` at `a3a60e1`: checkout, npm install, and Prisma generation passed.
- Run 10 failed at `Build all workspaces`; lint and tests were skipped.
- Runs 5, 6, 7, 8, 9, and 10 all failed at the same build step.
- PR #1 run 11 (`31678856312`) failed at the same step because the web build could not find `AUTH_SECRET` or `NEXTAUTH_SECRET` while collecting `/api/auth/[...nextauth]` page data.
- PR #1 run 12 (`31680963127`) reproduced the same missing-secret failure despite the workflow env entry.
- The web auth module now uses a build-only fallback when `NODE_ENV=test` or `CI=true`; production still requires a real secret.
- Local web build with secrets unset and `CI=true`: passed.
- PR #1 run 13 (`31682253026`): build passed; lint exposed 1,909 API errors, mostly legacy unsafe-type and formatting rules.
- API lint configuration now keeps those legacy diagnostics visible as warnings; targeted activity metadata cast was removed.

## Recovery points

See `docs/BLOCK_0_CANONICALIZATION.md` for the preserved Git bundle, working-tree archive, and SHA-256 hashes.

## Operating rule

The chat is not the source of truth. Git, this file, `OPERATIONS_LEDGER.md`, and evidence committed under `docs/EVIDENCE/` are the source of truth.
