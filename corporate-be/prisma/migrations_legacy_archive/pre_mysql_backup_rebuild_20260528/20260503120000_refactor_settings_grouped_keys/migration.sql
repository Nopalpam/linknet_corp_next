-- Refactor CMS settings from legacy flat keys to grouped dot-path keys.

UPDATE settings SET key = 'general_branding.site.title', "group" = 'general_branding', label = 'Site Title'
WHERE key = 'site_name';
UPDATE settings SET key = 'general_branding.site.description', "group" = 'general_branding', label = 'Site Description'
WHERE key = 'site_description';
UPDATE settings SET key = 'general_branding.site.timezone', "group" = 'general_branding', label = 'Timezone'
WHERE key = 'timezone';
UPDATE settings SET key = 'general_branding.site.date_format', "group" = 'general_branding', label = 'Date Format'
WHERE key = 'date_format';
UPDATE settings SET key = 'general_branding.branding.logo', "group" = 'general_branding', label = 'Main Logo'
WHERE key = 'site_logo';
UPDATE settings SET key = 'general_branding.branding.favicon', "group" = 'general_branding', label = 'Favicon'
WHERE key = 'site_favicon';
UPDATE settings SET key = 'general_branding.about.title', "group" = 'general_branding', label = 'About Title'
WHERE key = 'news_about_title';
UPDATE settings SET key = 'general_branding.about.content', "group" = 'general_branding', label = 'About Content'
WHERE key = 'news_about_content';
UPDATE settings SET key = 'general_branding.media_contacts.title', "group" = 'general_branding', label = 'Media Contacts Title'
WHERE key = 'news_media_contacts_title';
UPDATE settings SET key = 'general_branding.media_contacts.items', "group" = 'general_branding', label = 'Media Contacts'
WHERE key = 'news_media_contacts';

UPDATE settings SET key = 'contact.address', label = 'Contact Address'
WHERE key = 'contact_address';
UPDATE settings SET key = 'contact.email', label = 'Contact Email'
WHERE key = 'contact_email';
UPDATE settings SET key = 'contact.phone', label = 'Contact Phone'
WHERE key = 'contact_phone';
UPDATE settings SET key = 'contact.socials', label = 'Social Media Links'
WHERE key = 'social_media';
UPDATE settings
SET value = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('platform', social.platform, 'label', initcap(social.platform), 'url', social.url)), '[]'::jsonb)
  FROM jsonb_each_text(settings.value::jsonb) AS social(platform, url)
)
WHERE key = 'contact.socials' AND jsonb_typeof(value::jsonb) = 'object';

UPDATE settings SET key = 'email.from.name', label = 'From Name'
WHERE key = 'from_name';
UPDATE settings SET key = 'email.from.email', label = 'From Email'
WHERE key = 'from_email';
UPDATE settings SET key = 'email.smtp.host', label = 'SMTP Host'
WHERE key = 'smtp_host';
UPDATE settings SET key = 'email.smtp.port', label = 'SMTP Port'
WHERE key = 'smtp_port';
UPDATE settings SET key = 'email.smtp.username', label = 'SMTP Username'
WHERE key = 'smtp_user';
UPDATE settings SET key = 'email.smtp.password', label = 'SMTP Password'
WHERE key = 'smtp_password';

UPDATE settings SET key = 'seo.meta_title', label = 'Meta Title'
WHERE key = 'meta_title';
UPDATE settings SET key = 'seo.meta_description', label = 'Meta Description'
WHERE key = 'meta_description';
UPDATE settings SET key = 'seo.meta_keywords', label = 'Meta Keywords', type = 'JSON', value = to_jsonb(string_to_array(value #>> '{}', ','))
WHERE key = 'meta_keywords' AND jsonb_typeof(value::jsonb) = 'string';
UPDATE settings SET key = 'analytics.google_analytics_id', "group" = 'analytics', label = 'Google Analytics ID'
WHERE key = 'google_analytics_id';

UPDATE settings SET key = 'features.comments', label = 'Comments'
WHERE key = 'enable_comments';
UPDATE settings SET key = 'features.registration', label = 'Registration'
WHERE key = 'enable_registration';
UPDATE settings SET key = 'features.two_factor_auth', label = 'Two-Factor Authentication'
WHERE key = 'enable_2fa';
UPDATE settings SET key = 'features.maintenance_mode', label = 'Maintenance Mode'
WHERE key = 'maintenance_mode';

UPDATE settings SET key = 'cookies.enabled', label = 'Enable Cookies Modal'
WHERE key = 'cookies_enabled';
UPDATE settings SET key = 'cookies.title', label = 'Cookies Title'
WHERE key = 'cookies_title';
UPDATE settings SET key = 'cookies.description', label = 'Cookies Description'
WHERE key = 'cookies_description';
UPDATE settings SET key = 'cookies.accept_label', label = 'Accept Button Label'
WHERE key = 'cookies_accept_label';
UPDATE settings SET key = 'cookies.icon', label = 'Cookies Icon'
WHERE key = 'cookies_icon_url';
UPDATE settings SET key = 'cookies.more_info.label', label = 'More Info Label'
WHERE key = 'cookies_more_info_label';
UPDATE settings SET key = 'cookies.more_info.url', label = 'More Info URL'
WHERE key = 'cookies_more_info_url';

UPDATE settings SET key = 'footer.slogan', label = 'Footer Slogan'
WHERE key = 'footer_slogan';
UPDATE settings SET key = 'footer.copyright', label = 'Footer Copyright'
WHERE key = 'footer_copyright';
UPDATE settings SET key = 'footer.closingSentence_default.overline', label = 'Closing Overline'
WHERE key = 'closing_overline';
UPDATE settings SET key = 'footer.closingSentence_default.title', label = 'Closing Title'
WHERE key = 'closing_title';
UPDATE settings SET key = 'footer.closingSentence_default.description', label = 'Closing Description'
WHERE key = 'closing_description';

UPDATE settings SET key = 'pages.preview.base_url', label = 'Preview Base URL'
WHERE key = 'page_preview_base_url';
UPDATE settings SET key = 'pages.preview.path_template', label = 'Preview Path Template'
WHERE key = 'page_preview_path_template';

DELETE FROM settings
WHERE key IN ('footer_logo', 'footer_address', 'footer_email', 'footer_phone', 'footer_socials');

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(), 'general_branding.site.title_suffix', '""'::jsonb, 'STRING', 'general_branding', 'Site Title Suffix', 'Suffix appended to website page titles', true, true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'general_branding.site.title_suffix');
