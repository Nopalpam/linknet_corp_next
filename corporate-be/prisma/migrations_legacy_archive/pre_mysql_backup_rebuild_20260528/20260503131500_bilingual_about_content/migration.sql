-- Convert General > About Content to bilingual rich text.

UPDATE settings
SET value = jsonb_build_object('en', value #>> '{}', 'id', value #>> '{}')
WHERE key = 'general_branding.about.content'
  AND jsonb_typeof(value::jsonb) = 'string';
