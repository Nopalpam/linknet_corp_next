/**
 * Migration Script: Old MySQL Awards, Management, ContactUs data → New PostgreSQL (Prisma)
 * 
 * Source: datalengkap_awards_management_contactus.sql (MySQL dump)
 * Target: PostgreSQL via Prisma Client
 * 
 * Tables migrated:
 *   1. awards                   → awards (UUID id)
 *   2. management_categories    → management_categories (UUID id)
 *   3. managements              → managements (UUID id)
 *   4. contact_us               → contact_us (UUID id)
 * 
 * Mapping Decisions:
 *   D1: awards.nama_awards → title (legacy), nama_awards_id → titleId, nama_awards_en → titleEn
 *   D2: awards.detail_awards → description (legacy), detail_awards_id → descriptionId, detail_awards_en → descriptionEn
 *   D3: awards.tahun → issueDate (DateTime) + year (Int)
 *   D4: managements.position_en → positionEn, position_id → positionId
 *   D5: managements.bio_en → bioEn, bio_id → bioId
 *   D6: managements.category_id (bigint) → new UUID, maintain mapping
 *   D7: contact_us maps directly to ContactUs model
 *   D8: All operations wrapped in transactions for safety
 *   D9: Batch insert for contact_us (64 records)
 * 
 * Run: cd backend && node scripts/migrate-awards-management-contactus.js
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================
// SQL PARSER
// ============================================

/**
 * Parse INSERT INTO statements from SQL dump.
 * Character-by-character parsing to handle semicolons inside quoted strings.
 */
function parseSqlInserts(sql, tableName) {
  const rows = [];
  const marker = `INSERT INTO \`${tableName}\``;

  let searchStart = 0;
  while (true) {
    const insertPos = sql.indexOf(marker, searchStart);
    if (insertPos === -1) break;

    const valuesPos = sql.indexOf('VALUES', insertPos + marker.length);
    if (valuesPos === -1) break;

    let i = valuesPos + 6;
    let depth = 0;
    let currentRow = '';
    let inString = false;
    let escapeNext = false;
    let foundEnd = false;

    while (i < sql.length && !foundEnd) {
      const ch = sql[i];

      if (escapeNext) {
        if (depth >= 1) currentRow += ch;
        escapeNext = false;
        i++;
        continue;
      }

      if (ch === '\\') {
        if (depth >= 1) currentRow += ch;
        escapeNext = true;
        i++;
        continue;
      }

      if (ch === "'" && !escapeNext) {
        inString = !inString;
        if (depth >= 1) currentRow += ch;
        i++;
        continue;
      }

      if (!inString) {
        if (ch === '(') {
          depth++;
          if (depth === 1) {
            currentRow = '';
            i++;
            continue;
          }
        } else if (ch === ')') {
          depth--;
          if (depth === 0) {
            rows.push(parseRowValues(currentRow));
            currentRow = '';
            i++;
            continue;
          }
        } else if (ch === ';' && depth === 0) {
          foundEnd = true;
          i++;
          continue;
        }
      }

      if (depth >= 1) {
        currentRow += ch;
      }
      i++;
    }

    searchStart = i;
  }

  return rows;
}

/**
 * Parse a single row's comma-separated values.
 */
function parseRowValues(rowStr) {
  const values = [];
  let current = '';
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];

    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      escapeNext = true;
      continue;
    }

    if (ch === "'" && !escapeNext) {
      if (!inString) {
        inString = true;
        continue;
      } else {
        if (i + 1 < rowStr.length && rowStr[i + 1] === "'") {
          current += "'";
          i++;
          continue;
        }
        inString = false;
        continue;
      }
    }

    if (ch === ',' && !inString) {
      values.push(cleanValue(current.trim()));
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(cleanValue(current.trim()));
  return values;
}

/**
 * Clean a parsed value: NULL → null, numbers → number, strings → string
 */
function cleanValue(val) {
  if (val === 'NULL' || val === 'null') return null;
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  return val;
}

/**
 * Generate slug from string
 */
function generateSlug(text) {
  if (!text) return 'untitled-' + Date.now();
  return text
    .toLowerCase()
    .replace(/[''""]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 150);
}

/**
 * Parse MySQL timestamp string to JS Date (UTC)
 */
