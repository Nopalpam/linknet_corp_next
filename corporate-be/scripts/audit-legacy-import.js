const { PrismaClient } = require('@prisma/client');
const { readSqlSource } = require('./lib/legacy-sql-config');
const { parseSqlInserts } = require('./lib/mysql-dump-parser');

const prisma = new PrismaClient();

function buildRows(sourceCounts, dbCounts) {
  return [
    { table: 'pages', source: sourceCounts.pages, database: dbCounts.pages, note: '' },
    { table: 'page_components', source: sourceCounts.pageComponents, database: dbCounts.pageComponents, note: `raw:${sourceCounts.pageComponentsRaw}, orphan_skipped:${sourceCounts.pageComponentsRaw - sourceCounts.pageComponents}` },
    { table: 'career_content', source: sourceCounts.careerContent, database: dbCounts.careerContent, note: '' },
    { table: 'menus', source: sourceCounts.menus, database: dbCounts.menus, note: '' },
    { table: 'awards', source: sourceCounts.awards, database: dbCounts.awards, note: '' },
    { table: 'management_categories', source: sourceCounts.managementCategories, database: dbCounts.managementCategories, note: '' },
    { table: 'managements', source: sourceCounts.managements, database: dbCounts.managements, note: '' },
    { table: 'contact_us', source: sourceCounts.contactUs, database: dbCounts.contactUs, note: '' },
    { table: 'announcement_types', source: sourceCounts.announcementTypes, database: dbCounts.announcementTypes, note: '' },
    { table: 'announcement_sections', source: sourceCounts.announcementSections, database: dbCounts.announcementSections, note: '' },
    { table: 'announcement_items', source: sourceCounts.announcementItems, database: dbCounts.announcementItems, note: '' },
    { table: 'report_types', source: sourceCounts.reportTypes, database: dbCounts.reportTypes, note: '' },
    { table: 'report_sections', source: sourceCounts.reportSections, database: dbCounts.reportSections, note: '' },
    { table: 'report_items', source: sourceCounts.reportItems, database: dbCounts.reportItems, note: '' },
    { table: 'news_categories', source: sourceCounts.newsCategories, database: dbCounts.newsCategories, note: '' },
    { table: 'news', source: sourceCounts.news, database: dbCounts.news, note: '' },
    { table: 'news_highlights', source: sourceCounts.newsHighlights, database: dbCounts.newsHighlights, note: '' },
    { table: 'news_views', source: sourceCounts.newsViews, database: dbCounts.newsViews, note: '' },
  ].map((row) => ({
    ...row,
    diff: row.database - row.source,
  }));
}

function collectSourceCounts() {
  const pagesSql = readSqlSource('pages').content;
  const pageRows = parseSqlInserts(pagesSql, 'pages');
  const pageComponentRows = parseSqlInserts(pagesSql, 'page_components');
  const validPageIds = new Set(pageRows.map((row) => row[0]));
  const validPageComponents = pageComponentRows.filter((row) => validPageIds.has(row[1]));

  const careersSql = readSqlSource('careers').content;
  const menusSql = readSqlSource('menus').content;
  const awardsSql = readSqlSource('awardsManagementContact').content;
  const announcementsSql = readSqlSource('announcements').content;
  const reportsSql = readSqlSource('reports').content;
  const newsSql = readSqlSource('news').content;

  const announcementTypeRows = parseSqlInserts(announcementsSql, 'announcement_types');
  const announcementSectionRows = parseSqlInserts(announcementsSql, 'announcement_sections');
  const announcementItemRows = parseSqlInserts(announcementsSql, 'announcement_items');
  const validAnnouncementTypeIds = new Set(announcementTypeRows.map((row) => row[0]));
  const sectionToTypeMap = new Map(
    announcementSectionRows.map((row) => [row[0], row[1]]),
  );
  const validAnnouncementItems = announcementItemRows.filter((row) => {
    const typeId = row[1];
    const sectionId = row[2];
    if (typeId && validAnnouncementTypeIds.has(typeId)) {
      return true;
    }
    if (sectionId && sectionToTypeMap.has(sectionId)) {
      return true;
    }
    return false;
  });

  return {
    pages: pageRows.length,
    pageComponents: validPageComponents.length,
    pageComponentsRaw: pageComponentRows.length,
    careerContent: parseSqlInserts(careersSql, 'career_content').length,
    menus: parseSqlInserts(menusSql, 'menus').length,
    awards: parseSqlInserts(awardsSql, 'awards').length,
    managementCategories: parseSqlInserts(awardsSql, 'management_categories').length,
    managements: parseSqlInserts(awardsSql, 'managements').length,
    contactUs: parseSqlInserts(awardsSql, 'contact_us').length,
    announcementTypes: announcementTypeRows.length,
    announcementSections: announcementSectionRows.length,
    announcementItems: validAnnouncementItems.length,
    reportTypes: parseSqlInserts(reportsSql, 'report_types').length,
    reportSections: parseSqlInserts(reportsSql, 'report_sections').length,
    reportItems: parseSqlInserts(reportsSql, 'report_items').length,
    newsCategories: parseSqlInserts(newsSql, 'news_category').length,
    news: parseSqlInserts(newsSql, 'news_content').length,
    newsHighlights: parseSqlInserts(newsSql, 'news_highlight').length,
    newsViews: parseSqlInserts(newsSql, 'news_view').length,
  };
}

async function collectDatabaseCounts() {
  const [
    pages,
    pageComponents,
    careerContent,
    menus,
    awards,
    managementCategories,
    managements,
    contactUs,
    announcementTypes,
    announcementSections,
    announcementItems,
    reportTypes,
    reportSections,
    reportItems,
    newsCategories,
    news,
    newsHighlights,
    newsViews,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.pageComponent.count(),
    prisma.careerContent.count(),
    prisma.menu.count(),
    prisma.award.count(),
    prisma.managementCategory.count(),
    prisma.management.count(),
    prisma.contactUs.count(),
    prisma.announcementType.count(),
    prisma.announcementSection.count(),
    prisma.announcements.count(),
    prisma.reportType.count(),
    prisma.reportSection.count(),
    prisma.reports.count(),
    prisma.news_categories.count(),
    prisma.news.count(),
    prisma.news_highlights.count(),
    prisma.news_views.count(),
  ]);

  return {
    pages,
    pageComponents,
    careerContent,
    menus,
    awards,
    managementCategories,
    managements,
    contactUs,
    announcementTypes,
    announcementSections,
    announcementItems,
    reportTypes,
    reportSections,
    reportItems,
    newsCategories,
    news,
    newsHighlights,
    newsViews,
  };
}

async function main() {
  try {
    const sourceCounts = collectSourceCounts();
    const dbCounts = await collectDatabaseCounts();
    const rows = buildRows(sourceCounts, dbCounts);
    const mismatches = rows.filter((row) => row.diff !== 0);

    console.log('Legacy Import Audit (canonical backup_root sources vs PostgreSQL)\n');
    console.table(rows.map((row) => ({
      table: row.table,
      source: row.source,
      database: row.database,
      diff: row.diff,
      note: row.note,
    })));

    if (mismatches.length === 0) {
      console.log('Audit result: all canonical legacy-import tables match the configured SQL sources.');
      return;
    }

    console.log('\nAudit mismatches detected:');
    for (const row of mismatches) {
      console.log(`- ${row.table}: source=${row.source}, database=${row.database}, diff=${row.diff}${row.note ? ` (${row.note})` : ''}`);
    }
    process.exitCode = 1;
  } catch (error) {
    console.error('Legacy import audit failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();