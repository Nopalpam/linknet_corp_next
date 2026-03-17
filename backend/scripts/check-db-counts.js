const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    const users = await p.user.count();
    const pages = await p.page.count();
    const menus = await p.menu.count();
    const roles = await p.role.count();
    const perms = await p.permission.count();
    const settings = await p.setting.count();
    const news = await p.news.count();
    const awards = await p.award.count();
    const mgmt = await p.management.count();
    const mgmtCat = await p.managementCategory.count();
    const contacts = await p.contactUs.count();
    const reports = await p.reports.count();
    const announcements = await p.announcements.count();
    const careers = await p.career.count();
    const components = await p.pageComponent.count();
    const rolePerms = await p.rolePermission.count();
    const userRoles = await p.userRole.count();
    const careerContent = await p.careerContent.count();
    const folders = await p.folder.count();

    console.log(JSON.stringify({
      users, pages, components, menus, roles, perms, rolePerms, userRoles,
      settings, news, awards, mgmt, mgmtCat, contacts, reports, announcements, careers, careerContent, folders
    }, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await p.$disconnect();
  }
}

main();
