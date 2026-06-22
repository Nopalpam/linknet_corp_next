-- Add bilingual More Info Title for cookies popup link.

INSERT INTO settings (id, key, value, type, "group", label, description, is_public, is_system, created_at, updated_at)
SELECT gen_random_uuid(),
       'cookies.more_info.title',
       jsonb_build_object('en', 'More Info', 'id', 'Info Selengkapnya'),
       'STRING',
       'cookies',
       'More Info Title',
       'Bilingual title/label for the cookies more info link',
       true,
       true,
       now(),
       now()
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'cookies.more_info.title');
