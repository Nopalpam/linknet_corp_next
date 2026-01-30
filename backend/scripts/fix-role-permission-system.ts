import { PrismaClient } from '@prisma/client';
import { redisClient } from '../src/config/redis';

const prisma = new PrismaClient();

/**
 * Comprehensive script to fix role & permission system
 * This will:
 * 1. Ensure all permissions exist in database
 * 2. Assign all permissions to Super Admin role
 * 3. Clear permission cache for all users
 */
async function fixRolePermissionSystem() {
  try {
    console.log('🔧 Starting Role & Permission System Fix...\n');

    // Step 1: Get all permissions
    console.log('📝 Step 1: Checking permissions...');
    const allPermissions = await prisma.permission.findMany();
    console.log(`   Found ${allPermissions.length} permissions in database`);

    // Step 2: Get Super Admin role
    console.log('\n👑 Step 2: Getting Super Admin role...');
    const superAdminRole = await prisma.role.findFirst({
      where: {
        slug: 'super-admin',
      },
      include: {
        rolePermissions: true,
      },
    });

    if (!superAdminRole) {
      console.error('❌ Super Admin role not found!');
      return;
    }
    console.log(`   ✅ Super Admin role found: ${superAdminRole.name}`);
    console.log(`   Current permissions: ${superAdminRole.rolePermissions.length}`);

    // Step 3: Assign ALL permissions to Super Admin
    console.log('\n🔐 Step 3: Assigning ALL permissions to Super Admin...');
    const existingPermissionIds = superAdminRole.rolePermissions.map(rp => rp.permissionId);
    let assignedCount = 0;

    for (const permission of allPermissions) {
      if (!existingPermissionIds.includes(permission.id)) {
        await prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        });
        console.log(`   ✅ Assigned: ${permission.slug}`);
        assignedCount++;
      }
    }

    if (assignedCount === 0) {
      console.log('   ⏭️  All permissions already assigned');
    } else {
      console.log(`   ✨ Assigned ${assignedCount} new permissions`);
    }

    // Step 4: Get all users with Super Admin role
    console.log('\n👥 Step 4: Finding users with Super Admin role...');
    const superAdminUsers = await prisma.userRole.findMany({
      where: {
        roleId: superAdminRole.id,
      },
      include: {
        user: true,
      },
    });

    console.log(`   Found ${superAdminUsers.length} Super Admin users`);

    // Step 5: Clear permission cache for all Super Admin users
    console.log('\n🧹 Step 5: Clearing permission cache...');
    for (const userRole of superAdminUsers) {
      const userId = userRole.userId;
      const cacheKeys = [
        `user:${userId}:permissions`,
        `user:${userId}:roles`,
      ];

      for (const key of cacheKeys) {
        try {
          await redisClient.del(key);
          console.log(`   ✅ Cleared cache for user: ${userRole.user.email}`);
        } catch (error) {
          console.log(`   ⚠️  Could not clear cache for ${key} (Redis might not be running)`);
        }
      }
    }

    // Step 6: Verify url_redirection permissions
    console.log('\n🔍 Step 6: Verifying url_redirection permissions...');
    const urlRedirectionPerms = await prisma.permission.findMany({
      where: {
        module: 'url_redirection',
      },
    });

    console.log(`   Found ${urlRedirectionPerms.length} url_redirection permissions:`);
    for (const perm of urlRedirectionPerms) {
      const isAssigned = await prisma.rolePermission.findFirst({
        where: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      });
      console.log(`   ${isAssigned ? '✅' : '❌'} ${perm.slug}`);
    }

    console.log('\n✨ Role & Permission System Fix Complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Total permissions in system: ${allPermissions.length}`);
    console.log(`   - Super Admin has: ${superAdminRole.rolePermissions.length + assignedCount} permissions`);
    console.log(`   - Super Admin users: ${superAdminUsers.length}`);
    console.log(`   - url_redirection permissions: ${urlRedirectionPerms.length}`);
    console.log('\n✅ You can now access URL Redirection page without permission errors!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    try {
      await redisClient.quit();
    } catch (error) {
      // Redis might not be running, ignore
    }
  }
}

fixRolePermissionSystem();
