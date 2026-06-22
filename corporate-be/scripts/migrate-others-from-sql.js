const fs = require('fs');
const path = require('path');
const { Prisma, PrismaClient } = require('@prisma/client');
const { v5: uuidv5 } = require('uuid');
const slugify = require('slugify');
const { parseSqlInserts } = require('./lib/mysql-dump-parser');
const { normalizeLinknetUrls, rewriteLinknetUrls } = require('./lib/linknet-url-normalizer');

const prisma = new PrismaClient();
const UUID_NAMESPACE = uuidv5.URL;

const TABLE_WIDTHS = Object.freeze({
  awards: 14,
  career_content: 17,
  contact_us: 14,
  managements: 15,
  management_categories: 10,
  menus: 22,
  news_category: 9,
  news_content: 25,
  news_highlight: 7,
});

function usage() {
  return [
    'Usage:',
    '  node scripts/migrate-others-from-sql.js --file <dump.sql> --replace',
    '  node scripts/migrate-others-from-sql.js --file <dump.sql> --dry-run',
    '',
    '--replace is required because this migration replaces existing data in the target modules.',
  ].join('\n');
}

function readOptions(argv) {
  const fileIndex = argv.indexOf('--file');
  const fileValue = fileIndex >= 0 ? argv[fileIndex + 1] : null;
  if (!fileValue || fileValue.startsWith('--')) {
    throw new Error(`A SQL dump must be provided with --file.\n\n${usage()}`);
  }

  const replace = argv.includes('--replace');
  const dryRun = argv.includes('--dry-run');
  if (replace === dryRun) {
    throw new Error(`Choose exactly one of --replace or --dry-run.\n\n${usage()}`);
  }

  return { filePath: path.resolve(process.cwd(), fileValue), replace };
}

function asString(value) {
  return value == null ? null : normalizeLinknetUrls(String(value));
}

function asBoolean(value, fallback = false) {
  return value == null ? fallback : value === true || value === 1 || value === '1';
}

function asInteger(value, fallback = 0) {
  if (value == null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error(`Expected an integer, received: ${value}`);
  return parsed;
}

function clampedInteger(value) {
  const parsed = asInteger(value, 0);
  return Math.min(Math.max(parsed, -2147483648), 2147483647);
}

function parseTimestamp(value) {
  if (value == null || value === '') return null;
  const normalized = String(value).includes('T') ? String(value) : String(value).replace(' ', 'T');
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : `${normalized}Z`;
  const parsed = new Date(withTimezone);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid timestamp in SQL dump: ${value}`);
  return parsed;
}

function parseDate(value) {
  if (value == null || value === '') return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid date in SQL dump: ${value}`);
  return parsed;
}

function stableId(tableName, oldId) {
  return uuidv5(`mysql-legacy/${tableName}/${oldId}`, UUID_NAMESPACE);
}

function makeSlug(value, fallback) {
  return slugify(String(value || ''), { lower: true, strict: true }) || fallback;
}

function assertRows(tableName, rows) {
  if (rows.length === 0) throw new Error(`No rows found for required table ${tableName}.`);
  const invalidIndex = rows.findIndex((row) => row.length !== TABLE_WIDTHS[tableName]);
  if (invalidIndex >= 0) {
    throw new Error(
      `${tableName} row ${invalidIndex + 1} has ${rows[invalidIndex].length} columns; expected ${TABLE_WIDTHS[tableName]}.`,
    );
  }

  const ids = new Set();
  for (const row of rows) {
    if (row[0] == null) throw new Error(`${tableName} contains a row without an ID.`);
    const id = String(row[0]);
    if (ids.has(id)) throw new Error(`Duplicate source ID ${id} in ${tableName}.`);
    ids.add(id);
  }
}

function assertRequiredText(tableName, rows, columnIndex, columnName) {
  const invalid = rows.find((row) => row[columnIndex] == null || String(row[columnIndex]).trim() === '');
  if (invalid) throw new Error(`${tableName}.${columnName} is empty for source ID ${invalid[0]}.`);
}

