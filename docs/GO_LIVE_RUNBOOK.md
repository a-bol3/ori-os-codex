# Go-Live Runbook

This document provides a step-by-step checklist for the production launch of Ori-OS.

## T-Minus 24 Hours
- [ ] **Final Staging Review**: Ensure all P0/P1 blockers in staging are resolved.
- [ ] **Credential Check**: Complete the [Production Credential Activation Checklist](./PROD_CREDENTIALS_CHECKLIST.md).
- [ ] **Infrastructure Verification**: Ensure Hostinger VPS is provisioned and accessible.

## T-Minus 2 Hours (Maintenance Window Begins)
- [ ] **Announce Maintenance**: Update the marketing page with a "Scheduled Maintenance" banner.
- [ ] **Feature Flags**: Set initial flags in the production `.env` (e.g., `ENABLE_SEO_STUDIO=false`).

## Launch Procedure (Execution)
1. **Push Tags**: Push the release tag to GitHub.
```bash
git tag v1.0.0
git push origin v1.0.0
```
2. **Deploy Code**: Run the production deployment script on the VPS.
```bash
./scripts/deploy-prod.sh
```
3. **Database Migration**: Verify migrations applied successfully.
4. **Caddy Config**: Ensure `Caddyfile` is correctly pointing to the production domains.

## T-Plus 30 Minutes (Smoke Testing)
- [ ] **Auth Check**: Log in with a production Google/GitHub account.
- [ ] **API Health**: Confirm `/health` endpoints are green.
- [ ] **Monitoring**: Check logs for any immediate runtime errors.

## T-Plus 1 Hour (Go-Live)
- [ ] **Remove Maintenance Banner**: Set the site to live mode.
- [ ] **Internal Announcement**: Notify the team that Ori-OS is live!

---
**Launch Lead**: __________________  
**Start Time**: __________________  
**End Time**: __________________
