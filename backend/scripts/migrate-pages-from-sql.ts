/**
 * Migration Script: Pages & Components from Old SQL Backup
 * 
 * Reads daftar_pages_lengkap.sql and migrates all 39 valid pages
 * and their components into the new CMS (PostgreSQL + Prisma).
 * 
 * Rules:
 * - Phase 1: Create all pages (old bigint ID → new UUID)
 * - Phase 2: Create all components using page ID mapping
 * - Skip orphaned components (page_ids: 3,4,5,19,21,22,25,27,28,51,52)
 * - Uses Prisma transactions for safety
 * - Preserves slugs exactly as-is
 * - Maps: status draft→DRAFT, published→PUBLISHED
 * - Maps: meta_thumbnail → ogImage
 * - Maps: sort_order → order
 * - Maps: is_visible (1/0) → isVisible (boolean)
 * - Template defaults to DEFAULT
 * - publishedAt = created_at if status is published
 * 
 * Usage: cd backend && npx ts-node scripts/migrate-pages-from-sql.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Valid page IDs from the SQL (pages that exist in the pages table)
const VALID_PAGE_IDS = new Set([
  1, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 23, 24,
  29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44,
  45, 47, 48, 49, 50, 54
]);

interface OldPage {
  id: number;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  meta_thumbnail: string | null;
  status: string;
  seo_settings: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface OldComponent {
  id: number;
  page_id: number;
  component_type: string;
  component_data: string;
  sort_order: number;
  is_visible: number;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Parse a MySQL VALUES tuple, handling nested quotes and JSON correctly.
 * This handles the tricky parts: escaped quotes inside JSON strings,
 * NULL values, and nested parentheses inside JSON data.
 */
function parseMySQLValues(valuesStr: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let depth = 0;
  let i = 0;

  while (i < valuesStr.length) {
    const ch = valuesStr[i];

    if (inString) {
      if (ch === '\\' && i + 1 < valuesStr.length) {
        // Escaped character - take both
        current += ch + valuesStr[i + 1];
        i += 2;
        continue;
      }
      if (ch === stringChar) {
        // Check for doubled quote (e.g., '' in MySQL)
        if (i + 1 < valuesStr.length && valuesStr[i + 1] === stringChar) {
          current += ch + ch;
          i += 2;
          continue;
        }
        inString = false;
        current += ch;
        i++;
        continue;
      }
      current += ch;
      i++;
      continue;
    }

    // Not in string
    if (ch === '\'' || ch === '"') {
      inString = true;
      stringChar = ch;
      current += ch;
      i++;
      continue;
    }

    if (ch === '(' ) {
      depth++;
      if (depth === 1) {
        // Start of tuple, skip
        i++;
        continue;
      }
    }
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        // End of tuple, we don't add this
        i++;
        continue;
      }
    }

    if (ch === ',' && depth === 1) {
      fields.push(current.trim());
      current = '';
      i++;
      continue;
    }

    if (depth >= 1) {
      current += ch;
    }
    i++;
  }

  // Last field
  if (current.trim()) {
    fields.push(current.trim());
  }

  return fields;
}

/**
 * Clean a MySQL string value: remove surrounding quotes and unescape.
 */
