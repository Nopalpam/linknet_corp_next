/**
 * Component Default Templates
 * 
 * Rich default data for each component type, derived from web/data/components/*.js
 * Used as initial data when a component is first added in the Page Builder.
 * 
 * Field structure matches what componentMap.ts mapProps() reads from CMS settings.
 * Text fields use bilingual { en, id } format for localization support.
 */

import { DEFAULT_SECTION_INTRO } from '../../../../../../../shared/presentation/intro';

// ─── Helper ─────────────────────────────────────────────────────────

const DEFAULT_SECTION_CONFIG = {
  sectionId: '',
  className: '',
  bgImage: '',
  bgImageMobile: '',
  bgPositionClasses: '',
  bgSizeClass: '',
};

function withCommon(data: Record<string, any>): Record<string, any> {
  const {
    intro,
    introData,
    sectionIntro,
    ctaList,
    cta_list,
    ctaButtons,
    cta_buttons,
    config,
    custom_id,
    custom_class,
    bg_image,
    bg_image_mobile,
    bg_position_classes,
    bg_size_class,
    ...rest
  } = data;
  const ctaSource = ctaList || cta_list || ctaButtons || cta_buttons;
  const normalizedCtaList = Array.isArray(ctaSource)
    ? ctaSource.map((cta: Record<string, any>) => ({
        ...cta,
        label: cta.label ?? cta.text ?? '',
        text: cta.text ?? cta.label ?? '',
        href: cta.href ?? cta.url ?? cta.action ?? '',
        action: cta.action ?? cta.actionModal ?? cta.action_modal ?? '',
        iconLeft: cta.iconLeft ?? cta.icon_left ?? '',
        iconRight: cta.iconRight ?? cta.icon_right ?? cta.icon ?? '',
      }))
    : [];

  return {
    introData: {
      ...DEFAULT_SECTION_INTRO,
      ...(intro || {}),
      ...(sectionIntro || {}),
      ...(introData || {}),
    },
    ...(normalizedCtaList.length > 0 ? { ctaList: normalizedCtaList } : {}),
    ...rest,
    config: {
      ...DEFAULT_SECTION_CONFIG,
      ...(config || {}),
      sectionId: config?.sectionId ?? custom_id ?? '',
      className: config?.className ?? custom_class ?? '',
      bgImage: config?.bgImage ?? bg_image ?? '',
      bgImageMobile: config?.bgImageMobile ?? bg_image_mobile ?? '',
      bgPositionClasses: config?.bgPositionClasses ?? bg_position_classes ?? '',
      bgSizeClass: config?.bgSizeClass ?? bg_size_class ?? '',
    },
  };
}

// ─── 1. hero_section (from hero.js) ─────────────────────────────────

export const heroSectionDefaults = withCommon({
  background_image: '/assets/herosliders/mission-desktop.jpg',
  background_image_mobile: '',
  title: {
    en: 'Improving Lives and Supporting Indonesia\'s Digital Growth',
    id: 'Meningkatkan Kehidupan dan Mendukung Pertumbuhan Digital Indonesia',
  },
  description: {
    en: 'Linknet is dedicated to improving lives and supporting Indonesia\'s digital growth by delivering smart, reliable technology infrastructure.',
    id: 'Linknet berdedikasi untuk meningkatkan kehidupan dan mendukung pertumbuhan digital Indonesia melalui infrastruktur teknologi yang cerdas dan andal.',
  },
  pill_text: { en: 'Our Mission', id: 'Misi Kami' },
  ctaList: [
    {
      text: { en: 'Get to Know Us', id: 'Kenali Kami' },
      href: '/about-us',
      target: '_self',
      variant: 'primary',
      size: 'lg',
    },
  ],
  theme: 'light',
  size_hero: 'lnHero__medium',
  gradient_visible: false,
  minilogo_visible: false,
  minilogo_image: '',
});

// ─── 2. sliders_hero (from heroSliders.js + hero.js) ────────────────

