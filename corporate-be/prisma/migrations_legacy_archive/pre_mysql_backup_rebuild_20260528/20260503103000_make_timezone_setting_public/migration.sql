UPDATE "settings"
SET
  "value" = CASE
    WHEN "value" IS NULL THEN '"Asia/Jakarta"'::jsonb
    ELSE "value"
  END,
  "group" = COALESCE(NULLIF("group", ''), 'general'),
  "label" = COALESCE(NULLIF("label", ''), 'Timezone'),
  "description" = COALESCE(NULLIF("description", ''), 'Canonical timezone used for CMS scheduling and public date display.'),
  "is_public" = true,
  "is_system" = true,
  "updated_at" = NOW()
WHERE "key" = 'timezone';
