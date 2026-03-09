/**
 * Seed Header Menu Data
 * 
 * Seeds the menus table with header menu data that matches
 * the navbar structure from web/data/navData.js.
 * 
 * Usage: npx ts-node -r tsconfig-paths/register scripts/seed-header-menus.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubItem {
  label: string;
  url: string;
  sectionTitle?: string;
  sectionOrder?: number;
}

interface MenuItem {
  title: string;
  slug: string;
  url: string;
  type: 'LINK' | 'DROPDOWN' | 'MEGA';
  order: number;
  children?: SubItem[];
}

const headerMenus: MenuItem[] = [
  {
    title: 'Home',
    slug: 'home',
    url: '/',
    type: 'LINK',
    order: 1,
  },
  {
    title: 'About',
    slug: 'about',
    url: '/about',
    type: 'MEGA',
    order: 2,
    children: [
      // Section: Company Profile
      { label: 'Corporate Information', url: '/about/info', sectionTitle: 'Company Profile', sectionOrder: 1 },
      { label: 'Corporate Overview', url: '/about/overview', sectionTitle: 'Company Profile', sectionOrder: 1 },
      { label: 'Milestones', url: '/about/milestones', sectionTitle: 'Company Profile', sectionOrder: 1 },
      // Section: Leadership & Structure
      { label: 'Group Structures', url: '/about/group-structure', sectionTitle: 'Leadership & Structure', sectionOrder: 2 },
      { label: 'Managements', url: '/about/management', sectionTitle: 'Leadership & Structure', sectionOrder: 2 },
      { label: 'Awards', url: '/about/awards', sectionTitle: 'Leadership & Structure', sectionOrder: 2 },
    ],
  },
  {
    title: 'Business',
    slug: 'business',
    url: '/business',
    type: 'DROPDOWN',
    order: 3,
    children: [
      { label: 'Linknet Enterprise', url: '/business/enterprise', sectionTitle: '', sectionOrder: 1 },
      { label: 'Linknet Fiber', url: '/business/fiber', sectionTitle: '', sectionOrder: 1 },
      { label: 'Linknet Media', url: '/business/media', sectionTitle: '', sectionOrder: 1 },
    ],
  },
  {
    title: 'Corporate Governance',
    slug: 'governance',
    url: '/governance',
    type: 'MEGA',
    order: 4,
    children: [
      // Section: Framework & Principles
      { label: 'Structure', url: '/governance/structure', sectionTitle: 'Framework & Principles', sectionOrder: 1 },
      { label: 'Principle', url: '/governance/principle', sectionTitle: 'Framework & Principles', sectionOrder: 1 },
      { label: 'Guidance', url: '/governance/guidance', sectionTitle: 'Framework & Principles', sectionOrder: 1 },
      { label: 'Article of Association', url: '/governance/aoa', sectionTitle: 'Framework & Principles', sectionOrder: 1 },
      { label: 'Code of Conduct', url: '/governance/code-of-conduct', sectionTitle: 'Framework & Principles', sectionOrder: 1 },
      // Section: Committee & Privacy
      { label: 'Organization Structures', url: '/governance/org-structures', sectionTitle: 'Committee & Privacy', sectionOrder: 2 },
      { label: 'Board & Committe Charters', url: '/governance/charters', sectionTitle: 'Committee & Privacy', sectionOrder: 2 },
      { label: 'Data Privacy Policy', url: '/governance/privacy', sectionTitle: 'Committee & Privacy', sectionOrder: 2 },
      { label: 'GDS Policy', url: '/governance/gds', sectionTitle: 'Committee & Privacy', sectionOrder: 2 },
      // Section: Compliance & Systems
      { label: 'Whistleblowing System', url: '/governance/wbs', sectionTitle: 'Compliance & Systems', sectionOrder: 3 },
      { label: 'Whistleblowing Policy', url: '/governance/wbs-policy', sectionTitle: 'Compliance & Systems', sectionOrder: 3 },
      { label: 'ABAC Policy', url: '/governance/abac-policy', sectionTitle: 'Compliance & Systems', sectionOrder: 3 },
      { label: 'ABAC Clause', url: '/governance/abac-clause', sectionTitle: 'Compliance & Systems', sectionOrder: 3 },
      { label: 'Certified for Standarization', url: '/governance/iso', sectionTitle: 'Compliance & Systems', sectionOrder: 3 },
    ],
  },
  {
    title: 'Investor',
    slug: 'investor',
    url: '/investor',
    type: 'MEGA',
    order: 5,
    children: [
      // Section: Stock
      { label: 'Stock Price', url: '/investor/stock', sectionTitle: 'Stock', sectionOrder: 1 },
      // Section: Announcements
      { label: 'GMS Announcement', url: '/investor/gms', sectionTitle: 'Announcements', sectionOrder: 2 },
      { label: 'Emiten Announcement', url: '/investor/emiten', sectionTitle: 'Announcements', sectionOrder: 2 },
      { label: 'Public Expose Announcement', url: '/investor/public-expose', sectionTitle: 'Announcements', sectionOrder: 2 },
      // Section: Financial Data
      { label: 'Financial Statement', url: '/investor/financial', sectionTitle: 'Financial Data', sectionOrder: 3 },
      { label: 'Annual Report', url: '/investor/annual-report', sectionTitle: 'Financial Data', sectionOrder: 3 },
      { label: 'Sustainability Report', url: '/investor/sustainability-report', sectionTitle: 'Financial Data', sectionOrder: 3 },
    ],
  },
  {
    title: 'Media',
    slug: 'media',
    url: '/media',
    type: 'LINK',
    order: 6,
  },
  {
    title: 'Sustainability',
    slug: 'sustainability',
    url: '/sustainability',
    type: 'LINK',
    order: 7,
  },
  {
    title: 'Career',
    slug: 'career',
    url: '/career',
    type: 'LINK',
    order: 8,
  },
];

async function seedHeaderMenus() {
  console.log('🔄 Seeding header menus...');

  // Delete existing header menus
  await prisma.menu.deleteMany({
    where: { position: 'HEADER' },
  });
  console.log('✅ Cleared existing header menus');

  for (const menu of headerMenus) {
    // Create parent menu
    const parent = await prisma.menu.create({
      data: {
        title: menu.title,
        slug: menu.slug,
        url: menu.url,
        position: 'HEADER',
        type: menu.type,
        order: menu.order,
        isActive: true,
        createdBy: 'system',
      },
    });
    console.log(`  ✅ Created menu: ${menu.title} (id: ${parent.id})`);

    // Create children if any
    if (menu.children && menu.children.length > 0) {
      for (let i = 0; i < menu.children.length; i++) {
        const child = menu.children[i]!;
        await prisma.menu.create({
          data: {
            parentId: parent.id,
            title: child.label,
            slug: child.url.replace(/^\//, '').replace(/\//g, '-'),
            url: child.url,
            sectionTitle: child.sectionTitle || null,
            sectionOrder: child.sectionOrder || 0,
            position: 'HEADER',
            type: 'LINK',
            order: i + 1,
            isActive: true,
            createdBy: 'system',
          },
        });
      }
      console.log(`    ✅ Created ${menu.children.length} children for ${menu.title}`);
    }
  }

  console.log('\n🎉 Header menu seeding completed!');
}

seedHeaderMenus()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
