/**
 * Quick script to add awards permissions
 * Run with: npx ts-node prisma/add-awards-permissions.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding/Verifying Awards Permissions...\n');

  const awardsPermissions = [
    { name: 'View Awards', slug: 'awards.read', module: 'awards', description: 'View award list' },
    { name: 'Create Award', slug: 'awards.create', module: 'awards', description: 'Create new award' },
    { name: 'Update Award', slug: 'awards.update', module: 'awards', description: 'Update existing award' },
    { name: 'Delete Award', slug: 'awards.delete', module: 'awards', description: 'Delete award' },
  ];

  // Add permissions
  for (const perm of awardsPermissions) {
    const existing = await prisma.permission.findUnique({
      where: { slug: perm.slug },
    });

    if (existing) {
      console.log(`✓ Permission "${perm.name}" (${perm.slug}) already exists`);
    } else {
      await prisma.permission.create({
        data: perm,
      });
      console.log(`✅ Created permission "${perm.name}" (${perm.slug})`);
    }
  }

  console.log('\n🔐 Assigning permissions to Super Admin role...\n');

  // Find Super Admin role
  const superAdminRole = await prisma.role.findFirst({
    where: { slug: 'super-admin' },
  });

  if (!superAdminRole) {
    console.log('❌ Super Admin role not found!');
    return;
  }

  // Assign all awards permissions to Super Admin
  for (const perm of awardsPermissions) {
    const permission = await prisma.permission.findUnique({
      where: { slug: perm.slug },
    });

    if (!permission) continue;

    const existing = await prisma.rolePermission.findFirst({
      where: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });

    if (existing) {
      console.log(`✓ Super Admin already has "${perm.name}"`);
    } else {
      await prisma.rolePermission.create({
        data: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`✅ Assigned "${perm.name}" to Super Admin`);
    }
  }

  console.log('\n✅ Done! All awards permissions are set up.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
