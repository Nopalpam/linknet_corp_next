import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMenuPermissions() {
  console.log('🌱 Seeding menu management permissions...');

  const menuPermissions = [
    {
      name: 'Read Menus',
      slug: 'menu_management_read',
      module: 'menu_management',
      description: 'View menu list and details',
    },
    {
      name: 'Create Menus',
      slug: 'menu_management_create',
      module: 'menu_management',
      description: 'Create new menus',
    },
    {
      name: 'Update Menus',
      slug: 'menu_management_update',
      module: 'menu_management',
      description: 'Update existing menus, toggle status, and reorder',
    },
    {
      name: 'Delete Menus',
      slug: 'menu_management_delete',
      module: 'menu_management',
      description: 'Delete menus and bulk delete',
    },
  ];

  for (const permission of menuPermissions) {
    const existing = await prisma.permission.findUnique({
      where: { slug: permission.slug },
    });

    if (existing) {
      console.log(`⏭️  Permission "${permission.name}" already exists`);
      continue;
    }

    await prisma.permission.create({
      data: permission,
    });

    console.log(`✅ Created permission: ${permission.name}`);
  }

  // Assign all menu permissions to Admin role
  const adminRole = await prisma.role.findUnique({
    where: { slug: 'admin' },
  });

  if (adminRole) {
    for (const permission of menuPermissions) {
      const perm = await prisma.permission.findUnique({
        where: { slug: permission.slug },
      });

      if (perm) {
        const existing = await prisma.rolePermission.findFirst({
          where: {
            roleId: adminRole.id,
            permissionId: perm.id,
          },
        });

        if (!existing) {
          await prisma.rolePermission.create({
            data: {
              roleId: adminRole.id,
              permissionId: perm.id,
            },
          });

          console.log(`✅ Assigned "${permission.name}" to Admin role`);
        } else {
          console.log(`⏭️  "${permission.name}" already assigned to Admin`);
        }
      }
    }
  } else {
    console.log('⚠️  Admin role not found. Please run role seeder first.');
  }

  console.log('✅ Menu management permissions seeded successfully!');
}

seedMenuPermissions()
  .catch((error) => {
    console.error('❌ Error seeding menu permissions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
