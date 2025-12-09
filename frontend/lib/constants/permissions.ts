/**
 * Permission Constants for Frontend
 * Auto-generated permission slugs for RBAC system
 */

export const Permission = {
  // User Management
  USERS_MANAGEMENT_READ: 'users_management.read',
  USERS_MANAGEMENT_CREATE: 'users_management.create',
  USERS_MANAGEMENT_UPDATE: 'users_management.update',
  USERS_MANAGEMENT_DELETE: 'users_management.delete',
  USERS_MANAGEMENT_TOGGLE_STATUS: 'users_management.toggle_status',

  // Role Management
  ROLE_MANAGEMENT_READ: 'role_management.read',
  ROLE_MANAGEMENT_CREATE: 'role_management.create',
  ROLE_MANAGEMENT_UPDATE: 'role_management.update',
  ROLE_MANAGEMENT_DELETE: 'role_management.delete',
  ROLE_MANAGEMENT_ASSIGN_PERMISSIONS: 'role_management.assign_permissions',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',

  // Menu Management
  MENU_MANAGEMENT_READ: 'menu_management.read',
  MENU_MANAGEMENT_CREATE: 'menu_management.create',
  MENU_MANAGEMENT_UPDATE: 'menu_management.update',
  MENU_MANAGEMENT_DELETE: 'menu_management.delete',
  MENU_MANAGEMENT_REORDER: 'menu_management.reorder',

  // Pages
  PAGES_READ: 'pages.read',
  PAGES_CREATE: 'pages.create',
  PAGES_UPDATE: 'pages.update',
  PAGES_DELETE: 'pages.delete',
  PAGES_PUBLISH: 'pages.publish',

  // News
  NEWS_READ: 'news.read',
  NEWS_CREATE: 'news.create',
  NEWS_UPDATE: 'news.update',
  NEWS_DELETE: 'news.delete',
  NEWS_PUBLISH: 'news.publish',

  // News Categories
  NEWS_CATEGORIES_READ: 'news_categories.read',
  NEWS_CATEGORIES_CREATE: 'news_categories.create',
  NEWS_CATEGORIES_UPDATE: 'news_categories.update',
  NEWS_CATEGORIES_DELETE: 'news_categories.delete',

  // Announcements
  ANNOUNCEMENTS_READ: 'announcements.read',
  ANNOUNCEMENTS_CREATE: 'announcements.create',
  ANNOUNCEMENTS_UPDATE: 'announcements.update',
  ANNOUNCEMENTS_DELETE: 'announcements.delete',

  // Announcement Types
  ANNOUNCEMENT_TYPES_READ: 'announcement_types.read',
  ANNOUNCEMENT_TYPES_CREATE: 'announcement_types.create',
  ANNOUNCEMENT_TYPES_UPDATE: 'announcement_types.update',
  ANNOUNCEMENT_TYPES_DELETE: 'announcement_types.delete',

  // Reports
  REPORTS_READ: 'reports.read',
  REPORTS_CREATE: 'reports.create',
  REPORTS_UPDATE: 'reports.update',
  REPORTS_DELETE: 'reports.delete',

  // Report Types
  REPORT_TYPES_READ: 'report_types.read',
  REPORT_TYPES_CREATE: 'report_types.create',
  REPORT_TYPES_UPDATE: 'report_types.update',
  REPORT_TYPES_DELETE: 'report_types.delete',

  // Careers
  CAREERS_READ: 'careers.read',
  CAREERS_CREATE: 'careers.create',
  CAREERS_UPDATE: 'careers.update',
  CAREERS_DELETE: 'careers.delete',

  // Awards
  AWARDS_READ: 'awards.read',
  AWARDS_CREATE: 'awards.create',
  AWARDS_UPDATE: 'awards.update',
  AWARDS_DELETE: 'awards.delete',

  // Management
  MANAGEMENT_READ: 'management.read',
  MANAGEMENT_CREATE: 'management.create',
  MANAGEMENT_UPDATE: 'management.update',
  MANAGEMENT_DELETE: 'management.delete',

  // Management Categories
  MANAGEMENT_CATEGORIES_READ: 'management_categories.read',
  MANAGEMENT_CATEGORIES_CREATE: 'management_categories.create',
  MANAGEMENT_CATEGORIES_UPDATE: 'management_categories.update',
  MANAGEMENT_CATEGORIES_DELETE: 'management_categories.delete',

  // Contact Submissions
  CONTACT_SUBMISSIONS_READ: 'contact_submissions.read',
  CONTACT_SUBMISSIONS_REPLY: 'contact_submissions.reply',
  CONTACT_SUBMISSIONS_DELETE: 'contact_submissions.delete',

  // Files
  FILES_READ: 'files.read',
  FILES_CREATE: 'files.create',
  FILES_UPDATE: 'files.update',
  FILES_DELETE: 'files.delete',

  // Folders
  FOLDERS_READ: 'folders.read',
  FOLDERS_CREATE: 'folders.create',
  FOLDERS_UPDATE: 'folders.update',
  FOLDERS_DELETE: 'folders.delete',

  // Activity Logs
  LOG_ACTIVITY_READ: 'log_activity.read',
  LOG_ACTIVITY_DELETE: 'log_activity.delete',

  // URL Redirections
  URL_REDIRECTION_READ: 'url_redirection.read',
  URL_REDIRECTION_CREATE: 'url_redirection.create',
  URL_REDIRECTION_UPDATE: 'url_redirection.update',
  URL_REDIRECTION_DELETE: 'url_redirection.delete',
} as const;

export type PermissionSlug = (typeof Permission)[keyof typeof Permission];

/**
 * Role Constants
 */
export const Role = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  USER: 'user',
} as const;

export type RoleSlug = (typeof Role)[keyof typeof Role];
