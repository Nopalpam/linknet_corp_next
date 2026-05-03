ALTER TABLE "pages"
  ADD COLUMN IF NOT EXISTS "title_en" TEXT,
  ADD COLUMN IF NOT EXISTS "title_id" TEXT;

UPDATE "pages"
SET "title_en" = COALESCE("title_en", "title")
WHERE "title_en" IS NULL;
