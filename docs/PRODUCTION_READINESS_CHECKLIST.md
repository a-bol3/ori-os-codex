# ORI-OS Production Readiness Checklist

Last updated: 2026-09-02
Status legend:

- `[x]` Closed and validated
- `[-]` Partially closed / validated but not fully accepted
- `[ ]` Open

## How we close an item

An item is only closed when all five conditions are true:

1. Code implemented
2. Critical tests passing
3. Manual verification completed
4. Operational impact documented
5. No silent mock/fallback remains in the user path

---

## 0. Foundations

### 0.1 Product truth and route contract cleanup

- `[x]` Dashboard activity feed no longer uses hardcoded business data
  - Evidence:
    - `apps/web/src/app/(dashboard)/dashboard/activity/page.tsx`
    - `apps/web/src/app/(dashboard)/dashboard/activity/page.test.tsx`
    - web tests passed: `4 files / 11 tests`
    - web build passed

- `[ ]` Silent production success states removed across all critical modules
  - Closed in the current production release for the reviewed paths:
    - Content template load/create/update/delete
    - SEO crawl listing, crawl details, issue loading, and crawl start
    - SEO keyword/ranking/backlink pages
    - Settings integrations: Gmail is real; other providers are explicit `Soon`/unavailable
    - Evidence: PR #37 and PR #39; latest main CI `33591373235`, image publication `33591620754`, production deploy `33592108484`
  - Still to verify/fix:
    - live Engagement progression and event edge flows
    - any optimistic success toasts without persistence

- `[ ]` Web/API route contract matrix completed
  - Must include:
    - CRM
    - Dashboard
    - Engagement
    - Settings
    - SEO
    - Content

### 0.2 Authentication, tenancy, permissions

- `[x]` Auth bypass fails closed outside development
  - Evidence:
    - `apps/api/src/auth/auth-bypass.ts`
    - `apps/api/src/auth/jwt-auth.guard.ts`
    - `apps/web/src/lib/auth-bypass.ts`
    - tests passed for guard/bypass

- `[x]` Test bench disabled outside explicit development mode
  - Evidence:
    - `apps/api/src/test-bench.controller.ts`
    - `apps/api/src/app.module.ts`
    - tests added

- `[x]` Global API rate limiting enabled
  - Evidence:
    - `apps/api/src/app.module.ts`

- `[x]` Web auth secret fails closed in production
  - Evidence:
    - `apps/web/src/auth.ts` permits the build-only secret only under `NODE_ENV=development`, `NODE_ENV=test`, or `CI=true`
    - `apps/web/Dockerfile` sets `NODE_ENV=production` only in the runtime image, where no fallback is allowed
    - Production deploy `33596373756` and API/web smoke checks passed on `main@9765997`
  - The runtime still requires a real `AUTH_SECRET` or `NEXTAUTH_SECRET`; missing configuration throws during server startup.

- `[ ]` Active organization membership and role verified on every protected operation

- `[ ]` Session invalidation/versioning completed

- `[ ]` Sensitive actions fully protected by RBAC

- `[ ]` Multi-tenant write safety verified end-to-end

### 0.3 Release and deploy safety

- `[x]` Canonical backlog and operating model documented
  - Evidence:
    - `docs/MASTER_EXECUTION_BACKLOG.md`
    - `docs/AGENT_OPERATING_MODEL.md`

- `[x]` CI moved toward canonical npm flow
  - Evidence:
    - `.github/workflows/ci.yml`
    - `docs/RELEASE_PROCESS.md`
    - `docs/HOSTINGER_ORIOS_DEPLOY.md`

- `[-]` CI deterministic and aligned, but not globally proven end-to-end yet
  - Remaining proof required:
    - rollback rehearsal
    - staging restore rehearsal

- `[ ]` Backup and restore procedure proven

- `[ ]` Production rollback procedure proven

- `[ ]` Deploy preflight checks automated

