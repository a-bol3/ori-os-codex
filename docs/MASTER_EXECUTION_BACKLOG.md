# ORI-OS Master Execution Backlog

Last updated: 2026-09-04
Status: Active orchestration backlog
Scope: ORI-OS production hardening, beta readiness, and future distribution

## Purpose

This file is the canonical execution backlog for ORI-OS.
It consolidates product, security/compliance, and release/infrastructure findings into one ordered plan.

This backlog assumes:

- Credentials remain unchanged for now.
- Silent mocks, simulated success states, and hidden fallbacks are not acceptable in production.
- ORI-OS must reach private beta quality before public distribution.
- Before public distribution, the mandatory release gate must emit:

`ES TIEMPO DE ROTAR FINALMENTE LAS CREDENCIALES`

## Execution Rules

1. No production-facing module is considered complete while it still depends on silent mocks or fake success states.
2. No schema or tenancy change ships without tests and rollback notes.
3. No deploy flow is considered valid without repeatable backup and restore evidence.
4. Shared foundations are completed first, then domain modules, then commercial surfaces.
5. Every completed item must include:
   - code changes;
   - tests;
   - verification evidence;
   - operational notes if deployment behavior changes.

## Current Team Lanes

- Orchestrator: `/root`
- Lane A: security, tenancy, GDPR, auth
- Lane B: product truth, CRM, Engagement, UX correctness
- Lane C: release, CI/CD, VPS, deploy, rollback, observability

## Phase 0 - Non-Negotiable Foundations

### P0.1 Product truth and contract cleanup

Owner lane: B
Status: in progress

Required:

- Remove silent simulated success from production flows.
- Replace fake local saves with explicit unavailable/error states.
- Build a route contract matrix for web-to-API integration.
- Fix broken route mismatches already identified:
  - Content templates
  - Settings integrations
  - Engagement campaign delete/details
  - SEO backlinks and SEO keywords
- Replace hardcoded activity feed with real organization-scoped API data.

Acceptance:

- No production page reports success when the API fails.
- No dashboard module renders hardcoded business data in production.
- All critical dashboard pages load from real API routes.

### P0.2 Authentication, tenancy, and permission hardening

Owner lane: A
Status: pending

Required:

- Fail closed on auth bypass outside development.
- Verify active organization membership and role on authenticated requests.
- Introduce session invalidation/versioning and stronger logout semantics.
- Enforce RBAC for GDPR and sensitive actions.
- Review update/delete patterns to ensure org-scoped writes, not global ID writes.
- Disable `test-bench` in production.

Acceptance:

- Two organizations cannot read, infer, or modify each other's data.
- Sensitive routes reject unauthorized members.
- Development bypass cannot be activated in production.

Progress: PR #45 added `JwtAuthGuard` plus `RolesGuard` with `OWNER`/`ADMIN` authorization to the organization-scoped GDPR list/export/delete endpoints. PR #48 scoped manual running-campaign processing to the authenticated organization and added explicit roles to reviewed Engagement mutations, launch, and Inbox reply routes. PR #59 adds session-bound access tokens, active session checks on every JWT-authenticated request, revoked-session logout, and revoked refresh-token rejection; it is deployed at `main@401a1ab` with production smoke passing. Broader sensitive-action RBAC and end-to-end tenant isolation remain open.

### P0.3 Deliverability and engagement correctness

Owner lane: B with A support
Status: in progress

Required:

- Keep `business@ori-craftlabs.com` as the active sender for beta.
- Validate sender configuration before launch.
- Guarantee campaign launch only when audience, sender, steps, and compliance are valid.
- Ensure waits and later sequence steps execute correctly.
- Implement recipient progression so the UI shows current step, next step, blocked state, and completed state.
- Ensure `sent`, `delivered`, `opened`, `replied`, `bounced`, and `unsubscribed` are event-driven and consistent across list view, detail view, dashboard, and analytics.
- Add idempotent ingestion for delivery/open/reply/bounce events.

Acceptance:

- A campaign with wait steps progresses correctly over time.
- A reply and an open update metrics consistently.
- Recipient-level progression is visible in the campaign UI.

