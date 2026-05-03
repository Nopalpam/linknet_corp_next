INSERT INTO "settings" ("id", "key", "value", "type", "group", "label", "description", "is_public", "is_system", "created_at", "updated_at")
VALUES
  (
    '6d8303f7-a4b8-4c1f-9b44-0eec1bc5b801',
    'news_media_contacts_title',
    '"Kontak Media"'::jsonb,
    'STRING',
    'news',
    'News Media Contacts Title',
    'Heading for media contacts on news detail pages',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'a71d3d17-02d4-4f16-9b6e-8db68a9e62d2',
    'news_media_contacts',
    '[{"name":"Annisa Kameila","position":"Corporate Communication Specialist","phone":"0878 7873 4852","email":"annisa.kameila@linknet.co.id"}]'::jsonb,
    'JSON',
    'news',
    'News Media Contacts',
    'Array of media contacts shown on news detail pages. Add multiple contacts as objects with name, position, phone, and email.',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    'e843abf1-ef54-4a79-b97d-27a3aa3af4db',
    'news_about_title',
    '"Tentang Linknet"'::jsonb,
    'STRING',
    'news',
    'News About Title',
    'Heading for company information on news detail pages',
    true,
    true,
    NOW(),
    NOW()
  ),
  (
    '1437dc1f-7a66-48e1-a925-63e93df7bfa7',
    'news_about_content',
    '"<p>PT Link Net Tbk (&quot;Linknet&quot;, Kode Emiten: LINK), bagian dari Axiata Group, berkomitmen untuk meningkatkan kualitas hidup masyarakat dan mendukung pertumbuhan digital Indonesia melalui penyediaan infrastruktur teknologi yang cerdas dan andal.</p><p>Dengan mengusung tujuan &quot;We LINK the nation for better lives&quot;, Linknet senantiasa menempatkan pelanggan sebagai prioritas utama, mendorong inovasi dan kolaborasi, serta berkomitmen untuk terus melakukan perbaikan berkelanjutan.</p>"'::jsonb,
    'STRING',
    'news',
    'News About Content',
    'HTML content for company information on news detail pages',
    true,
    true,
    NOW(),
    NOW()
  )
ON CONFLICT ("key") DO NOTHING;
