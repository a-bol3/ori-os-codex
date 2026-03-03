# Ori-OS Verification Matrix

This document provides a matrix of verified routes and their implementation status as of Phase 2 of the Deployment Hardening Mission.

## Marketing Routes

| Route | Status | Auth Required | API Backed | Verified |
|-------|--------|---------------|------------|----------|
| `/` | ![Working](https://img.shields.io/badge/Status-Working-green) | No | No | Yes |
| `/pricing` | ![Working](https://img.shields.io/badge/Status-Working-green) | No | No | Yes |
| `/about` | ![Working](https://img.shields.io/badge/Status-Working-green) | No | No | Yes |
| `/solutions` | ![Working](https://img.shields.io/badge/Status-Working-green) | No | No | Yes |

## Dashboard Routes (`/dashboard/*`)

| Route | Status | Auth Required | API Backed | Data Source | Verified |
|-------|--------|---------------|------------|-------------|----------|
| `/dashboard` | ![Working](https://img.shields.io/badge/Status-Working-green) | Yes | Yes | API | Yes |
| `/dashboard/crm` | ![Working](https://img.shields.io/badge/Status-Working-green) | Yes | Yes | API | Yes |
| `/dashboard/engagement` | ![Working](https://img.shields.io/badge/Status-Working-green) | Yes | Yes | API | Yes |
| `/dashboard/automation` | ![Working](https://img.shields.io/badge/Status-Working-green) | Yes | Yes | API | Yes |
| `/dashboard/seo` | ![Partial](https://img.shields.io/badge/Status-Partial-yellow) | Yes | No (Mocked UI) | Frontend Mocks | Yes |
| `/dashboard/settings` | ![Working](https://img.shields.io/badge/Status-Working-green) | Yes | Yes | API | Yes |

## Infrastructure & API

| Component | Status | Verified |
|-----------|---------|----------|
| Next.js Standalone Build | ![Success](https://img.shields.io/badge/Status-Success-green) | Yes |
| NestJS API Health | ![Success](https://img.shields.io/badge/Status-Success-green) | Yes |
| Database Connectivity | ![Success](https://img.shields.io/badge/Status-Success-green) | Yes |
| Redis / BullMQ Connection | ![Pending](https://img.shields.io/badge/Status-Pending-orange) | - |
| MinIO Storage | ![Pending](https://img.shields.io/badge/Status-Pending-orange) | - |

> [!NOTE]
> All dashboard routes are protected by Auth.js v5. Authentication bypass is only allowed in development when `ORI_AUTH_BYPASS=1` is set.
