import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to assign missing url_redirection permissions to Super Admin role
 */
async function assignUrlRedirectionPermissions() {
  try {
    console.log('🔧 Assigning url_redirection permissions to Super Admin...');

    // Get Super Admin role
    const superAdminRole = await prisma.role.findFirst({
      where: {
        slug: 'super-admin',
      },
    });

    if (!superAdminRole) {
      console.error('❌ Super Admin role not found');
      return;
    }

    // Get all url_redirection permissions
    const urlRedirectionPermissions = await prisma.permission.findMany({
      where: {
        module: 'url_redirection',
      },
    });

    console.log(`Found ${urlRedirectionPermissions.length} url_redirection permissions`);

    // Assign each permission to Super Admin if not already assigned
    let assignedCount = 0;
    for (const permission of urlRedirectionPermissions) {
      const existing = await prisma.rolePermission.findFirst({
        where: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });

      if (!existing) {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`  ✅ Assigned permission: ${permission.slug}`);
        assignedCount++;
      } else {
        console.log(`  ⏭️  Permission already assigned: ${permission.slug}`);
      }
    }

    console.log(`\n✨ Successfully assigned ${assignedCount} new permissions to Super Admin`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignUrlRedirectionPermissions();
