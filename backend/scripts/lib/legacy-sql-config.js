const fs = require('fs');
const path = require('path');

const DEFAULT_BASE_DIR = path.resolve(__dirname, '../../../app_docs/backup_root');

const SQL_SOURCE_FILES = Object.freeze({
  announcements: 'data_announcement_lengkap.sql',
  awardsManagementContact: 'datalengkap_awards_management_contactus.sql',
  careers: 'data_career_lengkap.sql',
  menus: 'data_menus_lengkap.sql',
  news: 'data_news_lengkap.sql',
  newsNoViews: 'data_news_lengkap_tanpaviews.sql',
  pages: 'daftar_pages_lengkap.sql',
  reports: 'data_report_lengkap.sql',
});

function getLegacySqlBaseDir() {
  if (process.env.LEGACY_SQL_BASE_DIR) {
    return path.resolve(process.cwd(), process.env.LEGACY_SQL_BASE_DIR);
  }

  return DEFAULT_BASE_DIR;
}

function resolveSqlSource(key) {
  const fileName = SQL_SOURCE_FILES[key];
  if (!fileName) {
    throw new Error(`Unknown legacy SQL source key: ${key}`);
  }

  return path.join(getLegacySqlBaseDir(), fileName);
}

function readSqlSource(key) {
  const filePath = resolveSqlSource(key);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Legacy SQL source not found for "${key}": ${filePath}. ` +
      'Set LEGACY_SQL_BASE_DIR if your dumps live outside app_docs/backup_root.',
    );
  }

  return {
    filePath,
    content: fs.readFileSync(filePath, 'utf8'),
  };
}

module.exports = {
  DEFAULT_BASE_DIR,
  SQL_SOURCE_FILES,
  getLegacySqlBaseDir,
  resolveSqlSource,
  readSqlSource,
};