function assertReferences(childName, rows, columnIndex, parentName, parentRows, nullable) {
  const parentIds = new Set(parentRows.map((row) => String(row[0])));
  const orphan = rows.find((row) => {
    const value = row[columnIndex];
    if (value == null) return !nullable;
    return !parentIds.has(String(value));
  });
  if (orphan) {
    throw new Error(
      `${childName} source ID ${orphan[0]} references missing ${parentName} ID ${orphan[columnIndex]}.`,
    );
  }
}

function assertUniqueValues(tableName, rows, valueFactory, label) {
  const seen = new Map();
  for (const row of rows) {
    const value = valueFactory(row);
    if (seen.has(value)) {
      throw new Error(
        `${tableName} source IDs ${seen.get(value)} and ${row[0]} produce duplicate ${label}: ${value}.`,
      );
    }
    seen.set(value, row[0]);
  }
}

function parseJson(value, sourceId) {
  if (value == null || String(value).trim() === '') return null;
  try {
    return JSON.parse(normalizeLinknetUrls(String(value)));
  } catch (error) {
    throw new Error(`menus.translations contains invalid JSON for source ID ${sourceId}: ${error.message}`);
  }
}

function extractSource(sql) {
  const source = Object.fromEntries(
    Object.keys(TABLE_WIDTHS).map((tableName) => [tableName, parseSqlInserts(sql, tableName)]),
  );
  for (const [tableName, rows] of Object.entries(source)) assertRows(tableName, rows);

  assertRequiredText('awards', source.awards, 1, 'tahun');
  assertRequiredText('career_content', source.career_content, 1, 'position');
  assertRequiredText('contact_us', source.contact_us, 1, 'first_name');
  assertRequiredText('management_categories', source.management_categories, 1, 'name');
  assertRequiredText('managements', source.managements, 1, 'name');
  assertRequiredText('menus', source.menus, 4, 'title');
  assertRequiredText('news_category', source.news_category, 1, 'category_name');
  assertRequiredText('news_content', source.news_content, 1, 'title_en');
  assertRequiredText('news_content', source.news_content, 8, 'content_en');

  assertReferences('managements', source.managements, 5, 'management_categories', source.management_categories, false);
  assertReferences('menus', source.menus, 1, 'menus', source.menus, true);
  assertReferences('news_content', source.news_content, 18, 'news_category', source.news_category, false);
  assertReferences('news_highlight', source.news_highlight, 1, 'news_content', source.news_content, false);

  for (const row of source.menus) parseJson(row[5], row[0]);

  assertUniqueValues(
    'management_categories',
    source.management_categories,
    (row) => makeSlug(row[2] || row[1], `management-category-${row[0]}`),
    'slug',
  );
  assertUniqueValues(
    'managements',
    source.managements,
    (row) => makeSlug(`${row[1]}-${row[0]}`, `management-${row[0]}`),
    'slug',
  );
  assertUniqueValues(
    'awards',
    source.awards,
    (row) => {
      const title = row[2] || row[4] || row[3] || `Award ${row[0]}`;
      return makeSlug(`${title}-${String(row[1]).slice(0, 4)}-${row[0]}`, `award-${row[0]}`);
    },
    'slug',
  );
  assertUniqueValues(
    'news_category',
    source.news_category,
    (row) => makeSlug(row[3] || row[1], `news-category-${row[0]}`),
    'slug',
  );
  assertUniqueValues(
    'news_content',
    source.news_content,
    (row) => makeSlug(row[4] || row[1], `news-${row[0]}`),
    'slug',
  );
  assertUniqueValues(
    'news_highlight',
    source.news_highlight,
    (row) => String(row[2] == null ? row[0] : row[2]),
    'position',
  );

  return source;
}