export const slidersHeroDefaults = withCommon({
  slides: [
    {
      image: '/assets/herosliders/mission-desktop.jpg',
      image_mobile: '/assets/herosliders/mission-mobile.jpg',
      title: {
        en: 'Improving Lives and Supporting Indonesia\'s Digital Growth',
        id: 'Meningkatkan Kehidupan dan Mendukung Pertumbuhan Digital Indonesia',
      },
      description: {
        en: 'Linknet is dedicated to improving lives and supporting Indonesia\'s digital growth by delivering smart',
        id: 'Linknet berdedikasi untuk meningkatkan kehidupan dan mendukung pertumbuhan digital Indonesia',
      },
      ctaList: [{ text: { en: 'Get to Know Us', id: 'Kenali Kami' }, href: '/about-us', target: '_self', variant: 'primary', size: 'lg' }],
      pill_text: { en: 'Our Mission', id: 'Misi Kami' },
      indicator_label: { en: 'Indonesia\'s Digital Growth', id: 'Pertumbuhan Digital Indonesia' },
      theme: 'light',
    },
    {
      image: '/assets/herosliders/homepass-desktop.jpg',
      image_mobile: '/assets/herosliders/homepass-mobile.jpg',
      title: {
        en: 'Connecting 4 Million Homes, On Track to 8.4 Million by 2027',
        id: 'Menghubungkan 4 Juta Rumah, Menuju 8,4 Juta di 2027',
      },
      description: {
        en: 'Link Net Continues to Expand Its Digital Footprint for a Closer, More Connected Future.',
        id: 'Link Net Terus Memperluas Jejak Digital untuk Masa Depan yang Lebih Terhubung.',
      },
      ctaList: [{ text: { en: 'Get to Know Us', id: 'Kenali Kami' }, href: '/promo', target: '_self', variant: 'primary', size: 'lg' }],
      pill_text: { en: 'Our Vision', id: 'Visi Kami' },
      indicator_label: { en: '4M Homepass', id: '4 Juta Homepass' },
      theme: 'light',
    },
    {
      image: '/assets/herosliders/mt-desktop.jpg',
      image_mobile: '/assets/herosliders/mt-mobile.jpg',
      title: {
        en: 'Let\'s Join Management Trainee Generation 6',
        id: 'Bergabunglah dengan Management Trainee Generasi 6',
      },
      description: {
        en: 'Link Net Management Trainee Program is a comprehensive program that enables the organization',
        id: 'Program Management Trainee Link Net adalah program komprehensif yang memungkinkan organisasi',
      },
      ctaList: [{ text: { en: 'Apply Now', id: 'Daftar Sekarang' }, href: '/apply', target: '_self', variant: 'primary', size: 'lg' }],
      pill_text: { en: 'We\'re Hiring', id: 'Kami Merekrut' },
      indicator_label: { en: 'Management Trainee', id: 'Management Trainee' },
      theme: 'dark',
    },
  ],
  autoplay: true,
  autoplay_speed: 5000,
  theme: 'dark',
});

// ─── 3. usp_grid / AboutWithUSP (from aboutWithUSP.js) ─────────────

export const uspGridDefaults = withCommon({
  layoutVariant: 'image-on-left',
  image: {
    src: '/assets/img/sustainability/young-woman-using-phone-while-sitting-table.jpg',
    alt: 'Young business woman working at a table',
  },
  usp_variant: 'default',
  is_slider: false,
  bg_image: '/assets/bg/bg-usp-home.jpg',
  bg_image_mobile: '',
  intro: {
    label: { en: 'OUR PURPOSE', id: 'TUJUAN KAMI' },
    title: {
      en: 'We LINK the nation for better lives',
      id: 'Kami menghubungkan bangsa untuk kehidupan yang lebih baik',
    },
    description: {
      en: 'Through Hybrid Fiber Coaxial (HFC) and Fiber To The Home (FTTH) networks, Linknet provides reliable internet, multimedia, and business solutions to over 4 million homepasses in 70+ cities',
      id: 'Melalui jaringan Hybrid Fiber Coaxial (HFC) dan Fiber To The Home (FTTH), Linknet menyediakan layanan internet, multimedia, dan solusi bisnis yang andal ke lebih dari 4 juta homepass di 70+ kota',
    },
    align: 'left',
  },
  items: [
    {
      iconURL: '/assets/icons/usp/icon-homepass.svg',
      title: { en: '4M+ Homepasses', id: '4 Juta+ Homepass' },
      description: {
        en: 'Spread across more than 47 major cities',
        id: 'Tersebar di lebih dari 47 kota besar',
      },
    },
    {
      iconURL: '/assets/icons/usp/icon-business.svg',
      title: { en: '3 Pillars of Business', id: '3 Pilar Bisnis' },
      description: {
        en: 'FiberCo, EnterpriseCo, and MediaCo',
        id: 'FiberCo, EnterpriseCo, dan MediaCo',
      },
    },
  ],
  slides_per_view_desktop: 4,
  slides_per_view_mobile: 1.2,
  grid_cols_desktop: 4,
  grid_cols_mobile: 1,
  cta_list: [
    {
      text: { en: 'Get to Know Us', id: 'Kenali Kami' },
      variant: 'primary',
      size: 'lg',
      iconLeft: '',
      iconRight: 'arrow-right',
      href: '/about',
      link_type: 'url',
      action_modal: '',
    },
    {
      text: { en: 'Contact Us', id: 'Hubungi Kami' },
      variant: 'secondary-outline',
      size: 'lg',
      iconLeft: 'phone',
      iconRight: '',
      href: '/contact',
      link_type: 'url',
      action_modal: '',
    },
  ],
});

// ─── 4. usp_grid_slider / AboutValues (from aboutValues.js) ────────

