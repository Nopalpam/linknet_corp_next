ALTER TABLE "news"
  ADD COLUMN IF NOT EXISTS "meta_title" TEXT,
  ADD COLUMN IF NOT EXISTS "meta_description" TEXT,
  ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'PUBLIC';

UPDATE "news"
SET
  "meta_title" = COALESCE(NULLIF("meta_title", ''), NULLIF("title_en", '')),
  "meta_description" = COALESCE(NULLIF("meta_description", ''), NULLIF("meta_desc", ''), NULLIF("excerpt_en", ''))
WHERE "meta_title" IS NULL
   OR "meta_title" = ''
   OR "meta_description" IS NULL
   OR "meta_description" = '';

CREATE INDEX IF NOT EXISTS "news_visibility_idx" ON "news"("visibility");
