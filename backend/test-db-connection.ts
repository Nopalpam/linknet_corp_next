import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Get statistics
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const permissionCount = await prisma.permission.count();
    const settingCount = await prisma.setting.count();
    const newsCount = await prisma.news.count();
    const pageCount = await prisma.page.count();

    console.log('📊 Database Statistics:');
    console.log('   - Users:', userCount);
    console.log('   - Roles:', roleCount);
    console.log('   - Permissions:', permissionCount);
    console.log('   - Settings:', settingCount);
    console.log('   - News:', newsCount);
    console.log('   - Pages:', pageCount);
    console.log('');

    // Get sample user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (admin) {
      console.log('👤 Sample Admin User:');
      console.log('   - Name:', admin.firstName, admin.lastName);
      console.log('   - Email:', admin.email);
      console.log('   - Status:', admin.status);
      console.log('   - Roles:', admin.userRoles.map((ur) => ur.role.name).join(', '));
      console.log('');
    }

    console.log('🎉 Database is ready to use!\n');
    console.log('Next steps:');
    console.log('  1. Start building your API endpoints');
    console.log('  2. Run: npm run dev');
    console.log('  3. Access Prisma Studio: npm run db:studio\n');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