export const uspGridSliderDefaults = withCommon({
  intro: {
    label: { en: 'OUR VALUES', id: 'NILAI-NILAI KAMI' },
    title: {
      en: 'Corporate Values Linknet',
      id: 'Nilai-Nilai Perusahaan Linknet',
    },
    description: {
      en: 'Our values define who we are. They inspire us to act with integrity, work as one team, and create impact through innovation and excellence.',
      id: 'Nilai-nilai kami mendefinisikan siapa kami. Mereka menginspirasi kami untuk bertindak dengan integritas, bekerja sebagai satu tim, dan menciptakan dampak melalui inovasi dan keunggulan.',
    },
    align: 'center',
  },
  items: [
    {
      logo: '/assets/icons/corporate-values/icon-customers.webp',
      title: { en: 'Obsession for Customers', id: 'Obsesi terhadap Pelanggan' },
      desc: { en: '', id: '' },
      ctaList: [],
      bodyTitle: { en: 'Key Behavior', id: 'Perilaku Utama' },
      list: [
        { icon: 'key', text: { en: 'I start with my customers in mind in every decision I make.', id: 'Saya memulai dengan pelanggan dalam setiap keputusan yang saya buat.' } },
        { icon: 'key', text: { en: 'I go the extra mile to deliver beyond customers\' expectations.', id: 'Saya berusaha lebih untuk memberikan melebihi ekspektasi pelanggan.' } },
      ],
    },
    {
      logo: '/assets/icons/corporate-values/icon-change.webp',
      title: { en: 'Courage For Change', id: 'Keberanian untuk Berubah' },
      desc: { en: '', id: '' },
      ctaList: [],
      bodyTitle: { en: 'Key Behavior', id: 'Perilaku Utama' },
      list: [
        { icon: 'key', text: { en: 'I fearlessly push boundaries and try new things', id: 'Saya tanpa rasa takut mendorong batas dan mencoba hal baru' } },
        { icon: 'key', text: { en: 'I continuously adapt and improve to get better every day.', id: 'Saya terus beradaptasi dan meningkatkan diri setiap hari.' } },
      ],
    },
    {
      logo: '/assets/icons/corporate-values/icon-collaboration.webp',
      title: { en: 'Passion For Collaboration', id: 'Semangat untuk Kolaborasi' },
      desc: { en: '', id: '' },
      ctaList: [],
      bodyTitle: { en: 'Key Behavior', id: 'Perilaku Utama' },
      list: [
        { icon: 'key', text: { en: 'I build trust in all relationships to work towards common goals.', id: 'Saya membangun kepercayaan dalam semua hubungan untuk mencapai tujuan bersama.' } },
        { icon: 'key', text: { en: 'I embrace diversity and learn from each other.', id: 'Saya menerima keberagaman dan belajar satu sama lain.' } },
      ],
    },
    {
      logo: '/assets/icons/corporate-values/icon-uncompromising-integrity.webp',
      title: { en: 'Uncompromising Integrity', id: 'Integritas Tanpa Kompromi' },
      desc: { en: '', id: '' },
      ctaList: [],
      bodyTitle: { en: 'Key Behavior', id: 'Perilaku Utama' },
      list: [
        { icon: 'key', text: { en: 'I am honest, fair, and show ethical behaviour', id: 'Saya jujur, adil, dan menunjukkan perilaku etis' } },
        { icon: 'key', text: { en: 'I am consistent and accountable for my actions.', id: 'Saya konsisten dan bertanggung jawab atas tindakan saya.' } },
      ],
    },
  ],
  slides_per_view_desktop: 4,
  slides_per_view_mobile: 1.4,
  // autoplay: true,
});

// ─── 5. about_with_marquee (from aboutRunningPhotos.js) ─────────────

export const aboutWithMarqueeDefaults = withCommon({
  intro: {
    label: { en: 'ABOUT US', id: 'TENTANG KAMI' },
    title: {
      en: 'At Linknet, we believe that First Squad has an important role in giving the best contribution in the organization.',
      id: 'Di Linknet, kami percaya bahwa First Squad memiliki peran penting dalam memberikan kontribusi terbaik dalam organisasi.',
    },
    description: {
      en: 'As First Squad, we collaborate to achieve common goals and have a positive impact on the company. So, ready to join us as First Squad?',
      id: 'Sebagai First Squad, kami berkolaborasi untuk mencapai tujuan bersama dan memberikan dampak positif bagi perusahaan. Siap bergabung sebagai First Squad?',
    },
    align: 'center',
  },
  photos: [
    { url: '/assets/photos/squad-1.jpg', alt: 'Squad 1' },
    { url: '/assets/photos/squad-2.jpg', alt: 'Squad 2' },
    { url: '/assets/photos/squad-3.jpg', alt: 'Squad 3' },
    { url: '/assets/photos/squad-4.jpg', alt: 'Squad 4' },
    { url: '/assets/photos/squad-5.jpg', alt: 'Squad 5' },
  ],
  marquee_speed: 30,
  marquee_direction: 'left',
});

// ─── 6. business_tab (from tabBusiness.js) ──────────────────────────

