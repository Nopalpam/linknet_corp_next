import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const tables: string[] = [
    'user', 'page', 'pageComponent', 'menu', 'career', 'careerContent',
    'award', 'managementCategory', 'management', 'contactSubmission', 'contactUs',
    'setting', 'role', 'permission', 'rolePermission', 'userRole',
    'news', 'news_categories', 'news_highlights',
    'reports', 'reportType', 'reportSection',
    'announcements', 'announcementType', 'announcementSection',
    'folder', 'file', 'logActivity', 'urlRedirect',
    'cookieConsent',
  ];
  for (const t of tables) {
    try {
      const c = await (p as any)[t].count();
      console.log(`${t}: ${c}`);
    } catch (e: any) {
      console.log(`${t}: ERROR - ${e.message?.substring(0, 80)}`);
    }
  }
}

main().finally(() => p.$disconnect());
