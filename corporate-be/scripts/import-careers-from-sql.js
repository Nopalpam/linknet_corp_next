const { PrismaClient } = require('@prisma/client');
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

function extractCareers(sql) {
  return parseSqlInserts(sql, 'career_content').map((row) => ({
    id: row[0],
    position: row[1] == null ? null : String(row[1]),
    slug: row[2] == null ? null : String(row[2]),
    division: row[3] == null ? null : String(row[3]),
    type: row[4] == null ? null : String(row[4]),
    linkJob: row[5] == null ? null : String(row[5]),
    location: row[6] == null ? null : String(row[6]),
    description: row[7] == null ? null : String(row[7]),
    descriptionId: row[8] == null ? null : String(row[8]),
    requirements: row[9] == null ? null : String(row[9]),
    requirementsId: row[10] == null ? null : String(row[10]),
    status: row[11] == null ? 'active' : String(row[11]),
    expiryDate: parseTimestamp(row[12]),
    createdAt: parseTimestamp(row[13]),
    updatedAt: parseTimestamp(row[14]),
    createdBy: row[15] == null ? null : String(row[15]),
    updatedBy: row[16] == null ? null : String(row[16]),
  }));
}

async function importCareersFromSql() {
  console.log('==============================================');
  console.log('Career Migration: MySQL SQL → PostgreSQL');
  console.log('==============================================\n');

  const { filePath, content } = readSqlSource('careers');
  console.log(`[Parse] Reading SQL file: ${filePath}`);

  const careers = extractCareers(content);
  console.log(`  Parsed: ${careers.length} career rows\n`);

  await prisma.$transaction(async (tx) => {
    console.log('[Step 1] Clearing existing career data...');
    await tx.careerContent.deleteMany({});

    console.log('[Step 2] Inserting careers...');
    for (const career of careers) {
      await tx.$executeRawUnsafe(
        `INSERT INTO career_content (id, position, slug, division, type, link_job, location, description, description_id, requirements, requirements_id, status, expiry_date, created_at, updated_at, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        BigInt(career.id),
        career.position,
        career.slug,
        career.division,
        career.type,
        career.linkJob,
        career.location,
        career.description,
        career.descriptionId,
        career.requirements,
        career.requirementsId,
        career.status,
        career.expiryDate,
        career.createdAt,
        career.updatedAt,
        career.createdBy,
        career.updatedBy,
      );
    }

    const maxId = Math.max(...careers.map((career) => career.id));
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('career_content', 'id'), $1)`,
      BigInt(maxId),
    );
  });

  const total = await prisma.careerContent.count();
  console.log('[Verification]');
  console.log(`  Total career rows: ${total}`);
  console.log('\nCareer migration completed successfully.');
}

if (require.main === module) {
  importCareersFromSql()
    .catch((error) => {
      console.error('Career migration failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  importCareersFromSql,
};