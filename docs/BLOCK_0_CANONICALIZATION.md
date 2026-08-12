# Block 0: Canonicalization and source-of-truth decision

Date: 2026-07-17

## Decision

The repository rooted at `ORI-OS2.0` is the canonical Git container because it
preserves the available local history, branches, and the migration work already
recorded after the public `ib4d/ori-os` snapshot.

The nested `ori-os/` directory is not a valid independent checkout: the parent
repository records it as a gitlink, but there is no corresponding `.gitmodules`
mapping or nested Git metadata. Its contents nevertheless include newer product
and infrastructure work. Those changes must be imported selectively into the
root repository before the nested directory is retired.

No GitHub remote will be rewritten or replaced during this block. Remote
alignment happens only after the consolidated tree passes its local release
gates.

## Preserved recovery points

The pre-consolidation state is stored outside the working repository at:

`C:\dev\ORI-OS-PROJECTS\ORI-OS2.0-safety-20260717-001`

Artifacts:

- `repository-all-refs.bundle`
  - SHA-256: `D0B498FAA110916919639231C00C2C81682EFDA9382C2DFC3E5C81C8A4FD433C`
- `working-tree-source.zip`
  - SHA-256: `E677DDC8666D4944F28F7AA175BAC4CE6A7F74E04A8A15F650A6179B517928C9`
- `github-ori-os-f2c03d0.zip`
  - SHA-256: `8A689B0E67B9673855B24C2C5FE55610FF29BAEF337D29F4407762CD62E33700`

Generated directories such as `node_modules`, `.next`, `.turbo`, `dist`, and
`coverage` were intentionally excluded from the working-tree archive.

## Three-way inventory

Compared sources:

1. Root working tree (`ORI-OS2.0`).
2. Nested working tree (`ORI-OS2.0/ori-os`).
3. Public GitHub snapshot `ib4d/ori-os@f2c03d0`.

Meaningful file counts:

| Source | Files |
| --- | ---: |
| Root | 538 |
| Nested | 453 |
| Public snapshot | 447 |
| Union | 620 |

Key comparison results:

- 254 files are identical between root and nested trees.
- 101 files differ in all three sources.
- 163 files exist only in the root tree.
- 10 files exist only in the nested tree.
- Ignoring whitespace, API source differs in 37 files (405 additions and 201 deletions).
- Ignoring whitespace, web source differs in 35 files (714 additions and 549 deletions).
- Ignoring whitespace, worker source differs in 9 files (36 additions and 9 deletions).

The differences are substantive and cannot be resolved safely by copying one
complete directory over the other.

### Security-oriented comparison

The nested API contains a later request-context hardening pass that is not yet
present in the root tree:

- Root API: 36 mock identity fallbacks and no strict request-context calls.
- Nested API: 2 mock identity references and 136 strict calls to
  `requireOrganizationId` or `requireUserId`.

This makes the nested API the preferred candidate for controller-level identity
handling, subject to endpoint-by-endpoint review and multi-tenant tests. It does
not make the complete nested directory authoritative: both trees still contain
the database fallback implementation, and neither installs a global
`ValidationPipe` yet.

### Nested-only file triage

Import candidates:

- `apps/api/src/common/request-context.ts`
- `apps/web/src/instrumentation.ts`
- `apps/web/src/instrumentation-client.ts`
- `apps/worker/src/prisma/prisma.module.ts`
- `apps/worker/src/prisma/prisma.service.ts`
- `playwright.config.ts`
- `tests/e2e/*.spec.ts`
- `package-lock.json`, after manifest reconciliation

Manual-review candidates:

- `apps/web/scripts/sync-prisma-client.mjs`
- deployment scripts and production examples
- Sentry migration from the root's legacy config files

Explicitly excluded from import:

- `apps/api/.env` and `apps/web/.env.local`
- `apps/web/tsconfig.tsbuildinfo`
- build logs, compiler logs, database dumps, ad-hoc verification scripts, and
  uploaded test files
- `apps/web/src/lib/prisma.ts` in its current form because it imports Prisma
  internals by filesystem path and contains a default database credential
- `apps/web/src/types/globals.d.ts` in its current form because declaring the
  entire `lucide-react` package would mask useful type errors

## Package-manager decision

Use npm for the first reproducible baseline.

Reasons:

