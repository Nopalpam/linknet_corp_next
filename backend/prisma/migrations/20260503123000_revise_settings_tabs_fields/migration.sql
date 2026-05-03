-- Revise CMS settings fields after tab-based layout feedback.

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'general_branding.site.address', source.value, 'STRING', 'general_branding', 'Address', 'Primary office address used across the website', true, true, now(), now()
FROM (
  SELECT value
  FROM settings
  WHERE key IN ('contact.address', 'contact_address', 'footer_address')
  ORDER BY CASE key WHEN 'footer_address' THEN 1 WHEN 'contact.address' THEN 2 ELSE 3 END
  LIMIT 1
) source
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'general_branding.site.address');

DELETE FROM settings
WHERE key IN ('contact.address', 'contact_address', 'footer_address');

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'general_branding.site.slogan', source.value, 'STRING', 'general_branding', 'Slogan', 'Primary website/company slogan used in footer and brand surfaces', true, true, now(), now()
FROM (
  SELECT value
  FROM settings
  WHERE key IN ('footer.slogan', 'footer_slogan')
  LIMIT 1
) source
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'general_branding.site.slogan');

DELETE FROM settings
WHERE key IN ('footer.slogan', 'footer_slogan');

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'contact.phone_numbers', jsonb_build_array(jsonb_build_object('type', 'phone', 'label', 'Phone', 'number', source.value #>> '{}')), 'JSON', 'contact', 'Phone Numbers', 'Public phone and WhatsApp numbers shown on the website', true, true, now(), now()
FROM (
  SELECT value
  FROM settings
  WHERE key IN ('contact.phone', 'contact_phone')
  ORDER BY CASE key WHEN 'contact.phone' THEN 1 ELSE 2 END
  LIMIT 1
) source
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'contact.phone_numbers');

DELETE FROM settings
WHERE key IN ('contact.phone', 'contact_phone');

UPDATE settings
SET value = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'icon', COALESCE(item->>'icon', item->>'platform', item->>'iconName', item->>'name', ''),
        'label', COALESCE(item->>'label', item->>'platform', item->>'iconName', item->>'name', ''),
        'url', COALESCE(item->>'url', item->>'href', '')
      )
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(settings.value::jsonb) AS item
)
WHERE key = 'contact.socials'
  AND jsonb_typeof(value::jsonb) = 'array';

UPDATE settings
SET value = (
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('icon', social.platform, 'label', initcap(social.platform), 'url', social.url)),
    '[]'::jsonb
  )
  FROM jsonb_each_text(settings.value::jsonb) AS social(platform, url)
)
WHERE key = 'contact.socials'
  AND jsonb_typeof(value::jsonb) = 'object';

DELETE FROM settings
WHERE key IN (
  'features.comments',
  'features.registration',
  'enable_comments',
  'enable_registration',
  'cookies.accept_label',
  'cookies_accept_label',
  'cookies.more_info.label',
  'cookies_more_info_label',
  'footer_logo',
  'footer_email',
  'footer_phone',
  'footer_socials'
);

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'general_branding.site.address', '""'::jsonb, 'STRING', 'general_branding', 'Address', 'Primary office address used across the website', true, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'general_branding.site.address');

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'general_branding.site.slogan', '""'::jsonb, 'STRING', 'general_branding', 'Slogan', 'Primary website/company slogan used in footer and brand surfaces', true, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'general_branding.site.slogan');

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'contact.phone_numbers', '[]'::jsonb, 'JSON', 'contact', 'Phone Numbers', 'Public phone and WhatsApp numbers shown on the website', true, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'contact.phone_numbers');

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'seo.thumbnail', '""'::jsonb, 'IMAGE', 'seo', 'Default Thumbnail', 'Default Open Graph thumbnail used when a page does not set one', true, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'seo.thumbnail');