---

## 1. CRM + Dashboard

### 1.1 Dashboard

- `[x]` Main dashboard loads and is usable again
- `[x]` Activity feed is real, not hardcoded
- `[-]` Dashboard metrics consistency still needs final cross-check with CRM + Engagement definitions

### 1.2 Contacts

- `[x]` Contacts listing restored
- `[x]` Contact detail modal functional
- `[x]` Related company/deal visibility restored in real scenarios
- `[ ]` CRUD + import/export + filters + pagination fully acceptance-tested

### 1.3 Companies

- `[x]` Companies listing restored
- `[x]` Company creation restored
- `[x]` Company detail modal functional
- `[x]` Tasks, notes, audit trail and linked entities working in validated scenarios
- `[ ]` Full acceptance set still pending:
  - search
  - filters
  - export
  - edge-case validation
  - mobile/responsive pass

### 1.4 Deals

- `[x]` Deals listing restored
- `[x]` Deal detail modal functional
- `[x]` Pipeline summary visible again
- `[ ]` Full acceptance still pending:
  - create/edit/delete edge cases
  - stage transitions
  - metrics reconciliation with dashboard

### 1.5 UI/UX shell

- `[x]` Root scroll/layout issue materially improved
  - Evidence:
    - `apps/web/src/components/layout/app-shell.tsx`

- `[-]` Some detail pages were fixed enough to use, but full laptop-height acceptance is still open
  - Need final pass on:
    - contact detail
    - company detail
    - deal detail
    - engagement detail
    - wizard screens

---

## 2. Engagement and deliverability

### 2.1 Core campaign flows

- `[x]` Campaign list works
- `[x]` Campaign detail route works
- `[x]` Edit sequence route works
- `[x]` Sequence steps render correctly
- `[x]` Analytics tab renders
- `[x]` People tab renders

### 2.2 Recipients

- `[x]` Add recipient to campaign works in validated scenarios
- `[x]` Remove recipient works in validated scenarios
- `[x]` Recipient confirmation exists before removal
- `[-]` Recipient progression UI is now integrated and build-validated, but visual validation in the published environment is still pending
  - Confirmed in source:
    - `apps/web/src/app/(dashboard)/dashboard/engagement/campaigns/[id]/page.tsx` contains the progression UI and labels for:
      - `Recipient progression`
      - `Current flow`
      - `Next campaign step`
      - `Expected execution`
    - production build passed on 2026-08-07 after wiring the progression block into the People tab rendering path
  - Still required before closure:
    - visible production confirmation that the panel renders for real campaign states
    - proof of all states below from the live app:
      - current step
      - wait pending
      - next step scheduled
      - replied
      - bounced
      - completed
      - blocked

- `[x]` Campaign launch preflight rejects incomplete real-world configuration
  - Evidence:
    - `apps/api/src/engagement/campaign-launch.service.ts`
    - `apps/api/src/engagement/campaign-launch.service.spec.ts`
    - PR #41; production deploy `33596373756` from `main@9765997`
  - Enforced checks: pending audience, organization-owned active mailbox, sender address, first sequence step, and complete email subject/body.

### 2.3 Launch and sender validation

- `[x]` Campaign launch path works with configured sender
- `[x]` `business@ori-craftlabs.com` recognized as active sender for beta use
- `[x]` Real email delivery from ORI-OS to `abolanos@folga.com.pl` confirmed

### 2.4 Analytics correctness

- `[x]` Delivery metric reached verified state in at least one real scenario
- `[x]` Campaign list exposes persisted `opened` aggregate from recipient events
  - Evidence: PR #41; production deploy `33596373756`
