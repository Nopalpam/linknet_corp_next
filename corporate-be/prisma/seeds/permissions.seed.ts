/**
 * Permissions Seeder
 * ==================
 * Seeds all RBAC permissions into the database.
 *
 * Features:
 * - Idempotent (upsert - safe to run multiple times)
 * - Returns created/verified permission objects
 * - Can be run standalone or imported by master seed.ts
 *
 * Usage (standalone):
 *   npx ts-node prisma/seeds/permissions.seed.ts
 *
 * Usage (module):
 *   import { seedPermissions } from './permissions.seed';
 *   const permissions = await seedPermissions(prisma);
 */

import { PrismaClient, Permission } from '@prisma/client';

const prisma = new PrismaClient();

export interface PermissionDef {
  name: string;
  slug: string;
  module: string;
  description: string;
}

export const permissionsData: PermissionDef[] = [
  // ── User Management ──────────────────────────────────────────────
  { name: 'View Users', slug: 'users_management.read', module: 'users_management', description: 'View user list and details' },
  { name: 'Create User', slug: 'users_management.create', module: 'users_management', description: 'Create new user' },
  { name: 'Update User', slug: 'users_management.update', module: 'users_management', description: 'Update existing user' },
  { name: 'Delete User', slug: 'users_management.delete', module: 'users_management', description: 'Delete user' },
  { name: 'Toggle User Status', slug: 'users_management.toggle_status', module: 'users_management', description: 'Activate/deactivate user' },

  // ── Role Management ──────────────────────────────────────────────
  { name: 'View Roles', slug: 'role_management.read', module: 'role_management', description: 'View role list and permissions' },
  { name: 'Create Role', slug: 'role_management.create', module: 'role_management', description: 'Create new role' },
  { name: 'Update Role', slug: 'role_management.update', module: 'role_management', description: 'Update existing role' },
  { name: 'Delete Role', slug: 'role_management.delete', module: 'role_management', description: 'Delete role' },
  { name: 'Assign Permissions', slug: 'role_management.assign_permissions', module: 'role_management', description: 'Assign permissions to roles' },

  // ── Settings ─────────────────────────────────────────────────────
  { name: 'View Settings', slug: 'settings.read', module: 'settings', description: 'View system settings' },
  { name: 'Update Settings', slug: 'settings.update', module: 'settings', description: 'Update system settings' },

  // ── Menu Management ──────────────────────────────────────────────
  { name: 'View Menus', slug: 'menu_management.read', module: 'menu_management', description: 'View menu list' },
  { name: 'Create Menu', slug: 'menu_management.create', module: 'menu_management', description: 'Create new menu item' },
  { name: 'Update Menu', slug: 'menu_management.update', module: 'menu_management', description: 'Update existing menu item' },
  { name: 'Delete Menu', slug: 'menu_management.delete', module: 'menu_management', description: 'Delete menu item' },
  { name: 'Reorder Menu', slug: 'menu_management.reorder', module: 'menu_management', description: 'Reorder menu items' },

  // ── Pages ────────────────────────────────────────────────────────
  { name: 'View Pages', slug: 'pages.read', module: 'pages', description: 'View page list and details' },
  { name: 'Create Page', slug: 'pages.create', module: 'pages', description: 'Create new page' },
  { name: 'Update Page', slug: 'pages.update', module: 'pages', description: 'Update existing page' },
  { name: 'Delete Page', slug: 'pages.delete', module: 'pages', description: 'Delete page' },
  { name: 'Publish Page', slug: 'pages.publish', module: 'pages', description: 'Publish/unpublish page' },

  // ── News ─────────────────────────────────────────────────────────
  { name: 'View News', slug: 'news.read', module: 'news', description: 'View news list and details' },
  { name: 'Create News', slug: 'news.create', module: 'news', description: 'Create new news article' },
  { name: 'Update News', slug: 'news.update', module: 'news', description: 'Update existing news article' },
  { name: 'Delete News', slug: 'news.delete', module: 'news', description: 'Delete news article' },
  { name: 'Publish News', slug: 'news.publish', module: 'news', description: 'Publish/unpublish news article' },

  // ── Events ──────────────────────────────────────────────────────
  { name: 'View Events', slug: 'events.read', module: 'events', description: 'View event list and details' },
  { name: 'Create Event', slug: 'events.create', module: 'events', description: 'Create new event' },
  { name: 'Update Event', slug: 'events.update', module: 'events', description: 'Update existing event' },
  { name: 'Delete Event', slug: 'events.delete', module: 'events', description: 'Delete event' },

  // ── News Categories ──────────────────────────────────────────────
  { name: 'View News Categories', slug: 'news_categories.read', module: 'news', description: 'View news category list' },
  { name: 'Create News Category', slug: 'news_categories.create', module: 'news', description: 'Create new news category' },
  { name: 'Update News Category', slug: 'news_categories.update', module: 'news', description: 'Update existing news category' },
  { name: 'Delete News Category', slug: 'news_categories.delete', module: 'news', description: 'Delete news category' },

  // ── Announcements ────────────────────────────────────────────────
  { name: 'View Announcements', slug: 'announcements.read', module: 'announcements', description: 'View announcement list' },
  { name: 'Create Announcement', slug: 'announcements.create', module: 'announcements', description: 'Create new announcement' },
  { name: 'Update Announcement', slug: 'announcements.update', module: 'announcements', description: 'Update existing announcement' },
  { name: 'Delete Announcement', slug: 'announcements.delete', module: 'announcements', description: 'Delete announcement' },

  // ── Announcement Types ───────────────────────────────────────────
  { name: 'View Announcement Types', slug: 'announcement_types.read', module: 'announcements', description: 'View announcement types' },
  { name: 'Create Announcement Type', slug: 'announcement_types.create', module: 'announcements', description: 'Create announcement type' },
  { name: 'Update Announcement Type', slug: 'announcement_types.update', module: 'announcements', description: 'Update announcement type' },
  { name: 'Delete Announcement Type', slug: 'announcement_types.delete', module: 'announcements', description: 'Delete announcement type' },

  // ── Reports ──────────────────────────────────────────────────────
  { name: 'View Reports', slug: 'reports.read', module: 'reports', description: 'View report list' },
  { name: 'Create Report', slug: 'reports.create', module: 'reports', description: 'Create new report' },
  { name: 'Update Report', slug: 'reports.update', module: 'reports', description: 'Update existing report' },
  { name: 'Delete Report', slug: 'reports.delete', module: 'reports', description: 'Delete report' },

  // ── Report Types ─────────────────────────────────────────────────
  { name: 'View Report Types', slug: 'report_types.read', module: 'reports', description: 'View report types' },
  { name: 'Create Report Type', slug: 'report_types.create', module: 'reports', description: 'Create report type' },
  { name: 'Update Report Type', slug: 'report_types.update', module: 'reports', description: 'Update report type' },
  { name: 'Delete Report Type', slug: 'report_types.delete', module: 'reports', description: 'Delete report type' },

  // ── Careers ──────────────────────────────────────────────────────
  { name: 'View Careers', slug: 'careers.read', module: 'careers', description: 'View career list and details' },
  { name: 'Create Career', slug: 'careers.create', module: 'careers', description: 'Create new career posting' },
  { name: 'Update Career', slug: 'careers.update', module: 'careers', description: 'Update existing career posting' },
  { name: 'Delete Career', slug: 'careers.delete', module: 'careers', description: 'Delete career posting' },

  // ── Awards ───────────────────────────────────────────────────────
  { name: 'View Awards', slug: 'awards.read', module: 'awards', description: 'View award list' },
  { name: 'Create Award', slug: 'awards.create', module: 'awards', description: 'Create new award' },
  { name: 'Update Award', slug: 'awards.update', module: 'awards', description: 'Update existing award' },
  { name: 'Delete Award', slug: 'awards.delete', module: 'awards', description: 'Delete award' },

  // ── Management Team ──────────────────────────────────────────────
  { name: 'View Management', slug: 'management.read', module: 'management', description: 'View management team list' },
  { name: 'Create Management', slug: 'management.create', module: 'management', description: 'Create management team member' },
  { name: 'Update Management', slug: 'management.update', module: 'management', description: 'Update management team member' },
  { name: 'Delete Management', slug: 'management.delete', module: 'management', description: 'Delete management team member' },

  // ── Management Categories ────────────────────────────────────────
  { name: 'View Management Categories', slug: 'management_categories.read', module: 'management', description: 'View management categories' },
  { name: 'Create Management Category', slug: 'management_categories.create', module: 'management', description: 'Create management category' },
  { name: 'Update Management Category', slug: 'management_categories.update', module: 'management', description: 'Update management category' },
  { name: 'Delete Management Category', slug: 'management_categories.delete', module: 'management', description: 'Delete management category' },

  // ── Contact Submissions ──────────────────────────────────────────
  { name: 'View Contacts', slug: 'contact_submissions.read', module: 'contact_submissions', description: 'View contact submissions' },
  { name: 'Reply Contact', slug: 'contact_submissions.reply', module: 'contact_submissions', description: 'Reply to contact submission' },
  { name: 'Delete Contact', slug: 'contact_submissions.delete', module: 'contact_submissions', description: 'Delete contact submission' },

  // ── Files ────────────────────────────────────────────────────────
  { name: 'View Files', slug: 'files.read', module: 'files', description: 'View file list' },
  { name: 'Upload File', slug: 'files.create', module: 'files', description: 'Upload new file' },
  { name: 'Update File', slug: 'files.update', module: 'files', description: 'Update file metadata' },
  { name: 'Delete File', slug: 'files.delete', module: 'files', description: 'Delete file' },

  // ── Folders ──────────────────────────────────────────────────────
  { name: 'View Folders', slug: 'folders.read', module: 'files', description: 'View folder structure' },
  { name: 'Create Folder', slug: 'folders.create', module: 'files', description: 'Create new folder' },
  { name: 'Update Folder', slug: 'folders.update', module: 'files', description: 'Update folder' },
  { name: 'Delete Folder', slug: 'folders.delete', module: 'files', description: 'Delete folder' },

  // ── Activity Logs ────────────────────────────────────────────────
  { name: 'View Activity Logs', slug: 'log_activity.read', module: 'log_activity', description: 'View activity logs' },
  { name: 'Delete Activity Logs', slug: 'log_activity.delete', module: 'log_activity', description: 'Delete activity logs' },

  // ── URL Redirections ─────────────────────────────────────────────
  { name: 'View URL Redirections', slug: 'url_redirection.read', module: 'url_redirection', description: 'View URL redirections' },
  { name: 'Create URL Redirection', slug: 'url_redirection.create', module: 'url_redirection', description: 'Create URL redirection' },
  { name: 'Update URL Redirection', slug: 'url_redirection.update', module: 'url_redirection', description: 'Update URL redirection' },
  { name: 'Delete URL Redirection', slug: 'url_redirection.delete', module: 'url_redirection', description: 'Delete URL redirection' },

  // ── Form Modules ─────────────────────────────────────────────────
  { name: 'View Form Modules', slug: 'form_modules.read', module: 'form_modules', description: 'View form modules and submissions' },
  { name: 'Create Form Module', slug: 'form_modules.create', module: 'form_modules', description: 'Create new form module' },
  { name: 'Update Form Module', slug: 'form_modules.update', module: 'form_modules', description: 'Update existing form module' },
  { name: 'Delete Form Module', slug: 'form_modules.delete', module: 'form_modules', description: 'Delete form module' },

  // ── Form Submissions ─────────────────────────────────────────────
  { name: 'View Form Submissions', slug: 'form_submissions.read', module: 'form_submissions', description: 'View form submissions' },
  { name: 'Delete Form Submission', slug: 'form_submissions.delete', module: 'form_submissions', description: 'Delete form submission' },
];

/**
 * Seed all permissions.
 * Idempotent — uses upsert so it is safe to call multiple times.
 *
 * @param prismaClient - Optional Prisma client (uses default if omitted)
 * @returns Array of upserted Permission records
 */
export async function seedPermissions(prismaClient?: PrismaClient): Promise<Permission[]> {
  const client = prismaClient ?? prisma;

  console.log('📝 Seeding permissions...');

  const permissions = await Promise.all(
    permissionsData.map((p) =>
      client.permission.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          module: p.module,
          description: p.description,
        },
        create: p,
      }),
    ),
  );

  console.log(`✅ ${permissions.length} permissions seeded`);

  return permissions;
}

// ─── Standalone execution ───────────────────────────────────────────────────
if (require.main === module) {
  seedPermissions()
    .then((permissions) => {
      console.log('');
      console.log('📋 Modules seeded:');
      const modules = [...new Set(permissions.map((p) => p.module))].sort();
      modules.forEach((mod) => {
        const count = permissions.filter((p) => p.module === mod).length;
        console.log(`   ${mod}: ${count} permissions`);
      });
    })
    .catch((e) => {
      console.error('❌ Error seeding permissions:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