- The recent nested tree completed a forced, uncached production build with npm.
- The public repository and its CI already use npm.
- The root pnpm lockfile is currently deleted and the root pnpm installation is
  incomplete.
- Supporting more than one package-manager path would expand the stabilization
  surface without improving the product.

The decision can be revisited after the production baseline is green, but only
through a separate migration.

## Merge policy

- Preserve all pre-existing root working-tree changes.
- Treat the nested tree as a candidate source, not as an automatic winner.
- Resolve authentication, tenancy, database, billing, and infrastructure files
  manually.
- Import clearly additive files first.
- Keep generated output, diagnostic logs, local databases, backups, and secrets
  outside the canonical source tree.
- Never copy `.env` files into Git.
- Run typecheck and focused tests after each functional group.

## Execution order

1. Normalize repository hygiene and package-manager metadata.
2. Import additive runtime files required by the newer nested implementation.
3. Reconcile authentication and request-context changes.
4. Reconcile API controllers and tenant scoping.
5. Reconcile web hooks, authentication actions, and instrumentation.
6. Reconcile worker Prisma wiring.
7. Reconcile Docker and CI without overwriting existing uncommitted work.
8. Run clean installation, lint, typecheck, tests, and uncached build.
9. Retire the invalid gitlink only after all gates pass.

## Block exit criteria

- One canonical source tree.
- One package manager and one committed lockfile.
- No nested source-of-truth directory.
- Clean installation on Node.js 20 LTS.
- Lint, typecheck, unit tests, and production build are reproducible.
- Existing user changes remain preserved or are explicitly accounted for.
- GitHub remotes remain untouched until the consolidated branch is reviewed.

## Baseline checkpoint: 2026-07-17

Completed in an external clean validation copy:

- npm lockfile generated from the reconciled manifests and copied to the
  canonical root.
- Dependency installation completed with 1,762 packages and 33 known
  vulnerabilities: 31 moderate and 2 high; no critical vulnerabilities.
- Forced production build completed successfully, including all 66 web routes.
- Unit tests completed successfully: 4 API suites (8 tests), 2 worker suites
  (5 tests), and 1 web suite (2 tests), for 15 passing tests in total.
- Core and UI lint gates pass. Web lint has no blocking errors after fixing one
  invalid JSX comment; inherited `any`, unused import, escaping, and hook
  findings remain visible as warnings.
- API lint is a measured blocker: 2,715 errors and 145 warnings. Most errors are
  strict typed-lint findings around untyped request identity, Prisma access,
  and unsafe values. These must be reduced as part of the tenancy/authentication
  reconciliation, not hidden globally or auto-fixed without review.

Additional source repairs made while establishing the baseline:

- restored the missing dashboard page component boundary;
- removed a stray identifier from the execution-log modal;
- added portable, non-mutating lint commands and monorepo lint configuration;
- aligned Next.js and ESLint compatibility without changing runtime behavior;
- corrected two UI lint violations and one JSX comment violation.

Known non-blocking test warnings:

- worker `ts-jest` configuration should enable isolated modules or narrow its
  transform pattern so compiled JavaScript is not passed through `ts-jest`;
- Next.js `next lint` is deprecated and should be migrated to the ESLint CLI in
  a later tooling block;
- Sentry instrumentation still uses legacy entrypoints.

## Next block: identity and tenant isolation

Priority order:

1. Import and test the strict request-context helpers from the nested candidate.
2. Replace mock/default user and organization identifiers at API boundaries.
3. Reconcile controllers in small domain groups, starting with authentication,
   users/organizations, billing, and automation.
4. Add negative tests proving that missing identity is rejected and that one
   organization cannot read or mutate another organization's records.
5. Reduce API typed-lint errors for each reconciled domain to zero before moving
   to the next domain.
6. Run lint, focused tests, the full unit suite, and a production build after
   every domain group.

This block is not complete until the nested gitlink is retired and a fresh
Node.js 20 installation is repeated from the canonical root. The checkpoint
above establishes a usable baseline; it does not yet claim production readiness.

### Identity block progress

- Added typed request-context helpers that reject missing user or organization
  identity.
- Removed hard-coded mock user and organization identifiers from the development
  authentication bypass; explicit development identifiers are now required.
- Removed the known default JWT signing key. Outside tests, API startup now
  requires `JWT_SECRET`.
