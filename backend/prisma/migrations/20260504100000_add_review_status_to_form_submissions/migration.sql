-- Add review_status column to form_submissions for CMS review workflow (Hold/Rejected/Approved).
-- Existing rows will have NULL which UI treats as HOLD (default).
ALTER TABLE "form_submissions"
  ADD COLUMN IF NOT EXISTS "review_status" TEXT DEFAULT 'HOLD';
