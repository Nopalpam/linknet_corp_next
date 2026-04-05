const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const p = new PrismaClient();

async function main() {
  const cookieSettings = [
    {
      id: randomUUID(),
      key: 'cookies_title',
      value: 'We use cookies',
      type: 'STRING',
      group: 'cookies',
      label: 'Cookie Popup Title',
      description: 'Title text for cookie consent popup',
      isPublic: true,
      isSystem: false,
    },
    {
      id: randomUUID(),
      key: 'cookies_description',
      value: 'This website uses cookies to ensure you get the best experience on our website. By continuing to browse, you agree to our use of cookies.',
      type: 'STRING',
      group: 'cookies',
      label: 'Cookie Popup Description',
      description: 'Description text for cookie consent popup',
      isPublic: true,
      isSystem: false,
    },
    {
      id: randomUUID(),
      key: 'cookies_accept_label',
      value: 'Accept',
      type: 'STRING',
      group: 'cookies',
      label: 'Accept Button Label',
      description: 'Label for the accept button',
      isPublic: true,
      isSystem: false,
    },
    {
      id: randomUUID(),
      key: 'cookies_more_info_label',
      value: 'More Info',
      type: 'STRING',
      group: 'cookies',
      label: 'More Info Button Label',
      description: 'Label for the more info link',
      isPublic: true,
      isSystem: false,
    },
    {
      id: randomUUID(),
      key: 'cookies_more_info_url',
      value: '/privacy-policy',
      type: 'STRING',
      group: 'cookies',
      label: 'More Info URL',
      description: 'URL for the more info link',
      isPublic: true,
      isSystem: false,
    },
    {
      id: randomUUID(),
      key: 'cookies_icon_url',
      value: '',
      type: 'STRING',
      group: 'cookies',
      label: 'Cookie Icon URL',
      description: 'URL for the cookie icon image (optional)',
      isPublic: true,
      isSystem: false,
    },
  ];

  console.log('Inserting cookie settings...');

  for (const setting of cookieSettings) {
    const existing = await p.setting.findUnique({ where: { key: setting.key } });
    if (existing) {
      console.log(`  [SKIP] "${setting.key}" already exists`);
    } else {
      await p.setting.create({ data: setting });
      console.log(`  [OK]   "${setting.key}" inserted`);
    }
  }

  // Verify
  const result = await p.setting.findMany({ where: { group: 'cookies' } });
  console.log(`\nTotal cookies settings in DB: ${result.length}`);
  result.forEach(r => console.log(`  ${r.key} = ${JSON.stringify(r.value)}`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
