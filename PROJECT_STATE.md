# ORI-OS Project State

> This file is the recovery starting point when a Codex, browser, VPS, or chat session is lost.

## Last verified

- Date: 2026-09-02
- Local repository: `C:\dev\ORI-OS-PROJECTS\ORI-OS2.0`
- Canonical remote: `https://github.com/a-bol3/ori-os-codex.git`
- Canonical production line: `main` at the merged private-beta release line
- Latest release line: `main` at commit `db1261d213e38503d0d1255dc7f879778a86d5fc`
- Latest CI: `33612509086` passed
- Latest image publication: `33612873504` passed
- Latest production deploy: `33613469160` passed
- Public web: `https://orios.ori-craftlabs.com`
- Public API: `https://api.orios.ori-craftlabs.com`

## Current truth

| Area                     | State                            | Evidence / next proof                                                                                  |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Source repository        | Recoverable                      | Local Git history and canonical remote                                                                 |
| Web availability         | Passing                          | Login, dashboard, logout-to-marketing, and private-beta messaging verified in browser                  |
| API health               | Passing                          | `/health` returned HTTP 200                                                                            |
| API readiness            | Passing                          | `/ready` returned DB and Redis `ok`                                                                    |
| GitHub Actions           | Green baseline                   | Main CI run `33612509086` passed on commit `db1261d`; image publication and production deploy also passed |
| Release images           | Published and promoted           | Run `33612873504` published API, Worker, and Web images at immutable digests recorded below           |
| VPS identity             | Confirmed operational            | `/opt/orios-codex`; release Compose overlay active; API, Worker, Web, PostgreSQL, and Redis running    |
| Backups                  | Verified                         | PostgreSQL dump and Hostinger snapshot exist; isolated restore drill passed                           |
| Production certification | Private beta operational         | Production smoke passed; public distribution remains gated by `docs/PRODUCTION_READINESS_CHECKLIST.md` |

## Active blockers

1. Activate an actually isolated staging host, DNS/routing, secrets, and the GitHub `staging` environment.
2. Complete live Engagement progression, wait-step, and remaining event-idempotency proof; launch preflight validation is enforced, tracking-pixel OPENED and IMAP reply replays are deduplicated, and provider delivery/bounce handling is implemented and deployed but not live-configured.
3. Complete remaining RBAC, tenant-isolation, GDPR, dependency, and credential-rotation acceptance evidence; GDPR endpoints and Engagement mutations now have explicit authorization, and the web production-secret fail-closed check is closed.
4. Configure and verify the Resend webhook secret/registration, then close unsubscribe ingestion, live wait-step progression, cross-surface metric parity, and provider failure visibility before inviting additional beta organizations.
5. Complete monitoring/alerting, firewall/SSH review, and full-stack rollback timing evidence.
6. Keep production on immutable release digests; no `latest` or VPS-side builds.

## Recovery update — 2026-09-02 Resend delivery/bounce webhook production promotion

- PR #54 added `POST /webhooks/resend` with raw-body Svix signature verification, verified `email.delivered`/`email.bounced` handling, provider-message correlation, and race-safe deduplication through `resend-webhook:{svix-id}`.
- PR #54 merged into `main` at commit `db1261d213e38503d0d1255dc7f879778a86d5fc`. PR CI `33612139707` and post-merge main CI `33612509086` passed.
- Image publication run `33612873504` passed for API, Worker, and Web. Immutable image digests:
  - API `sha256:c8ed193b16c4924a21e5ba0fb200842dd1e4f8514b9e9da77ff44b00014ac9b5`
  - Worker `sha256:e49dffd7e583d205174a09b7429fe7d5e751af0f895758f336549705b38714ad`
  - Web `sha256:8a6ff30b56c962c5c144ec99fa80fe8302e6525d52cfe105192d3a35a506a458`
