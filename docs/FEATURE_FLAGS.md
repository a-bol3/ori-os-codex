# Feature Flags and Launch Controls

This document outlines the feature flags and launch controls used to safely roll out new capabilities in Ori-OS.

## 1. Purpose
Feature flags allow us to:
- Decouple deployment from release.
- Perform "Canary" testing in production.
- Instantly kill-switch problematic features without a full rollback.

## 2. Active Feature Flags

| Flag Key | Description | Default (Staging) | Default (Prod) |
|----------|-------------|-------------------|----------------|
| `ENABLE_SEO_STUDIO` | Enables the SEO Studio dashboard module. | `OFF` | `OFF` |
| `ENABLE_AI_ENRICH` | Enables the AI-powered lead enrichment feature. | `ON` | `OFF` |
| `ENABLE_WEBHOOKS` | Enables outbound webhook notifications. | `ON` | `OFF` |

## 3. Implementation Strategy
Feature flags are currently managed via environment variables and checked in the code.

**Frontend Check (React):**
```typescript
if (process.env.NEXT_PUBLIC_ENABLE_SEO_STUDIO === 'true') {
    // Render module
}
```

**Backend Check (NestJS):**
```typescript
if (this.configService.get('ENABLE_AI_ENRICH')) {
    // Execute logic
}
```

## 4. Future Roadmap
Planned transition to a dynamic feature flag management system (e.g., Unleash or a custom DB-backed UI) to allow non-technical team members to manage releases.
