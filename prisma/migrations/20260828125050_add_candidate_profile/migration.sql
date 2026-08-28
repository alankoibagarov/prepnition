/*
  Warnings:

  - You are about to drop the column `userId` on the `Interview` table. All the data in the column will be lost.
  - Added the required column `profileId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Interview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "companyUrl" TEXT,
    "position" TEXT,
    "scheduledAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Interview_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("company", "companyUrl", "createdAt", "deletedAt", "id", "notes", "position", "scheduledAt", "status", "title", "updatedAt") SELECT "company", "companyUrl", "createdAt", "deletedAt", "id", "notes", "position", "scheduledAt", "status", "title", "updatedAt" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
CREATE INDEX "Interview_profileId_idx" ON "Interview"("profileId");
CREATE INDEX "Interview_scheduledAt_idx" ON "Interview"("scheduledAt");
CREATE INDEX "Interview_deletedAt_idx" ON "Interview"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
