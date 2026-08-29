/*
  Warnings:

  - You are about to drop the column `company` on the `Applications` table. All the data in the column will be lost.
  - You are about to drop the column `companyUrl` on the `Applications` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Applications` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `Applications` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Applications` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `Applications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Interviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduledAt" DATETIME,
    "durationMinutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "appliedAt" DATETIME,
    "closedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Applications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Applications" ("createdAt", "deletedAt", "id", "notes", "profileId", "status", "updatedAt") SELECT "createdAt", "deletedAt", "id", "notes", "profileId", "status", "updatedAt" FROM "Applications";
DROP TABLE "Applications";
ALTER TABLE "new_Applications" RENAME TO "Applications";
CREATE INDEX "Applications_profileId_idx" ON "Applications"("profileId");
CREATE INDEX "Applications_jobId_idx" ON "Applications"("jobId");
CREATE INDEX "Applications_deletedAt_idx" ON "Applications"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Interviews_applicationId_idx" ON "Interviews"("applicationId");

-- CreateIndex
CREATE INDEX "Interviews_scheduledAt_idx" ON "Interviews"("scheduledAt");
