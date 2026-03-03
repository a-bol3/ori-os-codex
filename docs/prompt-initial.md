# Build “Ori‑OS” – Full SaaS Platform (Next.js 16, Compliance‑First Lead Gen Hub, Optimized for Hostinger VPS)

Act as a +20 years senior full‑stack engineer, product architect, and UI/UX lead.  
Your mission is to (re)build **Ori‑OS** end‑to‑end as a production‑ready SaaS, using the tech stack and architecture below, and **encoding best‑practice lead‑gen, deliverability, GDPR workflows, a Notion‑like knowledge/task hub, n8n‑style automations, AND full leverage of a Hostinger VPS environment**.

You must output **complete, coherent code** (entire files, not snippets) and a **step‑by‑step execution plan** for:

- Local development in VSCode on Windows.
- Containerized deployment on **my Hostinger VPS** using Docker/Docker Compose and, where helpful, Hostinger’s Docker Manager and VPS API.

---

## 0. Context & Product Definition

Ori‑OS is an all‑in‑one platform that replaces the typical stack of: Apollo.io, Sales Navigator + Phantombuster/TexAu, Woodpecker/Quickmail, n8n/Make, Attio/HubSpot CRM, PostHog, Notion, and basic content tools.

Core philosophy: **“One input, complete intelligence.”**  
User inputs a target (niche / company / problem), and Ori‑OS runs the loop:

> Find → Enrich → Analyze → Strategize → Engage → Measure → Iterate

Key constraints:

- Single login, single dashboard, single source of truth.
- Avoid hard dependencies on third‑party tools for core logic.
- If external APIs are needed (email sending, SMS, payments, calendar, validation, warm‑up, transcription, proxies, etc.):
  - Explain *why* clearly.
  - Implement native connectors and OAuth/API‑key management so the user connects once.
  - Ensure the platform still works in a **local MVP mode** with reduced features if connectors are not configured.

Ori‑OS has two main faces:

1. **Marketing Site** – marketing pages, pricing, blog, demo flows, legal.
2. **App Dashboard** – multi‑tenant workspace with feature modules.

---

## 1. Tech Stack & Repo Structure (Hostinger‑Aware)

### 1.1 Monorepo

Use a monorepo with this structure:

- `apps/web` – Next.js 16 (App Router) SaaS UI (marketing + app shell).
- `apps/api` – NestJS REST API (TypeScript) for core backend.
- `apps/worker` – Node worker (BullMQ) for queues, workflows, warm‑up, scraping orchestration, scheduled jobs.
- `packages/db` – Prisma schema, migrations, DB client.
- `packages/ui` – shared UI components (shadcn/ui, Tailwind config, design system).
- `packages/core` – shared domain logic (validation, GDPR helpers, deliverability utilities, workflow engine types, block/page engine for the Notion‑like module).
- `infra/` – **Hostinger‑oriented** Docker & deploy:
  - `docker-compose.yml` (production stack tailored for a single Hostinger VPS).
  - Additional compose files if needed (e.g. `docker-compose.dev.yml`, `docker-compose.ci.yml`).
  - Nginx config for reverse proxy and SSL termination.
  - Hostinger VPS deployment scripts (bash/PowerShell) using SSH and, where appropriate, Hostinger API.
- `docs/` – `README.md`, `CHANGELOG.md`, `QUICK_START.md`, `DEPLOYMENT_HOSTINGER.md`, architecture diagrams (markdown), and an “App Tree”.

**Important:**  
Design the `docker-compose.yml` to be **directly usable** with Hostinger’s Docker Manager (no exotic Docker features they don’t support). Provide clear instructions in `DEPLOYMENT_HOSTINGER.md` on how to:

- Upload or reference the compose file from GitHub.
- Start, stop, and update the stack using Hostinger’s Docker Manager UI and/or SSH.

### 1.2 Frontend

- **Framework:** Next.js 16 App Router, TypeScript, Server Components where possible.
- **Styling:** TailwindCSS + shadcn/ui + shadcnblocks sections.
- **Visuals:** gradients, glassmorphism, subtle noise, micro/macro animations via Framer Motion.
- **Icons:** Lucide. Always premium elegant feeling (no childish imagery, emojis, etc), and 1 main color (or 2 when needed) per UI surface.
- **Design language:** very small or zero border radius for main cards, tables, and buttons, consistent with Ori‑OS screenshots. Use screenshots as inspiration, but final result should be near 90% likeness (UI design and typography included).
- **Color palette** (use as CSS variables / Tailwind theme):
  - `#393d3f` gunmetal (dark background)
  - `#fdfdff` white
  - `#c6c5b9` silver
  - `#10050c` coffee‑bean (deep accent)
  - `#f77f00` vivid‑tangerine (primary accent)