- Production deploy `33613469160` passed after production environment approval, using the exact source SHA and immutable digests above.
- External smoke passed: Web HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`; request ID `scope-db1261d-smoke` was preserved.
- The code path is deployed fail-closed, but live provider activation is not yet complete: the production runtime still needs `RESEND_WEBHOOK_SECRET`, the webhook URL must be registered in Resend, and a real delivered/bounced callback plus replay must be observed.

## Recovery update — 2026-09-02 IMAP reply idempotency and production promotion

- PR #52 added canonical dedupe keys for inferred tracking opens and IMAP replies. Existing reply replays now repair recipient state without creating a second event; concurrent/replayed inserts are absorbed through the unique `EmailEvent.dedupeKey` constraint, and reply metrics increment only for a newly accepted reply.
- PR #52 merged into `main` at commit `95b1c49b803fce7e162665ceb2fcb91a0bad370d`. PR CI `33608734116` and post-merge main CI `33609062113` passed.
- Image publication run `33609469179` passed for all three images. Immutable image digests:
  - API `sha256:8b00adba59ab8d6078fee21a34f67ec24ab3711ff66079e8899351df38b85fcc`
  - Worker `sha256:27f3d09943fca66f6573397265a1280ebec7f22d0d94f89ef45a22e5152c19ab`
  - Web `sha256:bdf48b8093221e7582755c96b4ed88ffef3b685edfdd87f785a18b7a5e079d86`
- Production deploy `33610095143` passed after approval of the `production` environment, using source `95b1c49b803fce7e162665ceb2fcb91a0bad370d` and the pinned digests above.
- External smoke passed: Web HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`; API request ID `scope-95b1c49-smoke` was preserved.
- IMAP reply idempotency is deployed. Provider delivery/bounce/unsubscribe ingestion, live wait-step progression, cross-surface metric parity, broader security acceptance, staging activation, observability, rollback timing, and public distribution gates remain open.

## Recovery update — 2026-09-02 Engagement OPENED idempotency and production promotion

- PR #50 added a unique `EmailEvent.dedupeKey` and race-safe handling for campaign tracking-pixel `OPENED` events. Concurrent replays for the same campaign/contact are now harmless and do not create duplicate events. The migration is `20260902074000_add_email_event_dedupe_key`.
- PR #50 merged into `main` at commit `943b453243900804442b3788e2fa9b97c3c3585e`. PR CI `33605173033` and post-merge main CI `33605474694` passed.
- Image publication run `33605778213` passed for all three images. Immutable image digests:
  - API `sha256:6fa15ef3bf503607c52bbb60a44a82053a054e5c8e4182eaad8a1122315e6183`
  - Worker `sha256:44e2426846d9d70f115ca10375b1df2b7612082adc98d28ca65bc04f964a94ac`
  - Web `sha256:8b562d62d48eb453a10b3f22a7a197f0ddf7533fba47c0aa4a5ca6486a8ddc37`
- Production deploy `33606380185` passed after approval of the `production` environment, using source `943b453243900804442b3788e2fa9b97c3c3585e` and the pinned digests above.
- External smoke passed: Web HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`; API request ID `scope-943b453-smoke` was preserved.
- Tracking-pixel `OPENED` idempotency is deployed. Delivery/reply/bounce/unsubscribe ingestion idempotency, live wait-step progression, cross-surface metric parity, broader security acceptance, staging activation, observability, rollback timing, and public distribution gates remain open.

## Recovery update — 2026-09-02 Engagement tenant-scope correction and production promotion

- PR #48 scoped manual running-campaign processing to the authenticated organization and added explicit roles to Engagement mutations, launch, and Inbox reply. It merged into `main` at commit `2cc6f5facee7fc83dcbcea6f14a7904e048154fa`.
- PR CI `33602123466` and post-merge main CI `33602446667` passed.
- Image publication run `33602731772` passed for `main@2cc6f5f`. Immutable image digests:
  - API `sha256:b85dbbcba26d96052a4616eb08dcc60d3fb0434b3c60683244db8af63dfcbd4e`
  - Worker `sha256:d4ded97662a7651a0d5c59c7173e8b4032b51a86068e8a405538143cc1653626`
  - Web `sha256:462f9417c7701806f58723362ce2561680ee11273f473018f9178a32c8e78310`
- Production deploy `33603411924` passed after environment approval using the exact source SHA and immutable digests above.
- External smoke passed: Web `/` HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`; API request ID `scope-2cc6f5f-smoke` was preserved.
- Engagement tenant-scope processing and explicit mutation RBAC are deployed. Live wait-step progression, event idempotency, broader active-membership/session proof, staging activation, observability, rollback timing, and public distribution gates remain open.

