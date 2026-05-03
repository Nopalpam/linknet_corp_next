/**
 * MIGRATION SCRIPT: Legacy Pages & Components from daftar_pages_lengkap.sql
 * 
 * Reads data from the SQL dump file and creates pages with their components
 * in the current CMS database via Prisma.
 * 
 * Features:
 * - Parses MySQL INSERT statements from SQL dump
 * - Maps old integer IDs to new UUIDs
 * - Remaps `interactive_maps` → `maps_coverage`
 * - Uses Prisma transaction for data integrity
 * - Skips pages that already exist (by slug)
 * - Detailed logging with summary
 * 
 * Usage:
 *   cd backend
 *   npx ts-node --project tsconfig.dev.json prisma/seeds/migrate-legacy-pages.seed.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ============================================================================
// KNOWN COMPONENT TYPES (registered in CMS)
// ============================================================================

const KNOWN_COMPONENT_TYPES = new Set([
  'text_block', 'ckeditor', 'image', 'hero_section', 'sliders_hero',
  'usp_grid', 'usp_grid_slider', 'business_tab',
  'key_highlight', 'about_with_marquee', 'join_first_squad', 'list_services',
  'card_with_highlight_summary', 'highlighting_real_initiatives', 'info_contacts',
  'information_list', 'contact_us', 'document_list', 'accordion',
  'tradingview_symbol_overview', 'vision_mission', 'maps_coverage', 'milestone',
  'awards_marquee', 'product_showcase', 'usp_strip', 'closing_cta',
  'video_section', 'extendable_article', 'stock_information', 'testimonials',
  'news_highlight', 'news_list', 'career_highlight', 'career_list',
  'management_list', 'announcement_list', 'report_list', 'awards_list',
]);

// Component type remapping: old type → new type
const COMPONENT_TYPE_REMAP: Record<string, string> = {
  'interactive_maps': 'maps_coverage',
};

// ============================================================================
// SQL PARSING UTILITIES
// ============================================================================

/**
 * Unescape MySQL string literal content (content between single quotes).
 * Handles: \\→\, \'→', \"→", \n→newline, \r→CR, \t→tab, \0→NUL
 */
function mysqlUnescape(s: string): string {
  let result = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const next = s[i + 1];
      switch (next) {
        case '\\': result += '\\'; break;
        case "'":  result += "'";  break;
        case '"':  result += '"';  break;
        case 'n':  result += '\n'; break;
        case 'r':  result += '\r'; break;
        case 't':  result += '\t'; break;
        case '0':  result += '\0'; break;
        default:   result += next; break;
      }
      i += 2;
    } else {
      result += s[i];
      i++;
    }
  }
  return result;
}

/**
 * Parse a raw SQL field value string into its JavaScript equivalent.
 * Returns null for NULL, number for numerics, string for quoted strings.
 */
function parseFieldValue(raw: string): any {
  raw = raw.trim();
  if (raw === 'NULL') return null;
  if (raw.startsWith("'") && raw.endsWith("'")) {
    return mysqlUnescape(raw.slice(1, -1));
  }
  const num = Number(raw);
  if (!isNaN(num) && raw !== '') return num;
  return raw;
}

/**
 * Split a SQL value tuple into individual raw field strings.
 * Properly handles single-quoted strings with escape sequences.
 * Input: the content between ( and ) of a VALUES tuple.
 */
function splitSQLFields(content: string): string[] {
  const fields: string[] = [];
  let i = 0;
  let current = '';
  let inString = false;

  while (i < content.length) {
    const ch = content[i];

    if (!inString) {
      if (ch === ',') {
        fields.push(current);
        current = '';
        i++;
        continue;
      }
      if (ch === "'") {
        inString = true;
        current += ch;
        i++;
        continue;
      }
      current += ch;
      i++;
    } else {
      // Inside a single-quoted string
      if (ch === '\\') {
        // MySQL escape: consume this char + next char
        current += ch;
        i++;
        if (i < content.length) {
          current += content[i];
          i++;
        }
        continue;
      }
      if (ch === "'") {
        // Check for '' (double-quote escape)
        if (i + 1 < content.length && content[i + 1] === "'") {
          current += "''";
          i += 2;
          continue;
        }
        // End of string
        current += ch;
        i++;
        inString = false;
        continue;
      }
      current += ch;
      i++;
    }
  }

  if (current.trim()) {
    fields.push(current);
  }

  return fields;
}

/**
 * Extract value tuples from SQL content starting after the VALUES keyword.
 * Returns array of tuple content strings and the position after the last tuple.
 */
