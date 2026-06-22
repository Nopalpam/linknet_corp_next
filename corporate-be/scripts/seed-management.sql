-- Management Categories Seed Data
-- Pastikan database PostgreSQL sudah running dan connected

-- Insert Management Categories
INSERT INTO management_categories (id, name, slug, description, position, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Board of Directors', 'board-of-directors', 'Board of Directors members who oversee strategic direction', 1, true, NOW(), NOW()),
  (gen_random_uuid(), 'Executive Team', 'executive-team', 'C-Level executives leading the company', 2, true, NOW(), NOW()),
  (gen_random_uuid(), 'Management Team', 'management-team', 'Senior managers and department heads', 3, true, NOW(), NOW()),
  (gen_random_uuid(), 'Advisory Board', 'advisory-board', 'External advisors and consultants', 4, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Note: Setelah insert categories, copy ID yang dihasilkan untuk insert managements
-- Atau query untuk mendapatkan ID:
-- SELECT id, name FROM management_categories ORDER BY position;

-- Example Management Members (ganti 'CATEGORY_ID_HERE' dengan ID kategori yang sesuai)
/*
INSERT INTO managements (id, category_id, name, slug, position, description, photo, email, phone, linkedin, "order", is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(), 
    'CATEGORY_ID_HERE', -- Executive Team ID
    'John Doe', 
    'john-doe', 
    'Chief Executive Officer',
    'John Doe is the CEO with over 20 years of experience in telecommunications industry.',
    'https://via.placeholder.com/400',
    'john.doe@linknet.co.id',
    '+62 812 3456 7890',
    'https://linkedin.com/in/johndoe',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(), 
    'CATEGORY_ID_HERE', -- Executive Team ID
    'Jane Smith', 
    'jane-smith', 
    'Chief Financial Officer',
    'Jane Smith leads the financial strategy with expertise in corporate finance.',
    'https://via.placeholder.com/400',
    'jane.smith@linknet.co.id',
    '+62 813 4567 8901',
    'https://linkedin.com/in/janesmith',
    2,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(), 
    'CATEGORY_ID_HERE', -- Executive Team ID
    'Michael Johnson', 
    'michael-johnson', 
    'Chief Technology Officer',
    'Michael Johnson drives technology innovation and digital transformation.',
    'https://via.placeholder.com/400',
    'michael.johnson@linknet.co.id',
    '+62 814 5678 9012',
    'https://linkedin.com/in/michaeljohnson',
    3,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(), 
    'CATEGORY_ID_HERE', -- Management Team ID
    'Sarah Williams', 
    'sarah-williams', 
    'VP of Operations',
    'Sarah Williams oversees all operational activities and process optimization.',
    'https://via.placeholder.com/400',
    'sarah.williams@linknet.co.id',
    '+62 815 6789 0123',
    'https://linkedin.com/in/sarahwilliams',
    1,
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(), 
    'CATEGORY_ID_HERE', -- Management Team ID
    'David Brown', 
    'david-brown', 
    'VP of Marketing',
    'David Brown leads marketing strategy and brand development initiatives.',
    'https://via.placeholder.com/400',
    'david.brown@linknet.co.id',
    '+62 816 7890 1234',
    'https://linkedin.com/in/davidbrown',
    2,
    true,
    NOW(),
    NOW()
  );
*/

-- Cara menggunakan:
-- 1. Jalankan INSERT categories terlebih dahulu
-- 2. Query untuk mendapatkan category IDs:
--    SELECT id, name FROM management_categories ORDER BY position;
-- 3. Copy ID yang sesuai
-- 4. Uncomment dan edit INSERT managements, ganti 'CATEGORY_ID_HERE' dengan ID yang tepat
-- 5. Jalankan INSERT managements
