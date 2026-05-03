/**
 * Seed Script: Component Visibility
 *
 * Seeds all component types from the registry into the component_visibility table.
 * Safe to re-run: uses upsert so existing rows are never overwritten or duplicated.
 *
 * Usage (from backend/ dir):
 *   ts-node -r tsconfig-paths/register scripts/seed-component-visibility.ts
 *
 * Or via npm script (add to package.json):
 *   "db:seed:component-visibility": "ts-node -r tsconfig-paths/register scripts/seed-component-visibility.ts"
 */

import { PrismaClient } from '@prisma/client';
import { ALL_COMPONENT_TYPES } from '../src/constants/componentDefaults';

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('========================================');
  console.log(' Seed: Component Visibility');
  console.log('========================================');
  console.log(`Registry contains ${ALL_COMPONENT_TYPES.length} component type(s).`);
  console.log('');

  let inserted = 0;
  let skipped = 0;

  for (const ct of ALL_COMPONENT_TYPES) {
    const existing = await prisma.componentVisibility.findUnique({
      where: { componentKey: ct.type },
    });

    if (existing) {
      skipped++;
      console.log(`  SKIP   ${ct.type} (already exists, preserving current status)`);
    } else {
      await prisma.componentVisibility.create({
        data: {
          componentKey: ct.type,
          componentName: ct.name,
          status: 'ACTIVE',
          businessUnit: null,
        },
      });
      inserted++;
      console.log(`  INSERT ${ct.type} → "${ct.name}"`);
    }
  }

  console.log('');
  console.log('========================================');
  console.log(` Done — inserted: ${inserted}, skipped: ${skipped}`);
  console.log('========================================');
  console.log('');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
