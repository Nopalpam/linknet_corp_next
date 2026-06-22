const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { readSqlSource } = require('./lib/legacy-sql-config');
const { parseSqlInserts } = require('./lib/mysql-dump-parser');

const prisma = new PrismaClient();

function parseTimestamp(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractData(sql) {
  const types = parseSqlInserts(sql, 'report_types').map((row) => ({
    id: row[0],
    name: row[1] == null ? null : String(row[1]),
    type: row[2] == null ? null : String(row[2]),
    sortOrder: row[3] ?? 0,
    isActive: Boolean(row[4]),
    createdAt: parseTimestamp(row[5]),
    updatedAt: parseTimestamp(row[6]),
    deletedAt: parseTimestamp(row[7]),
  }));

  const sections = parseSqlInserts(sql, 'report_sections').map((row) => ({
    id: row[0],
    reportTypeId: row[1],
    title: row[2] == null ? null : String(row[2]),
    description: row[3] == null ? null : String(row[3]),
    reportYear: row[4] == null ? null : String(row[4]),
    ctaEnabled: Boolean(row[5]),
    ctaText: row[6],
    ctaUrl: row[7],
    sortOrder: row[8] ?? 0,
    isActive: Boolean(row[9]),
    createdAt: parseTimestamp(row[10]),
    updatedAt: parseTimestamp(row[11]),
    deletedAt: parseTimestamp(row[12]),
  }));

  const items = parseSqlInserts(sql, 'report_items').map((row) => ({
    id: row[0],
    reportTypeId: row[1],
    reportSectionId: row[2],
    title: row[3] == null ? null : String(row[3]),
    subDescription: row[4] == null ? null : String(row[4]),
    pdfFile: row[5] == null ? null : String(row[5]),
    coverImage: row[6] == null ? null : String(row[6]),
    dataType: row[7] == null ? null : String(row[7]),
    auditStatus: row[8] == null ? null : String(row[8]),
    fileSize: row[9],
    sortOrder: row[10] ?? 0,
    isActive: Boolean(row[11]),
    createdAt: parseTimestamp(row[12]),
    updatedAt: parseTimestamp(row[13]),
    deletedAt: parseTimestamp(row[14]),
  }));

  return { types, sections, items };
}

async function importReportsFromSql() {
  console.log('==============================================');
  console.log('Reports Migration: MySQL SQL → PostgreSQL');
  console.log('==============================================\n');

  const { filePath, content } = readSqlSource('reports');
  console.log(`[Parse] Reading SQL file: ${filePath}`);

  const { types, sections, items } = extractData(content);
  console.log(`  Parsed: ${types.length} types, ${sections.length} sections, ${items.length} items\n`);

  const typeIdMap = {};
  const sectionIdMap = {};

  await prisma.$transaction(async (tx) => {
    console.log('[Step 1] Clearing existing report data...');
    await tx.reports.deleteMany({});
    await tx.reportSection.deleteMany({});
    await tx.reportType.deleteMany({});

    console.log('[Step 2] Creating report types...');
    for (const type of types) {
      const newId = uuidv4();
      typeIdMap[type.id] = newId;
      await tx.reportType.create({
        data: {
          id: newId,
          name: type.name,
          slug: slugify(type.name, { lower: true, strict: true }),
          description: type.type ? `Type: ${type.type}` : null,
          position: type.sortOrder,
          isActive: type.isActive,
          createdAt: type.createdAt ?? new Date(),
          updatedAt: type.updatedAt ?? new Date(),
          deletedAt: type.deletedAt,
        },
      });
    }

    console.log('[Step 3] Creating report sections...');
    for (const section of sections) {
      const newTypeId = typeIdMap[section.reportTypeId];
      if (!newTypeId) {
        throw new Error(`Missing type mapping for report section ${section.id}`);
      }

      const newId = uuidv4();
      sectionIdMap[section.id] = newId;
      await tx.reportSection.create({
        data: {
          id: newId,
          type_id: newTypeId,
          name: section.title,
          slug: slugify(`${section.title}-${section.id}`, { lower: true, strict: true }),
          description: section.description ?? (section.reportYear ? `Year ${section.reportYear}` : null),
          position: section.sortOrder,
          isActive: section.isActive,
          createdAt: section.createdAt ?? new Date(),
          updatedAt: section.updatedAt ?? new Date(),
          deletedAt: section.deletedAt,
        },
      });
    }

    console.log('[Step 4] Creating report items...');
    for (const item of items) {
      let newTypeId = item.reportTypeId ? typeIdMap[item.reportTypeId] : null;
      const newSectionId = item.reportSectionId ? sectionIdMap[item.reportSectionId] : null;

      if (!newTypeId && item.reportSectionId) {
        const parentSection = sections.find((section) => section.id === item.reportSectionId);
        if (parentSection) {
          newTypeId = typeIdMap[parentSection.reportTypeId];
        }
      }

      if (!newTypeId && !newSectionId) {
        continue;
      }

      await tx.reports.create({
        data: {
          id: uuidv4(),
          type_id: newTypeId,
          section_id: newSectionId,
          title: item.title ?? `report-${item.id}`,
          slug: slugify(`${item.title}-${item.id}`, { lower: true, strict: true }),
          description: item.subDescription,
          pdf_file: item.pdfFile,
          cover_image: item.coverImage,
          data_type: item.dataType,
          audit_status: item.auditStatus,
          file_size: item.fileSize == null ? null : String(item.fileSize),
          sort_order: item.sortOrder,
          is_active: item.isActive,
          status: 'PUBLISHED',
          created_at: item.createdAt ?? new Date(),
          updated_at: item.updatedAt ?? new Date(),
          deleted_at: item.deletedAt,
        },
      });
    }
  });

  const totalTypes = await prisma.reportType.count();
  const totalSections = await prisma.reportSection.count();
  const totalItems = await prisma.reports.count();

  console.log('[Verification]');
  console.log(`  Types: ${totalTypes}`);
  console.log(`  Sections: ${totalSections}`);
  console.log(`  Items: ${totalItems}`);
  console.log('\nReports migration completed successfully.');
}

if (require.main === module) {
  importReportsFromSql()
    .catch((error) => {
      console.error('Reports migration failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  importReportsFromSql,
};