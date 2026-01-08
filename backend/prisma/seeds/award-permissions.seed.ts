import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAwardPermissions() {
  console.log('🌱 Seeding award management permissions...');

  const awardPermissions = [
    {
      name: 'Read Awards',
      slug: 'award_management_read',
      module: 'award_management',
      description: 'View award list and details',
    },
    {
      name: 'Create Awards',
      slug: 'award_management_create',
      module: 'award_management',
      description: 'Create new awards',
    },
    {
      name: 'Update Awards',
      slug: 'award_management_update',
      module: 'award_management',
      description: 'Update existing awards and reorder',
    },
    {
      name: 'Delete Awards',
      slug: 'award_management_delete',
      module: 'award_management',
      description: 'Delete awards',
    },
  ];

  for (const permission of awardPermissions) {
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

  // Assign permissions to Super Admin role
  const superAdminRole = await prisma.role.findFirst({
    where: { slug: 'super-admin' },
  });

  if (superAdminRole) {
    console.log('🔐 Assigning award permissions to Super Admin role...');

    for (const permission of awardPermissions) {
      const permissionRecord = await prisma.permission.findUnique({
        where: { slug: permission.slug },
      });

      if (permissionRecord) {
        const existing = await prisma.rolePermission.findFirst({
          where: {
            roleId: superAdminRole.id,
            permissionId: permissionRecord.id,
          },
        });

        if (!existing) {
          await prisma.rolePermission.create({
            data: {
              roleId: superAdminRole.id,
              permissionId: permissionRecord.id,
            },
          });
          console.log(`✅ Assigned "${permission.name}" to Super Admin`);
        }
      }
    }
  }

  console.log('✅ Award management permissions seeded successfully!');
}

export default seedAwardPermissions;

// Run if executed directly
if (require.main === module) {
  seedAwardPermissions()
    .catch((e) => {
      console.error('❌ Error seeding award permissions:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