export const businessTabDefaults = withCommon({
  intro: {
    label: { en: 'EXPLORE OUR BUSINESS', id: 'JELAJAHI BISNIS KAMI' },
    title: {
      en: 'Driving Better Lives Through Innovation',
      id: 'Mendorong Kehidupan Lebih Baik Melalui Inovasi',
    },
    description: {
      en: 'Linknet advances Indonesia\'s digital transformation through innovative, reliable infrastructure',
      id: 'Linknet memajukan transformasi digital Indonesia melalui infrastruktur yang inovatif dan andal',
    },
    align: 'center',
  },
  tabs: [
    {
      name: { en: 'EnterpriseCo', id: 'EnterpriseCo' },
      title: {
        en: 'Seamless Connectivity, Smart ICT Solutions, and Trusted Cybersecurity',
        id: 'Konektivitas Tanpa Hambatan, Solusi ICT Cerdas, dan Keamanan Siber Terpercaya',
      },
      description: {
        en: 'We provide reliable connectivity, technology, and cybersecurity solutions to support digital transformation. With over 3,300 customers, we deliver secure, high-performance internet and ICT services for large-scale enterprises while offering reliable connectivity for SMEs.',
        id: 'Kami menyediakan konektivitas, teknologi, dan solusi keamanan siber yang andal untuk mendukung transformasi digital. Dengan lebih dari 3.300 pelanggan, kami menghadirkan layanan internet dan ICT yang aman dan berkinerja tinggi.',
      },
      background_image: '/assets/bg/bg-enterprise.jpg',
      background_image_mobile: '',
      logo_image: '/assets/logos/logo-enterprise.svg',
      cta_text: { en: 'Learn More', id: 'Selengkapnya' },
      cta_link: '/business/enterprise',
    },
    {
      name: { en: 'FiberCo', id: 'FiberCo' },
      title: {
        en: 'Your Solution for Nationwide Connectivity',
        id: 'Solusi Anda untuk Konektivitas Nasional',
      },
      description: {
        en: 'Linknet Fiber dedicated to delivering the ultimate internet experience with cutting-edge fiber optic technology that will connect Internet Service Providers (ISPs) to customers.',
        id: 'Linknet Fiber berdedikasi untuk memberikan pengalaman internet terbaik dengan teknologi fiber optic mutakhir yang menghubungkan Internet Service Provider (ISP) ke pelanggan.',
      },
      background_image: '/assets/bg/bg-fiber.jpg',
      background_image_mobile: '',
      logo_image: '/assets/logos/logo-fiberco-white.png',
      cta_text: { en: 'Learn More', id: 'Selengkapnya' },
      cta_link: '/business/fiber',
    },
    {
      name: { en: 'MediaCo', id: 'MediaCo' },
      title: {
        en: 'Your Gateway to Quality Content and Smarter Media',
        id: 'Gerbang Anda menuju Konten Berkualitas dan Media yang Lebih Cerdas',
      },
      description: {
        en: 'Premium entertainment and media solutions that bring the best content directly to your home and business.',
        id: 'Solusi hiburan dan media premium yang menghadirkan konten terbaik langsung ke rumah dan bisnis Anda.',
      },
      background_image: '/assets/bg/bg-media.jpg',
      background_image_mobile: '',
      logo_image: '/assets/logos/logo-mediaco.svg',
      cta_text: { en: 'Learn More', id: 'Selengkapnya' },
      cta_link: '/business/media',
    },
  ],
});

// ─── 7. key_highlight (from keyHighlight.js) ────────────────────────

export const keyHighlightDefaults = withCommon({
  intro: {
    label: { en: 'KEY HIGHLIGHT', id: 'SOROTAN UTAMA' },
    title: {
      en: 'Our Impact in Numbers',
      id: 'Dampak Kami dalam Angka',
    },
    description: {
      en: 'Measurable achievements that reflect our progress. From digital access and workforce diversity to environmental action.',
      id: 'Pencapaian terukur yang mencerminkan kemajuan kami. Dari akses digital dan keberagaman tenaga kerja hingga aksi lingkungan.',
    },
    align: 'left',
  },
  slides: [
    {
      image: '/assets/img/sustainability/2806.jpg',
      value: '4.07M',
      delta: '(+14.6% YoY)',
      caption: { en: 'Homes connected through open access', id: 'Rumah terhubung melalui akses terbuka' },
    },
    {
      image: '/assets/img/sustainability/young-woman-using-phone-while-sitting-table.jpg',
      value: '29.1%',
      delta: '(+4.9% YoY)',
      caption: { en: 'Women in Workforce / Leadership', id: 'Perempuan dalam Tenaga Kerja / Kepemimpinan' },
    },
    {
      image: '/assets/img/sustainability/view-green-forest-trees-with-co2.jpg',
      value: '±23,162 ton',
      delta: '(in 3 Years)',
      caption: { en: 'CO₂ Reduced (3 Years)', id: 'CO₂ Berkurang (3 Tahun)' },
    },
    {
      image: '/assets/img/sustainability/planting-trees-as-part-reforestation-process.jpg',
      value: '+12k',
      delta: 'New Trees',
      caption: { en: 'Trees planted through "New Homepass, New Tree"', id: 'Pohon ditanam melalui "Homepass Baru, Pohon Baru"' },
    },
    {
      image: '/assets/img/sustainability/20250227_095744.jpg',
      value: '232+',
      delta: '',
      caption: { en: 'Customers / communities reached through ISPs and Enterprise', id: 'Pelanggan / komunitas dijangkau melalui ISP dan Enterprise' },
    },
    {
      image: '/assets/img/sustainability/colleagues-working-together-high-angle.jpg',
      value: '20 Hours',
      delta: '',
      caption: { en: 'Workforce training hours', id: 'Jam pelatihan tenaga kerja' },
    },
  ],
});

// ─── 8. highlighting_real_initiatives (from highlightingInitiatives.js) ──

