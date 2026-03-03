# Fallback Modes and Feature Flags

This document describes the operational fallback modes available in Ori-OS to maintain system availability during incident response.

## 1. Feature Flag Controls
We use environmental feature flags to toggle system modules.

| Feature | Flag (`.env`) | Function |
|---------|---------------|----------|
| **SEO Studio** | `NEXT_PUBLIC_ENABLE_SEO_STUDIO` | Toggles the visibility and access to the SEO module. |
| **AI Enrichment** | `ENABLE_AI_ENRICH` | Toggles the background processing of AI lead enrichment. |
| **Webhooks** | `ENABLE_WEBHOOKS` | Toggles the firing of outbound system webhooks. |

## 2. Plan A: UI-Only Fallback (SEO Studio)
If the SEO Studio mock implementation interferes with core dashboard performance:
1. Set `NEXT_PUBLIC_ENABLE_SEO_STUDIO=false`.
2. Redeploy the web service.
3. The module will be hidden from the sidebar and its page will show a "Coming Soon" placeholder.

## 3. Plan B: API Failover
If the primary backend (`apps/api`) is slow:
1. The frontend (`apps/web`) uses Next.js `rewrites` which can be adjusted to point to a secondary API cluster if available.

## 4. Plan C: Deployment Rollback
In case of total failure, follow the [Rollback Plan](./ROLLBACK_PLAN.md).
