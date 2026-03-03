# Staging Smoke Test Checklist

After deployment to staging, execute these tests to ensure the build is stable.

## 1. Infrastructure Checks
- [ ] API Health Check: `https://staging-api.ori-craftlabs.com/health` returns 200.
- [ ] DB Migration: Verify `prisma_migrations` table contains the latest migration.
- [ ] Redis: Check if worker is consuming from `email-send` queue.

## 2. Authentication
- [ ] Login: Verify Google/GitHub OAuth works on staging.
- [ ] Session: Verify session persists across page refreshes.
- [ ] Bypass: Verify access to `/dashboard` is denied without login.

## 3. Core Features
- [ ] CRM: Create a test contact and company.
- [ ] Automation: Trigger a "Test Event" workflow and check execution logs.
- [ ] Engagement: Create a test campaign and queue an email.

## 4. UI/UX
- [ ] CSS: Verify all styles load correctly (no broken Tailwind classes).
- [ ] Assets: Verify logo and icons load (no 404s).
- [ ] Links: Verify all marketing sidebars links work.

## 5. Mobile
- [ ] Responsiveness: Check dashboard layout on mobile viewport.

---
**Verified By**: __________________  
**Date**: __________________
