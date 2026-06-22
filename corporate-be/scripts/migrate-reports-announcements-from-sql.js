const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { v5: uuidv5 } = require('uuid');
const slugify = require('slugify');
const { parseSqlInserts } = require('./lib/mysql-dump-parser');
const { normalizeLinknetUrls, rewriteLinknetUrls } = require('./lib/linknet-url-normalizer');

const prisma = new PrismaClient();
const UUID_NAMESPACE = uuidv5.URL;

const TABLE_WIDTHS = Object.freeze({
  announcement_types: 8,
  announcement_sections: 13,
  announcement_items: 15,
  report_types: 8,
  report_sections: 13,
  report_items: 15,
});

function usage() {
  return [
    'Usage:',
    '  node scripts/migrate-reports-announcements-from-sql.js --file <dump.sql> --replace',
    '  node scripts/migrate-reports-announcements-from-sql.js --file <dump.sql> --dry-run',
    '',
    '--replace is required because the migration deletes existing report and announcement data.',
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

  return {
    filePath: path.resolve(process.cwd(), fileValue),
    replace,
  };
}

function parseTimestamp(value) {
  if (value == null || value === '') return null;

  const normalized = String(value).includes('T')
    ? String(value)
    : String(value).replace(' ', 'T');
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
    ? normalized
    : `${normalized}Z`;
  const parsed = new Date(withTimezone);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid timestamp in SQL dump: ${value}`);
  }

  return parsed;
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
  if (!Number.isInteger(parsed)) {
    throw new Error(`Expected an integer in SQL dump, received: ${value}`);
  }
  return parsed;
}

function stableId(tableName, oldId) {
  return uuidv5(`mysql-legacy/${tableName}/${oldId}`, UUID_NAMESPACE);
}

function makeSlug(value, tableName, oldId) {
  return slugify(`${value ?? ''}-${oldId}`, { lower: true, strict: true }) || `${tableName}-${oldId}`;
}

function assertRows(tableName, rows) {
  if (rows.length === 0) {
    throw new Error(`No rows found for required table ${tableName}.`);
  }

  const expectedWidth = TABLE_WIDTHS[tableName];
  const invalidRow = rows.findIndex((row) => row.length !== expectedWidth);
  if (invalidRow >= 0) {
    throw new Error(
      `${tableName} row ${invalidRow + 1} has ${rows[invalidRow].length} columns; expected ${expectedWidth}.`,
    );
  }

  const ids = new Set();
  for (const row of rows) {
    const id = String(row[0]);
    if (ids.has(id)) throw new Error(`Duplicate source ID ${id} in ${tableName}.`);
    ids.add(id);
  }
}

function assertRequiredText(tableName, rows, columnIndex, columnName) {
  const invalid = rows.find((row) => row[columnIndex] == null || String(row[columnIndex]).trim() === '');
  if (invalid) {
    throw new Error(`${tableName}.${columnName} is empty for source ID ${invalid[0]}.`);
  }
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

function assertItemParents(itemTable, items, sections) {
  const sectionTypeIds = new Map(sections.map((row) => [String(row[0]), String(row[1])]));
  const mismatch = items.find((row) => {
    if (row[1] == null || row[2] == null) return false;
    return String(row[1]) !== sectionTypeIds.get(String(row[2]));
  });

  if (mismatch) {
    throw new Error(
      `${itemTable} source ID ${mismatch[0]} has a type that does not match its section parent.`,
    );
  }
}

function extractSource(sql) {
  const source = Object.fromEntries(
    Object.keys(TABLE_WIDTHS).map((tableName) => [tableName, parseSqlInserts(sql, tableName)]),
  );

  for (const [tableName, rows] of Object.entries(source)) assertRows(tableName, rows);

  assertRequiredText('announcement_types', source.announcement_types, 1, 'name');
  assertRequiredText('announcement_sections', source.announcement_sections, 2, 'title');
  assertRequiredText('announcement_items', source.announcement_items, 3, 'title');
  assertRequiredText('report_types', source.report_types, 1, 'name');
  assertRequiredText('report_sections', source.report_sections, 2, 'title');
  assertRequiredText('report_items', source.report_items, 3, 'title');

  assertReferences('announcement_sections', source.announcement_sections, 1, 'announcement_types', source.announcement_types, false);
  assertReferences('announcement_items', source.announcement_items, 1, 'announcement_types', source.announcement_types, true);
  assertReferences('announcement_items', source.announcement_items, 2, 'announcement_sections', source.announcement_sections, true);
  assertReferences('report_sections', source.report_sections, 1, 'report_types', source.report_types, false);
  assertReferences('report_items', source.report_items, 1, 'report_types', source.report_types, true);
  assertReferences('report_items', source.report_items, 2, 'report_sections', source.report_sections, true);
  assertItemParents('announcement_items', source.announcement_items, source.announcement_sections);
  assertItemParents('report_items', source.report_items, source.report_sections);

  return source;
}

function buildTargetData(source) {
  const announcementTypeIds = new Map(
    source.announcement_types.map((row) => [String(row[0]), stableId('announcement_types', row[0])]),
  );
  const announcementSectionIds = new Map(
    source.announcement_sections.map((row) => [String(row[0]), stableId('announcement_sections', row[0])]),
  );
  const reportTypeIds = new Map(
    source.report_types.map((row) => [String(row[0]), stableId('report_types', row[0])]),
  );
  const reportSectionIds = new Map(
    source.report_sections.map((row) => [String(row[0]), stableId('report_sections', row[0])]),
  );
  const reportSectionsById = new Map(source.report_sections.map((row) => [String(row[0]), row]));

  const announcementTypes = source.announcement_types.map((row) => ({
    id: announcementTypeIds.get(String(row[0])),
    name: String(row[1]),
    slug: makeSlug(row[1], 'announcement-type', row[0]),
    type: asString(row[2]) || 'List',
    description: null,
    icon: null,
    color: null,
    position: asInteger(row[3]),
    isActive: asBoolean(row[4], true),
    createdAt: parseTimestamp(row[5]) || new Date(),
    updatedAt: parseTimestamp(row[6]) || parseTimestamp(row[5]) || new Date(),
    deletedAt: parseTimestamp(row[7]),
  }));

  const announcementSections = source.announcement_sections.map((row) => ({
    id: announcementSectionIds.get(String(row[0])),
    type_id: announcementTypeIds.get(String(row[1])),
    name: String(row[2]),
    slug: makeSlug(row[2], 'announcement-section', row[0]),
    description: asString(row[3]),
    announcement_year: asString(row[4]),
    cta_enabled: asBoolean(row[5]),
    cta_text: asString(row[6]),
    cta_url: asString(row[7]),
    position: asInteger(row[8]),
    isActive: asBoolean(row[9], true),
    createdAt: parseTimestamp(row[10]) || new Date(),
    updatedAt: parseTimestamp(row[11]) || parseTimestamp(row[10]) || new Date(),
    deletedAt: parseTimestamp(row[12]),
  }));

  const announcements = source.announcement_items.map((row) => {
    const active = asBoolean(row[11], true);
    return {
      id: stableId('announcement_items', row[0]),
      type_id: row[1] == null ? null : announcementTypeIds.get(String(row[1])),
      section_id: row[2] == null ? null : announcementSectionIds.get(String(row[2])),
      title: String(row[3]),
      slug: makeSlug(row[3], 'announcement', row[0]),
      description: asString(row[4]),
      pdf_file: asString(row[5]),
      cover_image: asString(row[6]),
      data_type: asString(row[7]),
      audit_status: asString(row[8]),
      file_size: asString(row[9]),
      sort_order: asInteger(row[10]),
      is_active: active,
      status: active ? 'PUBLISHED' : 'ARCHIVED',
      created_at: parseTimestamp(row[12]) || new Date(),
      updated_at: parseTimestamp(row[13]) || parseTimestamp(row[12]) || new Date(),
      deleted_at: parseTimestamp(row[14]),
    };
  });

  const reportTypes = source.report_types.map((row) => ({
    id: reportTypeIds.get(String(row[0])),
    name: String(row[1]),
    slug: makeSlug(row[1], 'report-type', row[0]),
    description: null,
    icon: null,
    color: null,
    position: asInteger(row[3]),
    isActive: asBoolean(row[4], true),
    createdAt: parseTimestamp(row[5]) || new Date(),
    updatedAt: parseTimestamp(row[6]) || parseTimestamp(row[5]) || new Date(),
    deletedAt: parseTimestamp(row[7]),
  }));

  const reportSections = source.report_sections.map((row) => ({
    id: reportSectionIds.get(String(row[0])),
    type_id: reportTypeIds.get(String(row[1])),
    name: String(row[2]),
    slug: makeSlug(row[2], 'report-section', row[0]),
    description: asString(row[3]),
    position: asInteger(row[8]),
    isActive: asBoolean(row[9], true),
    createdAt: parseTimestamp(row[10]) || new Date(),
    updatedAt: parseTimestamp(row[11]) || parseTimestamp(row[10]) || new Date(),
    deletedAt: parseTimestamp(row[12]),
  }));

  const reports = source.report_items.map((row) => {
    const active = asBoolean(row[11], true);
    const sourceSection = row[2] == null ? null : reportSectionsById.get(String(row[2]));
    const year = sourceSection && sourceSection[4] != null ? asInteger(sourceSection[4]) : null;
    const createdAt = parseTimestamp(row[12]) || new Date();

    return {
      id: stableId('report_items', row[0]),
      type_id: row[1] == null ? null : reportTypeIds.get(String(row[1])),
      section_id: row[2] == null ? null : reportSectionIds.get(String(row[2])),
      title: String(row[3]),
      slug: makeSlug(row[3], 'report', row[0]),
      description: asString(row[4]),
      pdf_file: asString(row[5]),
      cover_image: asString(row[6]),
      data_type: asString(row[7]),
      audit_status: asString(row[8]),
      file_size: asString(row[9]),
      sort_order: asInteger(row[10]),
      is_active: active,
      period: year == null ? null : String(year),
      year,
      quarter: null,
      file_url: asString(row[5]),
      file_type: null,
      thumbnail: asString(row[6]),
      downloads: 0,
      status: active ? 'PUBLISHED' : 'ARCHIVED',
      published_at: active ? createdAt : null,
      created_at: createdAt,
      updated_at: parseTimestamp(row[13]) || createdAt,
      deleted_at: parseTimestamp(row[14]),
    };
  });

  return { announcementTypes, announcementSections, announcements, reportTypes, reportSections, reports };
}

function sourceCounts(source) {
  return {
    announcement_types: source.announcement_types.length,
    announcement_sections: source.announcement_sections.length,
    announcements: source.announcement_items.length,
    report_types: source.report_types.length,
    report_sections: source.report_sections.length,
    reports: source.report_items.length,
  };
}

async function databaseCounts(client) {
  const [announcementTypes, announcementSections, announcements, reportTypes, reportSections, reports] =
    await Promise.all([
      client.announcementType.count(),
      client.announcementSection.count(),
      client.announcements.count(),
      client.reportType.count(),
      client.reportSection.count(),
      client.reports.count(),
    ]);

  return {
    announcement_types: announcementTypes,
    announcement_sections: announcementSections,
    announcements,
    report_types: reportTypes,
    report_sections: reportSections,
    reports,
  };
}

function assertMatchingCounts(expected, actual) {
  for (const [tableName, expectedCount] of Object.entries(expected)) {
    if (actual[tableName] !== expectedCount) {
      throw new Error(`${tableName}: expected ${expectedCount} rows, found ${actual[tableName]}.`);
    }
  }
}

async function replaceData(target, expectedCounts) {
  await prisma.$transaction(
    async (tx) => {
      await tx.announcements.deleteMany();
      await tx.announcementSection.deleteMany();
      await tx.announcementType.deleteMany();
      await tx.reports.deleteMany();
      await tx.reportSection.deleteMany();
      await tx.reportType.deleteMany();

      await tx.announcementType.createMany({ data: target.announcementTypes });
      await tx.announcementSection.createMany({ data: target.announcementSections });
      await tx.announcements.createMany({ data: target.announcements });
      await tx.reportType.createMany({ data: target.reportTypes });
      await tx.reportSection.createMany({ data: target.reportSections });
      await tx.reports.createMany({ data: target.reports });
      await rewriteLinknetUrls(tx);

      const actualCounts = await databaseCounts(tx);
      assertMatchingCounts(expectedCounts, actualCounts);
    },
    { maxWait: 10_000, timeout: 120_000 },
  );
}

async function main() {
  const options = readOptions(process.argv.slice(2));
  if (!fs.existsSync(options.filePath)) throw new Error(`SQL dump not found: ${options.filePath}`);

  const sql = fs.readFileSync(options.filePath, 'utf8');
  const source = extractSource(sql);
  const expectedCounts = sourceCounts(source);
  const target = buildTargetData(source);

  console.log(`Source: ${options.filePath}`);
  console.table(expectedCounts);

  if (!options.replace) {
    console.log('Dry run completed. The dump is valid; no database data was changed.');
    return;
  }

  const [connection] = await prisma.$queryRawUnsafe(
    'SELECT current_database() AS database, inet_server_addr()::text AS server',
  );
  console.log(`Target: ${connection.database} on ${connection.server || 'local socket'}`);
  console.log('Replacing existing report and announcement data in one transaction...');

  await replaceData(target, expectedCounts);

  const actualCounts = await databaseCounts(prisma);
  assertMatchingCounts(expectedCounts, actualCounts);
  console.table(actualCounts);
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

module.exports = { buildTargetData, extractSource };
