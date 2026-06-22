const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const cookies = await p.setting.findMany({ where: { key: { contains: 'cookies' } } });
  console.log('=== COOKIES SETTINGS ===');
  console.log(JSON.stringify(cookies, null, 2));
  console.log('Total:', cookies.length);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
