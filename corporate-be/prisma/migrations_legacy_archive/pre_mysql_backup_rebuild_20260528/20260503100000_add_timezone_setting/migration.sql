INSERT INTO "settings" ("id", "key", "value", "type", "group", "label", "description", "is_public", "is_system", "created_at", "updated_at")
VALUES (
  '4f0f6c71-5f79-4a87-a4de-1e8d6c5c9d31',
  'timezone',
  '"Asia/Jakarta"'::jsonb,
  'STRING',
  'general',
  'Timezone',
  'Canonical timezone used for CMS scheduling and public date display.',
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("key") DO NOTHING;
