-- Rename the Enterprise recommendation module and remove the duplicate SMB module.
UPDATE form_modules
SET
  name = 'Solution Finder',
  promo_website = CASE
    WHEN promo_website IN ('Enterprise Recommender', 'Suggest Enterprise', '')
      THEN 'Solution Finder'
    ELSE promo_website
  END,
  updated_at = CURRENT_TIMESTAMP
WHERE business_unit = 'ENTERPRISE'
  AND slug = 'suggest-enterprise'
  AND deleted_at IS NULL;

UPDATE form_modules
SET
  status = 'ARCHIVED',
  deleted_at = COALESCE(deleted_at, CURRENT_TIMESTAMP),
  updated_at = CURRENT_TIMESTAMP
WHERE business_unit = 'ENTERPRISE'
  AND slug = 'enterprise-smb-registration'
  AND deleted_at IS NULL;