function cleanString(val: string): string | null {
  if (val === 'NULL' || val === 'null') return null;
  // Remove surrounding quotes
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  // Unescape MySQL escapes
  val = val.replace(/\\'/g, "'");
  val = val.replace(/\\"/g, '"');
  val = val.replace(/\\\\/g, '\\');
  val = val.replace(/\\n/g, '\n');
  val = val.replace(/\\r/g, '\r');
  val = val.replace(/\\t/g, '\t');
  return val;
}

function cleanInt(val: string): number {
  return parseInt(val.trim(), 10);
}

/**
 * Extract all tuples from a MySQL INSERT statement.
 * Each INSERT may contain multiple rows: INSERT INTO ... VALUES (...), (...), ...;
 */
function extractTuples(insertStatement: string): string[][] {
  // Find the VALUES keyword
  const valuesIndex = insertStatement.indexOf('VALUES');
  if (valuesIndex === -1) return [];
  
  const valuesStr = insertStatement.substring(valuesIndex + 6).trim();
  
  // Split into individual tuples by finding matching parentheses
  const tuples: string[][] = [];
  let i = 0;
  
  while (i < valuesStr.length) {
    if (valuesStr[i] === '(') {
      // Find matching close paren, respecting strings
      let depth = 0;
      let start = i;
      let inStr = false;
      let strChar = '';
      
      while (i < valuesStr.length) {
        const ch = valuesStr[i];
        
        if (inStr) {
          if (ch === '\\' && i + 1 < valuesStr.length) {
            i += 2;
            continue;
          }
          if (ch === strChar) {
            inStr = false;
          }
          i++;
          continue;
        }
        
        if (ch === '\'' || ch === '"') {
          inStr = true;
          strChar = ch;
          i++;
          continue;
        }
        
        if (ch === '(') depth++;
        if (ch === ')') {
          depth--;
          if (depth === 0) {
            const tupleStr = valuesStr.substring(start, i + 1);
            const fields = parseMySQLValues(tupleStr);
            tuples.push(fields);
            i++;
            break;
          }
        }
        i++;
      }
    } else {
      i++;
    }
  }
  
  return tuples;
}

/**
 * Parse pages from SQL content
 */
function parsePages(sql: string): OldPage[] {
  const pages: OldPage[] = [];
  
  // Find all INSERT INTO `pages` statements
  const pageInsertRegex = /INSERT INTO `pages`[^;]+;/gs;
  let match;
  
  while ((match = pageInsertRegex.exec(sql)) !== null) {
    const tuples = extractTuples(match[0]);
    
    for (const fields of tuples) {
      if (fields.length < 11) continue;
      
      const page: OldPage = {
        id: cleanInt(fields[0]),
        title: cleanString(fields[1]) || '',
        slug: cleanString(fields[2]) || '',
        meta_title: cleanString(fields[3]),
        meta_description: cleanString(fields[4]),
        meta_keywords: cleanString(fields[5]),
        meta_thumbnail: cleanString(fields[6]),
        status: cleanString(fields[7]) || 'draft',
        seo_settings: cleanString(fields[8]),
        created_at: cleanString(fields[9]),
        updated_at: cleanString(fields[10]),
      };
      
      pages.push(page);
    }
  }
  
  return pages;
}

/**
 * Parse page_components from SQL content
 */
function parseComponents(sql: string): OldComponent[] {
  const components: OldComponent[] = [];
  
  // Find all INSERT INTO `page_components` statements
  const compInsertRegex = /INSERT INTO `page_components`[^;]+;/gs;
  let match;
  
  while ((match = compInsertRegex.exec(sql)) !== null) {
    const tuples = extractTuples(match[0]);
    
    for (const fields of tuples) {
      if (fields.length < 8) continue;
      
      const component: OldComponent = {
        id: cleanInt(fields[0]),
        page_id: cleanInt(fields[1]),
        component_type: cleanString(fields[2]) || '',
        component_data: cleanString(fields[3]) || '{}',
        sort_order: cleanInt(fields[4]),
        is_visible: cleanInt(fields[5]),
        created_at: cleanString(fields[6]),
        updated_at: cleanString(fields[7]),
      };
      
      components.push(component);
    }
  }
  
  return components;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  MIGRATION: Pages & Components from Old SQL Backup');
  console.log('='.repeat(60));
  console.log();

  // Step 0: Read SQL file
  const sqlPath = path.resolve(__dirname, '../../daftar_pages_lengkap.sql');
  console.log(`📄 Reading SQL file: ${sqlPath}`);
  
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL file not found!');
    process.exit(1);
  }
  
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`   File size: ${(sqlContent.length / 1024).toFixed(1)} KB`);

  // Step 1: Parse SQL
  console.log('\n📊 STEP 1: Parsing SQL data...');
  const oldPages = parsePages(sqlContent);
  const oldComponents = parseComponents(sqlContent);
  
  console.log(`   Found ${oldPages.length} pages in SQL`);
  console.log(`   Found ${oldComponents.length} total components in SQL`);
  
  // Filter: only valid pages
  const validPages = oldPages.filter(p => VALID_PAGE_IDS.has(p.id));
  console.log(`   Valid pages to migrate: ${validPages.length}`);
  
  // Filter: only components for valid pages
  const validComponents = oldComponents.filter(c => VALID_PAGE_IDS.has(c.page_id));
  const orphanedComponents = oldComponents.filter(c => !VALID_PAGE_IDS.has(c.page_id));
  console.log(`   Valid components to migrate: ${validComponents.length}`);
  console.log(`   Orphaned components (skipped): ${orphanedComponents.length}`);

  // Step 2: Find admin user
  console.log('\n👤 STEP 2: Finding admin user...');
  const adminUser = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: {
            slug: 'super-admin'
          }
        }
      }
    }
  });

  if (!adminUser) {
    console.error('❌ No admin user found! Please seed users first.');
    process.exit(1);
  }
  console.log(`   Admin user: ${adminUser.email} (${adminUser.id})`);

  // Step 3: Migrate Pages (Phase 1)
  console.log('\n📝 STEP 3: Migrating Pages (Phase 1)...');
  console.log('-'.repeat(60));
  
  const oldIdToNewId: Map<number, string> = new Map();
  let pagesCreated = 0;
  let pagesSkipped = 0;
  let pagesFailed = 0;

  for (const oldPage of validPages) {
    try {
      // Check if page with same slug already exists
      const existing = await prisma.page.findUnique({
        where: { slug: oldPage.slug }
      });

      if (existing) {
        console.log(`   ⏭️  [Page ${oldPage.id}] "${oldPage.title}" (${oldPage.slug}) - already exists, mapping to ${existing.id}`);
        oldIdToNewId.set(oldPage.id, existing.id);
        pagesSkipped++;
        continue;
      }

      const status = oldPage.status === 'published' ? 'PUBLISHED' : 'DRAFT';
      const publishedAt = (status === 'PUBLISHED' && oldPage.created_at) 
        ? new Date(oldPage.created_at) 
        : null;

      const newPage = await prisma.page.create({
        data: {
          title: oldPage.title,
          slug: oldPage.slug,
          template: 'DEFAULT',
          metaTitle: oldPage.meta_title,
          metaDescription: oldPage.meta_description,
          metaKeywords: oldPage.meta_keywords,
          ogImage: oldPage.meta_thumbnail,
          status: status as 'DRAFT' | 'PUBLISHED',
          publishedAt,
          createdById: adminUser.id,
        }
      });

      oldIdToNewId.set(oldPage.id, newPage.id);
      pagesCreated++;
      console.log(`   ✅ [Page ${oldPage.id}] "${oldPage.title}" (${oldPage.slug}) → ${newPage.id}`);
    } catch (error: any) {
      pagesFailed++;
      console.error(`   ❌ [Page ${oldPage.id}] "${oldPage.title}" - ERROR: ${error.message}`);
    }
  }

  console.log('\n   Phase 1 Summary:');
  console.log(`   Created: ${pagesCreated} | Skipped (exists): ${pagesSkipped} | Failed: ${pagesFailed}`);
  console.log(`   Total ID mappings: ${oldIdToNewId.size}`);

  // Step 4: Migrate Components (Phase 2)
  console.log('\n🧩 STEP 4: Migrating Components (Phase 2)...');
  console.log('-'.repeat(60));
  
  let componentsCreated = 0;
  let componentsSkipped = 0;
  let componentsFailed = 0;

  // Group components by page_id for batch processing
  const componentsByPage = new Map<number, OldComponent[]>();
  for (const comp of validComponents) {
    if (!componentsByPage.has(comp.page_id)) {
      componentsByPage.set(comp.page_id, []);
    }
    componentsByPage.get(comp.page_id)!.push(comp);
  }

  for (const [oldPageId, components] of componentsByPage) {
    const newPageId = oldIdToNewId.get(oldPageId);
    
    if (!newPageId) {
      console.log(`   ⚠️  Page ${oldPageId}: No mapping found, skipping ${components.length} components`);
      componentsSkipped += components.length;
      continue;
    }

    // Check how many components already exist for this page
    const existingCount = await prisma.pageComponent.count({
      where: { pageId: newPageId }
    });

    if (existingCount > 0) {
      console.log(`   ⏭️  Page ${oldPageId} → ${newPageId}: ${existingCount} components already exist, skipping`);
      componentsSkipped += components.length;
      continue;
    }

    // Sort by sort_order
    components.sort((a, b) => a.sort_order - b.sort_order);

    // Create all components for this page in a transaction
    try {
      await prisma.$transaction(async (tx) => {
        for (const comp of components) {
          let componentData: any;
          try {
            componentData = JSON.parse(comp.component_data);
          } catch {
            // If JSON parsing fails, store as-is wrapped in an object
            componentData = { raw: comp.component_data };
          }

          await tx.pageComponent.create({
            data: {
              pageId: newPageId,
              type: comp.component_type,
              data: componentData,
              order: comp.sort_order,
              isVisible: comp.is_visible === 1,
            }
          });
        }
      });

      componentsCreated += components.length;
      console.log(`   ✅ Page ${oldPageId}: Created ${components.length} components (${components.map(c => c.component_type).join(', ')})`);
    } catch (error: any) {
      componentsFailed += components.length;
      console.error(`   ❌ Page ${oldPageId}: Failed to create components - ${error.message}`);
    }
  }

  console.log('\n   Phase 2 Summary:');
  console.log(`   Created: ${componentsCreated} | Skipped: ${componentsSkipped} | Failed: ${componentsFailed}`);

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('  MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Pages:      ${pagesCreated} created, ${pagesSkipped} skipped, ${pagesFailed} failed`);
  console.log(`  Components: ${componentsCreated} created, ${componentsSkipped} skipped, ${componentsFailed} failed`);
  console.log(`  ID Mapping: ${oldIdToNewId.size} old→new mappings`);
  console.log('='.repeat(60));

  // Verification
  console.log('\n🔍 VERIFICATION:');
  const totalPages = await prisma.page.count();
  const totalComponents = await prisma.pageComponent.count();
  console.log(`   Total pages in DB: ${totalPages}`);
  console.log(`   Total components in DB: ${totalComponents}`);
}

main()
  .catch((error) => {
    console.error('\n💥 Migration failed with error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
