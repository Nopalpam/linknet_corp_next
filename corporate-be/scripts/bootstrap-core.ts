import { PrismaClient } from '@prisma/client';
import { seedPermissions } from '../prisma/seeds/permissions.seed';
import { seedRoles } from '../prisma/seeds/roles.seed';
import { seedUsers } from '../prisma/seeds/users.seed';

const prisma = new PrismaClient();

export async function runBootstrapCore(): Promise<void> {
  console.log('========================================');
  console.log(' Bootstrap Seed: Core Auth Data');
  console.log('========================================');

  const permissions = await seedPermissions(prisma);
  await seedRoles(prisma, permissions);
  await seedUsers(prisma);

  console.log('========================================');
  console.log(' Core bootstrap completed');
  console.log('========================================');
}

if (require.main === module) {
  runBootstrapCore()
    .catch((error) => {
      console.error('Bootstrap core failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}