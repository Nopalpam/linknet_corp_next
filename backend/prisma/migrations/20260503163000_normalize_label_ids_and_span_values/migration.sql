DO $$
DECLARE
  rec RECORD;
  base_label_id TEXT;
  next_label_id TEXT;
  suffix INT;
BEGIN
  FOR rec IN
    SELECT ln.id, ln.label_id, lg.slug
    FROM label_nodes ln
    JOIN label_groups lg ON lg.id = ln.group_id
    WHERE ln.label_id <> lg.slug
      AND ln.label_id NOT LIKE lg.slug || '.%'
  LOOP
    base_label_id := rec.slug || '.' || rec.label_id;
    next_label_id := base_label_id;
    suffix := 2;

    WHILE EXISTS (
      SELECT 1
      FROM label_nodes
      WHERE label_id = next_label_id
        AND id <> rec.id
    ) LOOP
      next_label_id := regexp_replace(base_label_id, '([^.]+)$', '\1_' || suffix::TEXT);
      suffix := suffix + 1;
    END LOOP;

    UPDATE label_nodes
    SET label_id = next_label_id
    WHERE id = rec.id;
  END LOOP;
END $$;

UPDATE label_nodes
SET values = jsonb_set(
  jsonb_set(
    values,
    '{id}',
    to_jsonb(regexp_replace(regexp_replace(values->>'id', '<p([^>]*)>', '<span\1>', 'gi'), '</p>', '</span>', 'gi')),
    true
  ),
  '{en}',
  to_jsonb(regexp_replace(regexp_replace(values->>'en', '<p([^>]*)>', '<span\1>', 'gi'), '</p>', '</span>', 'gi')),
  true
)
WHERE values IS NOT NULL
  AND (
    values->>'id' ILIKE '%<p%'
    OR values->>'en' ILIKE '%<p%'
  );
