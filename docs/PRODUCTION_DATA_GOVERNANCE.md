# ORI production data governance

This document is the operational boundary for ORI-OS and the future ORI Core. It is deliberately practical: a feature is not considered production-ready merely because its screen renders.

## Data roles and inventories

Before enabling a module for a customer, record its data flows in the treatment register. At minimum, record:

| Domain | Typical personal data | Purpose | Default retention | External transfer |
|---|---|---|---|---|
| CRM | name, work email, role, company, notes, activities | account and relationship management | customer-configured, with a documented maximum | none by default |
| Engagement | recipient, consent/suppression state, delivery and reply events | campaigns and deliverability | campaign lifetime plus operational evidence | mail transport only when enabled |
| Analytics | aggregate events and workspace identifiers | product reporting | aggregate-first; raw events time-limited | none by default |
| Billing | account and subscription identifiers | invoicing and limits | statutory/customer agreement | payment provider only when enabled |
| Support | support messages and attachments | incident resolution | support retention policy | support tools only after review |
| Telemetry | request IDs, errors, performance metadata | reliability and security | short operational window | monitoring provider only after review |

The controller/processor role is decided per treatment, not globally. A customer generally remains controller for its CRM and candidate data; ORI acts as processor where it operates the service. Legal review is required for each new product or special category of data.

## Production truth policy

- Demo records, fixture metrics, generic email bodies and simulated enrichment are development-only.
- Production must show an explicit state such as `not_configured`, `provider_unavailable` or `insufficient_data` when a dependency is missing.
- `ENABLE_AI_SIMULATION`, `ENABLE_EMAIL_FIXTURES`, `ENABLE_BILLING_FIXTURES`, `ENABLE_SEO_FIXTURES` and `ENABLE_TEST_BENCH` are development/test-only switches and are rejected by production environment validation. The browser flags `NEXT_PUBLIC_ENABLE_ANALYTICS_FIXTURES` and `NEXT_PUBLIC_ENABLE_SEO_FIXTURES` follow the same rule and must remain false in deployed builds.
- The Prisma fallback clients are guarded and throw in production. A generated Prisma client and a reachable database are mandatory.
- A release is blocked if a critical path silently substitutes a mock.

## ORI Core boundaries

`packages/core` contains contracts shared by ORI products:

- `IntegrationHealth` for transparent connector status;
- `AuditEvent` for durable activity records;
- `DataSubjectRequest` for export, deletion and anonymisation workflows;
- `MetricDefinition` for consistent dashboard/analytics definitions;
- `WorkspaceFeatureFlags` for explicit capability control.

Product applications must keep their own subdomain, secrets, deployment and database/schema boundary. Sharing a contract does not permit sharing customer data. Cross-product access requires an explicit, scoped, audited integration.

## Connectors and secrets

Connector API responses never include decrypted configuration or encrypted secret blobs. Provider workers use the internal `getForProvider` accessor only after organisation scoping. Tokens and Hostinger credentials must never be sent to the browser.

The Hostinger API/MCP boundary is operator-only: infrastructure status, VPS, backups and deployment checks may use it; customer CRM, candidate or campaign PII must not be sent through it by default. Any exception requires a documented provider, region, retention, security and subprocessor review.

Email, AI, storage, SEO and payment integrations are adapters. A provider can be replaced without changing CRM or workflow data models. Health checks report configuration state; actual delivery/connectivity is verified by the provider operation and recorded as an event. Billing and SEO screens must show `not_configured`/`provider_unavailable` when Stripe, Search Console or an external analysis provider is absent; they must not display fabricated plans, crawls or competitor data.

## GDPR operations

1. Authenticate the requester and resolve the organisation from the session, never from an arbitrary client-supplied organisation ID.
2. Create a data-subject request with type, subject, requester and timestamp.
3. Execute export, deletion or anonymisation in an idempotent job.
4. Record completion/failure and an audit event without copying unnecessary personal data into logs.
5. Confirm the result to the requester through the configured support/account channel.
6. Test restoration and deletion procedures periodically; a backup that cannot be restored is not a backup, and deleted production data must have a documented backup expiry process.

## Engagement release gates

A campaign cannot launch unless the sender is verified and active, the audience is valid and consent/suppression rules pass, every email step has non-empty content, compliance is confirmed, and a send window is valid. Delivery, bounce, complaint, unsubscribe, open, click and reply events must be deduplicated by provider event ID. `sent`, `delivered`, `opened` and `replied` have one documented definition used by Dashboard and Analytics.

Hostinger mailbox SMTP is acceptable for the private beta and low volume only. Before public self-serve SaaS, evaluate a transactional provider with webhooks, reputation controls, suppression management and a written data-processing position. See the Hostinger limits links in the approved product plan.

## Credential incident checklist

The mailbox credential shared during the development conversation is considered exposed. Rotate it in Hostinger, update the secret store and deployment environment, restart only the ORI email worker/API services, send a test to a controlled address, and confirm the old credential fails. Do not put the replacement password in git, tickets or chat.

## Release evidence

Each release must attach:

- data-flow/treatment register change;
- subprocessor and transfer review;
- migration and rollback result;
- tenant-isolation and permission tests;
- DSAR export/delete evidence;
- webhook idempotency and email scheduling evidence;
- backup restoration evidence;
- production smoke test and error/health dashboard.

Until those artefacts exist, describe the capability as beta/partial rather than GDPR-ready or production-certified.
