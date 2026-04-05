import { PrismaClient, SettingType, MenuPosition, MenuType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Footer Seed — Menambahkan data footer settings + footer menus
 * 
 * Data sesuai dengan referensi dari web_static_reference:
 * - Logo, slogan, address, contact, copyright, socials
 * - 3 menu groups: COMPANY, INVESTOR, PLATFORM
 */
async function seedFooter() {
  console.log('🦶 Starting footer data seeding...');

  // ============================================
  // 1. FOOTER SETTINGS
  // ============================================
  console.log('⚙️  Seeding footer settings...');

  const footerSettings = [
    {
      key: 'footer_logo',
      value: '/assets/logos/linknet-logo.svg',
      type: SettingType.IMAGE,
      group: 'footer',
      label: 'Footer Logo',
      description: 'Logo displayed in the footer area',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_slogan',
      value: 'We LINK the nation for better lives',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Slogan',
      description: 'Tagline displayed below the footer logo',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_address',
      value: 'Centennial Tower Lantai 26, Unit D. Jl. Jenderal Gatot Subroto Kav. 24-25. Jakarta 12930, Indonesia.',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Address',
      description: 'Company address displayed in the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_email',
      value: 'corporate.secretary@linknet.co.id',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Email',
      description: 'Contact email displayed in the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_phone',
      value: '021-29536800',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Phone',
      description: 'Contact phone displayed in the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_copyright',
      value: 'Copyright © 1996 - 2025 PT Link Net Tbk. All Right Reserved.',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Copyright',
      description: 'Copyright text displayed at the bottom of the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_socials',
      value: [
        { iconName: 'instagram', href: 'https://instagram.com/linkaboratory' },
        { iconName: 'youtube', href: 'https://youtube.com/@linknet' },
      ],
      type: SettingType.JSON,
      group: 'footer',
      label: 'Footer Social Links',
      description: 'Social media links with icon names (JSON array of {iconName, href})',
      isPublic: true,
      isSystem: true,
    },

    // ============================================
    // CLOSING SENTENCE SETTINGS (untuk ClosingSentence component)
    // ============================================
    {
      key: 'closing_overline',
      value: 'Discover Linknet',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Closing Overline',
      description: 'Overline text for closing CTA section',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'closing_title',
      value: 'Your Trusted Digital Infrastructure Partner',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Closing Title',
      description: 'Title text for closing CTA section',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'closing_description',
      value: 'Empowering businesses and communities with reliable, high-speed connectivity solutions.',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Closing Description',
      description: 'Description text for closing CTA section',
      isPublic: true,
      isSystem: true,
    },
  ];

  for (const setting of footerSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value as any,
        type: setting.type,
        group: setting.group,
        label: setting.label,
        description: setting.description,
        isPublic: setting.isPublic,
        isSystem: setting.isSystem,
      },
      create: setting,
    });
  }

  console.log(`   ✅ Seeded ${footerSettings.length} footer settings`);

  // ============================================
  // 2. FOOTER MENUS — 3 Groups sesuai static reference
  // ============================================
  console.log('📑 Seeding footer menus...');

  // Hapus footer menus yang sudah ada (agar bersih)
  await prisma.menu.deleteMany({
    where: { position: MenuPosition.FOOTER },
  });
  console.log('   🗑️  Cleared existing footer menus');

  // Group 1: COMPANY
  const companyMenu = await prisma.menu.create({
    data: {
      title: 'Company',
      sectionTitle: 'COMPANY',
      sectionOrder: 1,
      slug: 'footer-company',
      position: MenuPosition.FOOTER,
      type: MenuType.DROPDOWN,
      order: 1,
      isActive: true,
    },
  });

  const companyLinks = [
    { title: 'About Linknet', slug: 'about-us', url: '/about-us', order: 1 },
    { title: 'Management', slug: 'footer-management', url: '/management', order: 2 },
    { title: 'Awards', slug: 'footer-awards', url: '/awards', order: 3 },
    { title: 'Newsroom', slug: 'footer-newsroom', url: '/newsroom', order: 4 },
    { title: 'Career', slug: 'footer-career', url: '/career', order: 5 },
  ];

  for (const link of companyLinks) {
    await prisma.menu.create({
      data: {
        parentId: companyMenu.id,
        title: link.title,
        slug: link.slug,
        url: link.url,
        position: MenuPosition.FOOTER,
        type: MenuType.LINK,
        order: link.order,
        isActive: true,
      },
    });
  }

  // Group 2: INVESTOR
  const investorMenu = await prisma.menu.create({
    data: {
      title: 'Investor',
      sectionTitle: 'INVESTOR',
      sectionOrder: 2,
      slug: 'footer-investor',
      position: MenuPosition.FOOTER,
      type: MenuType.DROPDOWN,
      order: 2,
      isActive: true,
    },
  });

  const investorLinks = [
    { title: 'Stock Price', slug: 'footer-stock-price', url: '/investor/stock-price', order: 1 },
    { title: 'Announcement', slug: 'footer-announcement', url: '/investor/announcement', order: 2 },
    { title: 'Reports', slug: 'footer-reports', url: '/investor/reports', order: 3 },
  ];

  for (const link of investorLinks) {
    await prisma.menu.create({
      data: {
        parentId: investorMenu.id,
        title: link.title,
        slug: link.slug,
        url: link.url,
        position: MenuPosition.FOOTER,
        type: MenuType.LINK,
        order: link.order,
        isActive: true,
      },
    });
  }

  // Group 3: PLATFORM
  const platformMenu = await prisma.menu.create({
    data: {
      title: 'Platform',
      sectionTitle: 'PLATFORM',
      sectionOrder: 3,
      slug: 'footer-platform',
      position: MenuPosition.FOOTER,
      type: MenuType.DROPDOWN,
      order: 3,
      isActive: true,
    },
  });

  const platformLinks = [
    { title: 'Privacy Notice', slug: 'footer-privacy-notice', url: '/privacy-notice', order: 1 },
    { title: 'Cookies Policy', slug: 'footer-cookies-policy', url: '/cookies-policy', order: 2 },
    { title: 'Contact Us', slug: 'footer-contact', url: '/contact', order: 3 },
    { title: 'Sitemap', slug: 'footer-sitemap', url: '/sitemap', order: 4 },
  ];

  for (const link of platformLinks) {
    await prisma.menu.create({
      data: {
        parentId: platformMenu.id,
        title: link.title,
        slug: link.slug,
        url: link.url,
        position: MenuPosition.FOOTER,
        type: MenuType.LINK,
        order: link.order,
        isActive: true,
      },
    });
  }

  const totalMenus = 3 + companyLinks.length + investorLinks.length + platformLinks.length;
  console.log(`   ✅ Seeded ${totalMenus} footer menus (3 groups + ${totalMenus - 3} links)`);

  console.log('');
  console.log('🎉 Footer seeding completed!');
  console.log('');
  console.log('📋 Data yang ditambahkan:');
  console.log('   - Footer settings: logo, slogan, address, email, phone, copyright, socials');
  console.log('   - Footer menus: COMPANY (5 links), INVESTOR (3 links), PLATFORM (4 links)');
  console.log('   - Closing sentence: overline, title, description');
}

export { seedFooter };

// Allow standalone execution
if (require.main === module) {
  seedFooter()
    .catch((e) => {
      console.error('❌ Error seeding footer:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