- **State management & data fetching:** React Query (TanStack Query) as primary remote‑data layer; minimal Zustand for local UI state.
- **Charts:** Recharts (or a better library if justified) with theme‑consistent styling.
- **Workflow builder:** React Flow for the Automation Studio canvas.
- **Block editor:** rich block‑based editor for the Notion‑like module (pages, blocks, inline commands, drag‑and‑drop).

### 1.3 Backend

- **Framework:** NestJS (TypeScript).
- **DB:** PostgreSQL with Prisma.
- **Queue:** Redis + BullMQ.
- **Search:** Meilisearch (primary) with an abstraction so Elasticsearch could be plugged later.
- **File storage:** 
  - Local disk for dev.
  - S3‑compatible for production (e.g. MinIO or Hostinger’s object storage / external S3 provider), deployed as a container or external service on the Hostinger VPS.
- **Auth:** 
  - Email/password + OAuth (Google, Microsoft).
  - Multi‑tenant by Organizations (workspaces).
  - RBAC: `owner`, `admin`, `manager`, `operator`, `viewer`.
  - JWT access tokens + refresh tokens, secure cookies.
- **Security/Compliance:**
  - Encryption at rest for secrets/API keys (e.g. using libsodium or AES via a master key env var).
  - 2FA scaffold (TOTP entities, UI, API).
  - Audit logs for critical actions (exports, deletions, permission changes, workflow edits, domain changes).
  - GDPR: retention policies, export & delete (right‑to‑be‑forgotten) endpoints.

---

## 1.4 Hostinger VPS Integration Requirements

Design Ori‑OS to explicitly take advantage of Hostinger VPS features:

1. **Dockerized deployment**
   - All components (web, api, worker, Redis, Postgres, Meilisearch, MinIO/S3) must run in Docker containers orchestrated by `docker-compose.yml`, suitable for Hostinger’s Docker Manager.
   - Provide clear instructions for:
     - Deploying and updating the stack via Hostinger Docker Manager GUI.
     - Deploying and updating the stack via SSH and `docker compose`.

2. **Dedicated resources & performance**
   - Assume a typical Hostinger VPS plan with dedicated vCPUs, RAM, and NVMe storage (KVM‑based).
   - Optimize API and DB settings (connection pool, caching, index usage) for this environment.
   - Provide ENV‑based tuning knobs for CPU/RAM constrained deployments (so scaling from small to larger Hostinger plans is easy).

3. **Hostinger VPS API for ops**
   - Provide a small internal module/service in `apps/api` that can call Hostinger’s VPS API (abstract URL and token via ENV) to:
     - **List & trigger backups/snapshots** (before major migrations or deploys).
     - **Fetch basic metrics** (CPU/RAM/disk) and expose them in an internal “Infra Health” panel (Owner‑only).
   - You don’t need to hard‑code Hostinger’s exact endpoints, but you must:
     - Create an integration abstraction (`HostingerVpsClient`) with methods like `createSnapshot()`, `listSnapshots()`, `getResourceUsage()`.
     - Document in `DEPLOYMENT_HOSTINGER.md` how the user can plug in their actual Hostinger API token and base URL.

4. **Backups & disaster recovery flow**
   - Document a **recommended deployment flow** that:
     - Calls `createSnapshot()` (or instructs the user) before applying DB migrations or major releases.
     - Provides a manual fallback procedure in case of failure (restore previous snapshot and roll back app version).

5. **CI/CD on VPS (optional but scaffolded)**
   - Include an `infra/ci/` folder with basic configuration/examples for running:
     - Woodpecker CI or Jenkins as Docker containers on the same or a dedicated Hostinger VPS.
   - Explain in docs how to:
     - Build Docker images on CI.
     - Push to a registry (Docker Hub or GHCR).
     - Pull updated images on the Hostinger VPS and restart the stack.

6. **Scraping & outbound traffic safety**
   - All web scraping/crawling components (Intelligence module workers) must:
     - Run on the Hostinger VPS inside Docker.
     - Use **external rotating proxy APIs** (configured via ENV) for risky outbound scraping (directories, web pages), so Hostinger’s own IP is not abused.
     - Implement per‑domain rate limiting, robots.txt respect, and back‑off strategies.
   - Implement a `ProxyProvider` abstraction so proxy vendor can be swapped without code changes.
   - Document this clearly: **Hostinger VPS is the orchestrator and worker host; IP rotation and anti‑block behavior come from external proxy services.**

