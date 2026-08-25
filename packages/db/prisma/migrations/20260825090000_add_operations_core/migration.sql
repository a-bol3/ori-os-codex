-- Extend shared tasks for Operations Core without duplicating the task system.
ALTER TABLE "tasks"
ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'medium',
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'crm',
ADD COLUMN "operationIncidentId" TEXT,
ADD COLUMN "idempotencyKey" TEXT;

CREATE TABLE "operation_incidents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "category" TEXT,
    "ownerUserId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "idempotencyKey" TEXT,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "operation_incidents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "risk_signals" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "incidentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "idempotencyKey" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "risk_signals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commitments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "incidentId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ownerUserId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "idempotencyKey" TEXT,
    "completedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "commitments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "incidentId" TEXT,
    "actionType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedBy" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "panic_protocol_runs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "severity" TEXT NOT NULL DEFAULT 'critical',
    "category" TEXT NOT NULL,
    "factsJson" JSONB NOT NULL DEFAULT '[]',
    "unknownsJson" JSONB NOT NULL DEFAULT '[]',
    "checklistJson" JSONB NOT NULL DEFAULT '[]',
    "contactsJson" JSONB NOT NULL DEFAULT '[]',
    "idempotencyKey" TEXT,
    "activatedBy" TEXT,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "panic_protocol_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_logs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "minutes" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'operations',
    "outsideHours" BOOLEAN NOT NULL DEFAULT false,
    "travelMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdBy" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "work_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workload_snapshots" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "workedMinutes" INTEGER NOT NULL DEFAULT 0,
    "outsideHoursMinutes" INTEGER NOT NULL DEFAULT 0,
    "travelMinutes" INTEGER NOT NULL DEFAULT 0,
    "openIncidents" INTEGER NOT NULL DEFAULT 0,
    "criticalIncidents" INTEGER NOT NULL DEFAULT 0,
    "overdueCommitments" INTEGER NOT NULL DEFAULT 0,
    "loadScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "source" TEXT NOT NULL DEFAULT 'operations-worker',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workload_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tasks_organizationId_idempotencyKey_key" ON "tasks"("organizationId", "idempotencyKey");
CREATE INDEX "tasks_organizationId_status_dueDate_idx" ON "tasks"("organizationId", "status", "dueDate");
CREATE INDEX "tasks_operationIncidentId_idx" ON "tasks"("operationIncidentId");
CREATE UNIQUE INDEX "operation_incidents_organizationId_idempotencyKey_key" ON "operation_incidents"("organizationId", "idempotencyKey");
CREATE INDEX "operation_incidents_organizationId_status_severity_idx" ON "operation_incidents"("organizationId", "status", "severity");
CREATE INDEX "operation_incidents_organizationId_lastActivityAt_idx" ON "operation_incidents"("organizationId", "lastActivityAt");
CREATE UNIQUE INDEX "risk_signals_organizationId_idempotencyKey_key" ON "risk_signals"("organizationId", "idempotencyKey");
CREATE INDEX "risk_signals_organizationId_status_severity_idx" ON "risk_signals"("organizationId", "status", "severity");
CREATE INDEX "risk_signals_incidentId_idx" ON "risk_signals"("incidentId");
CREATE UNIQUE INDEX "commitments_organizationId_idempotencyKey_key" ON "commitments"("organizationId", "idempotencyKey");
CREATE INDEX "commitments_organizationId_status_dueAt_idx" ON "commitments"("organizationId", "status", "dueAt");
CREATE INDEX "commitments_incidentId_idx" ON "commitments"("incidentId");
CREATE UNIQUE INDEX "approval_requests_organizationId_idempotencyKey_key" ON "approval_requests"("organizationId", "idempotencyKey");
CREATE INDEX "approval_requests_organizationId_status_createdAt_idx" ON "approval_requests"("organizationId", "status", "createdAt");
CREATE INDEX "approval_requests_incidentId_idx" ON "approval_requests"("incidentId");
CREATE UNIQUE INDEX "panic_protocol_runs_organizationId_idempotencyKey_key" ON "panic_protocol_runs"("organizationId", "idempotencyKey");
CREATE INDEX "panic_protocol_runs_organizationId_status_activatedAt_idx" ON "panic_protocol_runs"("organizationId", "status", "activatedAt");
CREATE INDEX "panic_protocol_runs_incidentId_idx" ON "panic_protocol_runs"("incidentId");
CREATE UNIQUE INDEX "work_logs_organizationId_idempotencyKey_key" ON "work_logs"("organizationId", "idempotencyKey");
CREATE INDEX "work_logs_organizationId_startedAt_idx" ON "work_logs"("organizationId", "startedAt");
CREATE UNIQUE INDEX "workload_snapshots_organizationId_snapshotDate_key" ON "workload_snapshots"("organizationId", "snapshotDate");
CREATE INDEX "workload_snapshots_organizationId_snapshotDate_idx" ON "workload_snapshots"("organizationId", "snapshotDate");

ALTER TABLE "operation_incidents" ADD CONSTRAINT "operation_incidents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "risk_signals" ADD CONSTRAINT "risk_signals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "risk_signals" ADD CONSTRAINT "risk_signals_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "operation_incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commitments" ADD CONSTRAINT "commitments_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "operation_incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "approval_requests" ADD CONSTRAINT "approval_requests_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "operation_incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "panic_protocol_runs" ADD CONSTRAINT "panic_protocol_runs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "panic_protocol_runs" ADD CONSTRAINT "panic_protocol_runs_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "operation_incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_logs" ADD CONSTRAINT "work_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workload_snapshots" ADD CONSTRAINT "workload_snapshots_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_operationIncidentId_fkey" FOREIGN KEY ("operationIncidentId") REFERENCES "operation_incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
