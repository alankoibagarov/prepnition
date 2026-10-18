ALTER TABLE "Companies" ADD COLUMN "deletedAt" DATETIME;

CREATE INDEX "Companies_deletedAt_idx" ON "Companies"("deletedAt");
