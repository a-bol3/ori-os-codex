# Ori-OS — The Unified Operating System for GTM Teams

**Ori-OS** is a comprehensive, multi-tenant SaaS platform designed to consolidate the fragmented sales and marketing stack into a single, AI-powered intelligence engine. It provides high-tech telemetry, streamlined CRM workflows, and advanced automation for modern Go-to-Market (GTM) teams.

## 🚀 Scope & Features

Ori-OS integrates the following core pillars into a single "Axion" design experience:

- **Command Center**: Real-time telemetry and system monitoring visualizer.
- **Lead Intelligence**: Automated enrichment and scoring with 50+ data points.
- **Relationship Hub (CRM)**: Full-cycle contact, company, and deal management.
- **Automation Studio**: Drag-and-drop workflow orchestrator for complex GTM playbooks.
- **Engagement Suite**: Deliverability-first email sequences and outbound management.
- **Knowledge Hub**: Notion-like collaborative workspace for internal documentation.
- **SEO Studio**: Content analysis, backlink monitoring, and competitor tracking.
- **Compliance Center**: GDPR-first architecture with audit logs and automated suppression.

## 🎨 Aesthetics: The Axion Design System

Ori-OS uses the proprietary **Axion UI**, characterized by:
- **Palette**: Obsidian backgrounds (#050505), vibrant orange accents (#FF5C00), and technical green signals (#00FF41).
- **Core Styles**: Sharp corners (0px radius), glassy glassmorphism effects, and terminal-inspired monospace typography.
- **Typography**: Primary use of "JetBrains Mono" for a tech-savvy, data-driven feel.

## 🛠 Technology Stack

### Monorepo Architecture
Managed via **Turborepo** and **pnpm** for optimized build pipelines and shared package management.

### Apps
- **Web (`apps/web`)**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, Recharts, Zustand.
- **API (`apps/api`)**: NestJS 10 (Centralized REST API), Prisma.
- **Worker (`apps/worker`)**: NestJS background job processor for high-latency tasks.

### Packages
- **Core (`packages/core`)**: Shared TypeScript types, schemas, and business logic.
- **Database (`packages/db`)**: Prisma client and multi-tenant schema definitions.

### Infrastructure
- **PostgreSQL 16**: Primary relational data store.
- **Redis 7**: High-performance caching and message queuing.
- **MeiliSearch**: Ultra-fast global search across all system entities.
- **MinIO**: S3-compatible object storage for media and document assets.

## 💻 Installation & Local Development

### Prerequisites
- **Node.js**: 20.x or higher
- **pnpm**: 10.x or higher
- **Docker**: For running infrastructure services

### Setup Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/ib4d/ori-os.git
   cd ori-os
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create your environment file**:
   ```bash
   copy .env.example .env
   ```

4. **Spin up local infrastructure**:
   ```bash
   npm run dev:up
   ```

5. **Initialize Database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start the app locally**:
   ```bash
   npm run dev:local
   ```
   - Web: `http://localhost:3000`
   - API: `http://localhost:4000`

### Local recovery commands
- **Reset local app processes and build caches**:
  ```bash
  npm run dev:reset
  ```
- **Run only the frontend**:
  ```bash
  npm run dev:web
  ```
- **Run only the API**:
  ```bash
  npm run dev:api
  ```

### Development auth bypass
- Keep `ORI_AUTH_BYPASS=0` by default.
- Enable it only for local development when you need to access the dashboard without full auth wiring.
- When bypass is enabled locally, also set:
  - `ORI_DEV_USER_ID`
  - `ORI_DEV_ORGANIZATION_ID`
- The backend guard already blocks auth bypass outside `NODE_ENV=development`.

## 🌐 Production Readiness & Deployment

### Hostinger VPS Deployment
Ori-OS is optimized for deployment on **Hostinger VPS** plans under the domain `ori-os-ori-craftlabs.com`.

**Key Requirements for Deployment:**
- **OS**: Ubuntu 24.04 LTS (recommended).
- **Docker & Compose**: For containerized deployment of services.
- **Reverse Proxy**: Caddy (recommended for automatic SSL) or Nginx.

**Production Checklist:**
- [ ] Set `ORI_AUTH_BYPASS=0` in `.env`.
- [ ] Set `NODE_ENV=production`.
- [ ] Configure persistent volumes for PostgreSQL, MinIO, and MeiliSearch.
- [ ] Align Prisma versions across packages before final build.
- [ ] Validate all external API keys (OpenAI, Resend, Stripe).

## 📄 Documentation
For more detailed information, see the `docs/` folder:
- `DEPLOY_HOSTINGER.md`: Detailed VPS setup guide.
- `project_audit_report.md`: Technical debt and roadmap analysis.
- `worklog.md`: History of implementation phases.

---
© 2026 Ori-CraftLabs. All rights reserved.