function buildNonNewsData(source) {
  const managementCategoryIds = new Map(
    source.management_categories.map((row) => [String(row[0]), stableId('management_categories', row[0])]),
  );

  const awards = source.awards.map((row) => {
    const issueDate = parseDate(row[1]);
    const title = asString(row[2] || row[4] || row[3] || `Award ${row[0]}`);
    return {
      id: stableId('awards', row[0]),
      title,
      titleId: asString(row[3]),
      titleEn: asString(row[4]),
      slug: makeSlug(`${title}-${issueDate.getUTCFullYear()}-${row[0]}`, `award-${row[0]}`),
      description: asString(row[5]),
      descriptionId: asString(row[6]),
      descriptionEn: asString(row[7]),
      topLogo: null,
      link: asString(row[8]),
      image: asString(row[9]),
      issuer: 'Link Net',
      year: issueDate.getUTCFullYear(),
      issueDate,
      position: asInteger(row[0]),
      isActive: true,
      status: 'ACTIVE',
      createdBy: asString(row[10]),
      updatedBy: asString(row[11]),
      createdAt: parseTimestamp(row[12]) || new Date(),
      updatedAt: parseTimestamp(row[13]) || parseTimestamp(row[12]) || new Date(),
      deletedAt: null,
    };
  });

  const careers = source.career_content.map((row) => ({
    id: BigInt(row[0]),
    position: asString(row[1]),
    slug: asString(row[2]),
    division: asString(row[3]),
    type: asString(row[4]),
    linkJob: asString(row[5]),
    location: asString(row[6]),
    description: asString(row[7]),
    descriptionId: asString(row[8]),
    requirements: asString(row[9]),
    requirementsId: asString(row[10]),
    status: asString(row[11]) || 'active',
    expiryDate: parseTimestamp(row[12]),
    createdAt: parseTimestamp(row[13]),
    updatedAt: parseTimestamp(row[14]),
    createdBy: asString(row[15]),
    updatedBy: asString(row[16]),
  }));

  const contacts = source.contact_us.map((row) => {
    const inquiryType = String(row[7] || 'others').trim().toUpperCase();
    return {
      id: stableId('contact_us', row[0]),
      firstName: asString(row[1]),
      lastName: asString(row[2]) || '',
      email: asString(row[3]),
      phone: asString(row[4]),
      role: asString(row[5]),
      company: asString(row[6]),
      inquiryType: ['BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS'].includes(inquiryType) ? inquiryType : 'OTHERS',
      subject: 'Legacy contact import',
      message: asString(row[8]),
      status: 'NEW',
      ipAddress: asString(row[9]),
      userAgent: asString(row[10]),
      readAt: null,
      submittedAt: parseTimestamp(row[11]) || parseTimestamp(row[12]) || new Date(),
      createdAt: parseTimestamp(row[12]) || parseTimestamp(row[11]) || new Date(),
      updatedAt: parseTimestamp(row[13]) || parseTimestamp(row[12]) || parseTimestamp(row[11]) || new Date(),
    };
  });

  const managementCategories = source.management_categories.map((row) => ({
    id: managementCategoryIds.get(String(row[0])),
    name: asString(row[1]),
    slug: makeSlug(row[2] || row[1], `management-category-${row[0]}`),
    description: asString(row[3]),
    position: asInteger(row[4]),
    is_active: asBoolean(row[5], true),
    createdBy: asString(row[6]),
    updatedBy: asString(row[7]),
    createdAt: parseTimestamp(row[8]) || new Date(),
    updatedAt: parseTimestamp(row[9]) || parseTimestamp(row[8]) || new Date(),
    deleted_at: null,
  }));

  const managements = source.managements.map((row) => ({
    id: stableId('managements', row[0]),
    categoryId: managementCategoryIds.get(String(row[5])),
    name: asString(row[1]),
    slug: makeSlug(`${row[1]}-${row[0]}`, `management-${row[0]}`),
    positionEn: asString(row[2]),
    positionId: asString(row[3]),
    description: asString(row[4]),
    photo: asString(row[6]),
    bioEn: asString(row[7]),
    bioId: asString(row[8]),
    email: null,
    phone: null,
    linkedin: null,
    order: asInteger(row[9]),
    is_active: asBoolean(row[10], true),
    createdBy: asString(row[11]),
    updatedBy: asString(row[12]),
    createdAt: parseTimestamp(row[13]) || new Date(),
    updatedAt: parseTimestamp(row[14]) || parseTimestamp(row[13]) || new Date(),
    deleted_at: null,
  }));

  const menus = source.menus.map((row) => ({
    id: BigInt(row[0]),
    parentId: row[1] == null ? null : BigInt(row[1]),
    sectionTitle: asString(row[2]),
    sectionOrder: asInteger(row[3]),
    title: asString(row[4]),
    translations: parseJson(row[5], row[0]) ?? Prisma.DbNull,
    slug: asString(row[6]),
    url: asString(row[7]),
    icon: asString(row[8]),
    image: asString(row[9]),
    description: asString(row[10]),
    badge: asString(row[11]),
    position: String(row[12] || 'header').trim().toUpperCase(),
    type: String(row[13] || 'link').trim().toUpperCase(),
    order: asInteger(row[14]),
    isActive: asBoolean(row[15], true),
    openNewTab: asBoolean(row[16]),
    cssClass: asString(row[17]),
    createdBy: asString(row[18]),
    updatedBy: asString(row[19]),
    createdAt: parseTimestamp(row[20]),
    updatedAt: parseTimestamp(row[21]),
  }));

  return { awards, careers, contacts, managementCategories, managements, menus };
}