- `[x]` Bounce state surfaced in analytics in prior scenario
- `[x]` Reply email was physically received and confirmed in mailbox flow
- `[-]` Cross-surface delivery evidence exists, but analytics parity is not yet fully proven across every view
  - Verified scenario:
    - real campaign delivered from `business@ori-craftlabs.com`
    - message physically received in `abolanos@folga.com.pl`
    - campaign detail later reflected `Sent = 1`
  - Still required before closure:
    - reliable open tracking proof in the published environment
    - reliable reply-rate synchronization back into analytics/UI
    - consistency check across:
      - campaign list
      - campaign detail
      - analytics tab
      - dashboard summaries

- `[ ]` Open rate tracking fully reliable
- `[ ]` Reply rate tracking fully reliable
- `[ ]` Cross-view metric consistency fully closed

### 2.5 Time-based execution

- `[-]` Scheduler path exists in backend, but end-to-end production proof is still incomplete
  - Confirmed in source:
    - recipients added to running campaigns are scheduled through backend campaign execution services
    - wait steps and delayed follow-up execution are implemented in worker/queue processing
  - Still required before closure:
    - real validation of a 1-day wait completing on time
    - proof that second scheduled email is sent after the wait
    - proof that later scheduled emails continue correctly
    - proof that queued progression survives restart/redeploy without duplicating or skipping work

- `[ ]` Wait step of 1 day validated through real scheduler progression
- `[ ]` Second scheduled email validated after wait
- `[ ]` Third scheduled email validated after wait
- `[ ]` Worker progression proven across restarts/redeploys

### 2.6 Mailbox/webhook/provider hardening

- `[ ]` SMTP/auth configuration fully hardened and documented
- `[ ]` Event ingestion idempotent for:
  - delivery
  - open
  - reply
  - bounce
  - unsubscribe
- `[ ]` Provider health and failure visibility exposed in UI/ops

---

## 3. GDPR, compliance, and data governance

- `[ ]` Data inventory by module completed
- `[ ]` Controller/processor/subprocessor map completed
- `[ ]` DSAR export flow complete
- `[ ]` DSAR delete/anonymization flow complete
- `[ ]` Retention rules implemented
- `[ ]` Suppression/unsubscribe rules completed
- `[ ]` Privacy/legal docs aligned with actual implementation

---

## 4. ORI Core shared foundation

- `[ ]` Shared auth/session contract stabilized
- `[ ]` Shared organization/member/role contract stabilized
- `[ ]` Shared audit event contract stabilized
- `[ ]` Shared feature flag contract stabilized
- `[ ]` Shared integration health contract stabilized
- `[ ]` Shared metric definition contract stabilized
- `[ ]` Prepared for later ORI-CRUIT-HUB reuse without unsafe copying

---

## 5. Beta readiness gate

Private beta is only allowed when all these are closed:

- `[ ]` No silent mocks in production-critical paths
- `[ ]` Auth/tenancy/RBAC hardened
- `[ ]` CRM daily workflows usable end-to-end
- `[ ]` Engagement launch/delivery/reply tracking usable end-to-end
- `[ ]` Backup/restore proven
- `[ ]` Rollback proven
- `[ ]` Monitoring and alerting minimally usable
- `[ ]` Legal/compliance baseline in place

---

## 6. Public distribution gate

Public rollout is only allowed when all these are closed:

- `[ ]` Beta validated with real pilot organizations
- `[ ]` Plan limits and billing correctness validated
- `[ ]` Support process defined
- `[ ]` Export/cancel/delete flows proven
- `[ ]` Deliverability provider strategy accepted
- `[ ]` Security review completed
- `[ ]` Final release checklist passed
- `[ ]` Alert issued exactly as required:
  - `ES TIEMPO DE ROTAR FINALMENTE LAS CREDENCIALES`

---

## Immediate next focus

1. Finish live Engagement recipient progression and scheduled-step truth
2. Add idempotent delivery/open/reply/bounce ingestion and prove metric parity
3. Complete RBAC, tenant-isolation, and GDPR acceptance evidence
4. Re-run CRM + Dashboard regression after Engagement fixes
5. Prove deploy/rollback/restore path
