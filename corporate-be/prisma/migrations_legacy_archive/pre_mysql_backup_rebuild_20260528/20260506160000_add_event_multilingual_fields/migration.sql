ALTER TABLE "events"
    ADD COLUMN IF NOT EXISTS "title_id" TEXT,
    ADD COLUMN IF NOT EXISTS "hero_title_id" TEXT,
    ADD COLUMN IF NOT EXISTS "excerpt_id" TEXT,
    ADD COLUMN IF NOT EXISTS "content_id" TEXT;
