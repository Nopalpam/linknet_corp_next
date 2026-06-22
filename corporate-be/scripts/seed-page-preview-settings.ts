/**
 * Script to add page preview settings to the database
 * Run with: npx ts-node -r tsconfig-paths/register scripts/seed-page-preview-settings.ts
 */
import { PrismaClient, SettingType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding page preview settings...\n');

  const pageSettings = [
    {
      key: 'pages.preview.base_url',
      value: 'https://dev-be.lncorp.local',
      type: 'STRING' as SettingType,
      group: 'pages',
      label: 'Page Preview Base URL',
      description:
        'Base URL for previewing public pages (e.g., https://example.com). The page slug will be appended automatically.',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'pages.preview.path_template',
      value: '/pages/{slug}',
      type: 'STRING' as SettingType,
      group: 'pages',
      label: 'Page Preview Path Template',
      description:
        'URL path template for page preview. Use {slug} as placeholder. Example: /pages/{slug} or /{slug}',
      isPublic: false,
      isSystem: true,
    },
  ];

  for (const setting of pageSettings) {
    const result = await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        label: setting.label,
        description: setting.description,
        group: setting.group,
        type: setting.type,
        isPublic: setting.isPublic,
        isSystem: setting.isSystem,
      },
      create: setting,
    });
    console.log(`  ✅ ${result.key} = ${result.value}`);
  }

  console.log('\n✅ Page preview settings added successfully!');
  console.log('\nYou can now configure these in CMS → Settings → pages group.');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
