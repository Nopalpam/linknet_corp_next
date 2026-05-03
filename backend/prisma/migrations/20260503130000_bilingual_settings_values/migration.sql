-- Convert title/description settings to bilingual values and remove General title-only fields.

UPDATE settings
SET value = jsonb_build_object('en', value #>> '{}', 'id', value #>> '{}')
WHERE key IN (
  'general_branding.site.title',
  'general_branding.site.title_suffix',
  'general_branding.site.description',
  'seo.meta_title',
  'seo.meta_description',
  'cookies.title',
  'cookies.description',
  'footer.closingSentence_default.title',
  'footer.closingSentence_default.description'
)
AND jsonb_typeof(value::jsonb) = 'string';

DELETE FROM settings
WHERE key IN (
  'general_branding.about.title',
  'general_branding.media_contacts.title',
  'news_about_title',
  'news_media_contacts_title'
);
