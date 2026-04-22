const { PrismaClient } = require('@prisma/client');
const { readSqlSource } = require('./lib/legacy-sql-config');
const { parseSqlInserts } = require('./lib/mysql-dump-parser');

const prisma = new PrismaClient();

function mapMenuPosition(value) {
  switch ((value || '').toLowerCase()) {
    case 'footer':
      return 'footer';
    case 'both':
      return 'both';
    case 'header':
    default:
      return 'header';
  }
}

function mapMenuType(value) {
  switch ((value || '').toLowerCase()) {
    case 'dropdown':
      return 'dropdown';
    case 'mega':
      return 'mega';
    case 'link':
    default:
      return 'link';
  }
}

function parseJsonOrNull(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parseTimestamp(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function extractMenus(sql) {
  return parseSqlInserts(sql, 'menus').map((row) => ({
    id: row[0],
    parentId: row[1],
    sectionTitle: row[2],
    sectionOrder: row[3] ?? 0,
    title: row[4],
    translations: parseJsonOrNull(row[5]),
    slug: row[6],
    url: row[7],
    icon: row[8],
    image: row[9],
    description: row[10],
    badge: row[11],
    position: mapMenuPosition(row[12]),
    type: mapMenuType(row[13]),
    order: row[14] ?? 0,
    isActive: Boolean(row[15]),
    openNewTab: Boolean(row[16]),
    cssClass: row[17],
    createdBy: row[18],
    updatedBy: row[19],
    createdAt: parseTimestamp(row[20]),
    updatedAt: parseTimestamp(row[21]),
  }));
}

async function insertMenu(tx, menu) {
  await tx.$executeRawUnsafe(
    `INSERT INTO menus (id, parent_id, section_title, section_order, title, translations, slug, url, icon, image, description, badge, position, type, "order", is_active, open_new_tab, css_class, created_by, updated_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13::"MenuPosition", $14::"MenuType", $15, $16, $17, $18, $19, $20, $21, $22)`,
    BigInt(menu.id),
    menu.parentId == null ? null : BigInt(menu.parentId),
    menu.sectionTitle,
    menu.sectionOrder,
    menu.title,
    menu.translations ? JSON.stringify(menu.translations) : null,
    menu.slug,
    menu.url,
    menu.icon,
    menu.image,
    menu.description,
    menu.badge,
    menu.position,
    menu.type,
    menu.order,
    menu.isActive,
    menu.openNewTab,
    menu.cssClass,
    menu.createdBy,
    menu.updatedBy,
    menu.createdAt,
    menu.updatedAt,
  );
}

async function migrateMenusFromSql() {
  console.log('==============================================');
  console.log('Menus Migration: MySQL SQL → PostgreSQL');
  console.log('==============================================\n');

  const { filePath, content } = readSqlSource('menus');
  console.log(`[Parse] Reading SQL file: ${filePath}`);

  const menus = extractMenus(content);
  console.log(`  Parsed: ${menus.length} menus\n`);

  await prisma.$transaction(async (tx) => {
    console.log('[Step 1] Clearing existing menus...');
    await tx.menu.deleteMany({ where: { parentId: { not: null } } });
    await tx.menu.deleteMany({ where: { parentId: null } });

    console.log('[Step 2] Inserting menus...');
    const parentMenus = menus.filter((menu) => menu.parentId == null);
    const childMenus = menus.filter((menu) => menu.parentId != null);

    for (const menu of parentMenus) {
      await insertMenu(tx, menu);
    }

    for (const menu of childMenus) {
      await insertMenu(tx, menu);
    }

    const maxId = Math.max(...menus.map((menu) => menu.id));
    await tx.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('menus', 'id'), $1)`,
      BigInt(maxId),
    );
  });

  const total = await prisma.menu.count();
  const header = await prisma.menu.count({ where: { position: 'HEADER' } });
  const footer = await prisma.menu.count({ where: { position: 'FOOTER' } });

  console.log('[Verification]');
  console.log(`  Total menus: ${total}`);
  console.log(`  Header menus: ${header}`);
  console.log(`  Footer menus: ${footer}`);
  console.log('\nMenus migration completed successfully.');
}

if (require.main === module) {
  migrateMenusFromSql()
    .catch((error) => {
      console.error('Menus migration failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = {
  migrateMenusFromSql,
};