/**
 * Migration Script: Old MySQL Announcement data → New PostgreSQL (Prisma)
 * 
 * Source: data_announcement_lengkap.sql (MySQL dump)
 * Target: PostgreSQL via Prisma Client
 * 
 * Mapping:
 *   Old announcement_types (bigint id) → New announcement_types (UUID id)
 *   Old announcement_sections (bigint id) → New announcement_sections (UUID id)
 *   Old announcement_items (bigint id) → New announcements (UUID id)
 * 
 * This script PARSES the SQL file directly (400+ items, too many to hardcode).
 * 
 * Run: cd backend && node scripts/migrate-announcement-data.js
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================
// SQL PARSER
// ============================================

/**
 * Parse INSERT INTO statements from SQL dump.
 * Handles multi-row VALUES with proper quoting (escaped quotes, NULLs, etc.)
 */
function parseSqlInserts(sql, tableName) {
  const rows = [];
  
  // Match all INSERT INTO blocks for this table
  const insertRegex = new RegExp(
    `INSERT INTO \`${tableName}\`\\s*\\([^)]+\\)\\s*VALUES\\s*([\\s\\S]*?);`,
    'gi'
  );
  
  let insertMatch;
  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    const valuesBlock = insertMatch[1];
    
    // Parse individual row tuples: (val1, val2, ...)
    // We need to handle nested parentheses in URLs and escaped quotes
    let depth = 0;
    let currentRow = '';
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < valuesBlock.length; i++) {
      const ch = valuesBlock[i];
      
      if (escapeNext) {
        currentRow += ch;
        escapeNext = false;
        continue;
      }
      
      if (ch === '\\') {
        currentRow += ch;
        escapeNext = true;
        continue;
      }
      
      if (ch === "'" && !escapeNext) {
        inString = !inString;
        currentRow += ch;
        continue;
      }
      
      if (!inString) {
        if (ch === '(') {
          depth++;
          if (depth === 1) {
            currentRow = '';
            continue;
          }
        } else if (ch === ')') {
          depth--;
          if (depth === 0) {
            rows.push(parseRowValues(currentRow));
            currentRow = '';
            continue;
          }
        }
      }
      
      if (depth >= 1) {
        currentRow += ch;
      }
    }
  }
  
  return rows;
}

/**
 * Parse a single row's comma-separated values.
 * Handles: integers, NULL, quoted strings (with escaped quotes).
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
      // Don't add the backslash itself for escaped quotes
      continue;
    }
    
    if (ch === "'" && !escapeNext) {
      if (!inString) {
        inString = true;
        continue; // Skip opening quote
      } else {
        // Check for '' (escaped quote in SQL)
        if (i + 1 < rowStr.length && rowStr[i + 1] === "'") {
          current += "'";
          i++; // Skip next quote
          continue;
        }
        inString = false;
        continue; // Skip closing quote
      }
    }
    
    if (ch === ',' && !inString) {
      values.push(cleanValue(current.trim()));
      current = '';
      continue;
    }
    
    current += ch;
  }
  
  // Push last value
  values.push(cleanValue(current.trim()));
  
  return values;
}

/**
 * Clean a parsed value: NULL → null, numbers → number, strings → string
 */
function cleanValue(val) {
  if (val === 'NULL' || val === 'null') return null;
  // Check if it's a number (integer)
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  return val;
}

// ============================================
// DATA EXTRACTION
// ============================================

function extractData(sqlContent) {
  // Parse announcement_types
  // SQL columns: id, name, type, sort_order, is_active, created_at, updated_at, deleted_at
  const rawTypes = parseSqlInserts(sqlContent, 'announcement_types');
  const types = rawTypes.map(row => ({
    id: row[0],
    title: row[1],
    type: row[2],
    sort_order: row[3],
    is_active: row[4],
    created_at: row[5],
    updated_at: row[6],
    deleted_at: row[7],
  }));

  // Parse announcement_sections
  const rawSections = parseSqlInserts(sqlContent, 'announcement_sections');
  const sections = rawSections.map(row => ({
    id: row[0],
    announcement_type_id: row[1],
    title: row[2],
    description: row[3],
    announcement_year: row[4],
    cta_enabled: row[5],
    cta_text: row[6],
    cta_url: row[7],
    sort_order: row[8],
    is_active: row[9],
    created_at: row[10],
    updated_at: row[11],
    deleted_at: row[12],
  }));

  // Parse announcement_items
  const rawItems = parseSqlInserts(sqlContent, 'announcement_items');
  const items = rawItems.map(row => ({
    id: row[0],
    announcement_type_id: row[1],
    announcement_section_id: row[2],
    title: row[3],
    sub_description: row[4],
    pdf_file: row[5],
    cover_image: row[6],
    data_type: row[7],
    audit_status: row[8],
    file_size: row[9],
    sort_order: row[10],
    is_active: row[11],
    created_at: row[12],
    updated_at: row[13],
    deleted_at: row[14],
  }));

  return { types, sections, items };
}

