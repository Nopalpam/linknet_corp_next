import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { seedPages } from './seeds/pages.seed';
import { seedFooter } from './seeds/footer.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ============================================
  // AUTHENTICATION - Permissions
  // ============================================
  console.log('📝 Creating permissions...');
  
  const permissionsData = [
    // User Management
    { name: 'View Users', slug: 'users_management.read', module: 'users_management', description: 'View user list and details' },
    { name: 'Create User', slug: 'users_management.create', module: 'users_management', description: 'Create new user' },
    { name: 'Update User', slug: 'users_management.update', module: 'users_management', description: 'Update existing user' },
    { name: 'Delete User', slug: 'users_management.delete', module: 'users_management', description: 'Delete user' },
    { name: 'Toggle User Status', slug: 'users_management.toggle_status', module: 'users_management', description: 'Activate/deactivate user' },
    
    // Role Management
    { name: 'View Roles', slug: 'role_management.read', module: 'role_management', description: 'View role list and permissions' },
    { name: 'Create Role', slug: 'role_management.create', module: 'role_management', description: 'Create new role' },
    { name: 'Update Role', slug: 'role_management.update', module: 'role_management', description: 'Update existing role' },
    { name: 'Delete Role', slug: 'role_management.delete', module: 'role_management', description: 'Delete role' },
    { name: 'Assign Permissions', slug: 'role_management.assign_permissions', module: 'role_management', description: 'Assign permissions to roles' },
    
    // Settings Management
    { name: 'View Settings', slug: 'settings.read', module: 'settings', description: 'View system settings' },
    { name: 'Update Settings', slug: 'settings.update', module: 'settings', description: 'Update system settings' },
    
    // Menu Management
    { name: 'View Menus', slug: 'menu_management.read', module: 'menu_management', description: 'View menu list' },
    { name: 'Create Menu', slug: 'menu_management.create', module: 'menu_management', description: 'Create new menu item' },
    { name: 'Update Menu', slug: 'menu_management.update', module: 'menu_management', description: 'Update existing menu item' },
    { name: 'Delete Menu', slug: 'menu_management.delete', module: 'menu_management', description: 'Delete menu item' },
    { name: 'Reorder Menu', slug: 'menu_management.reorder', module: 'menu_management', description: 'Reorder menu items' },
    
    // Pages Management
    { name: 'View Pages', slug: 'pages.read', module: 'pages', description: 'View page list and details' },
    { name: 'Create Page', slug: 'pages.create', module: 'pages', description: 'Create new page' },
    { name: 'Update Page', slug: 'pages.update', module: 'pages', description: 'Update existing page' },
    { name: 'Delete Page', slug: 'pages.delete', module: 'pages', description: 'Delete page' },
    { name: 'Publish Page', slug: 'pages.publish', module: 'pages', description: 'Publish/unpublish page' },
    
    // News Management
    { name: 'View News', slug: 'news.read', module: 'news', description: 'View news list and details' },
    { name: 'Create News', slug: 'news.create', module: 'news', description: 'Create new news article' },
    { name: 'Update News', slug: 'news.update', module: 'news', description: 'Update existing news article' },
    { name: 'Delete News', slug: 'news.delete', module: 'news', description: 'Delete news article' },
    { name: 'Publish News', slug: 'news.publish', module: 'news', description: 'Publish/unpublish news article' },

    // Events Management
    { name: 'View Events', slug: 'events.read', module: 'events', description: 'View event list and details' },
    { name: 'Create Event', slug: 'events.create', module: 'events', description: 'Create new event' },
    { name: 'Update Event', slug: 'events.update', module: 'events', description: 'Update existing event' },
    { name: 'Delete Event', slug: 'events.delete', module: 'events', description: 'Delete event' },
    
    // News Categories
    { name: 'View News Categories', slug: 'news_categories.read', module: 'news', description: 'View news category list' },
    { name: 'Create News Category', slug: 'news_categories.create', module: 'news', description: 'Create new news category' },
    { name: 'Update News Category', slug: 'news_categories.update', module: 'news', description: 'Update existing news category' },
    { name: 'Delete News Category', slug: 'news_categories.delete', module: 'news', description: 'Delete news category' },
    
    // Announcements Management
    { name: 'View Announcements', slug: 'announcements.read', module: 'announcements', description: 'View announcement list' },
    { name: 'Create Announcement', slug: 'announcements.create', module: 'announcements', description: 'Create new announcement' },
    { name: 'Update Announcement', slug: 'announcements.update', module: 'announcements', description: 'Update existing announcement' },
    { name: 'Delete Announcement', slug: 'announcements.delete', module: 'announcements', description: 'Delete announcement' },
    
    // Announcement Types
    { name: 'View Announcement Types', slug: 'announcement_types.read', module: 'announcements', description: 'View announcement types' },
    { name: 'Create Announcement Type', slug: 'announcement_types.create', module: 'announcements', description: 'Create announcement type' },
    { name: 'Update Announcement Type', slug: 'announcement_types.update', module: 'announcements', description: 'Update announcement type' },
    { name: 'Delete Announcement Type', slug: 'announcement_types.delete', module: 'announcements', description: 'Delete announcement type' },
    
    // Reports Management
    { name: 'View Reports', slug: 'reports.read', module: 'reports', description: 'View report list' },
    { name: 'Create Report', slug: 'reports.create', module: 'reports', description: 'Create new report' },
    { name: 'Update Report', slug: 'reports.update', module: 'reports', description: 'Update existing report' },
    { name: 'Delete Report', slug: 'reports.delete', module: 'reports', description: 'Delete report' },
    
    // Report Types
    { name: 'View Report Types', slug: 'report_types.read', module: 'reports', description: 'View report types' },
    { name: 'Create Report Type', slug: 'report_types.create', module: 'reports', description: 'Create report type' },
    { name: 'Update Report Type', slug: 'report_types.update', module: 'reports', description: 'Update report type' },
    { name: 'Delete Report Type', slug: 'report_types.delete', module: 'reports', description: 'Delete report type' },
    
    // Careers Management
    { name: 'View Careers', slug: 'careers.read', module: 'careers', description: 'View career list and details' },
    { name: 'Create Career', slug: 'careers.create', module: 'careers', description: 'Create new career posting' },
    { name: 'Update Career', slug: 'careers.update', module: 'careers', description: 'Update existing career posting' },
    { name: 'Delete Career', slug: 'careers.delete', module: 'careers', description: 'Delete career posting' },
    
    // Awards Management
    { name: 'View Awards', slug: 'awards.read', module: 'awards', description: 'View award list' },
    { name: 'Create Award', slug: 'awards.create', module: 'awards', description: 'Create new award' },
    { name: 'Update Award', slug: 'awards.update', module: 'awards', description: 'Update existing award' },
    { name: 'Delete Award', slug: 'awards.delete', module: 'awards', description: 'Delete award' },
    
    // Management Team
    { name: 'View Management', slug: 'management.read', module: 'management', description: 'View management team list' },
    { name: 'Create Management', slug: 'management.create', module: 'management', description: 'Create management team member' },
    { name: 'Update Management', slug: 'management.update', module: 'management', description: 'Update management team member' },
    { name: 'Delete Management', slug: 'management.delete', module: 'management', description: 'Delete management team member' },
    
    // Management Categories
    { name: 'View Management Categories', slug: 'management_categories.read', module: 'management', description: 'View management categories' },
    { name: 'Create Management Category', slug: 'management_categories.create', module: 'management', description: 'Create management category' },
    { name: 'Update Management Category', slug: 'management_categories.update', module: 'management', description: 'Update management category' },
    { name: 'Delete Management Category', slug: 'management_categories.delete', module: 'management', description: 'Delete management category' },
    
    // Contact Submissions
    { name: 'View Contacts', slug: 'contact_submissions.read', module: 'contact_submissions', description: 'View contact submissions' },
    { name: 'Reply Contact', slug: 'contact_submissions.reply', module: 'contact_submissions', description: 'Reply to contact submission' },
    { name: 'Delete Contact', slug: 'contact_submissions.delete', module: 'contact_submissions', description: 'Delete contact submission' },
    
    // Files Management
    { name: 'View Files', slug: 'files.read', module: 'files', description: 'View file list' },
    { name: 'Upload File', slug: 'files.create', module: 'files', description: 'Upload new file' },
    { name: 'Update File', slug: 'files.update', module: 'files', description: 'Update file metadata' },
    { name: 'Delete File', slug: 'files.delete', module: 'files', description: 'Delete file' },
    
    // Folders Management
    { name: 'View Folders', slug: 'folders.read', module: 'files', description: 'View folder structure' },
    { name: 'Create Folder', slug: 'folders.create', module: 'files', description: 'Create new folder' },
    { name: 'Update Folder', slug: 'folders.update', module: 'files', description: 'Update folder' },
    { name: 'Delete Folder', slug: 'folders.delete', module: 'files', description: 'Delete folder' },
    
    // Activity Logs
    { name: 'View Activity Logs', slug: 'log_activity.read', module: 'log_activity', description: 'View activity logs' },
    { name: 'Delete Activity Logs', slug: 'log_activity.delete', module: 'log_activity', description: 'Delete activity logs' },
    
    // URL Redirections
    { name: 'View URL Redirections', slug: 'url_redirection.read', module: 'url_redirection', description: 'View URL redirections' },
    { name: 'Create URL Redirection', slug: 'url_redirection.create', module: 'url_redirection', description: 'Create URL redirection' },
    { name: 'Update URL Redirection', slug: 'url_redirection.update', module: 'url_redirection', description: 'Update URL redirection' },
    { name: 'Delete URL Redirection', slug: 'url_redirection.delete', module: 'url_redirection', description: 'Delete URL redirection' },
  ];

  const permissions = await Promise.all(
    permissionsData.map((permission) =>
      prisma.permission.upsert({
        where: { slug: permission.slug },
        update: {},
        create: permission,
      })
    )
  );

  console.log(`✅ Created ${permissions.length} permissions`);

  // ============================================
  // AUTHENTICATION - Roles
  // ============================================
  console.log('👥 Creating roles...');

  const superAdminRole = await prisma.role.upsert({
    where: { slug: 'super-admin' },
    update: {},
    create: {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access with all permissions',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { slug: 'admin' },
    update: {},
    create: {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access to manage content',
      isSystem: true,
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { slug: 'editor' },
    update: {},
    create: {
      name: 'Editor',
      slug: 'editor',
      description: 'Can create and edit content',
      isSystem: true,
    },
  });

  await prisma.role.upsert({
    where: { slug: 'user' },
    update: {},
    create: {
      name: 'User',
      slug: 'user',
      description: 'Basic user access',
      isSystem: true,
    },
  });

  console.log('✅ Created 4 roles');

  // ============================================
  // AUTHENTICATION - Role Permissions
  // ============================================
  console.log('🔐 Assigning permissions to roles...');

  // Super Admin gets all permissions
  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Admin gets most permissions (excluding user/role management)
  const adminPermissions = permissions.filter(
    (p) => !['users_management', 'role_management'].includes(p.module)
  );
  await Promise.all(
    adminPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  // Editor gets view and edit permissions for content
  const editorPermissions = permissions.filter(
    (p) =>
      ['pages', 'news', 'news_categories', 'announcements', 'reports', 'careers', 'awards', 'management', 'files', 'folders'].includes(p.module) &&
      !p.slug.endsWith('.delete')
  );
  await Promise.all(
    editorPermissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: editorRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: editorRole.id,
          permissionId: permission.id,
        },
      })
    )
  );

  console.log('✅ Assigned permissions to roles');

  // ============================================
  // AUTHENTICATION - Users
  // ============================================
  console.log('👤 Creating users...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Super Admin
  let superAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@linknet.co.id' },
        { username: 'superadmin' }
      ]
    }
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: 'admin@linknet.co.id',
        username: 'superadmin',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });
    console.log('   ✅ Created Super Admin user (email: admin@linknet.co.id, password: Admin123!)');
  } else {
    console.log('   ⏭️  Super Admin already exists');
  }

  // Admin
  let adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@example.com' },
        { username: 'admin' }
      ]
    }
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });
    console.log('   ✅ Created Admin user (email: admin@example.com, password: Admin123!)');
  } else {
    console.log('   ⏭️  Admin already exists');
  }

  // Editor
  let editorUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'editor@example.com' },
        { username: 'editor' }
      ]
    }
  });

  if (!editorUser) {
    editorUser = await prisma.user.create({
      data: {
        email: 'editor@example.com',
        username: 'editor',
        password: hashedPassword,
        firstName: 'Content',
        lastName: 'Editor',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });
    console.log('   ✅ Created Editor user (email: editor@example.com, password: Admin123!)');
  } else {
    console.log('   ⏭️  Editor already exists');
  }

  // Basic User
  let basicUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'user@example.com' },
        { username: 'user' }
      ]
    }
  });

  if (!basicUser) {
    basicUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        username: 'user',
        password: hashedPassword,
        firstName: 'Basic',
        lastName: 'User',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
      },
    });
    console.log('   ✅ Created Basic User (email: user@example.com, password: Admin123!)');
  } else {
    console.log('   ⏭️  Basic User already exists');
  }

  console.log('✅ Created/verified 4 users');

  // ============================================
  // AUTHENTICATION - User Roles
  // ============================================
  console.log('🔗 Assigning roles to users...');

  // Super Admin gets Super Admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole.id,
    },
  });

  // Admin gets Admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Editor gets Editor role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: editorUser.id,
        roleId: editorRole.id,
      },
    },
    update: {},
    create: {
      userId: editorUser.id,
      roleId: editorRole.id,
    },
  });

  // Basic User gets User role
  const userRole = await prisma.role.findUnique({
    where: { slug: 'user' },
  });

  if (userRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: basicUser.id,
          roleId: userRole.id,
        },
      },
      update: {},
      create: {
        userId: basicUser.id,
        roleId: userRole.id,
      },
    });
  }

  console.log('✅ Assigned roles to users');

  // ============================================
  // CORE - Settings
  // ============================================
  console.log('⚙️ Creating settings...');

  const settingsData: Array<{
    key: string;
    value: any;
    type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'IMAGE' | 'SELECT';
    group: string;
    label: string;
    description?: string;
    isPublic: boolean;
    isSystem?: boolean;
    options?: any;
  }> = [
    // ============================================
    // GROUP: GENERAL
    // ============================================
    {
      key: 'site_name',
      value: 'LinkNet Corporation',
      type: 'STRING',
      group: 'general',
      label: 'Site Name',
      description: 'The name of your website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'site_description',
      value: 'Leading Internet Service Provider in Indonesia',
      type: 'STRING',
      group: 'general',
      label: 'Site Description',
      description: 'Short description of your website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'site_logo',
      value: '/images/logo.png',
      type: 'IMAGE',
      group: 'general',
      label: 'Site Logo',
      description: 'Upload your site logo',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'site_favicon',
      value: '/images/favicon.ico',
      type: 'IMAGE',
      group: 'general',
      label: 'Site Favicon',
      description: 'Upload your site favicon (16x16 or 32x32)',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'timezone',
      value: 'Asia/Jakarta',
      type: 'SELECT',
      group: 'general',
      label: 'Timezone',
      description: 'Default timezone for the website',
      isPublic: false,
      isSystem: true,
      options: {
        options: [
          'Asia/Jakarta',
          'Asia/Singapore',
          'UTC',
          'America/New_York',
          'Europe/London',
        ],
      },
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      type: 'SELECT',
      group: 'general',
      label: 'Date Format',
      description: 'Default date format',
      isPublic: false,
      isSystem: true,
      options: {
        options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
      },
    },

    // ============================================
    // GROUP: PAGES
    // ============================================
    {
      key: 'page_preview_base_url',
      value: 'http://localhost:3000',
      type: 'STRING',
      group: 'pages',
      label: 'Page Preview Base URL',
      description: 'Base URL for previewing public pages (e.g., https://example.com). The page slug will be appended automatically.',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'page_preview_path_template',
      value: '/pages/{slug}',
      type: 'STRING',
      group: 'pages',
      label: 'Page Preview Path Template',
      description: 'URL path template for page preview. Use {slug} as placeholder. Example: /pages/{slug} or /{slug}',
      isPublic: false,
      isSystem: true,
    },

    // ============================================
    // GROUP: CONTACT
    // ============================================
    {
      key: 'contact_email',
      value: 'info@linknet.co.id',
      type: 'STRING',
      group: 'contact',
      label: 'Contact Email',
      description: 'Primary contact email address',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'contact_phone',
      value: '+62 21 1500 900',
      type: 'STRING',
      group: 'contact',
      label: 'Contact Phone',
      description: 'Primary contact phone number',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'contact_address',
      value: 'Jakarta, Indonesia',
      type: 'STRING',
      group: 'contact',
      label: 'Contact Address',
      description: 'Primary office address',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'social_media',
      value: {
        facebook: 'https://facebook.com/linknet',
        twitter: 'https://twitter.com/linknet',
        linkedin: 'https://linkedin.com/company/linknet',
        instagram: 'https://instagram.com/linknet',
        youtube: 'https://youtube.com/@linknet',
      },
      type: 'JSON',
      group: 'contact',
      label: 'Social Media Links',
      description: 'Social media URLs',
      isPublic: true,
      isSystem: true,
    },

    // ============================================
    // GROUP: SEO
    // ============================================
    {
      key: 'meta_title',
      value: 'LinkNet Corporation - Leading ISP in Indonesia',
      type: 'STRING',
      group: 'seo',
      label: 'Meta Title',
      description: 'Default meta title for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'meta_description',
      value:
        'LinkNet Corporation provides high-speed internet services across Indonesia with reliable connectivity and excellent customer support.',
      type: 'STRING',
      group: 'seo',
      label: 'Meta Description',
      description: 'Default meta description for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'meta_keywords',
      value: 'internet, ISP, indonesia, broadband, fiber, connectivity',
      type: 'STRING',
      group: 'seo',
      label: 'Meta Keywords',
      description: 'Default meta keywords for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'google_analytics_id',
      value: '',
      type: 'STRING',
      group: 'seo',
      label: 'Google Analytics ID',
      description: 'Google Analytics tracking ID (e.g., G-XXXXXXXXXX)',
      isPublic: false,
      isSystem: true,
    },

    // ============================================
    // GROUP: EMAIL
    // ============================================
    {
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      type: 'STRING',
      group: 'email',
      label: 'SMTP Host',
      description: 'SMTP server hostname',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'smtp_port',
      value: 587,
      type: 'NUMBER',
      group: 'email',
      label: 'SMTP Port',
      description: 'SMTP server port (usually 587 or 465)',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'smtp_user',
      value: '',
      type: 'STRING',
      group: 'email',
      label: 'SMTP Username',
      description: 'SMTP authentication username',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'smtp_password',
      value: '',
      type: 'STRING',
      group: 'email',
      label: 'SMTP Password',
      description: 'SMTP authentication password (will be encrypted)',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'from_email',
      value: 'noreply@linknet.co.id',
      type: 'STRING',
      group: 'email',
      label: 'From Email',
      description: 'Default sender email address',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'from_name',
      value: 'LinkNet Corporation',
      type: 'STRING',
      group: 'email',
      label: 'From Name',
      description: 'Default sender name',
      isPublic: false,
      isSystem: true,
    },

    // ============================================
    // GROUP: FEATURES
    // ============================================
    {
      key: 'enable_2fa',
      value: false,
      type: 'BOOLEAN',
      group: 'features',
      label: 'Enable Two-Factor Authentication',
      description: 'Allow users to enable 2FA for their accounts',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'enable_registration',
      value: true,
      type: 'BOOLEAN',
      group: 'features',
      label: 'Enable Registration',
      description: 'Allow new user registrations',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'enable_comments',
      value: true,
      type: 'BOOLEAN',
      group: 'features',
      label: 'Enable Comments',
      description: 'Allow comments on news/blog posts',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'maintenance_mode',
      value: false,
      type: 'BOOLEAN',
      group: 'features',
      label: 'Maintenance Mode',
      description: 'Put the site in maintenance mode',
      isPublic: false,
      isSystem: true,
    },
  ];

  await Promise.all(
    settingsData.map((setting) =>
      prisma.setting.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      })
    )
  );

  console.log(`✅ Created ${settingsData.length} settings`);

  // ============================================
  // CORE - Menus
  // ============================================
  console.log('📑 Creating menus...');

  // Header Menu
  await prisma.menu.create({
    data: {
      title: 'Home',
      translations: { en: { title: 'Home' }, id: { title: 'Beranda' } },
      slug: 'home',
      url: '/',
      order: 1,
      type: 'LINK',
      isActive: true,
    },
  });

  const aboutMenu = await prisma.menu.create({
    data: {
      title: 'About Us',
      translations: { en: { title: 'About Us' }, id: { title: 'Tentang Kami' } },
      slug: 'about',
      url: '/about',
      order: 2,
      type: 'DROPDOWN',
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      parentId: aboutMenu.id,
      title: 'Company Profile',
      translations: { en: { title: 'Company Profile' }, id: { title: 'Profil Perusahaan' } },
      slug: 'company-profile',
      url: '/about/company-profile',
      order: 1,
      type: 'LINK',
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      parentId: aboutMenu.id,
      title: 'Management',
      translations: { en: { title: 'Management' }, id: { title: 'Manajemen' } },
      slug: 'management',
      url: '/about/management',
      order: 2,
      type: 'LINK',
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      parentId: aboutMenu.id,
      title: 'Awards',
      translations: { en: { title: 'Awards' }, id: { title: 'Penghargaan' } },
      slug: 'awards',
      url: '/about/awards',
      order: 3,
      type: 'LINK',
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      title: 'News',
      translations: { en: { title: 'News' }, id: { title: 'Berita' } },
      slug: 'news',
      url: '/news',
      order: 3,
      type: 'LINK',
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      title: 'Careers',
      translations: { en: { title: 'Careers' }, id: { title: 'Karir' } },
      slug: 'careers',
      url: '/careers',
      order: 4,
      type: 'LINK',
      isActive: true,
    },
  });

  await prisma.menu.create({
    data: {
      title: 'Contact',
      translations: { en: { title: 'Contact' }, id: { title: 'Kontak' } },
      slug: 'contact',
      url: '/contact',
      order: 5,
      type: 'LINK',
      isActive: true,
    },
  });

  console.log('✅ Created menus');

  // ============================================
  // NEWS - Categories
  // ============================================
  console.log('📰 Creating news categories...');

  const newsCategories = [
    { id: crypto.randomUUID(), name_en: 'Company News', name_id: 'Berita Perusahaan', slug: 'company-news', description: 'Company announcements and updates', position: 1, is_active: true, updated_at: new Date() },
    { id: crypto.randomUUID(), name_en: 'Press Release', name_id: 'Siaran Pers', slug: 'press-release', description: 'Official press releases', position: 2, is_active: true, updated_at: new Date() },
    { id: crypto.randomUUID(), name_en: 'Events', name_id: 'Acara', slug: 'events', description: 'Company events and activities', position: 3, is_active: true, updated_at: new Date() },
    { id: crypto.randomUUID(), name_en: 'Technology', name_id: 'Teknologi', slug: 'technology', description: 'Technology news and innovations', position: 4, is_active: true, updated_at: new Date() },
  ];

  const createdCategories = await Promise.all(
    newsCategories.map((category) =>
      prisma.news_categories.create({ data: category })
    )
  );

  console.log(`✅ Created ${newsCategories.length} news categories`);

  // ============================================
  // NEWS - Sample News
  // ============================================
  console.log('📝 Creating sample news...');

  await prisma.news.create({
    data: {
      id: crypto.randomUUID(),
      title_en: 'LinkNet Expands Network Infrastructure in Jakarta',
      title_id: 'LinkNet Memperluas Infrastruktur Jaringan di Jakarta',
      slug: 'linknet-expands-network-infrastructure-jakarta',
      news_date: new Date(),
      excerpt_en: 'LinkNet announces major network expansion project to enhance connectivity across Jakarta metropolitan area.',
      excerpt_id: 'LinkNet mengumumkan proyek ekspansi jaringan besar untuk meningkatkan konektivitas di wilayah Jakarta.',
      content_en: '<p>LinkNet Corp is pleased to announce a significant expansion of our network infrastructure across the Jakarta metropolitan area. This expansion will enhance connectivity and provide better service to our customers.</p><p>The project includes installation of new fiber optic cables, upgrade of existing infrastructure, and deployment of advanced networking equipment.</p>',
      content_id: '<p>LinkNet Corp dengan bangga mengumumkan ekspansi signifikan infrastruktur jaringan kami di wilayah Jakarta. Ekspansi ini akan meningkatkan konektivitas dan memberikan layanan yang lebih baik kepada pelanggan kami.</p><p>Proyek ini mencakup instalasi kabel fiber optik baru, upgrade infrastruktur yang ada, dan penerapan peralatan jaringan canggih.</p>',
      category_id: createdCategories[0]!.id,
      status: 'PUBLISHED',
      published_at: new Date(),
      created_by_id: superAdmin.id,
      updated_at: new Date(),
      view_count: 150,
      view_count_unique: 120,
    },
  });

  await prisma.news.create({
    data: {
      id: crypto.randomUUID(),
      title_en: 'LinkNet Achieves ISO 27001 Certification',
      title_id: 'LinkNet Meraih Sertifikasi ISO 27001',
      slug: 'linknet-achieves-iso-27001-certification',
      news_date: new Date(Date.now() - 86400000),
      excerpt_en: 'LinkNet receives ISO 27001 certification for information security management systems.',
      excerpt_id: 'LinkNet menerima sertifikasi ISO 27001 untuk sistem manajemen keamanan informasi.',
      content_en: '<p>We are proud to announce that LinkNet has achieved ISO 27001 certification, demonstrating our commitment to information security and data protection.</p><p>This certification validates our comprehensive approach to managing sensitive company and customer information.</p>',
      content_id: '<p>Kami dengan bangga mengumumkan bahwa LinkNet telah meraih sertifikasi ISO 27001, menunjukkan komitmen kami terhadap keamanan informasi dan perlindungan data.</p><p>Sertifikasi ini memvalidasi pendekatan komprehensif kami dalam mengelola informasi sensitif perusahaan dan pelanggan.</p>',
      category_id: createdCategories[1]!.id,
      status: 'PUBLISHED',
      published_at: new Date(Date.now() - 86400000),
      created_by_id: superAdmin.id,
      updated_at: new Date(),
      view_count: 89,
      view_count_unique: 75,
    },
  });

  console.log('✅ Created sample news');

  // ============================================
  // DOCUMENTS - Announcement Types & Sections
  // ============================================
  console.log('📄 Creating announcement structure...');

  const announcementType = await prisma.announcementType.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Corporate Announcements',
      slug: 'corporate',
      description: 'Official corporate announcements and notices',
      icon: 'megaphone',
      color: '#0066cc',
      position: 1,
    },
  });

  await prisma.announcementSection.create({
    data: {
      id: crypto.randomUUID(),
      type_id: announcementType.id,
      name: 'General Announcements',
      slug: 'general',
      description: 'General company announcements',
      position: 1,
    },
  });

  console.log('✅ Created announcement structure');

  // ============================================
  // REPORTS - Report Types & Sections
  // ============================================
  console.log('📊 Creating report structure...');

  const reportType = await prisma.reportType.create({
    data: {
      id: crypto.randomUUID(),
      name: 'Financial Reports',
      slug: 'financial',
      description: 'Annual and quarterly financial reports',
      icon: 'chart-line',
      color: '#00aa44',
      position: 1,
    },
  });

  await prisma.reportSection.create({
    data: {
      id: crypto.randomUUID(),
      type_id: reportType.id,
      name: 'Annual Reports',
      slug: 'annual',
      description: 'Annual financial reports',
      position: 1,
    },
  });

  await prisma.reportSection.create({
    data: {
      id: crypto.randomUUID(),
      type_id: reportType.id,
      name: 'Quarterly Reports',
      slug: 'quarterly',
      description: 'Quarterly financial reports',
      position: 2,
    },
  });

  console.log('✅ Created report structure');

  // ============================================
  // HR - Management Categories
  // ============================================
  console.log('👔 Creating management categories...');

  const managementCategories = [
    { id: crypto.randomUUID(), name: 'Board of Directors', slug: 'board-of-directors', description: 'Company board of directors', position: 1, is_active: true },
    { id: crypto.randomUUID(), name: 'Executive Management', slug: 'executive-management', description: 'Executive management team', position: 2, is_active: true },
    { id: crypto.randomUUID(), name: 'Department Heads', slug: 'department-heads', description: 'Department heads and managers', position: 3, is_active: true },
  ];

  const createdManagementCategories = await Promise.all(
    managementCategories.map((category) =>
      prisma.managementCategory.create({ data: category })
    )
  );

  console.log(`✅ Created ${managementCategories.length} management categories`);

  // ============================================
  // HR - Sample Management
  // ============================================
  console.log('👨‍💼 Creating sample management...');

  await prisma.management.create({
    data: {
      id: crypto.randomUUID(),
      categoryId: createdManagementCategories[0]!.id,
      name: 'John Doe',
      slug: 'john-doe',
      positionEn: 'Chief Executive Officer',
      description: 'John has over 20 years of experience in telecommunications industry.',
      order: 1,
      is_active: true,
    },
  });

  console.log('✅ Created sample management');

  // ============================================
  // HR - Sample Career
  // ============================================
  console.log('💼 Creating sample career...');

  await prisma.career.create({
    data: {
      title: 'Senior Network Engineer',
      slug: 'senior-network-engineer',
      department: 'Engineering',
      location: 'Jakarta',
      employmentType: 'FULL_TIME',
      description: 'We are looking for an experienced Network Engineer to join our team.',
      requirements: '<ul><li>Bachelor degree in Computer Science or related field</li><li>5+ years experience in network engineering</li><li>Strong knowledge of TCP/IP, routing protocols</li></ul>',
      responsibilities: '<ul><li>Design and implement network solutions</li><li>Troubleshoot network issues</li><li>Maintain network documentation</li></ul>',
      benefits: '<ul><li>Competitive salary</li><li>Health insurance</li><li>Professional development opportunities</li></ul>',
      status: 'OPEN',
      closingDate: new Date(Date.now() + 30 * 86400000),
    },
  });

  console.log('✅ Created sample career');

  // ============================================
  // COOKIE CONSENTS - Sample Data
  // ============================================
  console.log('🍪 Creating cookie consent records...');

  const cookieConsentData = [
    {
      ipAddress: '103.76.129.42',
      os: 'Windows 10',
      browser: 'Chrome 120.0.6099.130',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.130 Safari/537.36',
      fingerprint: 'fp_a1b2c3d4e5f6',
      consentedAt: new Date('2026-03-15T08:30:00Z'),
    },
    {
      ipAddress: '182.253.194.18',
      os: 'macOS 14.2',
      browser: 'Safari 17.2',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      fingerprint: 'fp_g7h8i9j0k1l2',
      consentedAt: new Date('2026-03-16T10:15:00Z'),
    },
    {
      ipAddress: '36.68.45.112',
      os: 'Android 14',
      browser: 'Chrome Mobile 120.0',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      fingerprint: 'fp_m3n4o5p6q7r8',
      consentedAt: new Date('2026-03-17T14:45:00Z'),
    },
    {
      ipAddress: '114.124.200.55',
      os: 'iOS 17.2',
      browser: 'Safari Mobile 17.2',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      fingerprint: 'fp_s9t0u1v2w3x4',
      consentedAt: new Date('2026-03-18T09:00:00Z'),
    },
    {
      ipAddress: '103.76.129.42',
      os: 'Windows 10',
      browser: 'Firefox 121.0',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      fingerprint: 'fp_y5z6a7b8c9d0',
      consentedAt: new Date('2026-03-19T11:30:00Z'),
    },
    {
      ipAddress: '180.244.131.88',
      os: 'Windows 11',
      browser: 'Edge 120.0.2210.91',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.2210.91',
      fingerprint: 'fp_e1f2g3h4i5j6',
      consentedAt: new Date('2026-03-20T16:20:00Z'),
    },
    {
      ipAddress: '202.152.240.34',
      os: 'Linux Ubuntu',
      browser: 'Chrome 120.0.6099.130',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.130 Safari/537.36',
      fingerprint: 'fp_k7l8m9n0o1p2',
      consentedAt: new Date('2026-03-21T07:10:00Z'),
    },
    {
      ipAddress: '110.136.87.201',
      os: 'Android 13',
      browser: 'Samsung Internet 23.0',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
      fingerprint: 'fp_q3r4s5t6u7v8',
      consentedAt: new Date('2026-03-22T13:55:00Z'),
    },
    {
      ipAddress: '125.164.12.77',
      os: 'iPadOS 17.2',
      browser: 'Safari 17.2',
      device: 'Tablet',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      fingerprint: 'fp_w9x0y1z2a3b4',
      consentedAt: new Date('2026-03-23T19:40:00Z'),
    },
    {
      ipAddress: '36.80.155.63',
      os: 'macOS 14.1',
      browser: 'Chrome 120.0.6099.130',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.130 Safari/537.36',
      fingerprint: 'fp_c5d6e7f8g9h0',
      consentedAt: new Date('2026-03-24T12:05:00Z'),
    },
    {
      ipAddress: '182.253.194.18',
      os: 'Windows 10',
      browser: 'Opera 105.0',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
      fingerprint: 'fp_i1j2k3l4m5n6',
      consentedAt: new Date('2026-03-25T15:30:00Z'),
    },
    {
      ipAddress: '103.28.12.95',
      os: 'Android 14',
      browser: 'Chrome Mobile 120.0',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36',
      fingerprint: 'fp_o7p8q9r0s1t2',
      consentedAt: new Date('2026-03-26T06:45:00Z'),
    },
    {
      ipAddress: '114.124.200.55',
      os: 'Windows 11',
      browser: 'Brave 1.61',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Brave/1.61',
      fingerprint: 'fp_u3v4w5x6y7z8',
      consentedAt: new Date('2026-03-27T20:15:00Z'),
    },
    {
      ipAddress: '180.244.131.88',
      os: 'macOS 14.2',
      browser: 'Firefox 121.0',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.2; rv:121.0) Gecko/20100101 Firefox/121.0',
      fingerprint: 'fp_a9b0c1d2e3f4',
      consentedAt: new Date('2026-03-28T10:50:00Z'),
    },
    {
      ipAddress: '202.152.240.34',
      os: 'iOS 17.3',
      browser: 'Safari Mobile 17.3',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
      fingerprint: 'fp_g5h6i7j8k9l0',
      consentedAt: new Date('2026-03-29T17:25:00Z'),
    },
    {
      ipAddress: '36.68.45.112',
      os: 'Windows 10',
      browser: 'Chrome 121.0.6167.85',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.85 Safari/537.36',
      fingerprint: 'fp_m1n2o3p4q5r6',
      consentedAt: new Date('2026-03-30T08:00:00Z'),
    },
    {
      ipAddress: '125.164.12.77',
      os: 'Android 14',
      browser: 'Chrome Mobile 121.0',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.6167.101 Mobile Safari/537.36',
      fingerprint: 'fp_s7t8u9v0w1x2',
      consentedAt: new Date('2026-03-31T22:10:00Z'),
    },
    {
      ipAddress: '103.76.129.42',
      os: 'macOS 14.3',
      browser: 'Safari 17.3',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
      fingerprint: 'fp_y3z4a5b6c7d8',
      consentedAt: new Date('2026-04-01T09:35:00Z'),
    },
    {
      ipAddress: '110.136.87.201',
      os: 'Windows 11',
      browser: 'Edge 121.0.2277.83',
      device: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.2277.83',
      fingerprint: 'fp_e9f0g1h2i3j4',
      consentedAt: new Date('2026-04-01T14:50:00Z'),
    },
    {
      ipAddress: '36.80.155.63',
      os: 'Android 13',
      browser: 'Firefox Mobile 121.0',
      device: 'Mobile',
      userAgent: 'Mozilla/5.0 (Android 13; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
      fingerprint: 'fp_k5l6m7n8o9p0',
      consentedAt: new Date('2026-04-02T06:20:00Z'),
    },
  ];

  for (const consent of cookieConsentData) {
    await prisma.cookieConsent.create({ data: consent });
  }

  console.log(`✅ Created ${cookieConsentData.length} cookie consent records`);

  // ============================================
  // FILES - Sample Folder Structure
  // ============================================
  console.log('📁 Creating folder structure...');

  const imagesFolder = await prisma.folder.create({
    data: {
      name: 'Images',
      slug: 'images',
      path: '/images',
      isPublic: true,
    },
  });

  await prisma.folder.create({
    data: {
      parentId: imagesFolder.id,
      name: 'News',
      slug: 'news',
      path: '/images/news',
      isPublic: true,
    },
  });

  await prisma.folder.create({
    data: {
      name: 'Documents',
      slug: 'documents',
      path: '/documents',
      isPublic: false,
    },
  });

  console.log('✅ Created folder structure');

  // ============================================
  // PAGES - Sample Pages with Components
  // ============================================
  await seedPages();

  // ============================================
  // FOOTER - Settings + Menus
  // ============================================
  await seedFooter();

  console.log('');
  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log('   - Super Admin: admin@example.com / Admin123!');
  console.log('   - Editor: editor@example.com / Admin123!');
  console.log('   - Roles: Super Admin, Admin, Editor, User');
  console.log(`   - Permissions: ${permissions.length} permissions created`);
  console.log(`   - Settings: ${settingsData.length} settings created`);
  console.log(`   - Cookie Consents: ${cookieConsentData.length} records created`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
