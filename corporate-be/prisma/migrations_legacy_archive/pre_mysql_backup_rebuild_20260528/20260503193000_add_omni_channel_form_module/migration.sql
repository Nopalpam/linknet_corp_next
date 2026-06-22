-- Ensure the Enterprise Omni Channel form module is visible in CMS and can store submissions.
WITH upsert_module AS (
  INSERT INTO form_modules (
    id,
    business_unit,
    slug,
    name,
    description,
    category,
    handling_mode,
    status,
    schema_version,
    default_locale,
    public_path,
    source_website,
    promo_website,
    lead_source,
    integration_provider,
    submission_settings,
    created_at,
    updated_at,
    deleted_at
  )
  VALUES (
    '9f8a60c4-0c4b-4a88-a8c8-9a8d4fb3bc8f',
    'ENTERPRISE',
    'omni-channel',
    'Omni Channel',
    'Omni Channel chat and WhatsApp lead capture form for Enterprise prospects.',
    'INQUIRY',
    'SUBMISSION',
    'ACTIVE',
    1,
    'id',
    '/{locale}/enterprise/forms/omni-channel',
    'Linknet Enterprise Website',
    'Enterprise Omni Channel',
    'Website',
    'NOOP',
    '{"managedBy":"bootstrap-seed","seedKey":"omni-channel","revision":1,"salesForceReady":true,"salesForceStatus":"pending_configuration","primaryFieldPaths":{"name":["firstName","lastName"],"email":["email"],"phone":["phone"]},"locationFields":{"province":"province","city":"city","zip":"zip"}}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    NULL
  )
  ON CONFLICT (business_unit, slug)
  DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    handling_mode = EXCLUDED.handling_mode,
    status = 'ACTIVE',
    default_locale = EXCLUDED.default_locale,
    public_path = EXCLUDED.public_path,
    source_website = EXCLUDED.source_website,
    promo_website = EXCLUDED.promo_website,
    lead_source = EXCLUDED.lead_source,
    integration_provider = EXCLUDED.integration_provider,
    submission_settings = EXCLUDED.submission_settings,
    deleted_at = NULL,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id
)
INSERT INTO form_response_configs (
  id,
  form_module_id,
  key,
  response_type,
  label,
  match_condition,
  path_template,
  query_template,
  sort_order,
  is_default,
  is_active,
  created_at,
  updated_at
)
SELECT
  'seed-enterprise-omni-channel-default-success',
  id,
  'default-success',
  'SUCCESS',
  'Default Success',
  NULL,
  '/{locale}/enterprise/form/success',
  '{"name":"{firstName}","needs":"sales-inquiry"}'::jsonb,
  0,
  TRUE,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM upsert_module
ON CONFLICT (form_module_id, key)
DO UPDATE SET
  response_type = EXCLUDED.response_type,
  label = EXCLUDED.label,
  match_condition = EXCLUDED.match_condition,
  path_template = EXCLUDED.path_template,
  query_template = EXCLUDED.query_template,
  sort_order = EXCLUDED.sort_order,
  is_default = TRUE,
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP;

WITH module_row AS (
  SELECT id
  FROM form_modules
  WHERE business_unit = 'ENTERPRISE'
    AND slug = 'omni-channel'
)
INSERT INTO form_response_configs (
  id,
  form_module_id,
  key,
  response_type,
  label,
  match_condition,
  path_template,
  query_template,
  sort_order,
  is_default,
  is_active,
  created_at,
  updated_at
)
SELECT
  'seed-enterprise-omni-channel-salesforce-success',
  id,
  'salesforce-success',
  'SUCCESS',
  'Sales Force Success',
  '{"sendToSalesForce":true}'::jsonb,
  '/{locale}/enterprise/form/success',
  '{"name":"{firstName}","needs":"sales-inquiry","sf":"1","source":"{channel}"}'::jsonb,
  0,
  FALSE,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM module_row
ON CONFLICT (form_module_id, key)
DO UPDATE SET
  response_type = EXCLUDED.response_type,
  label = EXCLUDED.label,
  match_condition = EXCLUDED.match_condition,
  path_template = EXCLUDED.path_template,
  query_template = EXCLUDED.query_template,
  sort_order = EXCLUDED.sort_order,
  is_default = FALSE,
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP;

WITH module_row AS (
  SELECT id
  FROM form_modules
  WHERE business_unit = 'ENTERPRISE'
    AND slug = 'omni-channel'
)
INSERT INTO form_integration_configs (
  id,
  form_module_id,
  key,
  provider,
  dispatch_mode,
  endpoint,
  mapping_config,
  headers_config,
  is_active,
  created_at,
  updated_at
)
SELECT
  'seed-enterprise-omni-channel-salesforce-future',
  id,
  'salesforce-future',
  'NOOP',
  'ASYNC',
  NULL,
  '{"provider":"SalesForce","status":"pending_configuration","businessUnit":"ENTERPRISE","formSlug":"omni-channel","formName":"Omni Channel"}'::jsonb,
  '{"x-form-module":"omni-channel","x-form-business-unit":"ENTERPRISE"}'::jsonb,
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM module_row
ON CONFLICT (form_module_id, key)
DO UPDATE SET
  provider = EXCLUDED.provider,
  dispatch_mode = EXCLUDED.dispatch_mode,
  endpoint = EXCLUDED.endpoint,
  mapping_config = EXCLUDED.mapping_config,
  headers_config = EXCLUDED.headers_config,
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP;