export const highlightingRealInitiativesDefaults = withCommon({
  title: {
    en: 'Highlighting Real Initiatives',
    id: 'Menyoroti Inisiatif Nyata',
  },
  description: {
    en: 'From digital literacy to environmental stewardship, that bring positive impact to communities.',
    id: 'Dari literasi digital hingga pelestarian lingkungan, yang membawa dampak positif bagi masyarakat.',
  },
  initiatives: [
    {
      title: {
        en: 'Program Lindungi Hutan | Forest Protection Program',
        id: 'Program Lindungi Hutan',
      },
      description: {
        en: 'Through tree planting as part of its CSR activities, PT Link Net Tbk not only reduces its carbon footprint but also provides long-term benefits in preserving biodiversity and improving air quality.',
        id: 'Melalui penanaman pohon sebagai bagian dari kegiatan CSR, PT Link Net Tbk tidak hanya mengurangi jejak karbon tetapi juga memberikan manfaat jangka panjang dalam melestarikan keanekaragaman hayati.',
      },
      image: '/assets/img/sustainability/20250227_095744.jpg',
      link: '#',
    },
    {
      title: {
        en: 'Link Net Supports West Java Community Health and Economic Recovery',
        id: 'Link Net Mendukung Kesehatan dan Pemulihan Ekonomi Masyarakat Jawa Barat',
      },
      description: {
        en: 'PT Link Net Tbk with the First Media brand together with the Bandung City Communication and Information Office held a Covid-19 vaccination.',
        id: 'PT Link Net Tbk dengan brand First Media bersama Dinas Komunikasi dan Informatika Kota Bandung menyelenggarakan vaksinasi Covid-19.',
      },
      image: '/assets/img/sustainability/Link-Net-Dukung-Kesehatan-dan-Pemulihan-Ekonomi-Masyarakat-Jawa-Barat.jpg',
      link: '#',
    },
  ],
  partner_text: {
    en: 'We also work with community organizations,',
    id: 'Kami juga bekerja sama dengan organisasi masyarakat,',
  },
  community_logos: [
    { url: '/assets/logos/sustainability/logo-sustainability-1.png', alt: 'Partner 1' },
    { url: '/assets/logos/sustainability/logo-sustainability-2.png', alt: 'Partner 2' },
    { url: '/assets/logos/sustainability/logo-sustainability-3.png', alt: 'Partner 3' },
    { url: '/assets/logos/sustainability/logo-sustainability-4.png', alt: 'Partner 4' },
    { url: '/assets/logos/sustainability/logo-sustainability-5.png', alt: 'Partner 5' },
  ],
  cta_list: [
    {
      text: { en: 'View All CSR Program', id: 'Lihat Semua Program CSR' },
      href: '/csr',
      variant: 'secondary-outline',
      size: 'lg',
      iconLeft: '',
      iconRight: '',
      link_type: 'url',
      action_modal: '',
    },
  ],
});

// ─── 9. info_contacts (from infoContact.js) ─────────────────────────

export const infoContactsDefaults = withCommon({
  introData: {
    as: 'h2',
    label: { en: '', id: '' },
    title: {
      en: 'Get More Information about Linknet EnterpriseCo',
      id: 'Dapatkan Informasi Lebih Lanjut tentang Linknet EnterpriseCo',
    },
    description: {
      en: 'Have questions or need more information? Our team is here to help. Reach out to us and we\'ll respond as soon as possible.',
      id: 'Punya pertanyaan atau butuh informasi lebih? Tim kami siap membantu. Hubungi kami dan kami akan merespons sesegera mungkin.',
    },
    align: 'center',
  },
  contact_items: [
    {
      type: 'website',
      icon: 'world',
      label: { en: 'Visit Website', id: 'Kunjungi Website' },
      value: 'enterprise.linknet.co.id',
      url: 'https://enterprise.linknet.co.id',
      target: '_blank',
    },
    {
      type: 'phone',
      icon: 'phone',
      label: { en: 'Call Us', id: 'Hubungi CS' },
      value: '(021) 2994 0808',
      url: 'tel:+622129940808',
    },
    {
      type: 'email',
      icon: 'mail',
      label: { en: 'Email', id: 'Email' },
      value: 'enterprise.inquiry@linknet.co.id',
      url: 'mailto:enterprise.inquiry@linknet.co.id',
    },
  ],
});

// ─── 10. information_list (from informationList.js) ─────────────────

export const informationListDefaults = withCommon({
  intro: {
    label: { en: 'MEDIA & ACTIVITIES', id: 'MEDIA & AKTIVITAS' },
    title: {
      en: 'Keep up with what\'s happening at Linknet',
      id: 'Ikuti perkembangan terbaru di Linknet',
    },
    description: { en: 'Stay Update', id: 'Tetap Update' },
    align: 'left',
  },
  info_sections: [
    {
      title: { en: 'Our Vision', id: 'Visi Kami' },
      content: {
        en: '<p>The company was founded under the name PT Seruling Indah Permai in 1996 and then changed its name to PT Linknet Tbk in 2000 with business activities in the field of trading goods and services.</p><p>The Company operates HFC and FTTH cable systems with high technology and two-way broadband services.</p>',
        id: '<p>Perusahaan didirikan dengan nama PT Seruling Indah Permai pada tahun 1996 lalu berganti nama menjadi PT Linknet Tbk pada tahun 2000 dengan kegiatan usaha di bidang perdagangan barang dan jasa.</p>',
      },
      related_articles: [
        {
          articleName: { en: 'Linknet Successfully Completed IPO On The Indonesia Stock Exchange (IDX)', id: 'Linknet Berhasil Menyelesaikan IPO di Bursa Efek Indonesia (BEI)' },
          source: 'manual',
          articleId: '',
          url: '#',
        },
        {
          articleName: { en: 'Rebranding of OTT Service From "First Media Live" To "First Media Go"', id: 'Rebranding Layanan OTT Dari "First Media Live" Menjadi "First Media Go"' },
          source: 'manual',
          articleId: '',
          url: '#',
        },
      ],
      documents: [
        {
          documentName: { en: 'Anti-Bribery and Anti-Corruption Policy', id: 'Kebijakan Anti-Penyuapan dan Anti-Korupsi' },
          subDesc: 'February 26, 2025',
          url: '#',
        },
      ],
      ctaList: [],
    },
    {
      title: { en: 'About Linknet', id: 'Tentang Linknet' },
      content: {
        en: '<p>Linknet is dedicated to improving lives and supporting Indonesia\'s digital growth by delivering smart, reliable technology infrastructure through its three main business units.</p>',
        id: '<p>Linknet berdedikasi untuk meningkatkan kehidupan dan mendukung pertumbuhan digital Indonesia melalui infrastruktur teknologi yang cerdas dan andal melalui tiga unit bisnis utamanya.</p>',
      },
      related_articles: [],
      documents: [],
      ctaList: [],
    },
  ],
});

