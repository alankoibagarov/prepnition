PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TEMP TABLE "_JobCompanyBackfill" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL
);

-- Preflight to inspect the company assignments that will be consolidated:
-- SELECT jobs."id", jobs."title", applications."companyId", companies."name",
--        COUNT(applications."id") AS application_count
-- FROM "Jobs" AS jobs
-- LEFT JOIN "Applications" AS applications ON applications."jobId" = jobs."id"
-- LEFT JOIN "Companies" AS companies ON companies."id" = applications."companyId"
-- GROUP BY jobs."id", jobs."title", applications."companyId", companies."name"
-- ORDER BY jobs."id", application_count DESC;
-- Choose a company explicitly for jobs with tied counts or no applications.
-- If preflight finds a tie or a job with no applications, add an explicit
-- mapping here before applying this migration, for example:
-- INSERT INTO "_JobCompanyBackfill" ("jobId", "companyId") VALUES ('job-id', 'company-id');

CREATE TEMP TABLE "_JobCompanyResolved" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL
);

WITH company_votes AS (
    SELECT "jobId", "companyId", COUNT(*) AS vote_count
    FROM "Applications"
    GROUP BY "jobId", "companyId"
),
unambiguous_winners AS (
    SELECT votes."jobId", votes."companyId"
    FROM company_votes AS votes
    WHERE votes.vote_count = (
        SELECT MAX(other_votes.vote_count)
        FROM company_votes AS other_votes
        WHERE other_votes."jobId" = votes."jobId"
    )
    AND 1 = (
        SELECT COUNT(*)
        FROM company_votes AS tied_votes
        WHERE tied_votes."jobId" = votes."jobId"
          AND tied_votes.vote_count = votes.vote_count
    )
)
INSERT INTO "_JobCompanyResolved" ("jobId", "companyId")
SELECT jobs."id", COALESCE(backfill."companyId", winners."companyId")
FROM "Jobs" AS jobs
LEFT JOIN "_JobCompanyBackfill" AS backfill ON backfill."jobId" = jobs."id"
LEFT JOIN unambiguous_winners AS winners ON winners."jobId" = jobs."id"
WHERE COALESCE(backfill."companyId", winners."companyId") IS NOT NULL;

CREATE TEMP TABLE "_JobCompanyMigrationGuard" ("unresolvedCount" INTEGER NOT NULL);
CREATE TEMP TRIGGER "_JobCompanyMigrationGuardTrigger"
BEFORE INSERT ON "_JobCompanyMigrationGuard"
WHEN NEW."unresolvedCount" > 0
BEGIN
    SELECT RAISE(
        ABORT,
        'Job company backfill is incomplete. Map tied or unreferenced jobs in this migration''s _JobCompanyBackfill section, then retry.'
    );
END;

INSERT INTO "_JobCompanyMigrationGuard" ("unresolvedCount")
SELECT COUNT(*)
FROM "Jobs" AS jobs
LEFT JOIN "_JobCompanyResolved" AS resolved ON resolved."jobId" = jobs."id"
WHERE resolved."jobId" IS NULL;

DROP TRIGGER "_JobCompanyMigrationGuardTrigger";
DROP TABLE "_JobCompanyMigrationGuard";

UPDATE "Applications"
SET "companyId" = (
    SELECT resolved."companyId"
    FROM "_JobCompanyResolved" AS resolved
    WHERE resolved."jobId" = "Applications"."jobId"
);

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

INSERT INTO "new_Applications" (
    "id", "profileId", "jobId", "status", "appliedAt", "closedAt", "notes",
    "createdAt", "updatedAt", "deletedAt"
)
SELECT
    "id", "profileId", "jobId", "status", "appliedAt", "closedAt", "notes",
    "createdAt", "updatedAt", "deletedAt"
FROM "Applications";

DROP TABLE "Applications";
ALTER TABLE "new_Applications" RENAME TO "Applications";
CREATE INDEX "Applications_profileId_idx" ON "Applications"("profileId");
CREATE INDEX "Applications_jobId_idx" ON "Applications"("jobId");
CREATE INDEX "Applications_deletedAt_idx" ON "Applications"("deletedAt");

CREATE TABLE "new_Jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Jobs" (
    "id", "title", "description", "location", "salary", "companyId",
    "createdAt", "updatedAt"
)
SELECT
    jobs."id", jobs."title", jobs."description", jobs."location", jobs."salary",
    resolved."companyId", jobs."createdAt", jobs."updatedAt"
FROM "Jobs" AS jobs
JOIN "_JobCompanyResolved" AS resolved ON resolved."jobId" = jobs."id";

DROP TABLE "Jobs";
ALTER TABLE "new_Jobs" RENAME TO "Jobs";
CREATE INDEX "Jobs_companyId_idx" ON "Jobs"("companyId");

DROP TABLE "_JobCompanyResolved";
DROP TABLE "_JobCompanyBackfill";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
