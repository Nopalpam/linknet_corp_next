/**
 * FULL DATA RESTORE SCRIPT
 * ========================
 * Restores all database data that was lost after the awards migration.
 * Runs all seeds and migrations in the correct order.
 *
 * Usage: cd backend && node scripts/restore-all-data.js
 */

const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');

function run(cmd, label) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  STEP: ${label}`);
  console.log(`  CMD:  ${cmd}`);
  console.log('='.repeat(60));
  try {
    execSync(cmd, { cwd: backendDir, stdio: 'inherit', timeout: 120000 });
    console.log(`  ✅ ${label} - SUCCESS\n`);
    return true;
  } catch (err) {
    console.error(`  ❌ ${label} - FAILED`);
    console.error(`  Error: ${err.message}\n`);
    return false;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║          FULL DATABASE DATA RESTORE                  ║');
  console.log('║  Restoring: users, roles, permissions, settings,     ║');
  console.log('║  pages, menus, news, reports, announcements, careers ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const steps = [
    // Step 1: Main seed (users, permissions, roles, settings, pages)
    {
      cmd: 'npx ts-node prisma/seed.ts',
      label: '1. Main Seed (users, permissions, roles, settings, sample pages)',
    },
    // Step 2: Pages migration from SQL (39 pages from old CMS)
    {
      cmd: 'npx ts-node scripts/migrate-pages-from-sql.ts',
      label: '2. Pages Migration from SQL (39 pages + components)',
    },
    // Step 3: Header menus seed
    {
      cmd: 'npx ts-node scripts/seed-header-menus.ts',
      label: '3. Header Menus Seed',
    },
    // Step 4: News migration
    {
      cmd: 'node scripts/migrate-news-data.js',
      label: '4. News Data Migration',
    },
    // Step 5: Report migration
    {
      cmd: 'node scripts/migrate-report-data.js',
      label: '5. Report Data Migration',
    },
    // Step 6: Announcement migration
    {
      cmd: 'node scripts/migrate-announcement-data.js',
      label: '6. Announcement Data Migration',
    },
    // Step 7: Career seed
    {
      cmd: 'npx ts-node prisma/seeds/career-content.seed.ts',
      label: '7. Career Content Seed (43 careers)',
    },
    // Step 8: Award permissions seed (awards data already exists)
    {
      cmd: 'npx ts-node prisma/seeds/award-permissions.seed.ts',
      label: '8. Award Permissions Seed',
    },
    // Step 9: Fix role-permission system
    {
      cmd: 'npx ts-node scripts/fix-role-permission-system.ts',
      label: '9. Fix Role-Permission System',
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const step of steps) {
    const ok = run(step.cmd, step.label);
    if (ok) successCount++;
    else failCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('  RESTORE SUMMARY');
  console.log('='.repeat(60));
  console.log(`  ✅ Successful: ${successCount}/${steps.length}`);
  if (failCount > 0) {
    console.log(`  ❌ Failed: ${failCount}/${steps.length}`);
  }
  console.log('='.repeat(60));

  // Verify final counts
  console.log('\n  Verifying final data counts...');
  try {
    execSync('node scripts/check-db-counts.js', { cwd: backendDir, stdio: 'inherit' });
  } catch (e) {
    console.error('  Could not verify counts');
  }
}

main();
