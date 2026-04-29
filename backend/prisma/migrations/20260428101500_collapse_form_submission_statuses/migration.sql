ALTER TYPE "FormSubmissionStatus" RENAME TO "FormSubmissionStatus_old";

CREATE TYPE "FormSubmissionStatus" AS ENUM ('STORED', 'FAILED');

ALTER TABLE "form_submissions"
  ADD COLUMN "status_next" "FormSubmissionStatus";

UPDATE "form_submissions" AS submission
SET "status_next" = CASE
  WHEN EXISTS (
    SELECT 1
    FROM "form_submission_dispatch_logs" AS log
    WHERE log."submission_id" = submission."id"
      AND log."status" = 'FAILED'
  ) THEN 'FAILED'::"FormSubmissionStatus"
  ELSE 'STORED'::"FormSubmissionStatus"
END;

ALTER TABLE "form_submissions"
  ALTER COLUMN "status_next" SET NOT NULL,
  ALTER COLUMN "status_next" SET DEFAULT 'STORED';

DROP INDEX IF EXISTS "form_submissions_status_idx";

ALTER TABLE "form_submissions"
  DROP COLUMN "status";

ALTER TABLE "form_submissions"
  RENAME COLUMN "status_next" TO "status";

CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");

DROP TYPE "FormSubmissionStatus_old";