function dateKey(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : null;
}

function chooseClosestByDate(candidates, sourceDate) {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  if (!sourceDate) return null;
  const sourceTime = sourceDate.getTime();
  return [...candidates].sort(
    (left, right) => Math.abs(left.news_date.getTime() - sourceTime) - Math.abs(right.news_date.getTime() - sourceTime),
  )[0];
}

async function buildNewsData(source) {
  const [currentCategories, currentNews, users] = await Promise.all([
    prisma.news_categories.findMany(),
    prisma.news.findMany(),
    prisma.user.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, email: true, username: true } }),
  ]);
  if (users.length === 0) throw new Error('At least one PostgreSQL user is required to own migrated news.');

  const categoryBySlug = new Map(currentCategories.map((item) => [item.slug, item]));
  const categoryIds = new Map();
  const categories = source.news_category.map((row) => {
    const slug = makeSlug(row[3] || row[1], `news-category-${row[0]}`);
    const id = categoryBySlug.get(slug)?.id || stableId('news_category', row[0]);
    categoryIds.set(String(row[0]), id);
    return {
      id,
      name_en: asString(row[1]),
      name_id: asString(row[1]),
      slug,
      description: null,
      position: asInteger(row[2]),
      is_active: asBoolean(row[4], true),
      created_by: asString(row[5]),
      updated_by: asString(row[6]),
      created_at: parseTimestamp(row[7]) || new Date(),
      updated_at: parseTimestamp(row[8]) || parseTimestamp(row[7]) || new Date(),
      deleted_at: null,
    };
  });

  const currentBySlug = new Map(currentNews.map((item) => [item.slug, item]));
  const currentByTitle = new Map();
  const currentByDate = new Map();
  for (const item of currentNews) {
    const title = item.title_en.trim().toLowerCase();
    const date = dateKey(item.news_date);
    if (!currentByTitle.has(title)) currentByTitle.set(title, []);
    if (!currentByDate.has(date)) currentByDate.set(date, []);
    currentByTitle.get(title).push(item);
    currentByDate.get(date).push(item);
  }

  const userByIdentity = new Map();
  for (const user of users) {
    if (user.email) userByIdentity.set(user.email.trim().toLowerCase(), user.id);
    if (user.username) userByIdentity.set(user.username.trim().toLowerCase(), user.id);
  }
  const fallbackUserId = users[0].id;
  const assignedCurrentIds = new Set();
  const newsIds = new Map();
  const matchedCurrentIds = [];

  function unassigned(items) {
    return (items || []).filter((item) => !assignedCurrentIds.has(item.id));
  }

  const articles = source.news_content.map((row) => {
    const sourceDate = parseDate(row[15]) || parseTimestamp(row[13]) || new Date();
    const sourceSlug = makeSlug(row[4] || row[1], `news-${row[0]}`);
    const idSpecificSlug = makeSlug(`${row[1]}-${row[0]}`, `news-${row[0]}`);
    let existing = currentBySlug.get(idSpecificSlug);
    if (existing && assignedCurrentIds.has(existing.id)) existing = null;
    if (!existing) {
      const exactSlug = currentBySlug.get(sourceSlug);
      if (exactSlug && !assignedCurrentIds.has(exactSlug.id)) existing = exactSlug;
    }
    if (!existing) {
      existing = chooseClosestByDate(
        unassigned(currentByTitle.get(String(row[1]).trim().toLowerCase())),
        sourceDate,
      );
    }
    if (!existing) {
      existing = chooseClosestByDate(unassigned(currentByDate.get(dateKey(sourceDate))), sourceDate);
    }

    const id = existing?.id || stableId('news_content', row[0]);
    if (existing) {
      assignedCurrentIds.add(existing.id);
      matchedCurrentIds.push(existing.id);
    }
    newsIds.set(String(row[0]), id);

    const sourceCreatedBy = asString(row[16])?.trim().toLowerCase();
    const sourceUpdatedBy = asString(row[17])?.trim().toLowerCase();
    const createdById =
      (sourceCreatedBy && userByIdentity.get(sourceCreatedBy)) || existing?.created_by_id || fallbackUserId;
    const updatedById =
      (sourceUpdatedBy && userByIdentity.get(sourceUpdatedBy)) || existing?.updated_by_id || null;
    const active = asBoolean(row[10], true);
    const createdAt = parseTimestamp(row[13]) || new Date();

    return {
      id,
      title_en: asString(row[1]),
      title_id: asString(row[2]),
      slug: sourceSlug,
      news_date: sourceDate,
      news_thumbnail: asString(row[3]),
      excerpt_en: asString(row[5]),
      excerpt_id: asString(row[6]),
      content_en: asString(row[8]),
      content_id: asString(row[9]),
      news_link: asString(row[19]),
      author: asString(row[7]),
      meta_title: asString(row[1]),
      meta_description: asString(row[11]),
      meta_desc: asString(row[11]),
      category_id: categoryIds.get(String(row[18])),
      meta_keywords: asString(row[12]),
      custom_css: asString(row[22]),
      custom_js: asString(row[23]),
      view_count: clampedInteger(row[20]),
      view_count_unique: clampedInteger(row[21]),
      status: active ? 'PUBLISHED' : 'DRAFT',
      visibility: 'PUBLIC',
      published_at: active ? sourceDate : null,
      created_by_id: createdById,
      updated_by_id: updatedById,
      created_at: createdAt,
      updated_at: parseTimestamp(row[14]) || createdAt,
      deleted_at: null,
    };
  });

  const highlights = source.news_highlight.map((row) => ({
    id: stableId('news_highlight', row[0]),
    news_id: newsIds.get(String(row[1])),
    position: asInteger(row[2], asInteger(row[0])),
    created_by: asString(row[3]),
    updated_by: asString(row[5]),
    created_at: parseTimestamp(row[4]) || new Date(),
    updated_at: parseTimestamp(row[6]) || parseTimestamp(row[4]) || new Date(),
  }));

  const [preservedViews, preservedEventRelations, preservedTagRelations] = await Promise.all([
    prisma.news_views.count({ where: { news_id: { in: matchedCurrentIds } } }),
    prisma.event_news_relations.count({ where: { news_id: { in: matchedCurrentIds } } }),
    prisma.news_tag_relations.count({ where: { news_id: { in: matchedCurrentIds } } }),
  ]);

  return {
    categories,
    articles,
    highlights,
    matchedArticles: matchedCurrentIds.length,
    dependencies: { views: preservedViews, eventRelations: preservedEventRelations, tagRelations: preservedTagRelations },
  };
}

