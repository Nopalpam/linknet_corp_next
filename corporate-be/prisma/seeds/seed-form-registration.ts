/**
 * seed-form-registration.ts
 *
 * Entry point: Seeds ALL form registration modules across all BUs.
 *
 * Calls:
 *   1. seedEnterpriseforms  — 5 Enterprise modules
 *   2. seedFiberForms       — 3 Fiber modules
 *   3. seedMediaForms       — 2 Media modules
 *
 * Total: 10 form modules
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register prisma/seeds/seed-form-registration.ts
 *
 * Or via run-seed.ps1:
 *   .\run-seed.ps1 seed-form-registration
 */

import { PrismaClient } from '@prisma/client';
import { seedEnterpriseforms } from './seed-enterprise-forms';
import { seedFiberForms } from './seed-fiber-forms';
import { seedMediaForms } from './seed-media-forms';

const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Form Registration Multi-BU — Full Seed               ');
  console.log('═══════════════════════════════════════════════════════');

  const [enterprise, fiber, media] = await Promise.all([
    seedEnterpriseforms(prisma),
    seedFiberForms(prisma),
    seedMediaForms(prisma),
  ]);

  const total = {
    created: enterprise.created + fiber.created + media.created,
    updated: enterprise.updated + fiber.updated + media.updated,
    skipped: enterprise.skipped + fiber.skipped + media.skipped,
  };

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  TOTAL — created=${total.created}, updated=${total.updated}, skipped=${total.skipped}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((err) => {
    console.error('❌ Form registration seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