function extractTuples(sqlContent: string, startPos: number): { tuples: string[], endPos: number } {
  const tuples: string[] = [];
  let i = startPos;

  while (i < sqlContent.length) {
    // Skip whitespace
    while (i < sqlContent.length && /[\s]/.test(sqlContent[i])) i++;

    if (i >= sqlContent.length) break;
    if (sqlContent[i] === ';') { i++; break; }
    if (sqlContent[i] === ',') { i++; continue; }
    if (sqlContent[i] !== '(') break;

    // Found opening paren - extract tuple content
    i++; // skip '('
    let depth = 1;
    let inString = false;
    let tupleContent = '';

    while (i < sqlContent.length && depth > 0) {
      const ch = sqlContent[i];

      if (inString) {
        if (ch === '\\') {
          tupleContent += ch;
          i++;
          if (i < sqlContent.length) {
            tupleContent += sqlContent[i];
            i++;
          }
          continue;
        }
        if (ch === "'") {
          if (i + 1 < sqlContent.length && sqlContent[i + 1] === "'") {
            tupleContent += "''";
            i += 2;
            continue;
          }
          inString = false;
          tupleContent += ch;
          i++;
          continue;
        }
        tupleContent += ch;
        i++;
      } else {
        if (ch === "'") {
          inString = true;
          tupleContent += ch;
          i++;
        } else if (ch === '(') {
          depth++;
          tupleContent += ch;
          i++;
        } else if (ch === ')') {
          depth--;
          if (depth === 0) {
            i++; // skip closing )
            break;
          }
          tupleContent += ch;
          i++;
        } else {
          tupleContent += ch;
          i++;
        }
      }
    }

    tuples.push(tupleContent);
  }

  return { tuples, endPos: i };
}

/**
 * Extract all rows from all INSERT INTO `tableName` statements in the SQL content.
 * Returns array of parsed field arrays.
 */
function getAllInsertRows(sqlContent: string, tableName: string): any[][] {
  const allRows: any[][] = [];
  const insertPattern = `INSERT INTO \`${tableName}\``;
  let searchPos = 0;

  while (true) {
    const idx = sqlContent.indexOf(insertPattern, searchPos);
    if (idx === -1) break;

    const valuesIdx = sqlContent.indexOf('VALUES', idx + insertPattern.length);
    if (valuesIdx === -1) break;

    const valuesEnd = valuesIdx + 6; // after 'VALUES'
    const { tuples, endPos } = extractTuples(sqlContent, valuesEnd);

    for (const tuple of tuples) {
      const rawFields = splitSQLFields(tuple);
      const parsedFields = rawFields.map(f => parseFieldValue(f));
      allRows.push(parsedFields);
    }

    searchPos = endPos;
  }

  return allRows;
}

// ============================================================================
// DATA INTERFACES
// ============================================================================

interface LegacyPage {
  oldId: number;
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  status: 'PUBLISHED' | 'DRAFT';
}

