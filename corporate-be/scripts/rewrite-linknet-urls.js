const { PrismaClient } = require('@prisma/client');
const { CDN_PREFIX, rewriteLinknetUrls } = require('./lib/linknet-url-normalizer');

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$transaction(
    (tx) => rewriteLinknetUrls(tx),
    { maxWait: 10_000, timeout: 120_000 },
  );

  console.table(result.changedColumns);
  console.log(`Updated ${result.changedRows} row/column value(s) to use ${CDN_PREFIX}`);
}

main()
  .catch((error) => {
    console.error(`URL rewrite failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
