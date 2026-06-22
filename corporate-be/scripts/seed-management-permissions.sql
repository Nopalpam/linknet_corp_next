-- ============================================
-- Add Management Permissions for Super Admin
-- Run this if permissions are missing after migration
-- ============================================

-- Insert management permissions (skip if already exist)
INSERT INTO permissions (id, name, slug, module, description, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'View Management', 'management.read', 'management', 'View management team list', NOW(), NOW()),
  (gen_random_uuid(), 'Create Management', 'management.create', 'management', 'Create management team member', NOW(), NOW()),
  (gen_random_uuid(), 'Update Management', 'management.update', 'management', 'Update management team member', NOW(), NOW()),
  (gen_random_uuid(), 'Delete Management', 'management.delete', 'management', 'Delete management team member', NOW(), NOW()),
  (gen_random_uuid(), 'View Management Categories', 'management_categories.read', 'management', 'View management categories', NOW(), NOW()),
  (gen_random_uuid(), 'Create Management Category', 'management_categories.create', 'management', 'Create management category', NOW(), NOW()),
  (gen_random_uuid(), 'Update Management Category', 'management_categories.update', 'management', 'Update management category', NOW(), NOW()),
  (gen_random_uuid(), 'Delete Management Category', 'management_categories.delete', 'management', 'Delete management category', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Assign all management permissions to Super Admin role
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'super-admin'
  AND p.slug IN (
    'management.read',
    'management.create',
    'management.update',
    'management.delete',
    'management_categories.read',
    'management_categories.create',
    'management_categories.update',
    'management_categories.delete'
  )
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Also assign to Admin role
INSERT INTO role_permissions (id, role_id, permission_id, created_at)
SELECT gen_random_uuid(), r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.slug = 'admin'
  AND p.slug IN (
    'management.read',
    'management.create',
    'management.update',
    'management.delete',
    'management_categories.read',
    'management_categories.create',
    'management_categories.update',
    'management_categories.delete'
  )
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Verify
SELECT p.slug, p.name, r.name as role_name
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE p.module = 'management'
ORDER BY r.name, p.slug;