function sourceCounts(source) {
  return {
    awards: source.awards.length,
    career_content: source.career_content.length,
    contact_us: source.contact_us.length,
    managements: source.managements.length,
    management_categories: source.management_categories.length,
    menus: source.menus.length,
    news_categories: source.news_category.length,
    news: source.news_content.length,
    news_highlights: source.news_highlight.length,
  };
}

async function databaseCounts(client) {
  const values = await Promise.all([
    client.award.count(),
    client.careerContent.count(),
    client.contactUs.count(),
    client.management.count(),
    client.managementCategory.count(),
    client.menu.count(),
    client.news_categories.count(),
    client.news.count(),
    client.news_highlights.count(),
  ]);
  return {
    awards: values[0],
    career_content: values[1],
    contact_us: values[2],
    managements: values[3],
    management_categories: values[4],
    menus: values[5],
    news_categories: values[6],
    news: values[7],
    news_highlights: values[8],
  };
}

function assertMatchingCounts(expected, actual) {
  for (const [tableName, expectedCount] of Object.entries(expected)) {
    if (actual[tableName] !== expectedCount) {
      throw new Error(`${tableName}: expected ${expectedCount} rows, found ${actual[tableName]}.`);
    }
  }
}

async function upsertById(model, records) {
  for (const record of records) {
    const { id, ...fields } = record;
    await model.upsert({ where: { id }, update: fields, create: record });
  }
}