// ─── 11. join_first_squad (from joinFirstSquad.js) ──────────────────

export const joinFirstSquadDefaults = withCommon({
  title: {
    en: 'Continuous Growth and Stability: A Grateful Journey at Linknet',
    id: 'Pertumbuhan dan Stabilitas Berkelanjutan: Perjalanan Penuh Syukur di Linknet',
  },
  slides: [
    {
      image: '/assets/photos/thumb/fs.png',
      title: { en: 'First Squad', id: 'First Squad' },
      description: {
        en: 'At Linknet, First Squad will contribute in providing the best experience for all of our customers. Let\'s join a company that sees potential and supports the development of every individual in it.',
        id: 'Di Linknet, First Squad akan berkontribusi dalam memberikan pengalaman terbaik bagi semua pelanggan kami. Bergabunglah dengan perusahaan yang melihat potensi dan mendukung pengembangan setiap individu.',
      },
      ctaList: [{ text: { en: 'Join as a First Squad', id: 'Bergabung sebagai First Squad' }, href: '#first-squad', target: '_self', variant: 'secondary-outline', size: 'lg' }],
    },
    {
      image: '/assets/photos/thumb/mt.png',
      title: { en: 'Management Trainee', id: 'Management Trainee' },
      description: {
        en: 'Every year, Linknet recruits the best graduates through the Management Trainee (MT) program. MT will be equipped with a comprehensive program and receive the best development program.',
        id: 'Setiap tahun, Linknet merekrut lulusan terbaik melalui program Management Trainee (MT). MT akan dibekali program komprehensif dan mendapatkan program pengembangan terbaik.',
      },
      ctaList: [{ text: { en: 'Join as a Management Trainee', id: 'Bergabung sebagai Management Trainee' }, href: '#management-trainee', target: '_self', variant: 'secondary-outline', size: 'lg' }],
    },
    {
      image: '/assets/photos/thumb/intern.png',
      title: { en: 'First Squad Intern', id: 'First Squad Intern' },
      description: {
        en: 'Start your career journey as a First Squad Intern at Linknet. You will have the opportunity to learn, contribute and develop your knowledge professionally.',
        id: 'Mulailah perjalanan karir Anda sebagai First Squad Intern di Linknet. Anda akan memiliki kesempatan untuk belajar, berkontribusi, dan mengembangkan pengetahuan secara profesional.',
      },
      ctaList: [{ text: { en: 'See Internship Openings', id: 'Lihat Lowongan Magang' }, href: '#first-squad-intern', target: '_self', variant: 'secondary-outline', size: 'lg' }],
    },
  ],
});

// ─── 12. vision_mission (from visionMission.js) ────────────────────

export const visionMissionDefaults = withCommon({
  introData: {
    as: 'h2',
    label: { en: '', id: '' },
    title: {
      en: 'Our Vision & Mission',
      id: 'Visi & Misi Kami',
    },
    description: { en: '', id: '' },
    align: 'center',
  },
  items: [
    {
      id: 'vision',
      label: { en: 'OUR VISION', id: 'VISI KAMI' },
      title: {
        en: 'By 2027, to be the 1st choice in every business we do.',
        id: 'Pada 2027, menjadi pilihan pertama di setiap bisnis yang kami lakukan.',
      },
      description: {
        en: '*Through the 4C\'s (Coverage, Capability, Cost, Capacity)',
        id: '*Melalui 4C (Coverage, Capability, Cost, Capacity)',
      },
      image: '/assets/images/vision-wind.jpg',
      align: 'left',
    },
    {
      id: 'mission',
      label: { en: 'OUR MISSION', id: 'MISI KAMI' },
      title: {
        en: 'To transform lives by providing innovative and exceptional broadband and media services and solutions.',
        id: 'Mentransformasi kehidupan dengan menyediakan layanan dan solusi broadband serta media yang inovatif dan luar biasa.',
      },
      description: { en: '', id: '' },
      image: '/assets/images/mission-city.jpg',
      align: 'right',
    },
  ],
});

// ─── 13. maps_coverage (from mapsCoverage.js) ───────────────────────

export const mapsCoverageDefaults = withCommon({
  title: {
    en: 'Linknet continues to expand its reach to serve more cities in Indonesia',
    id: 'Linknet terus memperluas jangkauan untuk melayani lebih banyak kota di Indonesia',
  },
  description: { en: '', id: '' },
  show_search: true,
  show_legend: true,
  default_province: '',
  widget: {
    instruction_text: {
      en: 'Click on a province on the map',
      id: 'Klik pada provinsi di peta',
    },
    status_covered: {
      en: 'Area Covered',
      id: 'Area Tercakup',
    },
    status_not_covered: {
      en: 'Area Not Covered',
      id: 'Area Belum Tercakup',
    },
    title: {
      en: 'Coverage Details',
      id: 'Detail Jangkauan',
    },
    region_label: {
      en: 'Area',
      id: 'Wilayah',
    },
    search_placeholder: {
      en: 'Search city',
      id: 'Cari kota',
    },
    no_city_found: {
      en: 'No cities found.',
      id: 'Kota tidak ditemukan.',
    },
    cta_text: {
      en: 'Get a Free Quote',
      id: 'Dapatkan Penawaran Gratis',
    },
    not_covered_message: {
      en: 'Sorry. Linknet hasn\'t reached this area yet. Follow us on Instagram @linknetfiber.id for updates when we cover this area.',
      id: 'Maaf. Linknet belum menjangkau area ini. Ikuti kami di Instagram @linknetfiber.id untuk update kapan kami menjangkau area ini.',
    },
  },
});

