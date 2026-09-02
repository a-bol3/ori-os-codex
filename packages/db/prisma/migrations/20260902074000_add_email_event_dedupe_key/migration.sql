ALTER TABLE "email_events" ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "email_events_dedupeKey_key" ON "email_events"("dedupeKey");
