/**
 * Roles Seeder
 * ============
 * Seeds roles and assigns permissions to each role.
 *
 * Depends on: permissions.seed.ts (must run first)
 *
 * Role definitions:
 *   Super Admin — all permissions
 *   Admin       — all except user/role management
 *   Editor      — content read/write (no delete, no admin modules)
 *   User        — no permissions (public-facing only)
 *
 * Features:
 * - Idempotent (upsert — safe to run multiple times)
 * - Returns created role objects
 * - Can be run standalone or imported by master seed.ts
 *
 * Usage (standalone):
 *   npx ts-node prisma/seeds/roles.seed.ts
 *
 * Usage (module):
 *   import { seedRoles } from './roles.seed';
 *   const roles = await seedRoles(prisma);
 */

import { PrismaClient, Role, Permission } from '@prisma/client';
import { seedPermissions } from './permissions.seed';

const prisma = new PrismaClient();

export interface RolesResult {
  superAdmin: Role;
  admin: Role;
  editor: Role;
  user: Role;
}

/**
 * Seed roles and assign permissions.
 * Idempotent — uses upsert so it is safe to call multiple times.
 *
 * @param prismaClient   - Optional Prisma client (uses module default if omitted)
 * @param permissions    - Pre-seeded permissions array. If omitted, seeds permissions first.
 * @returns Object containing all 4 created/verified role records
 */
export async function seedRoles(
  prismaClient?: PrismaClient,
  permissions?: Permission[],
): Promise<RolesResult> {
  const client = prismaClient ?? prisma;

  // ── 1. Ensure permissions exist ──────────────────────────────────
  const allPermissions = permissions ?? (await seedPermissions(client));

  // ── 2. Upsert roles ──────────────────────────────────────────────
  console.log('👥 Seeding roles...');

  const [superAdmin, admin, editor, user] = await Promise.all([
    client.role.upsert({
      where: { slug: 'super-admin' },
      update: {},
      create: {
        name: 'Super Admin',
        slug: 'super-admin',
        description: 'Full system access with all permissions',
        isSystem: true,
      },
    }),
    client.role.upsert({
      where: { slug: 'admin' },
      update: {},
      create: {
        name: 'Admin',
        slug: 'admin',
        description: 'Administrative access to manage content',
        isSystem: true,
      },
    }),
    client.role.upsert({
      where: { slug: 'editor' },
      update: {},
      create: {
        name: 'Editor',
        slug: 'editor',
        description: 'Can create and edit content, cannot delete or manage admin settings',
        isSystem: true,
      },
    }),
    client.role.upsert({
      where: { slug: 'user' },
      update: {},
      create: {
        name: 'User',
        slug: 'user',
        description: 'Basic authenticated user — no CMS permissions',
        isSystem: true,
      },
    }),
  ]);

  console.log('✅ 4 roles seeded');

  // ── 3. Assign permissions to roles ──────────────────────────────
  console.log('🔐 Assigning permissions to roles...');

  // Super Admin → all permissions
  const superAdminPermissions = allPermissions;

  // Admin → all except user/role management
  const adminPermissions = allPermissions.filter(
    (p) => !['users_management', 'role_management'].includes(p.module),
  );

  // Editor → content modules, read + create + update only (no delete, no admin)
  const editorModules = [
    'pages',
    'news',
    'announcements',
    'reports',
    'careers',
    'awards',
    'management',
    'files',
  ];
  const editorPermissions = allPermissions.filter(
    (p) =>
      editorModules.includes(p.module) &&
      !p.slug.endsWith('.delete') &&
      !p.slug.endsWith('.publish'),
  );

  await Promise.all([
    assignPermissionsToRole(client, superAdmin.id, superAdminPermissions),
    assignPermissionsToRole(client, admin.id, adminPermissions),
    assignPermissionsToRole(client, editor.id, editorPermissions),
    // User role gets no permissions
  ]);

  console.log('✅ Permissions assigned to roles');
  console.log(`   Super Admin : ${superAdminPermissions.length} permissions`);
  console.log(`   Admin       : ${adminPermissions.length} permissions`);
  console.log(`   Editor      : ${editorPermissions.length} permissions`);
  console.log(`   User        : 0 permissions`);

  return { superAdmin, admin, editor, user };
}

/**
 * Upserts role-permission links for a given role.
 * Uses createMany with skipDuplicates for efficiency.
 */
async function assignPermissionsToRole(
  client: PrismaClient,
  roleId: string,
  permissions: Permission[],
): Promise<void> {
  if (permissions.length === 0) return;

  await client.rolePermission.createMany({
    data: permissions.map((p) => ({
      roleId,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });
}

// ─── Standalone execution ───────────────────────────────────────────────────
if (require.main === module) {
  seedRoles()
    .then((roles) => {
      console.log('');
      console.log('📋 Roles created:');
      console.log(`   ${roles.superAdmin.id.substring(0, 8)}…  Super Admin`);
      console.log(`   ${roles.admin.id.substring(0, 8)}…  Admin`);
      console.log(`   ${roles.editor.id.substring(0, 8)}…  Editor`);
      console.log(`   ${roles.user.id.substring(0, 8)}…  User`);
    })
    .catch((e) => {
      console.error('❌ Error seeding roles:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