function parseTimestamp(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

// ============================================
// MIGRATION FUNCTIONS
// ============================================

/**
 * STEP 1: Migrate Management Categories
 */
async function migrateManagementCategories(sql, tx) {
  console.log('\n══════════════════════════════════════');
  console.log('  MIGRATING: management_categories');
  console.log('══════════════════════════════════════');

  const rows = parseSqlInserts(sql, 'management_categories');
  console.log(`  Parsed ${rows.length} rows from SQL`);

  // Old-ID → New-UUID mapping
  const idMap = {};
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    // Columns: id, name, slug, description, order, status, created_by, updated_by, created_at, updated_at
    const [oldId, name, slug, description, order, status, createdBy, updatedBy, createdAt, updatedAt] = row;

    const newId = uuidv4();
    idMap[oldId] = newId;

    // Check if slug already exists
    const existing = await tx.managementCategory.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  ⚠ Skipped (slug exists): "${name}" [slug=${slug}]`);
      idMap[oldId] = existing.id; // Use existing ID for relations
      skipped++;
      continue;
    }

    await tx.managementCategory.create({
      data: {
        id: newId,
        name,
        slug,
        description,
        position: order ?? 0,
        is_active: status === 1 || status === '1',
        createdBy: createdBy || null,
        updatedBy: updatedBy || null,
        createdAt: parseTimestamp(createdAt) || new Date(),
        updatedAt: parseTimestamp(updatedAt) || new Date(),
      },
    });
    created++;
    console.log(`  ✓ Created: "${name}" [old_id=${oldId} → new_id=${newId}]`);
  }

  console.log(`  Summary: ${created} created, ${skipped} skipped`);
  return idMap;
}

/**
 * STEP 2: Migrate Managements
 */
async function migrateManagements(sql, tx, categoryIdMap) {
  console.log('\n══════════════════════════════════════');
  console.log('  MIGRATING: managements');
  console.log('══════════════════════════════════════');

  const rows = parseSqlInserts(sql, 'managements');
  console.log(`  Parsed ${rows.length} rows from SQL`);

  let created = 0;
  let skipped = 0;
  const slugTracker = new Set();

  for (const row of rows) {
    // Columns: id, name, position_en, position_id, category, category_id, photo, bio_en, bio_id,
    //          data_order, data_status, created_by, updated_by, created_at, updated_at
    const [oldId, name, positionEn, positionId, category, categoryId, photo, bioEn, bioId,
           dataOrder, dataStatus, createdBy, updatedBy, createdAt, updatedAt] = row;

    const newCategoryId = categoryIdMap[categoryId];
    if (!newCategoryId) {
      console.log(`  ⚠ Skipped (category_id ${categoryId} not found): "${name}"`);
      skipped++;
      continue;
    }

    // Generate unique slug
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;
    while (slugTracker.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    // Also check DB
    while (await tx.management.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    slugTracker.add(slug);

    const newId = uuidv4();

    await tx.management.create({
      data: {
        id: newId,
        categoryId: newCategoryId,
        name,
        slug,
        positionEn: positionEn || null,
        positionId: positionId || null,
        description: null,
        photo: photo || null,
        bioEn: bioEn || null,
        bioId: bioId || null,
        order: dataOrder ?? 0,
        is_active: dataStatus === 1 || dataStatus === '1',
        createdBy: createdBy || null,
        updatedBy: updatedBy || null,
        createdAt: parseTimestamp(createdAt) || new Date(),
        updatedAt: parseTimestamp(updatedAt) || new Date(),
      },
    });
    created++;
    console.log(`  ✓ Created: "${name}" (${positionEn || positionId || 'N/A'}) [old_id=${oldId} → new_id=${newId}]`);
  }

  console.log(`  Summary: ${created} created, ${skipped} skipped`);
}

/**
 * STEP 3: Migrate Awards
 */
async function migrateAwards(sql, tx) {
  console.log('\n══════════════════════════════════════');
  console.log('  MIGRATING: awards');
  console.log('══════════════════════════════════════');

  const rows = parseSqlInserts(sql, 'awards');
  console.log(`  Parsed ${rows.length} rows from SQL`);

  let created = 0;
  let skipped = 0;
  const slugTracker = new Set();

  for (const row of rows) {
    // Columns: id, tahun, nama_awards, nama_awards_id, nama_awards_en, detail_awards,
    //          detail_awards_id, detail_awards_en, link, image, created_by, updated_by, created_at, updated_at
    const [oldId, tahun, namaAwards, namaAwardsId, namaAwardsEn, detailAwards,
           detailAwardsId, detailAwardsEn, link, image, createdBy, updatedBy, createdAt, updatedAt] = row;

    // Determine title: prefer EN, fallback to ID, then legacy
    const title = namaAwardsEn || namaAwardsId || namaAwards || `Award ${oldId}`;

    // Parse year from tahun (date format: 'YYYY-MM-DD')
    const issueDate = parseTimestamp(tahun);
    const year = issueDate ? issueDate.getFullYear() : new Date().getFullYear();

    // Determine issuer from title or default
    const issuer = 'Link Net Award';

    // Generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;
    while (slugTracker.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    while (await tx.award.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    slugTracker.add(slug);

    await tx.award.create({
      data: {
        title,
        titleId: namaAwardsId || null,
        titleEn: namaAwardsEn || null,
        slug,
        description: detailAwards || null,
        descriptionId: detailAwardsId || null,
        descriptionEn: detailAwardsEn || null,
        image: image || null,
        link: link || null,
        issuer,
        year,
        issueDate: issueDate || new Date(year, 0, 1),
        position: created + 1,
        isActive: true,
        status: 'ACTIVE',
        createdBy: createdBy != null ? String(createdBy) : null,
        updatedBy: updatedBy != null ? String(updatedBy) : null,
        createdAt: parseTimestamp(createdAt) || new Date(),
        updatedAt: parseTimestamp(updatedAt) || new Date(),
      },
    });
    created++;
    console.log(`  ✓ Created: "${title}" (${year}) [old_id=${oldId}]`);
  }

  console.log(`  Summary: ${created} created, ${skipped} skipped`);
}

/**
 * STEP 4: Migrate Contact Us (batch insert)
 */
async function migrateContactUs(sql, tx) {
  console.log('\n══════════════════════════════════════');
  console.log('  MIGRATING: contact_us');
  console.log('══════════════════════════════════════');

  const rows = parseSqlInserts(sql, 'contact_us');
  console.log(`  Parsed ${rows.length} rows from SQL`);

  const BATCH_SIZE = 50;
  let created = 0;
  let skipped = 0;

  for (let batchStart = 0; batchStart < rows.length; batchStart += BATCH_SIZE) {
    const batch = rows.slice(batchStart, batchStart + BATCH_SIZE);
    const batchData = [];

    for (const row of batch) {
      // Columns: id, first_name, last_name, email, phone, role, company, inquiry_type,
      //          message, ip_address, user_agent, submitted_at, created_at, updated_at
      const [oldId, firstName, lastName, email, phone, role, company, inquiryType,
             message, ipAddress, userAgent, submittedAt, createdAt, updatedAt] = row;

      // Map inquiry_type to InquiryType enum
      const inquiryTypeUpper = (inquiryType || 'others').toUpperCase();
      const validInquiryTypes = ['BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS'];
      const mappedInquiryType = validInquiryTypes.includes(inquiryTypeUpper) ? inquiryTypeUpper : 'OTHERS';

      batchData.push({
        id: uuidv4(),
        firstName: firstName != null ? String(firstName) : '',
        lastName: lastName != null ? String(lastName) : '',
        email: email != null ? String(email) : '',
        phone: phone != null ? String(phone) : null,
        role: role != null ? String(role) : null,
        company: company != null ? String(company) : null,
        inquiryType: mappedInquiryType,
        message: message != null ? String(message) : '',
        ipAddress: ipAddress != null ? String(ipAddress) : null,
        userAgent: userAgent != null ? String(userAgent) : null,
        submittedAt: parseTimestamp(submittedAt) || new Date(),
        createdAt: parseTimestamp(createdAt) || new Date(),
        updatedAt: parseTimestamp(updatedAt) || new Date(),
      });
    }

    await tx.contactUs.createMany({
      data: batchData,
      skipDuplicates: true,
    });

    created += batchData.length;
    console.log(`  ✓ Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}: ${batchData.length} records inserted (total: ${created})`);
  }

  console.log(`  Summary: ${created} created, ${skipped} skipped`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  MIGRATION: Awards, Management, Contact Us      ║');
  console.log('║  Source: MySQL SQL dump → PostgreSQL (Prisma)    ║');
  console.log('╚══════════════════════════════════════════════════╝');

  const sqlPath = path.resolve(__dirname, '../../datalengkap_awards_management_contactus.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`\n  ✗ SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`\n  ✓ SQL file loaded: ${(sql.length / 1024).toFixed(1)} KB`);

  // Dry run: parse counts
  const awardRows = parseSqlInserts(sql, 'awards');
  const catRows = parseSqlInserts(sql, 'management_categories');
  const mgmtRows = parseSqlInserts(sql, 'managements');
  const contactRows = parseSqlInserts(sql, 'contact_us');

  console.log('\n  Records to migrate:');
  console.log(`    awards:                ${awardRows.length}`);
  console.log(`    management_categories: ${catRows.length}`);
  console.log(`    managements:           ${mgmtRows.length}`);
  console.log(`    contact_us:            ${contactRows.length}`);
  console.log(`    TOTAL:                 ${awardRows.length + catRows.length + mgmtRows.length + contactRows.length}`);

  // Execute in a single transaction for data integrity
  console.log('\n  Starting transaction...');
  const startTime = Date.now();

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Management Categories first (needed for FK relations)
      const categoryIdMap = await migrateManagementCategories(sql, tx);

      // 2. Managements (depends on categories)
      await migrateManagements(sql, tx, categoryIdMap);

      // 3. Awards (independent)
      await migrateAwards(sql, tx);

      // 4. Contact Us (independent, batch insert)
      await migrateContactUs(sql, tx);
    }, {
      timeout: 120000, // 2 minutes timeout for large transactions
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  ✓ MIGRATION COMPLETED SUCCESSFULLY              ║');
    console.log(`║  Time: ${elapsed}s                                     `);
    console.log('╚══════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\n╔══════════════════════════════════════════════════╗');
    console.error('║  ✗ MIGRATION FAILED - All changes rolled back    ║');
    console.error('╚══════════════════════════════════════════════════╝');
    console.error('\nError:', error.message);
    if (error.meta) console.error('Meta:', JSON.stringify(error.meta, null, 2));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