// ─── 14. milestone (from milestone.js) ──────────────────────────────

export const milestoneDefaults = withCommon({
  title: {
    en: 'Our track record proves on how we innovate in the past 20 years.',
    id: 'Rekam jejak kami membuktikan bagaimana kami berinovasi dalam 20 tahun terakhir.',
  },
  milestones: [
    {
      year: '1996',
      image: '/assets/bg/bg-yellow-gradient.jpg',
      description: {
        en: 'Establishment of the company under the name PT Seruling Indah Permai',
        id: 'Pendirian perusahaan dengan nama PT Seruling Indah Permai',
      },
      list: [],
    },
    {
      year: '2000',
      image: '/assets/bg/bg-yellow-gradient.jpg',
      description: {
        en: 'Name change to PT Link Net, launch of Mynet Broadband Internet Service and Digital1',
        id: 'Perubahan nama menjadi PT Link Net, peluncuran Layanan Internet Broadband Mynet dan Digital1',
      },
      list: [],
    },
    {
      year: '2007',
      image: '/assets/bg/bg-yellow-gradient.jpg',
      description: {
        en: 'Acquired by PT First Media Tbk',
        id: 'Diakuisisi oleh PT First Media Tbk',
      },
      list: [],
    },
    {
      year: '2008',
      image: '/assets/bg/bg-yellow-gradient.jpg',
      description: {
        en: 'Major technology milestones achieved',
        id: 'Pencapaian teknologi besar tercapai',
      },
      list: [
        { text: { en: 'Launched HD', id: 'Meluncurkan HD' } },
        { text: { en: 'New Network Roll Out', id: 'Perluasan Jaringan Baru' } },
        { text: { en: 'Launched Video On Demand Services', id: 'Meluncurkan Layanan Video On Demand' } },
      ],
    },
    {
      year: '2011',
      image: '/assets/bg/bg-yellow-gradient.jpg',
      description: {
        en: 'Another major milestone in our growth journey.',
        id: 'Pencapaian besar lainnya dalam perjalanan pertumbuhan kami.',
      },
      list: [],
    },
  ],
});

// ─── 15. awards_marquee (from AwardsSneakPeek.js) ──────────────────

export const awardsMarqueeDefaults = withCommon({
  intro: {
    label: { en: 'ACHIEVEMENTS & RECOGNITIONS', id: 'PENGHARGAAN & PENGAKUAN' },
    title: {
      en: 'Penghargaan yang Menandai Perjalanan Kami',
      id: 'Penghargaan yang Menandai Perjalanan Kami',
    },
    description: { en: '', id: '' },
    align: 'center',
  },
  award_ids: [],
  cta_text: { en: 'View All Awards', id: 'Lihat Semua Penghargaan' },
  cta_link: '/about-us/awards',
  cta_variant: 'primary',
  cta_size: 'lg',
  cta_link_type: 'url',
  cta_target: '_self',
  cta_action_modal: '',
  cta_icon_left: '',
  cta_icon_right: '',
});

// ─── 16. news_highlight (from newsFeatured.js) ──────────────────────

export const newsHighlightDefaults = withCommon({
  source: 'cms_highlights',
  news_ids: [],
  limit: 5,
  introData: {
    as: 'h2',
    label: { en: 'MEDIA & ACTIVITIES', id: 'MEDIA & AKTIVITAS' },
    title: {
      en: 'Keep up with what\'s happening at Linknet',
      id: 'Ikuti perkembangan terbaru di Linknet',
    },
    description: { en: '', id: '' },
    align: 'left',
  },
  featured_count: 1,
  grid_count: 4,
  sort_by: 'news_date',
  sort_direction: 'desc',
  show_category: true,
  show_date: true,
  cta_text: { en: 'See More', id: 'Lihat Lainnya' },
  cta_link: '/news',
  cta_variant: 'primary',
  cta_size: 'lg',
  cta_link_type: 'url',
  cta_target: '_self',
  cta_action_modal: '',
  cta_icon_left: '',
  cta_icon_right: '',
});

// ─── 17. news_list (from newsFeed.js + newsTeaser.js) ───────────────

export const newsListDefaults = withCommon({
  introData: {
    as: 'h2',
    label: { en: '', id: '' },
    title: {
    en: 'All News & Updates',
    id: 'Semua Berita & Pembaruan',
  },
    description: { en: '', id: '' },
    align: 'left',
  },
  category_id: '',
  limit: 12,
  sort_by: 'news_date',
  sort_direction: 'desc',
  show_pagination: true,
  show_search: true,
  show_category_filter: true,
  layout: 'grid',
  card_style: 'default',
  display_image: true,
  display_description: true,
  show_date: true,
  show_category: true,
  cta_text: { en: 'View All News', id: 'Lihat Semua Berita' },
  cta_link: '/news',
  cta_variant: 'primary',
  cta_size: 'lg',
  cta_link_type: 'url',
  cta_target: '_self',
  cta_action_modal: '',
  cta_icon_left: '',
  cta_icon_right: '',
});