interface LegacyComponent {
  oldId: number;
  oldPageId: number;
  type: string;
  data: any;
  order: number;
  isVisible: boolean;
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

/**
 * Transform old `interactive_maps` data to new `maps_coverage` format.
 * The map region data (business units, provinces) now lives in static constants,
 * so component_data only stores display configuration and intro text.
 */
function transformMapsCoverageData(oldData: any): any {
  return {
    custom_id: oldData.custom_id || 'coverage-section',
    custom_class: oldData.custom_class || 'lnSection',
    bg_type: 'color',
    bg_color: '',
    bg_image: '',
    bg_position: 'center',
    title: oldData.intro_title || { en: 'Our Coverage', id: 'Jangkauan Kami' },
    description: oldData.intro_description || { en: 'We cover major cities across Indonesia.', id: 'Kami menjangkau kota-kota besar di Indonesia.' },
    intro_label: oldData.intro_label || { en: 'OPERATIONAL AREA', id: 'AREA OPERASIONAL' },
    show_search: true,
    show_legend: true,
    default_province: '',
  };
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

export async function migrateLegacyPages() {
  console.log('');
  console.log('='.repeat(70));
  console.log('  MIGRATION: Legacy Pages & Components from SQL Dump');
  console.log('='.repeat(70));

  // ── Phase 1: Read and parse SQL ──────────────────────────────────────────
  console.log('\n[Phase 1] Parsing SQL file...');

  const sqlPath = path.resolve(__dirname, '../../../daftar_pages_lengkap.sql');
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`SQL file not found at: ${sqlPath}`);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
  console.log(`  SQL file loaded: ${(sqlContent.length / 1024).toFixed(1)} KB`);

  // Parse pages
  const pageRows = getAllInsertRows(sqlContent, 'pages');
  console.log(`  Pages rows parsed from SQL: ${pageRows.length}`);

  // Parse page_components (handles multiple INSERT statements)
  const componentRows = getAllInsertRows(sqlContent, 'page_components');
  console.log(`  Component rows parsed from SQL: ${componentRows.length}`);

  // ── Phase 2: Transform data ──────────────────────────────────────────────
  console.log('\n[Phase 2] Transforming data...');

  // Transform pages
  // SQL columns: id, title, slug, meta_title, meta_description, meta_keywords, meta_thumbnail, status, seo_settings, created_at, updated_at
  const pages: LegacyPage[] = pageRows.map(row => ({
    oldId: row[0] as number,
    title: row[1] as string,
    slug: row[2] as string,
    metaTitle: row[3] as string | null,
    metaDescription: row[4] as string | null,
    metaKeywords: row[5] as string | null,
    ogImage: row[6] as string | null, // meta_thumbnail → ogImage
    status: ((row[7] as string) || 'draft').toUpperCase() as 'PUBLISHED' | 'DRAFT',
  }));

  // Build set of valid page IDs from pages INSERT
  const validPageIds = new Set(pages.map(p => p.oldId));

  // Transform components
  // SQL columns: id, page_id, component_type, component_data, sort_order, is_visible, created_at, updated_at
  const components: LegacyComponent[] = [];
  let skippedOrphanComponents = 0;
  let remappedComponents = 0;
  const unknownTypes = new Set<string>();
  let jsonParseErrors = 0;

  for (const row of componentRows) {
    const oldPageId = row[1] as number;

    // Skip components whose page doesn't exist in the pages INSERT
    if (!validPageIds.has(oldPageId)) {
      skippedOrphanComponents++;
      continue;
    }

    let componentType = row[2] as string;
    const componentDataStr = row[3] as string;
    let componentData: any;

    // Parse component_data JSON
    try {
      componentData = JSON.parse(componentDataStr);
    } catch (e: any) {
      jsonParseErrors++;
      console.warn(`  [WARN] JSON parse error for component #${row[0]} (type: ${componentType}, page: ${oldPageId}): ${e.message}`);
      // Store as raw fallback so data is not lost
      componentData = { _raw: componentDataStr, _parseError: true };
    }

    // Remap component types
    if (COMPONENT_TYPE_REMAP[componentType]) {
      const oldType = componentType;
      componentType = COMPONENT_TYPE_REMAP[componentType];
      remappedComponents++;
      console.log(`  [REMAP] Component #${row[0]}: ${oldType} → ${componentType} (page ${oldPageId})`);

      // Transform data for specific remapped types
      if (oldType === 'interactive_maps') {
        componentData = transformMapsCoverageData(componentData);
      }
    }

    // Track unknown types (still insert them, just warn)
    if (!KNOWN_COMPONENT_TYPES.has(componentType)) {
      unknownTypes.add(componentType);
    }

    components.push({
      oldId: row[0] as number,
      oldPageId,
      type: componentType,
      data: componentData,
      order: row[4] as number,
      isVisible: Boolean(row[5]),
    });
  }

  console.log(`  Pages to migrate:            ${pages.length}`);
  console.log(`  Components to migrate:        ${components.length}`);
  console.log(`  Orphan components skipped:    ${skippedOrphanComponents}`);
  console.log(`  Components remapped:          ${remappedComponents}`);
  console.log(`  JSON parse errors (fallback): ${jsonParseErrors}`);
  if (unknownTypes.size > 0) {
    console.log(`  [WARN] Unknown component types: ${Array.from(unknownTypes).join(', ')}`);
    console.log(`         These will still be inserted as-is.`);
  }

  // ── Phase 3: Find admin user ─────────────────────────────────────────────
  console.log('\n[Phase 3] Finding admin user for createdById...');

  const adminUser = await prisma.user.findFirst({
    where: {
      userRoles: {
        some: {
          role: { slug: 'super-admin' }
        }
      }
    }
  });

  if (!adminUser) {
    throw new Error('No admin user with super-admin role found. Run the main seed first (npm run seed).');
  }

  console.log(`  Admin user: ${adminUser.name || adminUser.email} (ID: ${adminUser.id})`);

  // ── Phase 4: Insert into database (transaction) ──────────────────────────
  console.log('\n[Phase 4] Inserting into database...');

  const pageIdMap: Record<number, string> = {}; // oldId → newUUID
  let pagesCreated = 0;
  let pagesSkipped = 0;
  let componentsCreated = 0;
  let componentsFailed = 0;

  await prisma.$transaction(async (tx) => {

    // ──── Create Pages ────────────────────────────────────────────────────
    console.log('\n  --- Creating Pages ---');

    for (const page of pages) {
      // Check if slug already exists
      const existing = await tx.page.findUnique({
        where: { slug: page.slug }
      });

      if (existing) {
        console.log(`  [SKIP] "${page.title}" (${page.slug}) → slug already exists, mapping to existing ID`);
        pageIdMap[page.oldId] = existing.id;
        pagesSkipped++;
        continue;
      }

      try {
        const newPage = await tx.page.create({
          data: {
            title: page.title,
            slug: page.slug,
            template: page.slug === 'homepage' ? 'LANDING' : 'DEFAULT',
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            metaKeywords: page.metaKeywords,
            ogImage: page.ogImage,
            status: page.status,
            publishedAt: page.status === 'PUBLISHED' ? new Date() : null,
            createdById: adminUser.id,
          }
        });

        pageIdMap[page.oldId] = newPage.id;
        pagesCreated++;
        console.log(`  [OK ${String(pagesCreated).padStart(2)}/${pages.length}] "${page.title}" → ${page.slug}`);
      } catch (error: any) {
        console.error(`  [FAIL] "${page.title}" (${page.slug}): ${error.message}`);
        // Don't throw - continue with other pages. Components for this page will be skipped.
      }
    }

    console.log(`\n  Pages created: ${pagesCreated}, skipped: ${pagesSkipped}`);

    // ──── Create Components ───────────────────────────────────────────────
    console.log('\n  --- Creating Components ---');

    // Group components by page for organized insertion
    const componentsByPage = new Map<number, LegacyComponent[]>();
    for (const comp of components) {
      if (!componentsByPage.has(comp.oldPageId)) {
        componentsByPage.set(comp.oldPageId, []);
      }
      componentsByPage.get(comp.oldPageId)!.push(comp);
    }

    for (const [oldPageId, pageComponents] of componentsByPage) {
      const newPageId = pageIdMap[oldPageId];
      if (!newPageId) {
        console.warn(`  [WARN] No UUID mapping for old page ID ${oldPageId} — skipping ${pageComponents.length} components`);
        componentsFailed += pageComponents.length;
        continue;
      }

      const pageName = pages.find(p => p.oldId === oldPageId)?.title || `Page #${oldPageId}`;

      // Sort by order to maintain sequence
      pageComponents.sort((a, b) => a.order - b.order);

      let pageCompCreated = 0;
      for (const comp of pageComponents) {
        try {
          await tx.pageComponent.create({
            data: {
              pageId: newPageId,
              type: comp.type,
              data: comp.data,
              order: comp.order,
              isVisible: comp.isVisible,
            }
          });
          componentsCreated++;
          pageCompCreated++;
        } catch (error: any) {
          console.error(`  [FAIL] Component "${comp.type}" (order ${comp.order}) for "${pageName}": ${error.message}`);
          componentsFailed++;
        }
      }

      const typeList = pageComponents.map(c => c.type).join(', ');
      console.log(`  [OK] "${pageName}" → ${pageCompCreated} components [${typeList}]`);
    }

  }, {
    timeout: 180000, // 3 minutes (large amount of data)
    maxWait: 60000,
  });

  // ── Phase 5: Verification ────────────────────────────────────────────────
  console.log('\n[Phase 5] Verifying migration...');

  const totalPagesInDB = await prisma.page.count();
  const totalComponentsInDB = await prisma.pageComponent.count();
  console.log(`  Total pages in database:      ${totalPagesInDB}`);
  console.log(`  Total components in database:  ${totalComponentsInDB}`);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('  MIGRATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`  Source SQL pages:         ${pages.length}`);
  console.log(`  Source SQL components:     ${components.length}`);
  console.log('  ─────────────────────────────────────────');
  console.log(`  Pages created:            ${pagesCreated}`);
  console.log(`  Pages skipped (existing): ${pagesSkipped}`);
  console.log(`  Components created:       ${componentsCreated}`);
  console.log(`  Components failed:        ${componentsFailed}`);
  console.log(`  Components remapped:      ${remappedComponents}`);
  console.log(`  Orphan components (no page): ${skippedOrphanComponents}`);
  if (unknownTypes.size > 0) {
    console.log(`  Unknown types (inserted): ${Array.from(unknownTypes).join(', ')}`);
  }
  console.log('='.repeat(70));

  if (componentsFailed > 0) {
    console.log('\n[!] Some components failed. Review the logs above.');
  } else if (pagesCreated === 0 && pagesSkipped === pages.length) {
    console.log('\n[i] All pages already existed. No new data was inserted.');
  } else {
    console.log('\n[OK] Migration completed successfully!');
  }
  console.log('');
}

// ============================================================================
// STANDALONE EXECUTION
// ============================================================================

if (require.main === module) {
  migrateLegacyPages()
    .catch((e) => {
      console.error('\n[FATAL] Migration failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
