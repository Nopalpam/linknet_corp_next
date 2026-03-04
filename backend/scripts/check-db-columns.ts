import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'management_categories'
    ORDER BY ordinal_position
  `;
  console.log('management_categories columns:');
  console.table(result);

  const result2 = await prisma.$queryRaw<any[]>`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'managements'
    ORDER BY ordinal_position
  `;
  console.log('managements columns:');
  console.table(result2);

  // Check which models prisma knows about
  console.log('\nPrisma models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
