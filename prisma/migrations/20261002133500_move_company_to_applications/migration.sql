PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "appliedAt" DATETIME,
    "closedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "Applications_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Jobs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Applications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Applications" (
    "id", "profileId", "jobId", "companyId", "status", "appliedAt",
    "closedAt", "notes", "createdAt", "updatedAt", "deletedAt"
)
SELECT
    "Applications"."id",
    "Applications"."profileId",
    "Applications"."jobId",
    "Jobs"."companyId",
    "Applications"."status",
    "Applications"."appliedAt",
    "Applications"."closedAt",
    "Applications"."notes",
    "Applications"."createdAt",
    "Applications"."updatedAt",
    "Applications"."deletedAt"
FROM "Applications"
LEFT JOIN "Jobs" ON "Jobs"."id" = "Applications"."jobId";

DROP TABLE "Applications";
ALTER TABLE "new_Applications" RENAME TO "Applications";
CREATE INDEX "Applications_profileId_idx" ON "Applications"("profileId");
CREATE INDEX "Applications_jobId_idx" ON "Applications"("jobId");
CREATE INDEX "Applications_companyId_idx" ON "Applications"("companyId");
CREATE INDEX "Applications_deletedAt_idx" ON "Applications"("deletedAt");

CREATE TABLE "new_Jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Jobs" (
    "id", "title", "description", "location", "salary", "createdAt", "updatedAt"
)
SELECT
    "id", "title", "description", "location", "salary", "createdAt", "updatedAt"
FROM "Jobs";

DROP TABLE "Jobs";
ALTER TABLE "new_Jobs" RENAME TO "Jobs";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
