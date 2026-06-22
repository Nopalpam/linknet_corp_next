ALTER TABLE "pages"
  ADD COLUMN IF NOT EXISTS "product" TEXT,
  ADD COLUMN IF NOT EXISTS "promo" TEXT,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "noindex" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "nofollow" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "updated_by_id" TEXT;

CREATE INDEX IF NOT EXISTS "pages_updated_by_id_idx" ON "pages"("updated_by_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pages_updated_by_id_fkey'
  ) THEN
    ALTER TABLE "pages"
      ADD CONSTRAINT "pages_updated_by_id_fkey"
      FOREIGN KEY ("updated_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "form_submissions"
  ADD COLUMN IF NOT EXISTS "product" TEXT;
