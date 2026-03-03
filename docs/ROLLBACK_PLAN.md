# Rollback Plan

This document defines the procedure for reverting to a previous stable version of Ori-OS in case of a failed deployment.

## 1. Rollback Triggers
- P0/P1 issues identified during Go-Live Smoke Tests.
- Sustained system downtime > 15 minutes after deployment.
- Data corruption or security vulnerability discovered in the new version.

## 2. Strategy: Binary/Image Rollback
Since we use Docker, rollback is accomplished by re-deploying the previous image tags.

### Step-by-Step Rollback
1. **Identify Stable Version**: Find the previous stable Git tag (e.g., `v1.2.3`).
2. **Revert Configuration**: If the deployment involved `.env` changes, revert them to the previous values.
3. **Re-deploy Previous Version**:
```bash
# Using the deployment script with a specific version/tag
./scripts/deploy-prod.sh --version v1.2.3
```
4. **Database Rollback (CAUTION)**:
    - If the new version included destructive migrations, you MAY need to restore the pre-deployment database backup.
    - **Warning**: Restoring a backup will lose any data created between the deployment and the rollback.

## 3. Database Migration Rollback
If only the schema needs to be reverted and data is intact:
```bash
docker exec -it ori-os-api npx prisma migrate diff --from-schema ... --to-schema ...
# OR manually revert the last migration if supported
```

## 4. Verification
After rollback, execute the [Smoke Test Checklist](./STAGING_SMOKE_TESTS.md) to ensure the system is back to a healthy state.
