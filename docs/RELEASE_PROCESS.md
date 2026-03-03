# Release Process

This document defines the versioning and release strategy for the Ori-OS monorepo.

## 1. Versioning Strategy
We use [Semantic Versioning (SemVer)](https://semver.org/).
- **MAJOR**: Breaking changes or major architectural shifts.
- **MINOR**: New features or significant improvements.
- **PATCH**: Bug fixes and minor updates.

## 2. Release Branches
- `main`: The stable production-ready code.
- `develop`: Ongoing feature development and integration.
- `feature/*`: Short-lived branches for specific tasks.

## 3. The Release Cycle
1. **Merge to Develop**: Complete features are merged into `develop`.
2. **Release Candidate (RC)**: When ready for a release, merge `develop` into `staging`.
3. **Verification**: Execute [Staging Smoke Tests](./STAGING_SMOKE_TESTS.md).
4. **Tagging**: Create a Git tag for the version:
```bash
git tag -a v1.x.x -m "Release version 1.x.x"
git push origin v1.x.x
```
5. **Merge to Main**: Merge the tagged commit into `main`.

## 4. Production Deployment
Production deployments are triggered only from the `main` branch or specific release tags using the `deploy-prod.sh` script.

## 5. Hotfix Process
If a P0 issue occurs in production:
1. Create a `hotfix/*` branch from `main`.
2. Apply the fix.
3. Merge back to `main` (and `develop`).
4. Re-tag and deploy with a patch version increment.