---

## 2. Product Modules (Feature Requirements)

### 2.1 Shared Concepts

Model these core entities in Prisma and expose them via the API:

- `Organization` (workspace)
- `User` (with membership & role per organization)
- `Domain` (sending domains and mailboxes)
- `Mailbox` (individual email identities connected)
- `Company`, `Contact`, `Deal`, `Activity`, `Task`, `Note`
- `Segment` (saved filters / dynamic lists)
- `Campaign` (outbound sequence)
- `EmailTemplate`, `SequenceStep`
- `Workflow` (Automation Studio definition)
- `WorkflowRun` and `WorkflowRunStep`
- `Event` (analytics events)
- `AuditLog`
- `GDPRRequest` (export/delete)
- `WarmupPlan`, `WarmupJob`
- `ValidationJob` (list/email validation pipeline)
- `ComplianceProfile` (regional defaults per org, e.g., EU‑strict)
- **Notion‑like entities:**
  - `WorkspacePage` (hierarchical page tree)
  - `Block` (typed blocks: text, heading, list, toggle, callout, image, file, code, database, etc.)
  - `KnowledgeDatabase` (Notion‑style database)
  - `KnowledgeView` (table, board, calendar, timeline, gallery, list)
  - `KnowledgeProperty` (text, number, select, multi‑select, date, person, status, relation, rollup, formula, files, URL, AI)
  - `KnowledgeRelation` / `KnowledgeRollup`
  - `KnowledgeTask` (tasks in the Task/Project Manager, linked to CRM entities)
  - `KnowledgeComment`, `KnowledgeTemplate`
  - `KnowledgeForm` (forms that write into databases)

Make everything multi‑tenant via `organizationId`. Seed dummy data (≥ 50 contacts, 20 companies, sample tasks/docs) for realistic first‑run experience across modules.

---

### 2.2 Dashboard (Command Center)

(Keep as already defined: KPIs, trends, activity feed, alerts, quick actions, global search.)

---

### 2.3 Intelligence (Find + Enrich + Analyze)

Include the scraping architecture with Hostinger constraints:

- Scraper workers run as containers on Hostinger VPS, orchestrated by queues.
- All HTTP scraping (except trivial/your own endpoints) must:
  - Go through configured proxy APIs.
  - Respect robots.txt.
  - Apply domain‑level rate limits stored in DB or cache.

(Keep all previous Discovery / Enrichment / AI Analysis / ToS safety requirements; just ensure they are implemented with the scraping architecture above.)

---

### 2.4 Relationship Hub (CRM)

(As previously defined.)

---

### 2.5 Automation Studio (Native “n8n‑like”)

Include:

- Engine and nodes as previously defined.
- **Template library** with Automation Types & concrete workflows:
  - Lead Capture, Lead Research, Lead Qualification, Outreach & Nurture, CRM Hygiene, Marketing & Content, Reporting & Analytics, Task Manager & Knowledge, Customer Success, AI Orchestration.
- All workflow execution is handled by `apps/worker` on the Hostinger VPS using Redis + BullMQ.

Templates must be stored as **seeded JSON** and visible in a Template Gallery UI grouped by Automation Type.

---

### 2.6 Engagement Suite (Outreach + Inbox + Deliverability)

(As defined before: sequences, templates, inbox, meetings, warm‑up, pre‑flight checks, validation.)

---

### 2.7 Compliance & GDPR Module

(As defined previously.)

---

### 2.8 Roles, Permissions & Safety

(As defined previously, including Task Manager scopes and protecting infra ops features to Owner/Admin.)

---

### 2.9 Task Manager (Notion‑like Knowledge & Project Hub)

(Use the full specification already defined: pages, blocks, databases, tasks, notes, wiki, AI, projects, content, docs, layout, integrations, forms, sites, charts.)

---

## 3. Database Schema (Prisma)

- Implement the full schema in `packages/db/prisma/schema.prisma`.
- Respect multi‑tenant design (every business object has `organizationId`).
- Index frequent queries (email, domain, externalId, page title, database id, task status, workflow triggers).
- Provide initial migrations and **seed script** to create example data on first run.

---

## 4. API Design (NestJS)

Design REST (or REST + minimal GraphQL) endpoints around:

