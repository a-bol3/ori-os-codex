# ORI Operations Core — Phase 1

## Scope

Operations Core is a tenant-isolated operational control layer for incidents,
tasks, commitments, risk signals, approvals, panic-protocol runs and workload.
Phase 1 deliberately has no Gmail, calendar or WhatsApp account connection and
contains no code path that sends an external message.

The module is disabled by default. Enable both flags in the same environment:

```env
ENABLE_OPERATIONS_CORE=true
NEXT_PUBLIC_ENABLE_OPERATIONS_CORE=true
```

`ENABLE_OPERATIONS_CORE` controls the API scheduler and worker. The public flag
is evaluated while building the Next.js application and controls the route and
navigation. Rebuild the web application after changing it.

## Model

Every new record contains `organizationId`; API reads and writes derive that ID
from the authenticated request and never accept it from a request body.

| Entity | Purpose | Idempotency |
| --- | --- | --- |
| `OperationIncident` | Operational issue with status, severity and activity timestamp | `(organizationId, idempotencyKey)` |
| `RiskSignal` | Manual or worker-detected warning | `(organizationId, idempotencyKey)` |
| shared `Task` | Existing ORI task extended with priority, source and incident link | `(organizationId, idempotencyKey)` |
| `Commitment` | Promise or deadline that must be tracked | `(organizationId, idempotencyKey)` |
| `ApprovalRequest` | Human approval gate for a proposed action | `(organizationId, idempotencyKey)` |
| `PanicProtocolRun` | Guided critical-protocol execution and checklist | `(organizationId, idempotencyKey)` |
| `WorkLog` | Hours, travel time and outside-hours work | `(organizationId, idempotencyKey)` |
| `WorkloadSnapshot` | Daily, computed load and risk snapshot | `(organizationId, snapshotDate)` |

The explicit operational states are `pending`, `in_progress`, `blocked`,
`resolved` and `cancelled`. Severities are `low`, `medium`, `high` and
`critical`. State transition and workload scoring rules live in
`packages/core/src/operations.ts` so the API and worker share one policy.

All API mutations use the existing `AuditLogService`, which persists the shared
ORI audit-event contract in `AuditLog`. Worker-created signals and snapshots
write system audit records directly. Integration state uses the existing
`IntegrationHealth` contract and reports Gmail, Calendar and WhatsApp as
`disabled` in this phase.

## API

All routes require JWT authentication. `VIEWER` may read; `OWNER`, `ADMIN`,
`MANAGER` and `OPERATOR` may mutate.

| Method | Route | Effect |
| --- | --- | --- |
| `GET` | `/operations/summary` | Daily operating picture and disabled integration health |
| `GET` | `/operations/incidents` | Tenant-scoped incident list with status/severity filters |
| `POST` | `/operations/incidents` | Create an incident |
| `PATCH` | `/operations/incidents/:id` | Change status, severity or description |
| `POST` | `/operations/tasks` | Create an operations task using the shared task system |
| `POST` | `/operations/commitments` | Register a commitment |
| `POST` | `/operations/approvals` | Register a human approval request |
| `GET` | `/operations/approvals` | List tenant-scoped approval requests |
| `PATCH` | `/operations/approvals/:id` | Approve or reject a pending request without executing it |
| `POST` | `/operations/panic` | Create a critical incident, checklist, alert and review task |
| `POST` | `/operations/work-logs` | Record hours and load inputs |

Clients should provide an `idempotencyKey` for every mutation. Replaying a key
within another organization does not expose or reuse the first tenant's data.

## Background execution

The API registers jobs on the existing BullMQ infrastructure and the existing
worker application consumes the `operations-core` queue:

- every 15 minutes: commitments due within 24 hours or already overdue;
- hourly: open incidents without activity for 24 hours;
- daily at 06:05: per-organization workload snapshots and summaries.

Reminder and stale-incident signals use a tenant-scoped daily idempotency key.
Daily workload records use an upsert. Job retries therefore do not duplicate
operational entities. Jobs only create internal records; they do not call an
email, messaging, calendar or webhook provider.

The shared workflow system remains the automation foundation. Its existing
task action and shared `Task` model are reused; Phase 1 does not add an
operations workflow that can invoke external actions.

## Local activation and verification

1. Set both feature flags to `true` in `.env`.
2. Apply migrations and regenerate the client:

   ```powershell
   npm run db:migrate
   npm run db:generate
   ```

3. Start web, API and worker. The root `npm run dev` runs workspace services;
   when starting them separately, also run the worker:

   ```powershell
   npm run dev --workspace=@ori-os/worker
   ```

4. Open `/dashboard/operations` and use only synthetic development data.

No production personal data should be entered during Phase 1 validation.

## Rollback

The safe operational rollback is non-destructive:

1. Set both flags to `false` in API, worker and web environments.
2. Restart API and worker and rebuild/restart web. Existing queued repeat jobs
   become no-ops because the worker fails closed while disabled.
3. Leave the tables in place until retention and backup requirements are met.

For a full schema rollback, first take and verify a database backup. This step
destroys Operations Core data and should only be performed after confirming no
other code depends on it:

```sql
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_operationIncidentId_fkey";
DROP TABLE IF EXISTS "workload_snapshots";
DROP TABLE IF EXISTS "work_logs";
DROP TABLE IF EXISTS "panic_protocol_runs";
DROP TABLE IF EXISTS "approval_requests";
DROP TABLE IF EXISTS "commitments";
DROP TABLE IF EXISTS "risk_signals";
DROP TABLE IF EXISTS "operation_incidents";
DROP INDEX IF EXISTS "tasks_organizationId_idempotencyKey_key";
DROP INDEX IF EXISTS "tasks_organizationId_status_dueDate_idx";
DROP INDEX IF EXISTS "tasks_operationIncidentId_idx";
ALTER TABLE "tasks"
  DROP COLUMN IF EXISTS "priority",
  DROP COLUMN IF EXISTS "source",
  DROP COLUMN IF EXISTS "operationIncidentId",
  DROP COLUMN IF EXISTS "idempotencyKey";
```

Do not run the destructive rollback merely to disable the module; the feature
flags are the primary kill switch.