Progress recorded in PR #41 and production deploy `33596373756`: launch preflight now enforces pending audience, active organization-owned mailbox, sender, first sequence step, and complete email content; campaign list responses now include `opened`. PR #48 additionally prevents manual processing from crossing organization boundaries. PR #50 adds a unique `EmailEvent.dedupeKey` and race-safe tracking-pixel `OPENED` ingestion; PR #52 adds idempotent IMAP reply ingestion; PR #54 adds verified, idempotent Resend delivery/bounce ingestion; PR #56 adds idempotent signed unsubscribe ingestion. PR #61 now gates campaign progression on confirmed provider success and aligns recipient-scoped queue IDs across launch, recovery, and email processing; it is deployed at `main@45198901` with CI `33763776115`, image publication `33764119684`, and production deploy `33764871294` passing. Remaining acceptance requires production webhook secret/registration, live callbacks and replay proof, suppression-policy behavior, live wait-step progression, recipient-state proof, and cross-surface metric parity.

### P0.4 Release pipeline and production safety

Owner lane: C
Status: complete

Required:

- Standardize on npm-based CI/CD.
- Replace contradictory deploy documentation with one canonical host-nginx release path.
- Add deterministic CI with:
  - install;
  - lint;
  - build;
  - migrations;
  - unit/integration tests;
  - browser smoke checks.
- Introduce immutable image/tag strategy per commit.
- Define real backup and restore scripts with current service names.
- Prove restore on staging.
- Add deploy preflight:
  - Docker config validation
  - disk and memory checks
  - nginx validation
  - dependency health validation
- Define tested rollback steps.

Acceptance:

- A release can be deployed and rolled back without improvisation.
- Backup restore has been executed successfully in a controlled environment.
- CI is deterministic and blocks unsafe releases.

Current production evidence: PR #61 merged at `main@45198901`; main CI `33763776115`, immutable image publication `33764119684`, and production deploy `33764871294` passed. The deploy helper is installed from the synchronized checkout before execution; external API readiness and protected Operations redirect smoke are green. Rollback rehearsal, staging restore rehearsal, and broader distribution gates remain separate open acceptance items.

## Phase 1 - Shared ORI Core

### P1.1 Shared platform layer

Owner lane: A
Status: pending

Required:

- Stabilize shared contracts for:
  - auth/session
  - organizations/members/roles
  - audit events
  - DSAR requests
  - feature flags
  - integration health
  - metric definitions
- Ensure all protected operations run with explicit organization context.
- Make error responses uniform across API modules.

Acceptance:

- ORI-OS foundations can later be reused by ORI-CRUIT-HUB without copying insecure logic.

### P1.2 GDPR and data subject operations

Owner lane: A
Status: pending

Required:

- Complete export, anonymization, and delete flows.
- Add requester identity, audit trail, idempotency, result artifact tracking, and retries.
- Expand anonymization to notes, metadata, relations, activity history, and suppression where required.
- Define retention rules per data type.

Acceptance:

- A DSAR request can be executed end to end and audited.

## Phase 2 - CRM and Dashboard Completion

### P2.1 CRM end-to-end

Owner lane: B
Status: pending

Required:

- Complete real CRUD for contacts, companies, deals, tasks, notes, tags, and activities.
- Validate linked entities by organization.
- Complete import/export and search/filter/sort/pagination.
- Ensure company/contact/deal details persist correctly and remain responsive.
- Remove residual fetch failures and fragile optimistic flows.

Acceptance:

- A pilot company can operate real sales workflows daily without placeholder behavior.

### P2.2 Dashboard from real metrics

Owner lane: B
Status: pending

Required:

- Build cards and summaries from real persisted data.
- Reconcile metric definitions with CRM and Engagement analytics.
- Replace any remaining hardcoded activity or summary content.

Acceptance:

- Dashboard numbers match underlying CRM and campaign data.

## Phase 3 - UX and Application Shell

### P3.1 Scroll, layout, and responsive correctness

Owner lane: B
Status: pending

Required:

- Fix root app shell vertical scrolling at 100% zoom.
- Ensure modal/detail panels fit common laptop heights without requiring zoom hacks.
- Add explicit scroll containers where needed.
- Review dashboard, contacts, companies, deals, and engagement detail pages.

Acceptance:

- Users can navigate and read all major detail pages at normal zoom on standard laptop screens.

### P3.2 Explicit state design

