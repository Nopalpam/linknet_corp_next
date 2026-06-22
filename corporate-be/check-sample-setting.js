const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const sample = await p.setting.findFirst({ where: { isPublic: true } });
  console.log('=== SAMPLE PUBLIC SETTING ===');
  console.log(JSON.stringify(sample, null, 2));
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