## Recovery update — 2026-09-02 GDPR RBAC hardening and deploy storage correction

- PR #45 added `JwtAuthGuard` plus `RolesGuard` with `OWNER`/`ADMIN` authorization to organization-scoped GDPR list/export/delete endpoints, with regression coverage. It was merged into `main` at commit `39f982e499fd7f355797d235c339db75d477381e`.
- PR #45 CI `33598057887` and post-merge main CI `33598267883` passed.
- The first production attempt `33598977419` correctly failed during image pull because the VPS had no free disk space; it did not replace the running release.
- PR #46 changed pre-deploy cleanup to reclaim all unused Docker objects and build cache while preserving volumes. It merged into `main` at `88b6910c5d72a46386a25fba2f5c3bdbd15a61c6`; PR CI `33599224606` and main CI `33599534591` passed.
- Image publication `33599809388` passed for `main@88b6910c`. Immutable image digests:
  - API `sha256:42cd6ba435853725550bddca8c503a6213d52d233f7709beeb42ec36a733a82b`
  - Worker `sha256:25df7008f865de44e94fd1fa6f90b516040657f02eba6b0d663637b59edf6c1a`
  - Web `sha256:360ed0e63387a58537711e336e5dc5daea3999ea95b548b1770fdfa5b35d0922`
- Production deploy `33600262585` passed after environment approval using the exact source SHA and immutable digests above.
- External smoke passed: Web HTTP 200; `/api/health` HTTP 200 with database and Redis `ok`; `/api/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`; API request ID `ori-os-gdpr-rbac-88b6910-smoke` was preserved.
- GDPR endpoint RBAC is partially closed; complete tenant-isolation, session invalidation, broader sensitive-action RBAC, DSAR end-to-end evidence, and public distribution gates remain open.

## Recovery update — 2026-09-02 Engagement hardening and production promotion

- PR #41 added server-side campaign launch readiness validation for pending audience, active organization-owned mailbox, sender address, first sequence step, and usable email subject/body; it also added `opened` counts to campaign list metrics and regression tests. It was merged into `main` at commit `b54b7d9513f52f794064696b2ce7dc5b1cbaeb3e`.
- PR CI run `33593796471` and post-merge main CI run `33594043988` passed. Full API validation passed locally: 50 suites / 143 tests.
- PR #42 added stale Docker image/build-cache reclamation before deployment, preserving Docker volumes. It was merged into `main` at commit `976599777723fc72c2768128615a08dea1257c29`; main CI run `33595413701` passed.
- Image publication run `33595798284` passed all three image jobs for the current `main` commit. Immutable image digests:
  - API `sha256:039eabd165addbfd68557dcaff4469fbeb44507670c0bbcbc38b71189885868e`
  - Worker `sha256:8039bb2aee1b91ce2e8649b062ff8855084728841e1c002aeeb35021984fb4c8`
  - Web `sha256:ec74a357cb79611a3ef01467d8744c2795b2200a34635ae5da51a2a0e626e1d6`
- Production deploy run `33596373756` passed after environment approval. The deploy used the exact `main@9765997` source and immutable digests; the pre-deploy Docker cleanup reclaimed stale storage and the VPS did not build images.
- External smoke evidence passed at `https://orios.ori-craftlabs.com`: Web HTTP 200; `/api/health` HTTP 200 with database and Redis `ok`; `/api/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`; API request ID `ori-os-engagement-9765997-smoke` was preserved.
- Engagement launch guard and aggregate `opened` metric correction are deployed. Release state remains `PRIVATE_BETA_OPERATIONAL`; live wait-step progression, open/reply/bounce idempotency, staging activation, security/RBAC/GDPR acceptance, observability, and rollback timing remain open.