Owner lane: B
Status: pending

Required:

- Standardize loading, empty, partial, unavailable, and failure states.
- Remove ambiguous UI states that look successful but are not.
- Make every blocked integration visible as such.

Acceptance:

- Users can always tell whether data is real, unavailable, loading, or failed.

## Phase 4 - Operations and Observability

### P4.1 Runtime health and traceability

Owner lane: C
Status: pending

Required:

- Upgrade `/health` and `/ready` to reflect actual dependency state.
- Remove misleading ready states when Redis or other dependencies are skipped.
- Add structured logs, request IDs, and correlation between API, worker, and campaign events.
- Connect alerts to real destinations before beta.

Acceptance:

- Operational issues can be diagnosed without guesswork.

Evidence: merged commit `418c0f8460783040679569c16d1bb8a26f9c646c`, successful
CI, immutable image publication, successful production deployment, and public
health/readiness checks showing database and Redis as `ok`.

### P4.2 Environment separation

Owner lane: C
Status: implementation ready; host activation pending

Required:

- Separate staging and production with isolated env, volumes, databases, and deployment identifiers.
- Ensure one app cannot interfere with another app in the ORI ecosystem.

Acceptance:

- `orios.ori-craftlabs.com` remains isolated from the other ORI applications operationally and at deploy time.

Repository controls are defined in `docker-compose.staging.yml`,
`.env.staging.example`, `scripts/orios-deploy-staging-release.sh`, and
`.github/workflows/deploy-staging.yml`. Host activation is pending the
dedicated staging VPS, DNS/reverse-proxy routing, staging secrets and GitHub
`staging` environment; those resources do not currently exist in the account.

## Phase 5 - Remaining Modules

### P5.1 Automation

Owner lane: B
Status: pending

Required:

- Remove simulated workflow creation and execution.
- Add real workflow definitions, background execution, retries, timeout handling, and run logs.

### P5.2 SEO, Content, Intelligence

Owner lane: B
Status: in progress

Required:

- Content template CRUD and reviewed SEO crawl flows must use authenticated, project-scoped API routes and explicit error states. Closed for the reviewed paths by PR #37 and production release `e4818d2`.
- Replace mock keyword/ranking/backlink data. Closed for the reviewed paths by PR #39 and production release `3b0b49e`; remaining SEO ranking/provider completeness is tracked separately from fallback removal.
- Make project-scoped flows persist real state.
- Ensure optional AI stays optional and transparent.

### P5.3 Settings, Notifications, Billing

Owner lane: B with C support
Status: pending

Required:

- Replace simulated profile/security saves.
- Implement real notification persistence and marking behavior.
- Complete billing status, usage, portal, webhook, cancellation, and invoice consistency.

Current correction status: Settings integration controls no longer simulate successful connections. Gmail uses the real status/connect flow; unsupported providers are visibly marked `Soon`/unavailable. Broader notification and billing work remains open.

## Phase 6 - Beta Gate

### P6.1 Private beta readiness

Owner lanes: A, B, C
Status: pending

Required:

- 3 to 10 pilot organizations
- production-like deploy
- monitoring active
- restore drill passed
- tenancy audit passed
- campaign delivery and progression verified
- legal/compliance docs aligned to actual implementation

Acceptance:

- ORI-OS is safe for controlled private beta with real users.

## Phase 7 - Distribution Gate

### P7.1 Final pre-distribution controls

Owner lanes: A, B, C
Status: blocked until beta stability

Required:

- rotate secrets and credentials
- harden external integrations
- finalize self-serve onboarding
- final pricing/billing validation
- legal and subprocessor register review

Mandatory alert before executing this gate:

`ES TIEMPO DE ROTAR FINALMENTE LAS CREDENCIALES`

## Immediate Next Sprint

Execution order:

1. Eliminate silent mocks and route mismatches.
2. Lock down auth bypass, tenancy writes, and GDPR permissions.
3. Finish Engagement progression and event-consistent metrics.
4. Stabilize CI, backup/restore, and rollback.
5. Fix app shell scroll/responsive issues.

## Done Definition

An item is done only when:

- implementation is real;
- tests pass;
- no silent fallback remains in production;
- org isolation is preserved;
- deployment notes are updated if relevant;
- evidence exists that the feature behaves as claimed.
