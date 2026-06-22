/**
 * Permission Constants
 * Auto-generated permission slugs for RBAC system
 */

export const Permission = {
  // Dashboard
  DASHBOARD_READ: 'dashboard.read',

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

  // Events
  EVENTS_READ: 'events.read',
  EVENTS_CREATE: 'events.create',
  EVENTS_UPDATE: 'events.update',
  EVENTS_DELETE: 'events.delete',
  EVENTS_PUBLISH: 'events.publish',

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
  ANNOUNCEMENTS_PUBLISH: 'announcements.publish',

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
  REPORTS_PUBLISH: 'reports.publish',

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
  CAREERS_PUBLISH: 'careers.publish',

  // Awards
  AWARDS_READ: 'awards.read',
  AWARDS_CREATE: 'awards.create',
  AWARDS_UPDATE: 'awards.update',
  AWARDS_DELETE: 'awards.delete',
  AWARDS_PUBLISH: 'awards.publish',

  // Data Bank Solutions
  SOLUTIONS_READ: 'solutions.read',
  SOLUTIONS_CREATE: 'solutions.create',
  SOLUTIONS_UPDATE: 'solutions.update',
  SOLUTIONS_DELETE: 'solutions.delete',
  SOLUTIONS_PUBLISH: 'solutions.publish',

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

  // Map Coverage
  MAP_COVERAGE_READ: 'map_coverage.read',
  MAP_COVERAGE_CREATE: 'map_coverage.create',
  MAP_COVERAGE_UPDATE: 'map_coverage.update',
  MAP_COVERAGE_DELETE: 'map_coverage.delete',

  // Contact Submissions
  CONTACT_SUBMISSIONS_READ: 'contact_submissions.read',
  CONTACT_SUBMISSIONS_REPLY: 'contact_submissions.reply',
  CONTACT_SUBMISSIONS_DELETE: 'contact_submissions.delete',

  // Form Modules
  FORM_MODULES_READ: 'form_modules.read',
  FORM_MODULES_CREATE: 'form_modules.create',
  FORM_MODULES_UPDATE: 'form_modules.update',
  FORM_MODULES_DELETE: 'form_modules.delete',

  // Form Submissions
  FORM_SUBMISSIONS_READ: 'form_submissions.read',
  FORM_SUBMISSIONS_DELETE: 'form_submissions.delete',

  // Cookie Consents
  COOKIE_CONSENTS_READ: 'cookie_consents.read',
  COOKIE_CONSENTS_DELETE: 'cookie_consents.delete',
  COOKIE_CONSENTS_EXPORT: 'cookie_consents.export',

  // Component Visibility
  COMPONENT_VISIBILITY_READ: 'component_visibility.read',
  COMPONENT_VISIBILITY_CREATE: 'component_visibility.create',
  COMPONENT_VISIBILITY_UPDATE: 'component_visibility.update',
  COMPONENT_VISIBILITY_DELETE: 'component_visibility.delete',
  COMPONENT_VISIBILITY_SYNC: 'component_visibility.sync',

  // Label Data Bank
  LABELS_READ: 'labels.read',
  LABELS_CREATE: 'labels.create',
  LABELS_UPDATE: 'labels.update',
  LABELS_DELETE: 'labels.delete',
  LABELS_PUBLISH: 'labels.publish',

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

  // Analytics
  ANALYTICS_READ: 'analytics.read',

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

/**
 * Permission Modules
 */
export const PermissionModule = {
  DASHBOARD: 'dashboard',
  USERS_MANAGEMENT: 'users_management',
  ROLE_MANAGEMENT: 'role_management',
  SETTINGS: 'settings',
  MENU_MANAGEMENT: 'menu_management',
  PAGES: 'pages',
  NEWS: 'news',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements',
  REPORTS: 'reports',
  CAREERS: 'careers',
  AWARDS: 'awards',
  SOLUTIONS: 'solutions',
  MANAGEMENT: 'management',
  MAP_COVERAGE: 'map_coverage',
  CONTACT_SUBMISSIONS: 'contact_submissions',
  FORM_MODULES: 'form_modules',
  FORM_SUBMISSIONS: 'form_submissions',
  COOKIE_CONSENTS: 'cookie_consents',
  COMPONENT_VISIBILITY: 'component_visibility',
  LABELS: 'labels',
  FILES: 'files',
  LOG_ACTIVITY: 'log_activity',
  ANALYTICS: 'analytics',
  URL_REDIRECTION: 'url_redirection',
} as const;

export type PermissionModuleType = (typeof PermissionModule)[keyof typeof PermissionModule];

/**
 * Group permissions by module for easier management
 */
export const PermissionsByModule: Record<PermissionModuleType, PermissionSlug[]> = {
  dashboard: [Permission.DASHBOARD_READ],
  users_management: [
    Permission.USERS_MANAGEMENT_READ,
    Permission.USERS_MANAGEMENT_CREATE,
    Permission.USERS_MANAGEMENT_UPDATE,
    Permission.USERS_MANAGEMENT_DELETE,
    Permission.USERS_MANAGEMENT_TOGGLE_STATUS,
  ],
  role_management: [
    Permission.ROLE_MANAGEMENT_READ,
    Permission.ROLE_MANAGEMENT_CREATE,
    Permission.ROLE_MANAGEMENT_UPDATE,
    Permission.ROLE_MANAGEMENT_DELETE,
    Permission.ROLE_MANAGEMENT_ASSIGN_PERMISSIONS,
  ],
  settings: [Permission.SETTINGS_READ, Permission.SETTINGS_UPDATE],
  menu_management: [
    Permission.MENU_MANAGEMENT_READ,
    Permission.MENU_MANAGEMENT_CREATE,
    Permission.MENU_MANAGEMENT_UPDATE,
    Permission.MENU_MANAGEMENT_DELETE,
    Permission.MENU_MANAGEMENT_REORDER,
  ],
  pages: [
    Permission.PAGES_READ,
    Permission.PAGES_CREATE,
    Permission.PAGES_UPDATE,
    Permission.PAGES_DELETE,
    Permission.PAGES_PUBLISH,
  ],
  news: [
    Permission.NEWS_READ,
    Permission.NEWS_CREATE,
    Permission.NEWS_UPDATE,
    Permission.NEWS_DELETE,
    Permission.NEWS_PUBLISH,
    Permission.NEWS_CATEGORIES_READ,
    Permission.NEWS_CATEGORIES_CREATE,
    Permission.NEWS_CATEGORIES_UPDATE,
    Permission.NEWS_CATEGORIES_DELETE,
  ],
  events: [
    Permission.EVENTS_READ,
    Permission.EVENTS_CREATE,
    Permission.EVENTS_UPDATE,
    Permission.EVENTS_DELETE,
    Permission.EVENTS_PUBLISH,
  ],
  announcements: [
    Permission.ANNOUNCEMENTS_READ,
    Permission.ANNOUNCEMENTS_CREATE,
    Permission.ANNOUNCEMENTS_UPDATE,
    Permission.ANNOUNCEMENTS_DELETE,
    Permission.ANNOUNCEMENTS_PUBLISH,
    Permission.ANNOUNCEMENT_TYPES_READ,
    Permission.ANNOUNCEMENT_TYPES_CREATE,
    Permission.ANNOUNCEMENT_TYPES_UPDATE,
    Permission.ANNOUNCEMENT_TYPES_DELETE,
  ],
  reports: [
    Permission.REPORTS_READ,
    Permission.REPORTS_CREATE,
    Permission.REPORTS_UPDATE,
    Permission.REPORTS_DELETE,
    Permission.REPORTS_PUBLISH,
    Permission.REPORT_TYPES_READ,
    Permission.REPORT_TYPES_CREATE,
    Permission.REPORT_TYPES_UPDATE,
    Permission.REPORT_TYPES_DELETE,
  ],
  careers: [
    Permission.CAREERS_READ,
    Permission.CAREERS_CREATE,
    Permission.CAREERS_UPDATE,
    Permission.CAREERS_DELETE,
    Permission.CAREERS_PUBLISH,
  ],
  awards: [
    Permission.AWARDS_READ,
    Permission.AWARDS_CREATE,
    Permission.AWARDS_UPDATE,
    Permission.AWARDS_DELETE,
    Permission.AWARDS_PUBLISH,
  ],
  solutions: [
    Permission.SOLUTIONS_READ,
    Permission.SOLUTIONS_CREATE,
    Permission.SOLUTIONS_UPDATE,
    Permission.SOLUTIONS_DELETE,
    Permission.SOLUTIONS_PUBLISH,
  ],
  management: [
    Permission.MANAGEMENT_READ,
    Permission.MANAGEMENT_CREATE,
    Permission.MANAGEMENT_UPDATE,
    Permission.MANAGEMENT_DELETE,
    Permission.MANAGEMENT_CATEGORIES_READ,
    Permission.MANAGEMENT_CATEGORIES_CREATE,
    Permission.MANAGEMENT_CATEGORIES_UPDATE,
    Permission.MANAGEMENT_CATEGORIES_DELETE,
  ],
  map_coverage: [
    Permission.MAP_COVERAGE_READ,
    Permission.MAP_COVERAGE_CREATE,
    Permission.MAP_COVERAGE_UPDATE,
    Permission.MAP_COVERAGE_DELETE,
  ],
  contact_submissions: [
    Permission.CONTACT_SUBMISSIONS_READ,
    Permission.CONTACT_SUBMISSIONS_REPLY,
    Permission.CONTACT_SUBMISSIONS_DELETE,
  ],
  form_modules: [
    Permission.FORM_MODULES_READ,
    Permission.FORM_MODULES_CREATE,
    Permission.FORM_MODULES_UPDATE,
    Permission.FORM_MODULES_DELETE,
  ],
  form_submissions: [
    Permission.FORM_SUBMISSIONS_READ,
    Permission.FORM_SUBMISSIONS_DELETE,
  ],
  cookie_consents: [
    Permission.COOKIE_CONSENTS_READ,
    Permission.COOKIE_CONSENTS_DELETE,
    Permission.COOKIE_CONSENTS_EXPORT,
  ],
  component_visibility: [
    Permission.COMPONENT_VISIBILITY_READ,
    Permission.COMPONENT_VISIBILITY_CREATE,
    Permission.COMPONENT_VISIBILITY_UPDATE,
    Permission.COMPONENT_VISIBILITY_DELETE,
    Permission.COMPONENT_VISIBILITY_SYNC,
  ],
  labels: [
    Permission.LABELS_READ,
    Permission.LABELS_CREATE,
    Permission.LABELS_UPDATE,
    Permission.LABELS_DELETE,
    Permission.LABELS_PUBLISH,
  ],
  files: [
    Permission.FILES_READ,
    Permission.FILES_CREATE,
    Permission.FILES_UPDATE,
    Permission.FILES_DELETE,
    Permission.FOLDERS_READ,
    Permission.FOLDERS_CREATE,
    Permission.FOLDERS_UPDATE,
    Permission.FOLDERS_DELETE,
  ],
  log_activity: [Permission.LOG_ACTIVITY_READ, Permission.LOG_ACTIVITY_DELETE],
  analytics: [Permission.ANALYTICS_READ],
  url_redirection: [
    Permission.URL_REDIRECTION_READ,
    Permission.URL_REDIRECTION_CREATE,
    Permission.URL_REDIRECTION_UPDATE,
    Permission.URL_REDIRECTION_DELETE,
  ],
};
