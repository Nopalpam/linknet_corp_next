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
      key: 'site_name',
      value: 'LinkNet Corporation',
      type: SettingType.STRING,
      group: 'general',
      label: 'Site Name',
      description: 'The name of your website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'site_description',
      value: 'Leading Internet Service Provider in Indonesia',
      type: SettingType.STRING,
      group: 'general',
      label: 'Site Description',
      description: 'Short description of your website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'site_logo',
      value: '/images/logo.png',
      type: SettingType.IMAGE,
      group: 'general',
      label: 'Site Logo',
      description: 'Upload your site logo',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'site_favicon',
      value: '/images/favicon.ico',
      type: SettingType.IMAGE,
      group: 'general',
      label: 'Site Favicon',
      description: 'Upload your site favicon (16x16 or 32x32)',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'timezone',
      value: 'Asia/Jakarta',
      type: SettingType.SELECT,
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
      type: SettingType.SELECT,
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
    // GROUP: CONTACT
    // ============================================
    {
      key: 'contact_email',
      value: 'info@linknet.co.id',
      type: SettingType.STRING,
      group: 'contact',
      label: 'Contact Email',
      description: 'Primary contact email address',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'contact_phone',
      value: '+62 21 1500 900',
      type: SettingType.STRING,
      group: 'contact',
      label: 'Contact Phone',
      description: 'Primary contact phone number',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'contact_address',
      value: 'Jakarta, Indonesia',
      type: SettingType.STRING,
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
      key: 'meta_title',
      value: 'LinkNet Corporation - Leading ISP in Indonesia',
      type: SettingType.STRING,
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
      type: SettingType.STRING,
      group: 'seo',
      label: 'Meta Description',
      description: 'Default meta description for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'meta_keywords',
      value: 'internet, ISP, indonesia, broadband, fiber, connectivity',
      type: SettingType.STRING,
      group: 'seo',
      label: 'Meta Keywords',
      description: 'Default meta keywords for SEO',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'google_analytics_id',
      value: '',
      type: SettingType.STRING,
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
      type: SettingType.STRING,
      group: 'email',
      label: 'SMTP Host',
      description: 'SMTP server hostname',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'smtp_port',
      value: 587,
      type: SettingType.NUMBER,
      group: 'email',
      label: 'SMTP Port',
      description: 'SMTP server port (usually 587 or 465)',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'smtp_user',
      value: '',
      type: SettingType.STRING,
      group: 'email',
      label: 'SMTP Username',
      description: 'SMTP authentication username',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'smtp_password',
      value: '',
      type: SettingType.STRING,
      group: 'email',
      label: 'SMTP Password',
      description: 'SMTP authentication password (will be encrypted)',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'from_email',
      value: 'noreply@linknet.co.id',
      type: SettingType.STRING,
      group: 'email',
      label: 'From Email',
      description: 'Default sender email address',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'from_name',
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
      key: 'enable_2fa',
      value: false,
      type: SettingType.BOOLEAN,
      group: 'features',
      label: 'Enable Two-Factor Authentication',
      description: 'Allow users to enable 2FA for their accounts',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'enable_registration',
      value: true,
      type: SettingType.BOOLEAN,
      group: 'features',
      label: 'Enable Registration',
      description: 'Allow new user registrations',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'enable_comments',
      value: true,
      type: SettingType.BOOLEAN,
      group: 'features',
      label: 'Enable Comments',
      description: 'Allow comments on news/blog posts',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'maintenance_mode',
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
      key: 'footer_logo',
      value: '/assets/logos/logo-linknet-white.svg',
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
      value: 'Jl. Setia Budi Selatan No. 1, Kuningan, Jakarta Selatan 12910, Indonesia',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Address',
      description: 'Company address displayed in the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_email',
      value: 'info@linknet.co.id',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Email',
      description: 'Contact email displayed in the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_phone',
      value: '+62 21 1500 900',
      type: SettingType.STRING,
      group: 'footer',
      label: 'Footer Phone',
      description: 'Contact phone displayed in the footer',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'footer_copyright',
      value: '© 2025 PT Link Net Tbk. All rights reserved.',
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
        { iconName: 'facebook', href: 'https://facebook.com/linknet' },
        { iconName: 'instagram', href: 'https://instagram.com/linknet' },
        { iconName: 'linkedin', href: 'https://linkedin.com/company/linknet' },
        { iconName: 'youtube', href: 'https://youtube.com/@linknet' },
        { iconName: 'twitter', href: 'https://twitter.com/linknet' },
      ],
      type: SettingType.JSON,
      group: 'footer',
      label: 'Footer Social Links',
      description: 'Social media links with icon names (JSON array of {iconName, href})',
      isPublic: true,
      isSystem: true,
    },

    // ============================================
    // GROUP: COOKIES
    // ============================================
    {
      key: 'cookies_enabled',
      value: true,
      type: SettingType.BOOLEAN,
      group: 'cookies',
      label: 'Enable Cookies Modal',
      description: 'Show or hide the cookie consent popup on the public website',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies_title',
      value: 'We use cookies',
      type: SettingType.STRING,
      group: 'cookies',
      label: 'Cookies Title',
      description: 'Title text of the cookies consent popup',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies_description',
      value: 'This website uses cookies to ensure you get the best experience on our website. By continuing to browse, you agree to our use of cookies.',
      type: SettingType.STRING,
      group: 'cookies',
      label: 'Cookies Description',
      description: 'Description text of the cookies consent popup',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies_accept_label',
      value: 'Accept',
      type: SettingType.STRING,
      group: 'cookies',
      label: 'Accept Button Label',
      description: 'Label for the accept cookies button',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies_more_info_label',
      value: 'More Info',
      type: SettingType.STRING,
      group: 'cookies',
      label: 'More Info Label',
      description: 'Label for the more info link',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies_more_info_url',
      value: '/privacy-policy',
      type: SettingType.STRING,
      group: 'cookies',
      label: 'More Info URL',
      description: 'URL the more info link points to',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'cookies_icon_url',
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
