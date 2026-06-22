import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('🗑️  Clearing existing users...');

  // Nullify optional FK to users (no cascade on these)
  await prisma.$executeRaw`UPDATE log_activities SET user_id = NULL WHERE user_id IS NOT NULL`;
  await prisma.$executeRaw`UPDATE contact_submissions SET user_id = NULL WHERE user_id IS NOT NULL`;
  await prisma.$executeRaw`UPDATE news SET updated_by_id = NULL WHERE updated_by_id IS NOT NULL`;

  // Delete tables with required FK to users (delete children first due to cascade)
  await prisma.$executeRaw`DELETE FROM news_tag_relations`;
  await prisma.$executeRaw`DELETE FROM news_highlights`;
  await prisma.$executeRaw`DELETE FROM news_views`;
  await prisma.$executeRaw`DELETE FROM news`;

  await prisma.$executeRaw`DELETE FROM page_components`;
  await prisma.$executeRaw`DELETE FROM pages`;

  await prisma.$executeRaw`DELETE FROM files`;

  // Delete user-dependent tables (cascade handles refresh_tokens, password_histories, user_roles)
  await prisma.user.deleteMany({});

  console.log('✅ Cleared existing users');

  // ============================================
  // Ensure Roles Exist
  // ============================================
  console.log('👥 Ensuring roles exist...');

  const superAdminRole = await prisma.role.upsert({
    where: { slug: 'super-admin' },
    update: {},
    create: {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access with all permissions',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access to manage content',
      isSystem: true,
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { slug: 'editor' },
    update: {},
    create: {
      name: 'Editor',
      slug: 'editor',
      description: 'Can create and edit content',
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { slug: 'user' },
    update: {},
    create: {
      name: 'User',
      slug: 'user',
      description: 'Basic user access',
      isSystem: true,
    },
  });

  console.log('✅ Roles verified');

  // ============================================
  // Create Users
  // ============================================
  console.log('👤 Creating users...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@linknet.co.id',
      username: 'superadmin',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      mustChangePassword: false,
    },
  });
  console.log('   ✅ Super Admin (admin@linknet.co.id / Admin123!)');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      mustChangePassword: false,
    },
  });
  console.log('   ✅ Admin (admin@example.com / Admin123!)');

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      username: 'editor',
      password: hashedPassword,
      firstName: 'Content',
      lastName: 'Editor',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      mustChangePassword: false,
    },
  });
  console.log('   ✅ Editor (editor@example.com / Admin123!)');

  const basicUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      username: 'user',
      password: hashedPassword,
      firstName: 'Basic',
      lastName: 'User',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      mustChangePassword: false,
    },
  });
  console.log('   ✅ Basic User (user@example.com / Admin123!)');

  // ============================================
  // Assign Roles to Users
  // ============================================
  console.log('🔗 Assigning roles to users...');

  await prisma.userRole.createMany({
    data: [
      { userId: superAdmin.id, roleId: superAdminRole.id },
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: editorUser.id, roleId: editorRole.id },
      { userId: basicUser.id, roleId: userRole.id },
    ],
  });

  console.log('✅ Roles assigned');

  console.log('');
  console.log('🎉 Users seeded successfully!');
  console.log('');
  console.log('📋 Accounts:');
  console.log('   superadmin  | admin@linknet.co.id  | Admin123! | Super Admin');
  console.log('   admin       | admin@example.com    | Admin123! | Admin');
  console.log('   editor      | editor@example.com   | Admin123! | Editor');
  console.log('   user        | user@example.com     | Admin123! | User');
}

// Run standalone
seedUsers()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
