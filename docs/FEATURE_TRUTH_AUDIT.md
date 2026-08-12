# ORI-OS Feature Truth Audit

Last reviewed: 2026-07-21. This matrix describes observable implementation state, not product intent.

## Status definitions

- **Real**: persisted end-to-end, tenant-scoped, authenticated, error-visible, and covered by critical tests.
- **Partial**: meaningful backend or UI exists, but at least one production-critical path is incomplete.
- **Simulated**: the primary experience depends on fixtures, generated responses, or placeholder behavior.
- **Empty**: navigation or presentation exists without a usable business workflow.

## Current module matrix

| Module | Status | Current evidence | Production exit condition |
| --- | --- | --- | --- |
| Authentication | Partial | API issues tenant-scoped JWTs; web now preserves and forwards them. Admin bootstrap is environment-driven. | Recovery, invitation, role enforcement, session expiry UX, and end-to-end tests. |
| Dashboard | Partial | API metrics are database-backed and tenant-scoped; production no longer silently replaces failures with demo totals. | Metric contract tests, alerts, and verified production data. |
| CRM contacts | Partial | Tenant-scoped CRUD, activity creation, CSV export, authenticated UI reads/writes. | Pagination, server filters, validation DTOs, audit log, import, and E2E. |
| CRM companies | Partial | Tenant-scoped CRUD and authenticated UI reads/writes. | Pagination, validation DTOs, audit log, import, and E2E. |
| CRM deals | Partial | Tenant-scoped CRUD and authenticated UI reads/writes; simulated deletion removed. | Pipelines/stages, tasks/notes/tags, audit log, import, and E2E. |
| Engagement | Partial | Campaign/inbox persistence exists, but frontend fallbacks and incomplete metrics remain. | Remove production mocks, provider contract, event accuracy, consent and E2E. |
| Deliverability | Partial | Service and endpoints exist. | Real provider events, reputation model, suppression and operational proof. |
| Activity | Partial | Tenant-scoped endpoint exists; frontend still has development fixture behavior. | Unified event model, pagination, filtering, and E2E. |
| Analytics | Partial | API calculations exist; frontend retains mock-on-error behavior. | Canonical metric definitions, no production fallback, contract tests. |
| Intelligence | Partial | Enrichment services and providers exist; missing provider keys can return mock data. | Explicit unavailable states, provenance, scoring explanation, cost controls. |
| Automation | Partial | Workflow persistence, triggers, worker logic and execution UI exist. | Versioning, idempotency, cancellation, DLQ, simulation and E2E. |
| Workflows | Partial | Builder and execution paths exist. | Publish/rollback model and safe retry semantics. |
| SEO | Simulated | Several API services exist; crawls, rank tracking and frontend hooks still contain simulations. | Persisted crawl/rank flows, optional GSC, no silent production simulation. |
| Content | Empty | UI surface exists without a complete persisted editorial workflow. | Brief-to-publication workflow with versions and approvals. |
| Notifications | Partial | Tenant-scoped endpoint exists. | Preferences, priorities, delivery states and E2E. |
| Billing | Partial | Stripe-oriented services and guards exist. | Idempotent webhooks, entitlements, cancellation, invoices and sandbox E2E. |
| Settings | Partial | Multiple settings screens exist. | Organization/member/role/security operations connected end-to-end. |
| Help | Empty | Presentation/documentation routes exist. | Contextual help, onboarding and support workflow. |
| Test Bench | Development-only target | Protected controller and dashboard route exist. | Enforce exclusion from public production navigation and runtime. |

## Block 0 controls now established

- Production CRM and Dashboard requests fail visibly instead of presenting invented business data.
- Auth.js retains the NestJS access token and the browser API client forwards it as a bearer token.
- Development fixtures remain allowed only under `NODE_ENV=development` in the converted hooks.
- Database bootstrap requires an explicit email and a password of at least 12 characters; production execution requires `ORI_ALLOW_PRODUCTION_SEED=1`.
- This audit supersedes earlier readiness documents wherever their claims conflict with this matrix.

## Immediate next slice

Complete CRM as a private-beta workflow: DTO validation, pipelines/stages, tasks/notes/tags, server pagination/filtering, audit events, import, and multi-tenant integration tests. Engagement follows only after this slice passes its exit criteria.