1. **Auth & Orgs:** login, register, invite user, accept invite, list orgs, switch org, manage roles, 2FA.
2. **Domains & Mailboxes:** CRUD domains, verify DNS, run audits, setup warm‑up, manage limits.
3. **Companies & Contacts:** CRUD, bulk import, search, segments management.
4. **Campaigns & Sequences:** CRUD campaigns, steps, start/stop, stats.
5. **Workflows:** CRUD workflows, run, pause, resume, get history, list template catalog, instantiate templates.
6. **Events & Analytics:** ingest events, query KPIs.
7. **Deliverability:** run audits, get list health, run spam check, view warm‑up status.
8. **GDPR & Compliance:** export contact data, delete/anonymise, manage suppression lists.
9. **Connectors:** manage API keys/OAuth, test connections, list available integrations.
10. **Task Manager:** pages, blocks, databases, views, tasks, comments, forms, sites, AI operations, search.
11. **Scraping:** safe endpoints for starting/stopping domain crawls, with clear constraints.
12. **HostingerOps (internal):**
    - `GET /internal/hostinger/usage` – returns CPU/RAM/disk usage (via Hostinger API).
    - `POST /internal/hostinger/snapshot` – triggers VPS snapshot before deploy (or logs instructions if API not wired).
    - These routes must be Owner‑only and disabled by default without env config.

Include DTOs, validation, and example request/response bodies in docs.

---

## 5. Worker Behaviour (BullMQ on Hostinger VPS)

Describe and implement workers for:

- Workflow execution (`WorkflowRun`).
- Warm‑up sending (`WarmupPlan` & `WarmupJob`).
- List validation (`ValidationJob`).
- Domain audits & reputation checks.
- Automation template workflows (all categories).
- Task Manager automations (recurring tasks, reminders, AI summarisation jobs, rollup recalculation).
- Scraping workers (Intelligence crawlers) with:
  - Proxy usage.
  - Robots.txt respect.
  - Domain‑level throttling and back‑off.
- Scheduled tasks (daily metrics aggregation, bounce processing, list hygiene).

All workers run as containers on the Hostinger VPS and are restarted/updated through Docker (manual or CI/CD).

Workers must be idempotent and safe to retry.

---

## 6. UX Flows to Implement (Important)

- **“New Campaign” wizard** – Objective & ICP → Audience & Data → Sending → Sequence → Compliance → Pre‑flight & Launch.
- **“New Page” flow** – location → template → editor → AI assist.
- **“New Database” flow** – use case → fields → default view → forms/site.
- **Automation Template Gallery** – browse by Automation Type, preview, “Use this template”.
- **Internal Infra Panel (Owner only)** – simple status page that:
  - Shows Hostinger VPS resource usage (if API wired).
  - Shows last backup/snapshot info.
  - Offers “Create snapshot before deploy” button (if API wired; otherwise, show manual instructions).

---

## 7. Deployment to Hostinger VPS

In `DEPLOYMENT_HOSTINGER.md`, provide **very explicit**, step‑by‑step instructions tailored to Hostinger VPS, including:

1. **Initial server setup**
   - How to log in via SSH and via hPanel.
   - How to enable Docker (and Docker Manager) on the VPS.
2. **Environment configuration**
   - How to create `.env` files for `apps/web`, `apps/api`, `apps/worker`, DB, Redis, Meilisearch, MinIO, proxies, and Hostinger API.
3. **Docker Compose deployment**
   - How to upload or reference `docker-compose.yml` in Docker Manager.
   - How to bring the stack up (`docker compose up -d`) via SSH.
   - How to update containers when pushing new versions (pull new images, restart stack).
4. **NGINX & SSL**
   - How to configure Nginx as reverse proxy for `web` and `api` containers.
   - How to obtain and renew SSL certificates (Let’s Encrypt).
5. **Backups & snapshots**
   - How to configure and verify automatic weekly backups in hPanel.
   - How to manually create and restore snapshots before/after big changes.
6. **Scaling**
   - How to scale up:
     - Bigger VPS plan.
     - Optional second VPS for DB/Redis.
   - What ENV/config changes are needed.

---

## 8. Delivery Expectations

- Provide full repo tree and then **all files**, organised by directory.
- No `...` placeholders; include implementation, even if some integrations are stubbed with clear comments and “TODO”.
- Include:
  - `QUICK_START.md` – local dev on Windows (install deps, env template, run docker, prisma migrate, seed, run all apps).
  - `DEPLOYMENT_HOSTINGER.md` – **Hostinger‑specific** Docker‑based deployment (Docker Manager + SSH), Nginx reverse proxy, SSL, env management, DB backups, snapshots, zero‑downtime update flow.
  - “What’s implemented vs stubbed” matrix.

Make reasonable assumptions and document them in the docs.  
Prioritise a coherent, working MVP with clear extension points over maximal feature depth.

Start now.
