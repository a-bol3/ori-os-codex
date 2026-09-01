# Gmail Integration — Phase 3 Human Approval

## Purpose

Turn Gmail-derived operational signals into reviewable internal proposals while
keeping every external Gmail mutation disabled. Operators may approve or reject
a proposal, but approval does not send, reply, archive, label, forward or delete
mail.

## Safety boundary

- Approval records are tenant-scoped and require an authenticated operator.
- Viewers may inspect approval state but cannot decide an approval.
- Decisions are idempotent: a decided request cannot be decided again.
- Every decision is written to the audit trail.
- No provider action worker is enabled in this phase.

## Exit criteria

- Pending approvals can be listed in Operations.
- Authorized operators can approve or reject a pending request.
- Cross-organization access and repeated decisions fail closed.
- The Operations UI clearly states that approval records intent only.
- API and UI behavior are covered by tests.

## Rollback

Disable the Operations and Gmail feature flags. Existing approval and audit
records remain intact; no external action needs to be reversed because this
phase never invokes Gmail write APIs.
