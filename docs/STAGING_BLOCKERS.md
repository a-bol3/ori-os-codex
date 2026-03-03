# Staging Blockers Policy

This document defines what constitutes a "Blocker" that prevents a build from moving from Staging to Production.

## Blocker Categories

### 1. Severity: CRITICAL
- **P0 - System Crash**: Any error that causes a service (Web, API, Worker) to crash or become unresponsive.
- **P0 - Data Loss/Corruption**: Any bug that risks losing or corrupting user/tenant data.
- **P0 - Security Breach**: Unauthorized access to dashboard or cross-tenant data visibility.

### 2. Severity: MAJOR
- **P1 - Core Feature Broken**: CRM, Workflows, or Campaigns fail to perform their primary function.
- **P1 - Auth Failure**: Real users cannot log in via OAuth.
- **P1 - Infrastructure Failure**: Redis, DB, or Storage connection failures.

### 3. Severity: MINOR (Non-Blockers)
- **P2 - UI Glitch**: Alignment issues, wrong colors, or typos (unless in legal/billing docs).
- **P2 - Placeholder**: Mock data in secondary features (e.g., SEO Studio).
- **P2 - Performance**: Slow response times (unless > 10s).

## Resolution Workflow
1. **Identify**: Report the issue in the staging log.
2. **Triaging**: Dev team classifies as P0, P1, or P2.
3. **Fixing**: P0/P1 must be fixed and re-deployed to staging.
4. **Approval**: Staging must be "Clear of P0/P1" for 24 hours before moving to Production.