async function replaceData(nonNews, newsData, expectedCounts) {
  return prisma.$transaction(
    async (tx) => {
      await tx.menu.deleteMany({ where: { parentId: { not: null } } });
      await tx.menu.deleteMany();
      await tx.careerContent.deleteMany();
      await tx.contactUs.deleteMany();
      await tx.management.deleteMany();
      await tx.managementCategory.deleteMany();
      await tx.award.deleteMany();

      await tx.award.createMany({ data: nonNews.awards });
      await tx.careerContent.createMany({ data: nonNews.careers });
      await tx.contactUs.createMany({ data: nonNews.contacts });
      await tx.managementCategory.createMany({ data: nonNews.managementCategories });
      await tx.management.createMany({ data: nonNews.managements });
      await tx.menu.createMany({ data: nonNews.menus.filter((menu) => menu.parentId == null) });
      await tx.menu.createMany({ data: nonNews.menus.filter((menu) => menu.parentId != null) });

      await tx.news_highlights.deleteMany();
      await tx.$executeRawUnsafe(`UPDATE "news" SET "slug" = '__legacy_migration__-' || "id"`);
      await upsertById(tx.news_categories, newsData.categories);
      await upsertById(tx.news, newsData.articles);

      const articleIds = newsData.articles.map((article) => article.id);
      const categoryIds = newsData.categories.map((category) => category.id);
      await tx.news.deleteMany({ where: { id: { notIn: articleIds } } });
      await tx.news_categories.deleteMany({ where: { id: { notIn: categoryIds } } });
      await tx.news_highlights.createMany({ data: newsData.highlights });

      const maxMenuId = nonNews.menus.reduce((max, menu) => (menu.id > max ? menu.id : max), 0n);
      const maxCareerId = nonNews.careers.reduce((max, career) => (career.id > max ? career.id : max), 0n);
      await tx.$queryRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('public.menus', 'id'), $1, true)`,
        maxMenuId,
      );
      await tx.$queryRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('public.career_content', 'id'), $1, true)`,
        maxCareerId,
      );

      const urlRewrite = await rewriteLinknetUrls(tx);
      const actualCounts = await databaseCounts(tx);
      assertMatchingCounts(expectedCounts, actualCounts);

      const [views, eventRelations, tagRelations] = await Promise.all([
        tx.news_views.count(),
        tx.event_news_relations.count(),
        tx.news_tag_relations.count(),
      ]);
      const dependencies = { views, eventRelations, tagRelations };
      for (const [name, expected] of Object.entries(newsData.dependencies)) {
        if (dependencies[name] !== expected) {
          throw new Error(`news dependency ${name}: expected ${expected}, found ${dependencies[name]}.`);
        }
      }

      return { actualCounts, dependencies, urlRewrite };
    },
    { maxWait: 10_000, timeout: 120_000 },
  );
}

async function main() {
  const options = readOptions(process.argv.slice(2));
  if (!fs.existsSync(options.filePath)) throw new Error(`SQL dump not found: ${options.filePath}`);

  const source = extractSource(fs.readFileSync(options.filePath, 'utf8'));
  const expectedCounts = sourceCounts(source);
  const nonNews = buildNonNewsData(source);

  console.log(`Source: ${options.filePath}`);
  console.table(expectedCounts);
  if (!options.replace) {
    console.log('Dry run completed. The dump is valid; no database data was changed.');
    return;
  }

  const newsData = await buildNewsData(source);
  const [connection] = await prisma.$queryRawUnsafe(
    'SELECT current_database() AS database, inet_server_addr()::text AS server',
  );
  console.log(`Target: ${connection.database} on ${connection.server || 'local socket'}`);
  console.log(`News UUIDs retained: ${newsData.matchedArticles}/${newsData.articles.length}`);
  console.log('Replacing target data in one transaction...');

  const result = await replaceData(nonNews, newsData, expectedCounts);
  console.table(result.actualCounts);
  console.log(`Preserved news dependencies: ${JSON.stringify(result.dependencies)}`);
  console.log(`URL rewrite changed ${result.urlRewrite.changedRows} row/column value(s).`);
  console.log('Migration completed and verified successfully.');
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(`Migration failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { buildNonNewsData, extractSource };
