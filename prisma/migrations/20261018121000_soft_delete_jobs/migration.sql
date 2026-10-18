ALTER TABLE "Jobs" ADD COLUMN "deletedAt" DATETIME;

CREATE INDEX "Jobs_deletedAt_idx" ON "Jobs"("deletedAt");