// ============================================
// ID MAPPING (old bigint → new UUID)
// ============================================
const typeIdMap = {};    // old_id → new_uuid
const sectionIdMap = {}; // old_id → new_uuid

// ============================================
// MAIN MIGRATION
// ============================================

async function main() {
  console.log('==============================================');
  console.log('Announcement Data Migration: MySQL → PostgreSQL');
  console.log('==============================================\n');

  // Read and parse SQL file
  const sqlPath = path.resolve(__dirname, '../../data_announcement_lengkap.sql');
  console.log(`[Parse] Reading SQL file: ${sqlPath}`);
  
  if (!fs.existsSync(sqlPath)) {
    console.error('ERROR: SQL file not found at:', sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  const { types, sections, items } = extractData(sqlContent);
  
  console.log(`  Parsed: ${types.length} types, ${sections.length} sections, ${items.length} items\n`);

  if (types.length === 0 || sections.length === 0 || items.length === 0) {
    console.error('ERROR: Failed to parse SQL data. Check the SQL file format.');
    process.exit(1);
  }

  // Step 0: Clear existing data (announcements first due to FK, then sections, then types)
  console.log('[Step 0] Clearing existing announcement data...');
  const delItems = await prisma.announcements.deleteMany({});
  const delSections = await prisma.announcementSection.deleteMany({});
  const delTypes = await prisma.announcementType.deleteMany({});
  console.log(`  Deleted: ${delItems.count} items, ${delSections.count} sections, ${delTypes.count} types\n`);

  // Step 1: Create Announcement Types
  console.log('[Step 1] Creating Announcement Types...');
  for (const oldType of types) {
    const newId = uuidv4();
    typeIdMap[oldType.id] = newId;

    const slug = slugify(oldType.title, { lower: true, strict: true });
    await prisma.announcementType.create({
      data: {
        id: newId,
        name: oldType.title,
        slug,
        type: oldType.type || 'List',
        description: null,
        icon: null,
        color: null,
        position: oldType.sort_order || 0,
        isActive: oldType.is_active === 1 || oldType.is_active === true,
        createdAt: oldType.created_at ? new Date(oldType.created_at) : new Date(),
        updatedAt: oldType.updated_at ? new Date(oldType.updated_at) : new Date(),
        deletedAt: oldType.deleted_at ? new Date(oldType.deleted_at) : null,
      },
    });
    console.log(`  ✓ Type: "${oldType.title}" (old:${oldType.id} → new:${newId})`);
  }
  console.log(`  Created ${types.length} types\n`);

  // Step 2: Create Announcement Sections
  console.log('[Step 2] Creating Announcement Sections...');
  let sectionSuccess = 0;
  let sectionSkip = 0;

  for (const oldSection of sections) {
    const newId = uuidv4();
    sectionIdMap[oldSection.id] = newId;

    const newTypeId = typeIdMap[oldSection.announcement_type_id];
    if (!newTypeId) {
      console.log(`  ⚠ Skipping section "${oldSection.title}" - no matching type for old id ${oldSection.announcement_type_id}`);
      sectionSkip++;
      continue;
    }

    const slug = slugify(String(oldSection.title) + '-' + oldSection.id, { lower: true, strict: true });
    await prisma.announcementSection.create({
      data: {
        id: newId,
        type_id: newTypeId,
        name: String(oldSection.title),
        slug,
        description: oldSection.description || null,
        announcement_year: oldSection.announcement_year != null ? String(oldSection.announcement_year) : null,
        cta_enabled: oldSection.cta_enabled === 1 || oldSection.cta_enabled === true,
        cta_text: oldSection.cta_text || null,
        cta_url: oldSection.cta_url || null,
        position: oldSection.sort_order || 0,
        isActive: oldSection.is_active === 1 || oldSection.is_active === true,
        createdAt: oldSection.created_at ? new Date(oldSection.created_at) : new Date(),
        updatedAt: oldSection.updated_at ? new Date(oldSection.updated_at) : new Date(),
        deletedAt: oldSection.deleted_at ? new Date(oldSection.deleted_at) : null,
      },
    });
    sectionSuccess++;
    console.log(`  ✓ Section: "${oldSection.title}" (old:${oldSection.id} → new:${newId})`);
  }
  console.log(`  Created ${sectionSuccess} sections, skipped ${sectionSkip}\n`);

  // Step 3: Create Announcement Items
  console.log('[Step 3] Creating Announcement Items...');
  let itemSuccess = 0;
  let itemSkip = 0;

  for (const oldItem of items) {
    const newId = uuidv4();

    // Map type_id
    let newTypeId = null;
    if (oldItem.announcement_type_id) {
      newTypeId = typeIdMap[oldItem.announcement_type_id];
    }

    // Map section_id
    let newSectionId = null;
    if (oldItem.announcement_section_id) {
      newSectionId = sectionIdMap[oldItem.announcement_section_id];
    }

    // For items with section but no type, derive type from section
    if (!newTypeId && newSectionId) {
      const section = sections.find(s => s.id === oldItem.announcement_section_id);
      if (section) {
        newTypeId = typeIdMap[section.announcement_type_id];
      }
    }

    // Validate: must have either type or section
    if (!newTypeId && !newSectionId) {
      console.log(`  ⚠ Skipping item "${oldItem.title}" (id:${oldItem.id}) - no valid type or section reference`);
      itemSkip++;
      continue;
    }

    // Generate slug - use title + optional sub_description for uniqueness
    const slugBase = oldItem.title + (oldItem.sub_description ? '-' + oldItem.sub_description : '') + '-' + oldItem.id;
    const slug = slugify(slugBase, { lower: true, strict: true });

    await prisma.announcements.create({
      data: {
        id: newId,
        type_id: newTypeId,
        section_id: newSectionId,
        title: oldItem.title,
        slug,
        description: oldItem.sub_description || null,
        pdf_file: oldItem.pdf_file || null,
        cover_image: oldItem.cover_image || null,
        data_type: oldItem.data_type || null,
        audit_status: oldItem.audit_status || null,
        file_size: oldItem.file_size ? String(oldItem.file_size) : null,
        sort_order: oldItem.sort_order || 0,
        is_active: oldItem.is_active === 1 || oldItem.is_active === true,
        status: 'PUBLISHED',
        created_at: oldItem.created_at ? new Date(oldItem.created_at) : new Date(),
        updated_at: oldItem.updated_at ? new Date(oldItem.updated_at) : new Date(),
        deleted_at: oldItem.deleted_at ? new Date(oldItem.deleted_at) : null,
      },
    });
    itemSuccess++;
  }
  console.log(`  Created ${itemSuccess} items, skipped ${itemSkip}\n`);

  // Step 4: Verification
  console.log('[Step 4] Verification...');
  const finalTypes = await prisma.announcementType.count();
  const finalSections = await prisma.announcementSection.count();
  const finalItems = await prisma.announcements.count();
  console.log(`  Types: ${finalTypes} (expected: ${types.length})`);
  console.log(`  Sections: ${finalSections} (expected: ${sections.length})`);
  console.log(`  Items: ${finalItems} (expected: ${items.length})`);

  // Show breakdown by type
  const allTypes = await prisma.announcementType.findMany({
    include: {
      _count: { select: { announcements: true, announcement_sections: true } },
    },
    orderBy: { position: 'asc' },
  });
  console.log('\n  Breakdown:');
  for (const t of allTypes) {
    console.log(`    ${t.name}: ${t._count.announcements} direct items, ${t._count.announcement_sections} sections`);
  }

  // Show sections per type
  const allSections = await prisma.announcementSection.findMany({
    include: {
      _count: { select: { announcements: true } },
      announcement_types: { select: { name: true } },
    },
    orderBy: { position: 'asc' },
  });
  console.log('\n  Sections detail:');
  for (const s of allSections) {
    console.log(`    [${s.announcement_types.name}] ${s.name} (year: ${s.announcement_year || 'N/A'}): ${s._count.announcements} items`);
  }

  console.log('\n==============================================');
  console.log('Announcement Migration completed successfully!');
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
