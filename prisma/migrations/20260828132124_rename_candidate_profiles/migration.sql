/*
  Warnings:

  - You are about to drop the `CandidateProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "CandidateProfile_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CandidateProfile";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CandidateProfiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CandidateProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "Interview_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Interview" ("company", "companyUrl", "createdAt", "deletedAt", "id", "notes", "position", "profileId", "scheduledAt", "status", "title", "updatedAt") SELECT "company", "companyUrl", "createdAt", "deletedAt", "id", "notes", "position", "profileId", "scheduledAt", "status", "title", "updatedAt" FROM "Interview";
DROP TABLE "Interview";
ALTER TABLE "new_Interview" RENAME TO "Interview";
CREATE INDEX "Interview_profileId_idx" ON "Interview"("profileId");
CREATE INDEX "Interview_scheduledAt_idx" ON "Interview"("scheduledAt");
CREATE INDEX "Interview_deletedAt_idx" ON "Interview"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfiles_userId_key" ON "CandidateProfiles"("userId");
