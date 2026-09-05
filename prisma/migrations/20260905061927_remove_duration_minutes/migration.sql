/*
  Warnings:

  - You are about to drop the column `durationMinutes` on the `Interviews` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interviews" ("applicationId", "createdAt", "id", "notes", "scheduledAt", "status", "title", "type", "updatedAt") SELECT "applicationId", "createdAt", "id", "notes", "scheduledAt", "status", "title", "type", "updatedAt" FROM "Interviews";
DROP TABLE "Interviews";
ALTER TABLE "new_Interviews" RENAME TO "Interviews";
CREATE INDEX "Interviews_applicationId_idx" ON "Interviews"("applicationId");
CREATE INDEX "Interviews_scheduledAt_idx" ON "Interviews"("scheduledAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
