# Gmail Integration — Phase 2 Safety Design

## Purpose

Add Gmail as a controlled, tenant-isolated source for operational signals. The
first implementation is read-only: it may inspect metadata and message content
only after an organization explicitly connects an account. It must never send,
reply, archive, delete, label, forward or modify a Gmail message automatically.

## Feature flags

Both flags remain disabled until the implementation and tests are complete:

```env
ENABLE_GMAIL_INTEGRATION=false
NEXT_PUBLIC_ENABLE_GMAIL_INTEGRATION=false
```

Production must reject fixture mode and must not accept access tokens in request
bodies, query strings or logs.

## Required boundaries

- Every integration and token is resolved through `organizationId` from the
  authenticated request; it is never accepted from client input.
- OAuth uses the minimum Gmail scope required for the read-only phase:
  `https://www.googleapis.com/auth/gmail.readonly`.
- Refresh and access tokens remain encrypted at rest and are never returned by
  an API response.
- Sync is incremental and idempotent, using Gmail `historyId`/message IDs and
  an organization-scoped cursor.
- Stored messages must redact or minimise personal data; retain only fields
  needed for operational work.
- Every sync, token refresh, parse failure and user action is written to the
  existing audit trail without secrets or message bodies.
- External actions remain behind `ApprovalRequest`; this includes sending,
  replying, forwarding, archiving, labelling and deleting.

## Proposed read-only lifecycle

1. An admin starts OAuth from the organization settings page.
2. The API validates a signed state containing organization and actor context.
3. Google callback exchanges the code server-side and stores encrypted tokens.
4. A health check validates the token and records `healthy`, `expired`,
   `revoked`, `disabled` or `error`.
5. A worker performs bounded incremental sync with retry and backoff.
6. Messages are normalised into internal operational events; no outbound
   provider call is made by the sync worker.
7. The Operations Center displays the source and confidence of each signal.

## Approval policy

The UI may prepare a draft response, but the draft is only an internal record.
An explicit human approval must exist before a future Gmail action worker can
call a write-capable provider endpoint. Approval keys must be idempotent and
tenant-scoped, and revoked/expired approvals must not execute.

## Exit criteria before enabling the flag

- OAuth state and callback tests, including replay and cross-organization tests.
- Token encryption and log-redaction tests.
- Incremental sync tests for duplicates, pagination, history gaps and retries.
- Rate-limit/backoff and provider outage tests.
- Permission tests for viewer versus operator/admin roles.
- Data retention and disconnect/revocation tests.
- Local fixture smoke test only; no production mailbox connection.
- Explicit review of the Google Cloud OAuth consent screen and redirect URIs.

## Rollback

Set both flags to `false`, stop the Gmail worker schedule, and leave existing
internal operational records intact. Disconnecting an account revokes/deletes
its encrypted token material; it does not delete the audit trail.
