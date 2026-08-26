-- Guarantees one Gmail integration and one token set per organization/integration.
CREATE UNIQUE INDEX "integrations_organizationId_type_key"
  ON "integrations"("organizationId", "type");

CREATE UNIQUE INDEX "integration_tokens_integrationId_key"
  ON "integration_tokens"("integrationId");
