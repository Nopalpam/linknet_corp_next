UPDATE "label_nodes"
SET "values" = COALESCE("values", '{}'::jsonb)
  || jsonb_strip_nulls(jsonb_build_object(
    'id', NULLIF(COALESCE("values"->>'id', "label_name"->>'id'), ''),
    'en', NULLIF(COALESCE("values"->>'en', "label_name"->>'en'), '')
  ))
WHERE "label_name" IS NOT NULL
  AND (
    "values" IS NULL
    OR "values" = '{}'::jsonb
    OR COALESCE("values"->>'id', '') = ''
    OR COALESCE("values"->>'en', '') = ''
  );
