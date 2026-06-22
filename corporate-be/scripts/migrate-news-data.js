/**
 * Migration Script: Old MySQL News data → New PostgreSQL (Prisma)
 * 
 * Source: data_news_lengkap.sql (MySQL dump)
 * Target: PostgreSQL via Prisma Client
 * 
 * Mapping:
 *   Old news_category  (bigint id) → New news_categories (UUID id)
 *   Old news_content   (bigint id) → New news          (UUID id)
 *   Old news_highlight  (bigint id) → New news_highlights (UUID id)
 *   Old news_view       (bigint id) → New news_views     (UUID id)
 * 
 * Decisions applied:
 *   D1: Create User per unique email found in created_by/updated_by
 *   D2: news_date NULL → fallback to created_at
 *   D3: Preserve author & meta_desc fields (added to Prisma schema)
 *   D4: news_views batch insert per 500 records
 *   D5: Full transaction with rollback support
 * 
 * Run: cd backend && node scripts/migrate-news-data.js
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================
// SQL PARSER (reused from migrate-announcement-data.js)
// ============================================

/**
 * Parse INSERT INTO statements from SQL dump.
 * Uses character-by-character parsing to handle semicolons inside quoted strings
 * (e.g. HTML entities like &ndash; &amp; etc.)
 */
function parseSqlInserts(sql, tableName) {
  const rows = [];
  const marker = `INSERT INTO \`${tableName}\``;

  let searchStart = 0;
  while (true) {
    // Find next INSERT INTO `tableName`
    const insertPos = sql.indexOf(marker, searchStart);
    if (insertPos === -1) break;

    // Find VALUES keyword after the column list
    const valuesPos = sql.indexOf('VALUES', insertPos + marker.length);
    if (valuesPos === -1) break;

    // Parse character by character from after VALUES, tracking quotes
    // Stop at ';' that is outside of any quoted string
    let i = valuesPos + 6; // skip "VALUES"
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

// ============================================
// DATA EXTRACTION
// ============================================

function extractData(sqlContent) {
  // news_category columns: id, category_name, data_order, slug, data_status, created_by, updated_by, created_at, updated_at
  const rawCategories = parseSqlInserts(sqlContent, 'news_category');
  const categories = rawCategories.map(row => ({
    id: row[0],
    category_name: row[1],
    data_order: row[2],
    slug: row[3],
    data_status: row[4],
    created_by: row[5],
    updated_by: row[6],
    created_at: row[7],
    updated_at: row[8],
  }));

  // news_content columns: id, title_en, title_id, news_thumbnail, slug, excerpt_en, excerpt_id,
  //   author, content_en, content_id, data_status, meta_desc, meta_keyword,
  //   created_at, updated_at, news_date, created_by, updated_by, id_category,
  //   news_link, view_count, view_count_unique, custom_css, custom_js, id_publisher
  const rawContent = parseSqlInserts(sqlContent, 'news_content');
  const articles = rawContent.map(row => ({
    id: row[0],
    title_en: row[1],
    title_id: row[2],
    news_thumbnail: row[3],
    slug: row[4],
    excerpt_en: row[5],
    excerpt_id: row[6],
    author: row[7],
    content_en: row[8],
    content_id: row[9],
    data_status: row[10],
    meta_desc: row[11],
    meta_keyword: row[12],
    created_at: row[13],
    updated_at: row[14],
    news_date: row[15],
    created_by: row[16],
    updated_by: row[17],
    id_category: row[18],
    news_link: row[19],
    view_count: row[20],
    view_count_unique: row[21],
    custom_css: row[22],
    custom_js: row[23],
    id_publisher: row[24],
  }));

  // news_highlight columns: id, id_news, data_order, created_by, created_at, updated_by, updated_at
  const rawHighlights = parseSqlInserts(sqlContent, 'news_highlight');
  const highlights = rawHighlights.map(row => ({
    id: row[0],
    id_news: row[1],
    data_order: row[2],
    created_by: row[3],
    created_at: row[4],
    updated_by: row[5],
    updated_at: row[6],
  }));

  // news_view columns: id, media_id, ip_address, user_agent, created_at, updated_at
  const rawViews = parseSqlInserts(sqlContent, 'news_view');
  const views = rawViews.map(row => ({
    id: row[0],
    media_id: row[1],
    ip_address: row[2],
    user_agent: row[3],
    created_at: row[4],
    updated_at: row[5],
  }));

  return { categories, articles, highlights, views };
}

// ============================================
// ID MAPPINGS (old bigint → new UUID)
// ============================================
const categoryIdMap = {};  // old_id → new_uuid
const articleIdMap = {};   // old_id → new_uuid
const userEmailMap = {};   // email → user_uuid

// ============================================
// HELPER: Ensure user exists for email
// ============================================
async function ensureUser(email, tx) {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();

  if (userEmailMap[normalizedEmail]) {
    return userEmailMap[normalizedEmail];
  }

  // Check if user already exists in DB
  const existing = await tx.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });

  if (existing) {
    userEmailMap[normalizedEmail] = existing.id;
    return existing.id;
  }

  // Create new user for this email
  const newId = uuidv4();
  const nameParts = normalizedEmail.split('@')[0].split(/[._-]/);
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Migrated';
  const lastName = nameParts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'User';
  const hashedPw = await bcrypt.hash('MigratedUser@2024!', 12);

  await tx.user.create({
    data: {
      id: newId,
      email: normalizedEmail,
      username: normalizedEmail.split('@')[0] + '_' + newId.substring(0, 4),
      password: hashedPw,
      firstName,
      lastName,
      status: 'ACTIVE',
      mustChangePassword: true,
      passwordChangedAt: new Date(),
    },
  });

  userEmailMap[normalizedEmail] = newId;
  console.log(`    ✓ Created user: ${normalizedEmail} → ${newId} (${firstName} ${lastName})`);
  return newId;
}

