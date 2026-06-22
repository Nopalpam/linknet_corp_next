import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCareerPermissions() {
  console.log('🌱 Seeding career management permissions...');

  const careerPermissions = [
    {
      name: 'View Careers',
      slug: 'careers.read',
      module: 'careers',
      description: 'View career list and details',
    },
    {
      name: 'Create Career',
      slug: 'careers.create',
      module: 'careers',
      description: 'Create new career posting',
    },
    {
      name: 'Update Career',
      slug: 'careers.update',
      module: 'careers',
      description: 'Update existing career posting',
    },
    {
      name: 'Delete Career',
      slug: 'careers.delete',
      module: 'careers',
      description: 'Delete career posting',
    },
  ];

  for (const permission of careerPermissions) {
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
    console.log('🔐 Assigning career permissions to Super Admin role...');

    for (const permission of careerPermissions) {
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
        } else {
          console.log(`⏭️  "${permission.name}" already assigned to Super Admin`);
        }
      }
    }
  }

  console.log('✅ Career management permissions seeded successfully!');
}

export default seedCareerPermissions;

// Run if executed directly
if (require.main === module) {
  seedCareerPermissions()
    .catch((e) => {
      console.error('❌ Error seeding career permissions:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