- Added seven negative/positive identity tests. The API now has 15 passing tests
  across 6 suites, bringing the validated project total to 22 tests.
- Reconciled login with the actual multi-organization schema. Authentication now
  loads organization memberships, rejects users with no assigned organization,
  and signs the JWT against a real membership instead of the non-existent
  `user.organizationId` field.
- Hardened JWT payload validation so requests without `sub` or
  `organizationId` are rejected before controller code runs.
- Replaced `mock-org-id` fallback behavior in the connectors API boundary with
  strict organization context enforcement and added controller tests for both
  rejection and tenant-safe routing.
- Added focused regression coverage for `AuthService`, `JwtStrategy`, and the
  connectors controller. A direct focused Jest run now passes 5 suites and 16
  tests for the identity slice.
- Restored the local root workspace installation on July 17, 2026 with
  `npm install`; dependency state remains 1,762 packages with 33 known
  vulnerabilities and no critical findings.
- Regenerated the Prisma client on July 17, 2026, which removed the fallback
  client state and restored enum exports such as `MailboxProvider`. API
  compilation now succeeds again from the canonical root.
- Reconciled `deliverability`, `media`, and `billing` controller boundaries to
  require organization context instead of using `default-org-id` or
  `mock-org-id`.
- Closed a real cross-tenant gap in deliverability: domain verification and
  mailbox updates are now organization-scoped instead of accepting any record
  identifier globally.
- Added four more focused test suites covering deliverability, media, and
  billing tenant-context enforcement. The focused identity/tenant slice now
  passes 9 suites and 24 tests.
- Repaired workspace script reliability on Windows by pointing API and database
  package scripts at the canonical root toolchain. `npm run db:generate`,
  `npm --workspace apps/api run build`, and focused `npm --workspace apps/api
  test` calls now work again without manual path workarounds.
- Reconciled `analytics`, `ai`, and `seo-projects` controller boundaries to
  require real organization context, and require real user identity for SEO
  project creation.
- Removed debug logging and mock fallbacks from the SEO projects entrypoint.
- Closed an analytics tenant-isolation bug on July 17, 2026: funnel stage
  reporting is now scoped through `pipeline.organizationId` instead of reading
  globally across all tenants.
- Added four focused suites for analytics, AI, and SEO project entrypoints.
  This latest tenant-hardening slice passes 4 suites and 8 tests on its own.
- Reconciled the `crawl`, `rankings`, and `content-analysis` SEO controller
  boundaries on July 17, 2026 so they now require authenticated organization
  context instead of inheriting `mock-org-id` or `default-org-id`.
- Added three focused SEO controller suites for those entrypoints. This slice
  passes 3 suites and 6 tests with lint and API build still green.
- Reconciled the remaining SEO controller boundaries on July 17, 2026:
  `backlinks`, `competitors`, and `alerts` now also require authenticated
  organization context and no longer accept inherited fallback tenant values.
- Added three focused controller suites for those final SEO entrypoints. This
  closing SEO boundary slice passes 3 suites and 6 tests with lint and API
  build still green.
- Reconciled the core CRM controller boundaries on July 17, 2026:
  `contacts`, `companies`, and `deals` now require authenticated organization
  context instead of relying on `default-org-id`.
- Closed a cross-tenant relationship risk in CRM: `contacts` and `deals` now
  verify that linked `companyId` and `contactId` records belong to the same
  authenticated organization before creating or updating associations.
- Added three focused CRM controller suites. This slice passes 3 suites and 6
  tests with lint and API build still green.
- Reconciled the operational controllers on Friday, July 17, 2026:
  `automations`, `activities`, `notifications`, and `intelligence` now require
  authenticated organization context, and workflow/activity/ICP mutations by
  `id` are tenant-scoped before execution.
- Reconciled `engagement` and `inbox` on Friday, July 17, 2026:
  campaign launch, recipient assignment, and inbox replies now require
  authenticated tenant context and validate that the addressed campaign, contact,
  or email event belongs to the same organization before acting.
- Added six focused suites for these operational and engagement slices. Together
  they pass 6 suites and 15 tests with lint and API build still green.
- Reconciled the residual boundary controllers on Friday, July 17, 2026:
  `dashboard`, legacy root `backlinks`, and `content/templates` now require
  authenticated organization context instead of reading through fallback tenant
  assumptions.
