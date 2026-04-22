const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');

function runStep(command, label) {
  console.log(`\n${'='.repeat(72)}`);
  console.log(`STEP: ${label}`);
  console.log(`CMD:  ${command}`);
  console.log('='.repeat(72));

  execSync(command, {
    cwd: backendDir,
    stdio: 'inherit',
    timeout: 300000,
    env: process.env,
  });
}

function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              LEGACY MIGRATION ORCHESTRATOR                 ║');
  console.log('║   schema -> bootstrap core -> legacy SQL domain imports    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const steps = [
    {
      label: 'Apply Prisma schema migration',
      command: 'npx prisma migrate deploy',
    },
    {
      label: 'Bootstrap core auth data',
      command: 'npx ts-node scripts/bootstrap-core.ts',
    },
    {
      label: 'Import legacy pages and page components',
      command: 'npx ts-node --project tsconfig.dev.json prisma/seeds/migrate-legacy-pages.seed.ts',
    },
    {
      label: 'Import career content',
      command: 'node scripts/import-careers-from-sql.js',
    },
    {
      label: 'Import legacy menus',
      command: 'node scripts/import-menus-from-sql.js',
    },
    {
      label: 'Import awards, management, and contact-us',
      command: 'node scripts/migrate-awards-management-contactus.js',
    },
    {
      label: 'Import announcement domain data',
      command: 'node scripts/migrate-announcement-data.js',
    },
    {
      label: 'Import reports domain data',
      command: 'node scripts/import-reports-from-sql.js',
    },
    {
      label: 'Import news domain data',
      command: 'node scripts/migrate-news-data.js',
    },
    {
      label: 'Show post-migration database counts',
      command: 'node scripts/check-db-counts.js',
    },
  ];

  for (const step of steps) {
    runStep(step.command, step.label);
  }
}

try {
  main();
} catch (error) {
  console.error('\nLegacy migration orchestrator failed:', error.message);
  process.exit(1);
}