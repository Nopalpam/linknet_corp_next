-- Keep the Omni Channel module active and make ZIP a manual text field.
WITH module_row AS (
  SELECT id
  FROM form_modules
  WHERE business_unit = 'ENTERPRISE'
    AND slug = 'omni-channel'
)
UPDATE form_modules
SET
  status = 'ACTIVE',
  deleted_at = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (SELECT id FROM module_row);

WITH module_row AS (
  SELECT id
  FROM form_modules
  WHERE business_unit = 'ENTERPRISE'
    AND slug = 'omni-channel'
)
UPDATE form_fields
SET
  field_type = 'TEXT',
  placeholder = 'Enter ZIP code',
  ui_config = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE form_module_id IN (SELECT id FROM module_row)
  AND path = 'zip';