// ─── 18. career_highlight (from careerSneakPeek.js) ────────────────

export const careerHighlightDefaults = withCommon({
  title: {
    en: 'Let\'s join Linknet and become First Squad, now!',
    id: 'Bergabunglah dengan Linknet dan jadilah First Squad, sekarang!',
  },
  description: {
    en: 'Let\'s Discover Possibilities Together',
    id: 'Mari Temukan Kemungkinan Bersama',
  },
  max_display: 8,
  show_department: true,
  show_location: true,
  cta_text: { en: 'Discover More', id: 'Temukan Lebih' },
  cta_link: '/career',
  cta_variant: 'primary',
  cta_size: 'lg',
  cta_link_type: 'url',
  cta_target: '_self',
  cta_action_modal: '',
  cta_icon_left: '',
  cta_icon_right: '',
});

// ─── 19. career_list ────────────────────────────────────────────────

export const careerListDefaults = withCommon({
  intro: {
    label: { en: '', id: '' },
    title: {
      en: 'Open Positions',
      id: 'Posisi Terbuka',
    },
    description: { en: '', id: '' },
    align: 'left',
  },
  show_search: true,
  show_department_filter: true,
  show_location_filter: true,
  show_type_filter: true,
  show_pagination: true,
  per_page: 10,
});

// ─── 20. management_list (from managementCategory.js) ───────────────

export const managementListDefaults = withCommon({
  title: {
    en: 'Management',
    id: 'Manajemen',
  },
  show_bio: true,
  show_photo: true,
  layout: 'grid',
  columns: 4,
  group_by_category: true,
});

// ─── 21. report_list (from listReportHome.js + reportGrid.js) ───────

export const reportListDefaults = withCommon({
  introData: {
    as: 'h2',
    label: { en: '', id: '' },
    title: {
    en: 'Performance Transparency & Corporate Announcements',
    id: 'Transparansi Kinerja & Pengumuman Perusahaan',
  },
    description: { en: '', id: '' },
    align: 'left',
  },
  report_type_id: '',
  report_section_id: '',
  limit: 12,
  sort_by: 'year',
  sort_direction: 'desc',
  show_year_filter: true,
  show_type_filter: true,
  show_section_filter: true,
  show_search: true,
  layout: 'grid',
  card_style: 'default',
  display_image: true,
  display_description: true,
  show_pagination: true,
});

// ─── 22. awards_list (from awardsFeed.js) ───────────────────────────

export const awardsListDefaults = withCommon({
  intro: {
    label: { en: 'ACHIEVEMENTS & RECOGNITIONS', id: 'PENGHARGAAN & PENGAKUAN' },
    title: {
      en: 'Our Awards & Milestones',
      id: 'Penghargaan & Pencapaian Kami',
    },
    description: {
      en: 'Discover the industry recognitions and awards that highlight our commitment to excellence, innovation, and customer satisfaction.',
      id: 'Temukan berbagai penghargaan industri yang menandai komitmen kami terhadap keunggulan, inovasi, dan kepuasan pelanggan.',
    },
    align: 'center',
  },
  show_year_filter: true,
  show_image: true,
  show_pagination: true,
  columns: 3,
  limit: 9,
  sort_by: 'issue_date',
  sort_direction: 'desc',
});

// ─── 23. announcement_list ──────────────────────────────────────────

export const announcementListDefaults = withCommon({
  introData: {
    as: 'h2',
    label: { en: '', id: '' },
    title: {
    en: 'Announcements',
    id: 'Pengumuman',
  },
    description: { en: '', id: '' },
    align: 'left',
  },
  announcement_type_id: '',
  announcement_section_id: '',
  latest_only: false,
  limit: 10,
  sort_by: 'created_at',
  sort_direction: 'desc',
  layout: 'list',
  card_style: 'document',
  show_publish_date: true,
  show_cta: true,
  show_type_filter: true,
  show_section_filter: true,
  show_year_filter: true,
  show_search: true,
  show_pagination: true,
});

// ─── Export all templates as a lookup map ────────────────────────────

export const COMPONENT_DEFAULT_TEMPLATES: Record<string, Record<string, any>> = {
  hero_section: heroSectionDefaults,
  sliders_hero: slidersHeroDefaults,
  usp_grid: uspGridDefaults,
  usp_grid_slider: uspGridSliderDefaults,
  about_with_marquee: aboutWithMarqueeDefaults,
  business_tab: businessTabDefaults,
  key_highlight: keyHighlightDefaults,
  highlighting_real_initiatives: highlightingRealInitiativesDefaults,
  info_contacts: infoContactsDefaults,
  information_list: informationListDefaults,
  join_first_squad: joinFirstSquadDefaults,
  vision_mission: visionMissionDefaults,
  maps_coverage: mapsCoverageDefaults,
  milestone: milestoneDefaults,
  awards_marquee: awardsMarqueeDefaults,
  news_highlight: newsHighlightDefaults,
  news_list: newsListDefaults,
  career_highlight: careerHighlightDefaults,
  career_list: careerListDefaults,
  management_list: managementListDefaults,
  report_list: reportListDefaults,
  awards_list: awardsListDefaults,
  announcement_list: announcementListDefaults,
};
