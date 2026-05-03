import { PrismaClient, SettingType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Default settings seed data
 */
export const settingsSeed = async () => {
  console.log('🌱 Seeding settings...');

  const settings = [
    // ============================================
    // GROUP: GENERAL
    // ============================================
    {
      key: 'general_branding.site.title',
      value: { en: 'LinkNet Corporation', id: 'LinkNet Corporation' },
      type: SettingType.STRING,
      group: 'general_branding',
      label: 'Site Name',
      description: 'The name of your website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.site.description',
      value: {
        en: 'Leading Internet Service Provider in Indonesia',
        id: 'Penyedia layanan internet terkemuka di Indonesia',
      },
      type: SettingType.STRING,
      group: 'general_branding',
      label: 'Site Description',
      description: 'Short description of your website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.site.title_suffix',
      value: { en: '- PT Link Net Tbk', id: '- PT Link Net Tbk' },
      type: SettingType.STRING,
      group: 'general_branding',
      label: 'Site Title Suffix',
      description: 'Suffix appended to website page titles',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.site.address',
      value: 'Jakarta, Indonesia',
      type: SettingType.STRING,
      group: 'general_branding',
      label: 'Address',
      description: 'Primary office address used across the website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.site.slogan',
      value: 'We LINK the nation for better lives',
      type: SettingType.STRING,
      group: 'general_branding',
      label: 'Slogan',
      description: 'Primary website/company slogan used in footer and brand surfaces',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.branding.logo',
      value: '/images/logo.png',
      type: SettingType.IMAGE,
      group: 'general_branding',
      label: 'Site Logo',
      description: 'Upload your site logo',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.branding.favicon',
      value: '/images/favicon.ico',
      type: SettingType.IMAGE,
      group: 'general_branding',
      label: 'Site Favicon',
      description: 'Upload your site favicon (16x16 or 32x32)',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.site.timezone',
      value: 'Asia/Jakarta',
      type: SettingType.SELECT,
      group: 'general_branding',
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
      key: 'general_branding.site.date_format',
      value: 'DD/MM/YYYY',
      type: SettingType.SELECT,
      group: 'general_branding',
      label: 'Date Format',
      description: 'Default date format',
      isPublic: false,
      isSystem: true,
      options: {
        options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY'],
      },
    },
    {
      key: 'default_locale',
      value: 'en',
      type: SettingType.SELECT,
      group: 'general',
      label: 'Default Language',
      description: 'Default website language. The default language will not show a prefix in the URL (e.g. / instead of /en). Non-default language will have a prefix (e.g. /id).',
      isPublic: true,
      isSystem: true,
      options: {
        options: ['en', 'id'],
      },
    },

    // ============================================
    // GROUP: CONTACT
    // ============================================
    {
      key: 'contact.email',
      value: 'info@linknet.co.id',
      type: SettingType.STRING,
      group: 'contact',
      label: 'Contact Email',
      description: 'Primary contact email address',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'contact.phone_numbers',
      value: [
        { type: 'phone', label: 'Phone', number: '+62 21 1500 900' },
        { type: 'whatsapp', label: 'WhatsApp', number: '+62 21 1500 900' },
      ],
      type: SettingType.JSON,
      group: 'contact',
      label: 'Phone Numbers',
      description: 'Public phone and WhatsApp numbers shown on the website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'contact.socials',
      value: [
        { icon: 'facebook', label: 'Facebook', url: 'https://facebook.com/linknet' },
        { icon: 'twitter', label: 'X', url: 'https://twitter.com/linknet' },
        { icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/linknet' },
        { icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/linknet' },
        { icon: 'youtube', label: 'YouTube', url: 'https://youtube.com/@linknet' },
      ],
      type: SettingType.JSON,
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
      key: 'seo.meta_title',
      value: {
        en: 'LinkNet Corporation - Leading ISP in Indonesia',
        id: 'LinkNet Corporation - ISP Terkemuka di Indonesia',
      },
      type: SettingType.STRING,
      group: 'seo',
      label: 'Meta Title',
      description: 'Default meta title for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'seo.meta_description',
      value: {
        en: 'LinkNet Corporation provides high-speed internet services across Indonesia with reliable connectivity and excellent customer support.',
        id: 'LinkNet Corporation menyediakan layanan internet berkecepatan tinggi di Indonesia dengan konektivitas andal dan dukungan pelanggan terbaik.',
      },
      type: SettingType.STRING,
      group: 'seo',
      label: 'Meta Description',
      description: 'Default meta description for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'seo.meta_keywords',
      value: ['internet', 'ISP', 'indonesia', 'broadband', 'fiber', 'connectivity'],
      type: SettingType.JSON,
      group: 'seo',
      label: 'Meta Keywords',
      description: 'Default meta keywords for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'seo.thumbnail',
      value: '',
      type: SettingType.IMAGE,
      group: 'seo',
      label: 'Default Thumbnail',
      description: 'Default Open Graph thumbnail used when a page does not set one',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'analytics.google_analytics_id',
      value: '',
      type: SettingType.STRING,
      group: 'analytics',
      label: 'Google Analytics ID',
      description: 'Google Analytics tracking ID (e.g., G-XXXXXXXXXX)',
      isPublic: false,
      isSystem: true,
    },

    // ============================================
    // GROUP: EMAIL
    // ============================================
    {
      key: 'email.smtp.host',
      value: 'smtp.gmail.com',
      type: SettingType.STRING,
      group: 'email',
      label: 'SMTP Host',
      description: 'SMTP server hostname',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'email.smtp.port',
      value: 587,
      type: SettingType.NUMBER,
      group: 'email',
      label: 'SMTP Port',
      description: 'SMTP server port (usually 587 or 465)',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'email.smtp.username',
      value: '',
      type: SettingType.STRING,
      group: 'email',
      label: 'SMTP Username',
      description: 'SMTP authentication username',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'email.smtp.password',
      value: '',
      type: SettingType.STRING,
      group: 'email',
      label: 'SMTP Password',
      description: 'SMTP authentication password (will be encrypted)',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'email.from.email',
      value: 'noreply@linknet.co.id',
      type: SettingType.STRING,
      group: 'email',
      label: 'From Email',
      description: 'Default sender email address',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'email.from.name',
      value: 'LinkNet Corporation',
      type: SettingType.STRING,
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
      key: 'features.two_factor_auth',
      value: false,
      type: SettingType.BOOLEAN,
      group: 'features',
      label: 'Enable Two-Factor Authentication',
      description: 'Allow users to enable 2FA for their accounts',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'features.maintenance_mode',
      value: false,
      type: SettingType.BOOLEAN,
      group: 'features',
      label: 'Maintenance Mode',
      description: 'Put the site in maintenance mode',
      isPublic: false,
      isSystem: true,
    },

    // ============================================
    // GROUP: FOOTER
    // ============================================
    {
      key: 'footer.copyright',
      value: '© 2025 PT Link Net Tbk. All rights reserved.',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Copyright',
      description: 'Copyright text displayed at the bottom of the footer',
      isPublic: true,
      isSystem: true,
    },
    // ============================================
    // GROUP: COOKIES
    // ============================================
    {
      key: 'cookies.enabled',
      value: true,
      type: SettingType.BOOLEAN,
      group: 'cookies',
      label: 'Enable Cookies Modal',
      description: 'Show or hide the cookie consent popup on the public website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies.title',
      value: { en: 'We use cookies', id: 'Kami menggunakan cookies' },
      type: SettingType.STRING,
      group: 'cookies',
      label: 'Cookies Title',
      description: 'Title text of the cookies consent popup',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies.description',
      value: {
        en: '<p>This website uses cookies to ensure you get the best experience on our website. By continuing to browse, you agree to our use of cookies.</p>',
        id: '<p>Website ini menggunakan cookies untuk memastikan Anda mendapatkan pengalaman terbaik. Dengan melanjutkan penelusuran, Anda menyetujui penggunaan cookies.</p>',
      },
      type: SettingType.STRING,
      group: 'cookies',
      label: 'Cookies Description',
      description: 'Description text of the cookies consent popup',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies.more_info.title',
      value: { en: 'More Info', id: 'Info Selengkapnya' },
      type: SettingType.STRING,
      group: 'cookies',
      label: 'More Info Title',
      description: 'Bilingual title/label for the cookies more info link',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies.more_info.url',
      value: '/privacy-policy',
      type: SettingType.STRING,
      group: 'cookies',
      label: 'More Info URL',
      description: 'URL the more info link points to',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies.icon',
      value: '',
      type: SettingType.IMAGE,
      group: 'cookies',
      label: 'Cookies Icon',
      description: 'Optional icon/image for the cookies popup',
      isPublic: true,
      isSystem: true,
    },

    // ============================================
    // GROUP: OMNICHANNEL WIDGET
    // ============================================
    {
      key: 'omnichannel_enabled',
      value: true,
      type: SettingType.BOOLEAN,
      group: 'omnichannel',
      label: 'Enable OmniChannel Widget',
      description: 'Show or hide the floating chat widget on the public website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'omnichannel_title',
      value: "Let's start new chat\nwith our Expert Team",
      type: SettingType.STRING,
      group: 'omnichannel',
      label: 'Widget Title',
      description: 'Title text shown in the chat widget intro',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'omnichannel_subtitle',
      value: 'How can we help you today?',
      type: SettingType.STRING,
      group: 'omnichannel',
      label: 'Widget Subtitle',
      description: 'Subtitle text shown in the chat widget intro',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'omnichannel_whatsapp_url',
      value: 'https://wa.me/622115000900',
      type: SettingType.STRING,
      group: 'omnichannel',
      label: 'WhatsApp URL',
      description: 'WhatsApp link for the chat widget',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'omnichannel_submit_endpoint',
      value: '',
      type: SettingType.STRING,
      group: 'omnichannel',
      label: 'Submit Endpoint',
      description: 'API endpoint to submit chat form data (leave empty to disable)',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.media_contacts.items',
      value: [
        {
          name: 'Annisa Kameila',
          role: 'Corporate Communication Specialist',
          phone: '0878 7873 4852',
          email: 'annisa.kameila@linknet.co.id',
        },
      ],
      type: SettingType.JSON,
      group: 'general_branding',
      label: 'News Media Contacts',
      description: 'Array of media contacts shown on news detail pages. Add multiple contacts with name, role, phone, and email.',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'general_branding.about.content',
      value: {
        en: '<p>PT Link Net Tbk ("Linknet", ticker code: LINK), part of Axiata Group, is committed to improving quality of life and supporting Indonesia\'s digital growth through smart and reliable technology infrastructure.</p><p>With the purpose "We LINK the nation for better lives", Linknet places customers as its priority, drives innovation and collaboration, and continues to improve sustainably.</p>',
        id: '<p>PT Link Net Tbk ("Linknet", Kode Emiten: LINK), bagian dari Axiata Group, berkomitmen untuk meningkatkan kualitas hidup masyarakat dan mendukung pertumbuhan digital Indonesia melalui penyediaan infrastruktur teknologi yang cerdas dan andal.</p><p>Dengan mengusung tujuan "We LINK the nation for better lives", Linknet senantiasa menempatkan pelanggan sebagai prioritas utama, mendorong inovasi dan kolaborasi, serta berkomitmen untuk terus melakukan perbaikan berkelanjutan.</p>',
      },
      type: SettingType.STRING,
      group: 'general_branding',
      label: 'News About Content',
      description: 'HTML content for company information on news detail pages',
      isPublic: true,
      isSystem: true,
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Seeded ${settings.length} default settings`);
};

export default settingsSeed;
