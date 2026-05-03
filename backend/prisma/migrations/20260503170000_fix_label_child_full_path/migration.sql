DO $$
DECLARE
  rec RECORD;
  base_label_id TEXT;
  next_label_id TEXT;
  relative_path TEXT;
  suffix INT;
BEGIN
  FOR rec IN
    WITH RECURSIVE label_depth AS (
      SELECT
        ln.id,
        ln.parent_id,
        ln.label_id,
        ln.group_id,
        0 AS depth
      FROM label_nodes ln
      WHERE ln.parent_id IS NULL

      UNION ALL

      SELECT
        child.id,
        child.parent_id,
        child.label_id,
        child.group_id,
        parent.depth + 1 AS depth
      FROM label_nodes child
      JOIN label_depth parent ON parent.id = child.parent_id
    )
    SELECT
      child.id,
      child.label_id,
      parent.label_id AS parent_label_id,
      groups.slug AS group_slug,
      label_depth.depth
    FROM label_depth
    JOIN label_nodes child ON child.id = label_depth.id
    JOIN label_nodes parent ON parent.id = child.parent_id
    JOIN label_groups groups ON groups.id = child.group_id
    WHERE child.parent_id IS NOT NULL
    ORDER BY label_depth.depth ASC, child.position ASC, child.created_at ASC
  LOOP
    IF rec.label_id <> rec.parent_label_id
      AND rec.label_id NOT LIKE rec.parent_label_id || '.%'
    THEN
      IF rec.label_id LIKE rec.group_slug || '.%' THEN
        relative_path := substring(rec.label_id FROM char_length(rec.group_slug) + 2);
      ELSE
        relative_path := rec.label_id;
      END IF;

      base_label_id := rec.parent_label_id || '.' || relative_path;
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
    END IF;
  END LOOP;
END $$;