// ============================================
// MAIN MIGRATION
// ============================================
async function main() {
  console.log('==============================================');
  console.log('News Data Migration: MySQL → PostgreSQL');
  console.log('==============================================\n');

  // Read and parse SQL file
  const sqlPath = path.resolve(__dirname, '../../data_news_lengkap.sql');
  console.log(`[Parse] Reading SQL file: ${sqlPath}`);

  if (!fs.existsSync(sqlPath)) {
    console.error('ERROR: SQL file not found at:', sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  const { categories, articles, highlights, views } = extractData(sqlContent);

  console.log(`  Parsed: ${categories.length} categories, ${articles.length} articles, ${highlights.length} highlights, ${views.length} views\n`);

  if (categories.length === 0 || articles.length === 0) {
    console.error('ERROR: Failed to parse SQL data. Check the SQL file format.');
    process.exit(1);
  }

  // Collect unique emails that need User records
  const uniqueEmails = new Set();
  for (const a of articles) {
    if (a.created_by) uniqueEmails.add(a.created_by.toLowerCase().trim());
    if (a.updated_by) uniqueEmails.add(a.updated_by.toLowerCase().trim());
  }
  console.log(`[Info] Unique content creator emails: ${uniqueEmails.size}`);
  for (const e of uniqueEmails) console.log(`  - ${e}`);
  console.log('');

  // ===== RUN INSIDE TRANSACTION =====
  console.log('[Transaction] Starting migration in transaction...\n');

  await prisma.$transaction(async (tx) => {

    // Step 0: Clear existing news data (respecting FK order)
    console.log('[Step 0] Clearing existing news data...');
    const delViews = await tx.news_views.deleteMany({});
    const delHighlights = await tx.news_highlights.deleteMany({});
    const delTagRels = await tx.news_tag_relations.deleteMany({});
    const delTags = await tx.news_tags.deleteMany({});
    const delNews = await tx.news.deleteMany({});
    const delCats = await tx.news_categories.deleteMany({});
    console.log(`  Deleted: ${delViews.count} views, ${delHighlights.count} highlights, ${delTagRels.count} tag_relations, ${delTags.count} tags, ${delNews.count} news, ${delCats.count} categories\n`);

    // Step 1: Ensure Users exist
    console.log('[Step 1] Ensuring Users exist for content creators...');
    for (const email of uniqueEmails) {
      await ensureUser(email, tx);
    }
    console.log(`  ${Object.keys(userEmailMap).length} users resolved\n`);

    // Step 2: Create News Categories
    console.log('[Step 2] Creating News Categories...');
    for (const oldCat of categories) {
      const newId = uuidv4();
      categoryIdMap[oldCat.id] = newId;

      await tx.news_categories.create({
        data: {
          id: newId,
          name_en: oldCat.category_name,
          name_id: null,
          slug: oldCat.slug,
          description: null,
          position: oldCat.data_order || 0,
          is_active: oldCat.data_status === 1,
          created_by: oldCat.created_by || null,
          updated_by: oldCat.updated_by || null,
          created_at: oldCat.created_at ? new Date(oldCat.created_at) : new Date(),
          updated_at: oldCat.updated_at ? new Date(oldCat.updated_at) : new Date(),
          deleted_at: null,
        },
      });
      console.log(`  ✓ Category: "${oldCat.category_name}" (old:${oldCat.id} → new:${newId}) active:${oldCat.data_status === 1}`);
    }
    console.log(`  Created ${categories.length} categories\n`);

    // Step 3: Create News Articles
    console.log('[Step 3] Creating News Articles...');
    let articleSuccess = 0;
    let articleSkip = 0;
    const usedSlugs = new Set();

    for (const a of articles) {
      const newId = uuidv4();
      articleIdMap[a.id] = newId;

      // Map category FK
      const newCategoryId = categoryIdMap[a.id_category];
      if (!newCategoryId) {
        console.log(`  ⚠ Skipping article "${a.title_en}" (id:${a.id}) - no matching category for old id ${a.id_category}`);
        articleSkip++;
        continue;
      }

      // Map created_by email → User UUID (D1)
      const createdByEmail = a.created_by ? a.created_by.toLowerCase().trim() : null;
      const createdById = createdByEmail ? userEmailMap[createdByEmail] : null;
      if (!createdById) {
        console.log(`  ⚠ Skipping article "${a.title_en}" (id:${a.id}) - no user for email "${a.created_by}"`);
        articleSkip++;
        continue;
      }

      // Map updated_by email → User UUID
      const updatedByEmail = a.updated_by ? a.updated_by.toLowerCase().trim() : null;
      const updatedById = updatedByEmail ? userEmailMap[updatedByEmail] : null;

      // D2: news_date NULL → fallback to created_at
      let newsDate;
      if (a.news_date) {
        newsDate = new Date(a.news_date);
      } else if (a.created_at) {
        newsDate = new Date(a.created_at);
        console.log(`  ℹ Article id:${a.id} - news_date NULL, using created_at as fallback`);
      } else {
        newsDate = new Date();
        console.log(`  ℹ Article id:${a.id} - news_date AND created_at NULL, using now()`);
      }

      // Map status: data_status 1 → PUBLISHED, else DRAFT
      const status = a.data_status === 1 ? 'PUBLISHED' : 'DRAFT';

      // Set published_at = created_at if PUBLISHED
      const publishedAt = status === 'PUBLISHED' && a.created_at ? new Date(a.created_at) : null;

      // Deduplicate slug
      let slug = a.slug;
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${a.id}`;
        console.log(`  ℹ Article id:${a.id} - duplicate slug, using "${slug}"`);
      }
      usedSlugs.add(slug);

      await tx.news.create({
        data: {
          id: newId,
          title_en: a.title_en,
          title_id: a.title_id || null,
          slug: slug,
          news_date: newsDate,
          news_thumbnail: a.news_thumbnail || null,
          excerpt_en: a.excerpt_en || null,
          excerpt_id: a.excerpt_id || null,
          content_en: a.content_en,
          content_id: a.content_id || null,
          news_link: a.news_link || null,
          author: a.author || null,
          meta_desc: a.meta_desc || null,
          category_id: newCategoryId,
          meta_keywords: a.meta_keyword || null,
          custom_css: a.custom_css || null,
          custom_js: a.custom_js || null,
          view_count: a.view_count != null ? Number(a.view_count) : 0,
          view_count_unique: a.view_count_unique != null ? Number(a.view_count_unique) : 0,
          status,
          published_at: publishedAt,
          created_by_id: createdById,
          updated_by_id: updatedById,
          created_at: a.created_at ? new Date(a.created_at) : new Date(),
          updated_at: a.updated_at ? new Date(a.updated_at) : new Date(),
          deleted_at: null,
        },
      });
      articleSuccess++;
    }
    console.log(`  Created ${articleSuccess} articles, skipped ${articleSkip}\n`);

    // Step 4: Create News Highlights
    console.log('[Step 4] Creating News Highlights...');
    let highlightSuccess = 0;
    let highlightSkip = 0;

    for (const h of highlights) {
      const newId = uuidv4();
      const newNewsId = articleIdMap[h.id_news];
      if (!newNewsId) {
        console.log(`  ⚠ Skipping highlight (id:${h.id}) - no matching news for old id ${h.id_news}`);
        highlightSkip++;
        continue;
      }

      await tx.news_highlights.create({
        data: {
          id: newId,
          news_id: newNewsId,
          position: h.data_order || 0,
          created_by: h.created_by || null,
          updated_by: h.updated_by || null,
          created_at: h.created_at ? new Date(h.created_at) : new Date(),
          updated_at: h.updated_at ? new Date(h.updated_at) : new Date(),
        },
      });
      highlightSuccess++;
      console.log(`  ✓ Highlight: news old_id:${h.id_news} → position:${h.data_order}`);
    }
    console.log(`  Created ${highlightSuccess} highlights, skipped ${highlightSkip}\n`);

    // Step 5: Create News Views (batch insert for ~11,860 rows)
    console.log('[Step 5] Creating News Views (batch mode)...');
    const BATCH_SIZE = 500;
    let viewSuccess = 0;
    let viewSkip = 0;
    const totalBatches = Math.ceil(views.length / BATCH_SIZE);

    for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
      const batch = views.slice(batchIdx * BATCH_SIZE, (batchIdx + 1) * BATCH_SIZE);
      const batchData = [];

      for (const v of batch) {
        const newNewsId = articleIdMap[v.media_id];
        if (!newNewsId) {
          viewSkip++;
          continue;
        }

        batchData.push({
          id: uuidv4(),
          news_id: newNewsId,
          ip_address: v.ip_address || null,
          user_agent: v.user_agent || null,
          created_at: v.created_at ? new Date(v.created_at) : new Date(),
          updated_at: v.updated_at ? new Date(v.updated_at) : new Date(),
        });
      }

      if (batchData.length > 0) {
        await tx.news_views.createMany({ data: batchData });
        viewSuccess += batchData.length;
      }

      if ((batchIdx + 1) % 5 === 0 || batchIdx === totalBatches - 1) {
        console.log(`  Batch ${batchIdx + 1}/${totalBatches}: ${viewSuccess} created, ${viewSkip} skipped`);
      }
    }
    console.log(`  Created ${viewSuccess} views, skipped ${viewSkip}\n`);

  }, {
    maxWait: 60000,  // 60s max wait for transaction lock
    timeout: 300000, // 5 min timeout for the whole transaction
  });

  // ===== VERIFICATION (outside transaction) =====
  console.log('[Verification] Checking final counts...');
  const finalCats = await prisma.news_categories.count();
  const finalNews = await prisma.news.count();
  const finalHighlights = await prisma.news_highlights.count();
  const finalViews = await prisma.news_views.count();
  const finalUsers = await prisma.user.count();

  console.log(`  Categories:  ${finalCats} (expected: ${categories.length})`);
  console.log(`  News:        ${finalNews} (expected: ${articles.length})`);
  console.log(`  Highlights:  ${finalHighlights} (expected: ${highlights.length})`);
  console.log(`  Views:       ${finalViews} (expected: ${views.length})`);
  console.log(`  Total Users: ${finalUsers}`);

  // Show category breakdown
  const allCats = await prisma.news_categories.findMany({
    include: {
      _count: { select: { news: true } },
    },
    orderBy: { position: 'asc' },
  });
  console.log('\n  Category Breakdown:');
  for (const c of allCats) {
    console.log(`    ${c.name_en}: ${c._count.news} articles (active: ${c.is_active})`);
  }

  // Show status breakdown
  const published = await prisma.news.count({ where: { status: 'PUBLISHED' } });
  const draft = await prisma.news.count({ where: { status: 'DRAFT' } });
  console.log(`\n  Status: ${published} PUBLISHED, ${draft} DRAFT`);

  // Show ID mapping sample
  console.log('\n  ID Mapping Sample (first 5):');
  const catEntries = Object.entries(categoryIdMap).slice(0, 5);
  for (const [oldId, newId] of catEntries) {
    console.log(`    Category old:${oldId} → new:${newId}`);
  }
  const artEntries = Object.entries(articleIdMap).slice(0, 5);
  for (const [oldId, newId] of artEntries) {
    console.log(`    Article  old:${oldId} → new:${newId}`);
  }

  console.log('\n==============================================');
  console.log('News Migration completed successfully!');
  console.log('==============================================');
}

main()
  .catch((e) => {
    console.error('\n❌ Migration FAILED (transaction rolled back):', e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
