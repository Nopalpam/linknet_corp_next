-- Separate page context from form metadata while preserving existing submissions.
ALTER TABLE "form_submissions"
  ADD COLUMN IF NOT EXISTS "form_module_name" TEXT,
  ADD COLUMN IF NOT EXISTS "form_channel" TEXT;

UPDATE "form_field_options"
SET "label" = 'Live Chat'
WHERE "value" = 'start_conversation'
  AND "label" = 'Start Conversation';