## Recovery update — 2026-09-02 authentication secret audit

- Audited `apps/web/src/auth.ts`, `apps/web/Dockerfile`, the production Compose environment, and the release workflow.
- Confirmed the only fallback (`ci-build-only-secret`) is build-only for development/test/CI paths. The runtime image sets `NODE_ENV=production` and requires a real `AUTH_SECRET` or `NEXTAUTH_SECRET`; missing configuration throws instead of starting with a default secret.
- Production smoke after the current release passed: Web HTTP 200, API health/readiness HTTP 200, and protected Operations HTTP 307 to `/login`.
- The checklist item “Web auth secret fails closed in production” is now closed. Remaining authentication work is active organization membership, RBAC, session invalidation, and end-to-end tenant isolation.

## Recovery update — 2026-09-02 SEO/Settings production line

- PR #39 removed SEO keyword/ranking/backlink mocks and the legacy unscoped backlinks endpoint, replaced simulated SEO project creation with authenticated API persistence, and made non-Gmail integrations explicit `Soon`/unavailable states. It was merged into `main` at commit `3b0b49ed8ff67e4b346cb30bfd37542bad4afa05`.
- PR CI run `33591153799` and post-merge main CI run `33591373235` passed. Local validation also passed for web lint/tests/build and API build/tests.
- Image publication run `33591620754` passed all three image jobs.
- Immutable images published for the deployed release:
  - API `sha256:4f21e07b4129ff87bbfc62fe468fa68f37834574cf724ab8634f8430233b3090`
  - Worker `sha256:37e604a81290baa26e913a99e791080d189ca2337f435c0d895931ec11a44ae6`
  - Web `sha256:caf5db4e878247b0e968aa7050facea48bd12feb394c6a2239a0900e3f4c8095`
- Production deploy run `33592108484` passed after production-environment approval. The deployment used pinned images and did not build on the VPS.
- External smoke evidence passed: Web HTTP 200; API `/api/health` HTTP 200 with database and Redis `ok`; API `/api/ready` HTTP 200 with database and Redis `ok`; unauthenticated `/dashboard/operations` returned HTTP 307 to `/login`.
- SEO keyword/ranking/backlink and Settings fallback removal is closed for the reviewed paths. Release state remains `PRIVATE_BETA_OPERATIONAL`; remaining blockers are staging activation, Engagement edge flows, security/RBAC/GDPR acceptance, observability, and rollback evidence.

## Recovery update — 2026-09-02 Content/Crawls production line

- PR #37 removed fabricated crawl/issue data, corrected project-scoped crawl routes, and removed simulated Content template persistence. Content and SEO crawl failures now surface explicit error states. It was merged into `main` at commit `e4818d228756d891a62f027fc2c037ca3f57b45e`.
- PR CI run `33588443863` and post-merge main CI run `33588696872` passed.
- Image publication run `33588721721` passed all three image jobs.
- Immutable images published for the deployed release:
  - API `sha256:eff45a753bcfa9418a51aad464c1cd518e2bbabf4a32dd62b6f84358c2daf0b2`
  - Worker `sha256:0bfd374540c0accf58e330e40049f90fe7be58ca7a9e48c88756a106b3b7fba8`
  - Web `sha256:0144e5a9b7a73950cae937b1d42464d0e84d0ba15c19998602a26418d51a17b6`
- Production deploy run `33589139919` passed after production-environment approval. The deployment used pinned images and did not build on the VPS.
- Final smoke evidence passed: public Web HTTP 200; API `/health` and `/ready` HTTP 200 with database and Redis healthy; unauthenticated Operations returned HTTP 307; API request ID propagation preserved `codex-e4818d2-smoke`.
- Content/Crawls fallback removal is closed for the reviewed paths. Release state remains `PRIVATE_BETA_OPERATIONAL`; remaining blockers are staging activation, other module fallback review, security/RBAC/GDPR acceptance, observability, and rollback evidence.

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