- Closed a production-exposure risk on Friday, July 17, 2026: the legacy
  `test-bench` controller is now authenticated and explicitly limited to
  `NODE_ENV=development`, so its seed, debug, and simulation endpoints no
  longer sit inside the production surface area.
- Added focused regression coverage for template tenancy and the new
  development-only gate on `test-bench`. This slice passes 2 suites and 3 tests
  with API build still green. The `test-bench` file itself remains a contained
  legacy typed-lint hotspot, but it is now outside the production path by
  design.
- Reconciled `seo-keywords` on Friday, July 17, 2026: keyword listing,
  creation, bulk creation, updates, deletion, ranking history, and clustering
  now all require authenticated organization context instead of accepting the
  legacy `default-org` fallback.
- Added a focused `seo-keywords` controller suite proving that missing tenant
  context is rejected and that authenticated tenant identity is propagated into
  keyword creation and clustering. This slice passes 1 suite and 3 tests with
  lint and API build still green.
- Reconciled `seo/gsc` on Friday, July 17, 2026 so that authenticated entry
  points now require real organization context, queued sync jobs carry
  organization identity explicitly, and the Google OAuth callback validates a
  signed `state` payload that binds the returned authorization code to the
  original tenant and project.
- Added a focused `gsc` controller suite proving that missing tenant context is
  rejected and that authenticated tenant identity is propagated into auth-url
  generation and manual sync execution. This slice passes 1 suite and 3 tests
  with lint and API build still green.
- Reconciled the public unsubscribe surface on Friday, July 17, 2026:
  `unsubscribe` and `resubscribe` no longer accept open email input and now
  require a signed token that binds the request to a specific contact and
  organization, with optional campaign scope.
- Moved unsubscribe state onto the canonical CRM fields `Contact.optOut` and
  `Contact.optOutTimestamp` instead of ad-hoc JSON metadata, and updated the
  campaign launch flow so opted-out recipients are marked `OPTED_OUT` and are
  not enqueued for delivery.
- Added focused regression coverage for signed unsubscribe handling and
  opt-out-aware campaign launch behavior. This slice passes 2 suites and 7
  tests with lint and API build still green.
- Integrated signed unsubscribe delivery into campaign launch on Friday,
  July 17, 2026: outbound campaign jobs now carry a tenant-bound unsubscribe
  URL, and campaign email HTML now includes a standard unsubscribe footer that
  points at the signed public endpoint.
- Extracted shared unsubscribe token helpers so generation and validation use
  the same signed payload contract. This integration slice passes 3 suites and
  10 tests with lint and API build still green.
- Hardened the worker email processor on Friday, July 17, 2026 so it now
  validates required payload fields, re-checks campaign recipients for
  contact-level opt-out before sending, records `SENT` and `BOUNCED` email
  events for campaign mail, and skips opted-out recipients as a final
  production-side safeguard.
- Repaired worker workspace script reliability on Windows by pointing worker
  build and test scripts at the canonical root toolchain, matching the earlier
  API/package-manager stabilization pattern.
- Added focused worker regression coverage for invalid email jobs, opted-out
  recipients, successful sends, bounced sends, and direct non-campaign emails.
  This slice passes 1 worker suite and 5 tests with lint and worker build
  green.
- Tightened runtime environment contracts on Friday, July 17, 2026 for both API
  and worker: explicit environment schemas now validate production-only secrets
  and URLs, API bootstrap derives CORS origins and port from validated
  configuration, and worker startup now fails fast on missing production mail
  credentials.
- Removed dangerous dummy fallbacks from billing and outbound email paths on
  Friday, July 17, 2026: Stripe secrets, webhook verification, price ids, and
  sender identity now require real environment values instead of silently
  defaulting to placeholder credentials.
- Added focused API and worker environment-schema regression coverage. This
  configuration slice passes 2 suites and 6 tests with API lint/build and
  worker lint/build green.
- Added practical operability endpoints on Friday, July 17, 2026: the API now
  exposes lightweight `health` output plus a `ready` response that checks
  database availability and reports Redis readiness or explicit skip status when
  Redis host/port are not configured.
- Added focused controller/service regression coverage for health and readiness.
  This slice passes 2 suites and 5 tests with API lint/build green.
