/**
 * Seed script: Add default_locale setting to CMS
 * Run: node scripts/seed-default-locale.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding default_locale setting...');

  await prisma.setting.upsert({
    where: { key: 'default_locale' },
    update: {},
    create: {
      key: 'default_locale',
      value: 'en',
      type: 'SELECT',
      group: 'general',
      label: 'Default Language',
      description:
        'Default website language. The default language will not show a prefix in the URL (e.g. / instead of /en). Non-default language will have a prefix (e.g. /id).',
      isPublic: true,
      isSystem: true,
      options: { options: ['en', 'id'] },
    },
  });

  console.log('✅ default_locale setting seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
