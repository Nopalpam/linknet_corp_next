/**
 * PAGE BUILDER - Component Type Definitions & Default Data
 * 
 * Every component type has:
 * - type: string identifier (snake_case)
 * - name: human-readable display name
 * - description: short description
 * - icon: icon identifier for CMS
 * - category: 'basic' | 'main' (basic = JSON only, main = needs DB query)
 * - defaultData: complete default component_data ready to render
 * 
 * Common settings available on all components:
 * - introData: canonical intro section settings
 * - config: canonical advanced section config
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ComponentTypeDefinition {
  type: string;
  name: string;
  componentPath?: string;
  description: string;
  icon: string;
  category: 'basic' | 'main';
  schemaVersion?: number;
  fields?: any[];
  metadata?: Record<string, any>;
  defaultData: Record<string, any>;
}

// ============================================================================
// COMMON FIELDS (merged into every default)
// ============================================================================

const DEFAULT_SECTION_INTRO = {
  label: { en: '', id: '' },
  title: { en: '', id: '' },
  description: { en: '', id: '' },
  as: 'h2',
  align: 'left',
  fluid: false,
  labelClassName: '',
  titleClassName: '',
  descriptionClassName: '',
  className: '',
};

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
    ...rest,
  };
}

// ============================================================================
// BASIC COMPONENTS (data fully from component_data JSON)
// ============================================================================

const TEXT_BLOCK: ComponentTypeDefinition = {
  type: 'text_block',
  name: 'Text Block',
  description: 'Text section with title, description, CTA button and background options',
  icon: 'FaAlignLeft',
  category: 'basic',
  defaultData: withCommon({
    introData: {
      label: '',
      title: { en: 'Section Title', id: 'Judul Bagian' },
      description: { en: 'Section description goes here.', id: 'Deskripsi bagian di sini.' },
    },
    cta_text: { en: 'Learn More', id: 'Selengkapnya' },
    cta_link: '#',
    text_position: 'left',
  }),
};

const CKEDITOR: ComponentTypeDefinition = {
  type: 'ckeditor',
  name: 'Rich Text Editor',
  description: 'WYSIWYG HTML content block',
  icon: 'FaEdit',
  category: 'basic',
  defaultData: withCommon({
    content: '<p>Enter your content here...</p>',
    content_id: '<p>Masukkan konten Anda di sini...</p>',
  }),
};

const IMAGE: ComponentTypeDefinition = {
  type: 'image',
  name: 'Image',
  description: 'Single image with caption and optional link',
  icon: 'FaImage',
  category: 'basic',
  defaultData: withCommon({
    image_url: '',
    alt_text: 'Image',
    caption: '',
    link_url: '',
    alignment: 'center',
  }),
};

const HERO_SECTION: ComponentTypeDefinition = {
  type: 'hero_section',
  name: 'Hero Static',
  componentPath: '@/components/main/HeroStatic',
  description: 'Full-width hero banner with background image, title, and CTA',
  icon: 'FaStar',
  category: 'basic',
  defaultData: withCommon({
    background_image: '',
    title: { en: 'Welcome to LinkNet', id: 'Selamat Datang di LinkNet' },
    description: { en: 'Connecting Indonesia with reliable network solutions.', id: 'Menghubungkan Indonesia dengan solusi jaringan terpercaya.' },
    pill_text: { en: 'New', id: 'Baru' },
    button_text: { en: 'Get Started', id: 'Mulai Sekarang' },
    button_link: '#',
    theme: 'dark',
    gradient_visible: true,
  }),
};

const SLIDERS_HERO: ComponentTypeDefinition = {
  type: 'sliders_hero',
  name: 'Hero Sliders',
  componentPath: '@/components/main/HeroSliders',
  description: 'Full-width hero carousel with multiple slides',
  icon: 'FaSlidersH',
  category: 'basic',
  defaultData: withCommon({
    slides: [
      {
        image: '',
        title: { en: 'Slide 1 Title', id: 'Judul Slide 1' },
        description: { en: 'Slide 1 description', id: 'Deskripsi slide 1' },
        button_text: { en: 'Learn More', id: 'Selengkapnya' },
        button_link: '#',
        pill_text: { en: '', id: '' },
        indicator_label: { en: 'Slide 1', id: 'Slide 1' },
      },
      {
        image: '',
        title: { en: 'Slide 2 Title', id: 'Judul Slide 2' },
        description: { en: 'Slide 2 description', id: 'Deskripsi slide 2' },
        button_text: { en: 'Learn More', id: 'Selengkapnya' },
        button_link: '#',
        pill_text: { en: '', id: '' },
        indicator_label: { en: 'Slide 2', id: 'Slide 2' },
      },
    ],
    autoplay: true,
    autoplay_speed: 5000,
    theme: 'dark',
  }),
};

const USP_GRID: ComponentTypeDefinition = {
  type: 'usp_grid',
  name: 'About With USP',
  componentPath: '@/components/main/AboutWithUSP',
  description: 'Grid of unique selling points with icons',
  icon: 'FaTh',
  category: 'basic',
  defaultData: withCommon({
    layoutVariant: 'image-on-left',
    image: {
      src: '/assets/img/sustainability/young-woman-using-phone-while-sitting-table.jpg',
      alt: 'Young business woman working at a table',
    },
    usp_variant: 'default',
    is_slider: false,
    bg_image: '/assets/bg/bg-usp-home.jpg',
    bg_image_mobile: '',
    items: [
      {
        iconURL: '/assets/icons/usp/icon-homepass.svg',
        title: { en: '4M+ Homepasses', id: '4 Juta+ Homepass' },
        description: { en: 'Spread across more than 47 major cities', id: 'Tersebar di lebih dari 47 kota besar' },
      },
      {
        iconURL: '/assets/icons/usp/icon-business.svg',
        title: { en: '3 Pillars of Business', id: '3 Pilar Bisnis' },
        description: { en: 'FiberCo, EnterpriseCo, and MediaCo', id: 'FiberCo, EnterpriseCo, dan MediaCo' },
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
  }),
};

const USP_GRID_SLIDER: ComponentTypeDefinition = {
  type: 'usp_grid_slider',
  name: 'About Values',
  componentPath: '@/components/main/AboutValues',
  description: 'USP items displayed as a slider/carousel',
  icon: 'FaThList',
  category: 'basic',
  defaultData: withCommon({
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
    // autoplay: true,
    slides_per_view: 3,
  }),
};

const BUSINESS_TAB: ComponentTypeDefinition = {
  type: 'business_tab',
  name: 'Tab Business',
  componentPath: '@/components/main/TabBusiness',
  description: 'Tabbed content showcasing business segments',
  icon: 'FaBriefcase',
  category: 'basic',
  defaultData: withCommon({
    tabs: [
      {
        name: { en: 'Enterprise', id: 'Perusahaan' },
        title: { en: 'Enterprise Solutions', id: 'Solusi Perusahaan' },
        description: { en: 'Comprehensive network solutions for businesses.', id: 'Solusi jaringan komprehensif untuk bisnis.' },
        background_image: '',
        background_image_mobile: '',
        logo_image: '',
        cta_text: { en: 'Learn More', id: 'Selengkapnya' },
        cta_link: '#',
      },
      {
        name: { en: 'Residential', id: 'Residensial' },
        title: { en: 'Home Solutions', id: 'Solusi Rumah' },
        description: { en: 'Fast and reliable internet for your home.', id: 'Internet cepat dan andal untuk rumah Anda.' },
        background_image: '',
        background_image_mobile: '',
        logo_image: '',
        cta_text: { en: 'Learn More', id: 'Selengkapnya' },
        cta_link: '#',
      },
    ],
  }),
};

const KEY_HIGHLIGHT: ComponentTypeDefinition = {
  type: 'key_highlight',
  name: 'Key Highlight With Image',
  componentPath: '@/components/main/KeyHighlightWithImage',
  description: 'Sliding key metrics/statistics with images',
  icon: 'FaChartBar',
  category: 'basic',
  defaultData: withCommon({
    slides: [
      { image: '', value: '1M+', delta: '+15%', caption: { en: 'Subscribers', id: 'Pelanggan' } },
      { image: '', value: '50+', delta: '+5', caption: { en: 'Cities Covered', id: 'Kota Terjangkau' } },
      { image: '', value: '99.9%', delta: '', caption: { en: 'Uptime', id: 'Waktu Aktif' } },
    ],
  }),
};

const ABOUT_WITH_MARQUEE: ComponentTypeDefinition = {
  type: 'about_with_marquee',
  name: 'About With Running Photos',
  componentPath: '@/components/main/AboutWithRunningPhotos',
  description: 'About section with scrolling photo marquee',
  icon: 'FaInfoCircle',
  category: 'basic',
  defaultData: withCommon({
    intro: {
      title: { en: 'About Us', id: 'Tentang Kami' },
      description: { en: 'We are a leading network provider in Indonesia.', id: 'Kami adalah penyedia jaringan terkemuka di Indonesia.' },
      cta_text: { en: 'Read More', id: 'Baca Selengkapnya' },
      cta_link: '/about',
    },
    photos: [
      { url: '', alt: 'Photo 1' },
      { url: '', alt: 'Photo 2' },
      { url: '', alt: 'Photo 3' },
      { url: '', alt: 'Photo 4' },
    ],
    marquee_speed: 30,
    marquee_direction: 'left',
  }),
};

const JOIN_FIRST_SQUAD: ComponentTypeDefinition = {
  type: 'join_first_squad',
  name: 'Join First Squad',
  componentPath: '@/components/main/JoinFirstSquad',
  description: 'Career carousel with 3 slides (First Squad, Management Trainee, Intern)',
  icon: 'FaUserPlus',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Join Our Team', id: 'Bergabung dengan Tim Kami' },
    slides: [
      {
        title: { en: 'First Squad', id: 'First Squad' },
        description: { en: 'Be part of our professional team.', id: 'Jadilah bagian dari tim profesional kami.' },
        image: '',
        cta_text: { en: 'Apply Now', id: 'Lamar Sekarang' },
        cta_link: '/careers',
      },
      {
        title: { en: 'Management Trainee', id: 'Management Trainee' },
        description: { en: 'Start your leadership journey.', id: 'Mulai perjalanan kepemimpinan Anda.' },
        image: '',
        cta_text: { en: 'Apply Now', id: 'Lamar Sekarang' },
        cta_link: '/careers',
      },
      {
        title: { en: 'Intern', id: 'Magang' },
        description: { en: 'Gain valuable experience with us.', id: 'Raih pengalaman berharga bersama kami.' },
        image: '',
        cta_text: { en: 'Apply Now', id: 'Lamar Sekarang' },
        cta_link: '/careers',
      },
    ],
  }),
};

const LIST_SERVICES: ComponentTypeDefinition = {
  type: 'list_services',
  name: 'List Services',
  description: 'Service listing with icons, descriptions, and product sub-items',
  icon: 'FaConciergeBell',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Our Services', id: 'Layanan Kami' },
    services: [
      {
        icon: 'globe',
        title: { en: 'Internet Service', id: 'Layanan Internet' },
        description: { en: 'High-speed internet connectivity.', id: 'Konektivitas internet berkecepatan tinggi.' },
        products: [
          { name: { en: 'Fiber 50 Mbps', id: 'Fiber 50 Mbps' }, link: '#' },
          { name: { en: 'Fiber 100 Mbps', id: 'Fiber 100 Mbps' }, link: '#' },
        ],
      },
      {
        icon: 'play',
        title: { en: 'Cable TV', id: 'TV Kabel' },
        description: { en: 'Premium TV channels.', id: 'Saluran TV premium.' },
        products: [
          { name: { en: 'Basic Package', id: 'Paket Dasar' }, link: '#' },
        ],
      },
    ],
  }),
};

const CARD_WITH_HIGHLIGHT_SUMMARY: ComponentTypeDefinition = {
  type: 'card_with_highlight_summary',
  name: 'Cards with Highlight Summary',
  description: 'Card grid with a highlight section featuring key metrics',
  icon: 'FaIdCard',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Performance Highlights', id: 'Sorotan Kinerja' },
    cards: [
      { title: { en: 'Revenue Growth', id: 'Pertumbuhan Pendapatan' }, description: { en: 'Strong revenue growth in 2024.', id: 'Pertumbuhan pendapatan yang kuat di 2024.' }, image: '', link: '#' },
      { title: { en: 'Network Expansion', id: 'Ekspansi Jaringan' }, description: { en: 'Expanded to 10 new cities.', id: 'Ekspansi ke 10 kota baru.' }, image: '', link: '#' },
    ],
    highlight: {
      title: { en: 'Key Metrics', id: 'Metrik Utama' },
      metrics: [
        { label: { en: 'Revenue', id: 'Pendapatan' }, value: 'Rp 2.5T', change: '+12%' },
        { label: { en: 'Subscribers', id: 'Pelanggan' }, value: '1.2M', change: '+8%' },
      ],
    },
  }),
};

const HIGHLIGHTING_REAL_INITIATIVES: ComponentTypeDefinition = {
  type: 'highlighting_real_initiatives',
  name: 'Highlighting Real Initiatives',
  componentPath: '@/components/main/HighlightingRealInitiatives',
  description: 'Showcase CSR/community initiatives with logos',
  icon: 'FaHandHoldingHeart',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Our Initiatives', id: 'Inisiatif Kami' },
    description: { en: 'Making a real difference in communities.', id: 'Memberikan dampak nyata bagi komunitas.' },
    initiatives: [
      { title: { en: 'Digital Literacy', id: 'Literasi Digital' }, description: { en: 'Empowering communities through digital education.', id: 'Memberdayakan komunitas melalui pendidikan digital.' }, image: '' },
      { title: { en: 'Green Network', id: 'Jaringan Hijau' }, description: { en: 'Sustainable network infrastructure.', id: 'Infrastruktur jaringan berkelanjutan.' }, image: '' },
    ],
    community_logos: [
      { url: '', alt: 'Partner 1' },
      { url: '', alt: 'Partner 2' },
    ],
  }),
};

const INFO_CONTACTS: ComponentTypeDefinition = {
  type: 'info_contacts',
  name: 'Info Contact',
  componentPath: '@/components/main/InfoContact',
  description: 'Contact details with icons (phone, email, address, etc.)',
  icon: 'FaAddressBook',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Contact Us', id: 'Hubungi Kami' },
    contact_items: [
      { type: 'phone', icon: 'phone', label: { en: 'Phone', id: 'Telepon' }, value: '+62 21 2996 0808', url: 'tel:+622129960808' },
      { type: 'email', icon: 'mail', label: { en: 'Email', id: 'Email' }, value: 'info@linknet.co.id', url: 'mailto:info@linknet.co.id' },
      { type: 'address', icon: 'pin-location', label: { en: 'Address', id: 'Alamat' }, value: 'Jakarta, Indonesia', url: '' },
    ],
  }),
};

const INFORMATION_LIST: ComponentTypeDefinition = {
  type: 'information_list',
  name: 'Information List',
  componentPath: '@/components/main/InformationList',
  description: 'HTML content sections with related articles and document downloads',
  icon: 'FaListUl',
  category: 'basic',
  defaultData: withCommon({
    info_sections: [
      {
        title: { en: 'General Information', id: 'Informasi Umum' },
        content: { en: '<p>General information content here.</p>', id: '<p>Konten informasi umum di sini.</p>' },
        related_articles: [
          { articleName: { en: 'Related Article 1', id: 'Artikel Terkait 1' }, source: 'manual', articleId: '', url: '#' },
        ],
        documents: [
          { documentName: { en: 'Document 1', id: 'Dokumen 1' }, subDesc: '', url: '#' },
        ],
        ctaList: [],
      },
    ],
  }),
};

const CONTACT_US: ComponentTypeDefinition = {
  type: 'contact_us',
  name: 'Contact Us',
  componentPath: '@/components/main/ContactUs',
  description: 'Contact form section using centralized public contact settings',
  icon: 'FaEnvelopeOpen',
  category: 'basic',
  defaultData: withCommon({
    introData: {
      label: { en: '', id: '' },
      title: { en: "We're Here to Help", id: 'Kami Siap Membantu' },
      description: {
        en: "We're here to assist you with any questions, concerns, or feedback you may have. Connect with us today!",
        id: 'Kami siap membantu pertanyaan, kebutuhan, atau masukan Anda. Hubungi kami hari ini!',
      },
      align: 'left',
    },
    form_fields: {
      firstName: { label: 'First Name', required: true },
      lastName: { label: 'Last Name', required: true },
      email: { label: 'Email', required: true },
      phone: { label: 'Phone', required: true },
      role: { label: 'Role / Job Title', required: false },
      company: { label: 'Company / Organization', required: false },
      inquiry: { label: 'Inquiry type', required: true },
      subject: { label: 'Subject', required: true },
      message: { label: 'Message', required: true, maxlength: 500 },
    },
  }),
};

const DOCUMENT_LIST: ComponentTypeDefinition = {
  type: 'document_list',
  name: 'Document List',
  description: 'Categorized document download sections',
  icon: 'FaFileAlt',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Documents', id: 'Dokumen' },
    sections: [
      {
        title: { en: 'Annual Reports', id: 'Laporan Tahunan' },
        documents: [
          { title: { en: 'Annual Report 2024', id: 'Laporan Tahunan 2024' }, url: '#', file_type: 'pdf', file_size: '5.2 MB', year: 2024 },
          { title: { en: 'Annual Report 2023', id: 'Laporan Tahunan 2023' }, url: '#', file_type: 'pdf', file_size: '4.8 MB', year: 2023 },
        ],
      },
    ],
  }),
};

const ACCORDION: ComponentTypeDefinition = {
  type: 'accordion',
  name: 'FAQ',
  componentPath: '@/components/main/FAQ',
  description: 'Collapsible FAQ/content sections',
  icon: 'FaListAlt',
  category: 'basic',
  defaultData: withCommon({
    // Override default intro alignment to center (matching FAQ static data)
    introData: { align: 'center' },
    style: 'default',
    allow_multiple: false,
    textCTA: { en: 'See More', id: 'Lihat Lebih' },
    textCTA_collapse: { en: 'Show Less', id: 'Tampilkan Lebih Sedikit' },
    items: [
      { title: { en: 'What is LinkNet?', id: 'Apa itu LinkNet?' }, content: { en: '<p>LinkNet is a leading network provider.</p>', id: '<p>LinkNet adalah penyedia jaringan terkemuka.</p>' }, expanded: false },
      { title: { en: 'How to subscribe?', id: 'Cara berlangganan?' }, content: { en: '<p>Visit our website or contact us.</p>', id: '<p>Kunjungi website kami atau hubungi kami.</p>' }, expanded: false },
      { title: { en: 'Coverage area?', id: 'Area jangkauan?' }, content: { en: '<p>We cover major cities across Indonesia.</p>', id: '<p>Kami menjangkau kota-kota besar di Indonesia.</p>' }, expanded: false },
    ],
  }),
};

const TRADINGVIEW_SYMBOL_OVERVIEW: ComponentTypeDefinition = {
  type: 'tradingview_symbol_overview',
  name: 'TradingView Symbol Overview',
  componentPath: '@/components/main/StockInformation',
  description: 'TradingView stock chart widget',
  icon: 'FaChartLine',
  category: 'basic',
  defaultData: withCommon({
    symbol: 'IDX:LINK',
    interval: 'D',
    theme: 'light',
    chart_type: 'area',
    width: '100%',
    height: '400',
    show_toolbar: true,
    show_volume: true,
    locale: 'en',
  }),
};

// ============================================================================
// MAIN COMPONENTS (require DB queries at render time)
// ============================================================================

const NEWS_HIGHLIGHT: ComponentTypeDefinition = {
  type: 'news_highlight',
  name: 'News Featured',
  componentPath: '@/components/main/NewsFeatured',
  description: 'Featured and grid news articles from database',
  icon: 'FaNewspaper',
  category: 'main',
  defaultData: withCommon({
    source: 'cms_highlights',
    news_ids: [],
    introData: {
      as: 'h2',
      label: { en: 'MEDIA & ACTIVITIES', id: 'MEDIA & AKTIVITAS' },
      title: { en: 'Latest News', id: 'Berita Terbaru' },
      description: { en: '', id: '' },
      align: 'left',
    },
    featured_count: 1,
    grid_count: 4,
    limit: 5,
    sort_by: 'news_date',
    sort_direction: 'desc',
    show_category: true,
    show_date: true,
    cta_text: { en: 'View All News', id: 'Lihat Semua Berita' },
    cta_link: '/news',
  }),
};

const NEWS_LIST: ComponentTypeDefinition = {
  type: 'news_list',
  name: 'News List',
  componentPath: '@/components/main/NewsList',
  description: 'Paginated news listing from database with filters',
  icon: 'FaList',
  category: 'main',
  defaultData: withCommon({
    introData: {
      as: 'h2',
      label: { en: '', id: '' },
      title: { en: 'News', id: 'Berita' },
      description: { en: '', id: '' },
      align: 'left',
    },
    sub_description: { en: '', id: '' },
    category_id: '',
    limit: 12,
    sort_by: 'news_date',
    sort_direction: 'desc',
    show_pagination: true,
    show_search: true,
    show_category_filter: true,
    display_image: true,
    display_description: true,
    show_date: true,
    show_category: true,
    search_placeholder: { en: 'Search news...', id: 'Cari berita...' },
    search_button_text: { en: 'Search', id: 'Cari' },
    layout: 'grid',
    cta_text: { en: '', id: '' },
    cta_link: '',
  }),
};

const CAREER_HIGHLIGHT: ComponentTypeDefinition = {
  type: 'career_highlight',
  name: 'Career Sneak Peek',
  componentPath: '@/components/main/CareerSneakPeek',
  description: 'Featured career opportunities from database',
  icon: 'FaUserTie',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Career Opportunities', id: 'Peluang Karir' },
    description: { en: 'Join our growing team.', id: 'Bergabung dengan tim kami yang berkembang.' },
    max_display: 6,
    show_department: true,
    show_location: true,
    cta_text: { en: 'View All Careers', id: 'Lihat Semua Karir' },
    cta_link: '/careers',
  }),
};

const CAREER_LIST: ComponentTypeDefinition = {
  type: 'career_list',
  name: 'Career',
  componentPath: '@/components/main/Career',
  description: 'Full career listing with search and filters',
  icon: 'FaBriefcase',
  category: 'main',
  defaultData: withCommon({
    intro: {
      label: { en: '', id: '' },
      title: { en: 'Open Positions', id: 'Posisi Terbuka' },
      description: { en: '', id: '' },
      align: 'left',
    },
    show_search: true,
    show_department_filter: true,
    show_location_filter: true,
    show_type_filter: true,
    show_pagination: true,
    per_page: 10,
  }),
};

const MANAGEMENT_LIST: ComponentTypeDefinition = {
  type: 'management_list',
  name: 'Management',
  componentPath: '@/components/main/Management',
  description: 'Board of directors / management team from database',
  icon: 'FaUsers',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Our Management', id: 'Manajemen Kami' },
    show_bio: true,
    show_photo: true,
    layout: 'grid',
    columns: 4,
    group_by_category: true,
  }),
};

const ANNOUNCEMENT_LIST: ComponentTypeDefinition = {
  type: 'announcement_list',
  name: 'Announcement List',
  componentPath: '@/components/main/AnnouncementList',
  description: 'Announcements listing from database with type/section filters',
  icon: 'FaBullhorn',
  category: 'main',
  defaultData: withCommon({
    introData: {
      title: { en: 'Announcements', id: 'Pengumuman' },
    },
    show_type_filter: true,
    show_section_filter: true,
    show_year_filter: true,
    show_search: true,
    show_pagination: true,
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
  }),
};

const REPORT_LIST: ComponentTypeDefinition = {
  type: 'report_list',
  name: 'Report List',
  componentPath: '@/components/main/ReportList',
  description: 'Financial and corporate reports from database',
  icon: 'FaFileInvoice',
  category: 'main',
  defaultData: withCommon({
    introData: {
      title: { en: 'Reports', id: 'Laporan' },
    },
    report_type_id: '',
    report_section_id: '',
    show_year_filter: true,
    show_type_filter: true,
    show_section_filter: true,
    show_search: true,
    layout: 'grid',
    limit: 12,
    sort_by: 'year',
    sort_direction: 'desc',
    card_style: 'default',
    display_image: true,
    display_description: true,
    show_pagination: true,
  }),
};

const AWARDS_LIST: ComponentTypeDefinition = {
  type: 'awards_list',
  name: 'Awards Feed',
  componentPath: '@/components/main/AwardsFeed',
  description: 'Company awards and achievements from database',
  icon: 'FaTrophy',
  category: 'main',
  defaultData: withCommon({
    intro: {
      label: { en: 'ACHIEVEMENTS & RECOGNITIONS', id: 'PENGHARGAAN & PENGAKUAN' },
      title: { en: 'Awards & Achievements', id: 'Penghargaan & Pencapaian' },
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
  }),
};

// ============================================================================
// NEW COMPONENTS (from web_static_reference design)
// ============================================================================

const VISION_MISSION: ComponentTypeDefinition = {
  type: 'vision_mission',
  name: 'Vision Mission',
  componentPath: '@/components/main/VisionMission',
  description: 'Vision and mission grid with alternating image/text blocks',
  icon: 'FaEye',
  category: 'basic',
  defaultData: withCommon({
    vision: {
      title: { en: 'Our Vision', id: 'Visi Kami' },
      description: { en: 'To be the leading network provider.', id: 'Menjadi penyedia jaringan terkemuka.' },
      image: '',
    },
    missions: [
      { title: { en: 'Mission 1', id: 'Misi 1' }, description: { en: 'Connecting Indonesia.', id: 'Menghubungkan Indonesia.' }, image: '' },
      { title: { en: 'Mission 2', id: 'Misi 2' }, description: { en: 'Innovation & excellence.', id: 'Inovasi & keunggulan.' }, image: '' },
    ],
    layout: 'grid',
    columns: 5,
  }),
};

const MAPS_COVERAGE: ComponentTypeDefinition = {
  type: 'maps_coverage',
  name: 'Maps Coverage',
  componentPath: '@/components/main/MapsCoverage',
  description: 'Interactive Indonesia coverage map with province selection and city search',
  icon: 'FaMapMarkedAlt',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Our Coverage', id: 'Jangkauan Kami' },
    description: { en: 'We cover major cities across Indonesia.', id: 'Kami menjangkau kota-kota besar di Indonesia.' },
    show_search: true,
    show_legend: true,
    default_province: '',
  }),
};

const MILESTONE: ComponentTypeDefinition = {
  type: 'milestone',
  name: 'Milestone',
  componentPath: '@/components/main/Milestone',
  description: 'Company timeline with year-based milestones',
  icon: 'FaStream',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Our Journey', id: 'Perjalanan Kami' },
    milestones: [
      { year: '2000', title: { en: 'Founded', id: 'Didirikan' }, description: { en: 'Company was established.', id: 'Perusahaan didirikan.' }, image: '', list: [] },
      { year: '2010', title: { en: 'Expansion', id: 'Ekspansi' }, description: { en: 'Nationwide expansion.', id: 'Ekspansi nasional.' }, image: '', list: [] },
    ],
  }),
};

const AWARDS_MARQUEE: ComponentTypeDefinition = {
  type: 'awards_marquee',
  name: 'Award Sneak Peek',
  componentPath: '@/components/main/AwardSneakPeek',
  description: 'Scrolling marquee of awards and achievements',
  icon: 'FaMedal',
  category: 'main',
  defaultData: withCommon({
    intro: {
      label: { en: 'ACHIEVEMENTS & RECOGNITIONS', id: 'PENGHARGAAN & PENGAKUAN' },
      title: { en: 'Awards & Recognition', id: 'Penghargaan & Pengakuan' },
      description: { en: '', id: '' },
      align: 'center',
    },
    award_ids: [],
    cta_text: { en: 'View All', id: 'Lihat Semua' },
    cta_link: '/awards',
    cta_variant: 'primary',
    cta_size: 'lg',
    cta_link_type: 'url',
    cta_target: '_self',
    cta_action_modal: '',
    cta_icon_left: '',
    cta_icon_right: '',
  }),
};

const PRODUCT_SHOWCASE: ComponentTypeDefinition = {
  type: 'product_showcase',
  name: 'One Stream',
  componentPath: '@/components/main/OneStream',
  description: 'Product section with device images, USP cards, and specs/order modals',
  icon: 'FaBox',
  category: 'basic',
  defaultData: withCommon({
    product_name: { en: 'Product Name', id: 'Nama Produk' },
    product_description: { en: 'Product description.', id: 'Deskripsi produk.' },
    product_image: '',
    logo_image: '',
    usp_items: [
      { icon: 'check', title: { en: 'Feature 1', id: 'Fitur 1' }, description: { en: 'Description', id: 'Deskripsi' } },
    ],
    cta_text: { en: 'Order Now', id: 'Pesan Sekarang' },
    cta_link: '#',
    show_specs: true,
  }),
};

const USP_STRIP: ComponentTypeDefinition = {
  type: 'usp_strip',
  name: 'USP',
  componentPath: '@/components/main/USP',
  description: 'Horizontal strip of USP taglines with dividers',
  icon: 'FaGripLines',
  category: 'basic',
  defaultData: withCommon({
    items: [
      { text: { en: 'Fast', id: 'Cepat' } },
      { text: { en: 'Reliable', id: 'Andal' } },
      { text: { en: 'Secure', id: 'Aman' } },
    ],
  }),
};

const CLOSING_CTA: ComponentTypeDefinition = {
  type: 'closing_cta',
  name: 'Closing Sentence',
  componentPath: '@/components/main/ClosingSentence',
  description: 'Full-screen video background CTA section',
  icon: 'FaBullseye',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Ready to Get Started?', id: 'Siap Untuk Memulai?' },
    description: { en: 'Contact us today.', id: 'Hubungi kami hari ini.' },
    cta_text: { en: 'Get Started', id: 'Mulai Sekarang' },
    cta_link: '#',
    video_url: '',
    bg_image: '',
  }),
};

const VIDEO_SECTION: ComponentTypeDefinition = {
  type: 'video_section',
  name: 'Tvc',
  componentPath: '@/components/main/Tvc',
  description: 'Scroll-expanding video/image section with play button',
  icon: 'FaPlayCircle',
  category: 'basic',
  defaultData: withCommon({
    video_url: '',
    poster_image: '',
    autoplay: false,
  }),
};

const EXTENDABLE_ARTICLE: ComponentTypeDefinition = {
  type: 'extendable_article',
  name: 'Extendable Article',
  componentPath: '@/components/main/ExtendableArticle',
  description: 'Expandable/collapsible rich text article section with Read More/Show Less toggle',
  icon: 'FaFileAlt',
  category: 'basic',
  defaultData: withCommon({
    intro: {
      label: '',
      title: { en: 'More About Us', id: 'Tentang Kami' },
      align: 'center',
    },
    content: { en: '<p>Enter your article content here...</p>', id: '<p>Masukkan konten artikel di sini...</p>' },
    button_expand: { en: 'Read More', id: 'Baca Selengkapnya' },
    button_collapse: { en: 'Show Less', id: 'Lebih Sedikit' },
  }),
};

const STOCK_INFORMATION: ComponentTypeDefinition = {
  type: 'stock_information',
  name: 'Stock Information',
  componentPath: '@/components/main/StockInformation',
  description: 'Live stock price widget with TradingView chart, information panel, and historical data table',
  icon: 'FaChartLine',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Get the latest information about LINK stock price today', id: 'Dapatkan informasi terkini mengenai harga saham LINK hari ini' },
    symbol: 'LINK.JK',
  }),
};

const TESTIMONIALS: ComponentTypeDefinition = {
  type: 'testimonials',
  name: 'Testimonials',
  componentPath: '@/components/main/Testimonials',
  description: 'Client testimonial carousel with company logos, quotes, tags, and auto-advance progress tabs',
  icon: 'FaQuoteRight',
  category: 'basic',
  defaultData: withCommon({
    intro: {
      label: { en: 'TESTIMONIAL', id: 'TESTIMONIAL' },
      title: { en: 'Empowering Businesses Through Real Success Stories', id: 'Mendorong Bisnis Melalui Kisah Sukses Nyata' },
      description: '',
      align: 'left',
    },
    testimonials: [
      {
        image: '',
        companyLogo: '',
        companyName: 'Company Name',
        quote: { en: 'Testimonial text here.', id: 'Teks testimoni di sini.' },
        tags: ['Service 1', 'Service 2'],
        readMoreUrl: '#',
        name: 'Person Name',
        role: 'Job Title, Company',
      },
    ],
  }),
};

const FORM_REGISTRATION_ENTERPRISE: ComponentTypeDefinition = {
  type: 'form_registration_enterprise',
  name: 'Form Registration Enterprise',
  componentPath: '@/components/main/FormRegistrationEnterprise',
  description: 'Form registration section for Enterprise BU',
  icon: 'FaWpforms',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Enterprise Registration', id: 'Registrasi Enterprise' },
    description: { en: 'Choose the form that suits your enterprise needs.', id: 'Pilih form sesuai kebutuhan enterprise Anda.' },
    event_name: '',
    event_promo: '',
    event_page: '',
    max_participants: 5,
  }),
};

const FORM_REGISTRATION_FIBER: ComponentTypeDefinition = {
  type: 'form_registration_fiber',
  name: 'Form Registration Fiber',
  componentPath: '@/components/main/FormRegistrationFiber',
  description: 'Form registration section for Fiber BU',
  icon: 'FaWpforms',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Fiber Registration', id: 'Registrasi Fiber' },
    description: { en: 'Register your Fiber service or submit an inquiry.', id: 'Daftarkan layanan Fiber atau ajukan pertanyaan.' },
    event_name: '',
    event_promo: '',
    event_page: '',
    max_participants: 5,
  }),
};

const FORM_REGISTRATION_MEDIA: ComponentTypeDefinition = {
  type: 'form_registration_media',
  name: 'Form Registration Media',
  componentPath: '@/components/main/FormRegistrationMedia',
  description: 'Form registration section for Media BU',
  icon: 'FaWpforms',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Media Registration', id: 'Registrasi Media' },
    description: { en: 'Register your media partnership or campaign.', id: 'Daftarkan kemitraan atau kampanye media Anda.' },
    event_name: '',
    event_promo: '',
    event_page: '',
    max_participants: 5,
  }),
};

const COVERAGE_CHECK_FIBER: ComponentTypeDefinition = {
  type: 'coverage_check_fiber',
  name: 'Coverage Check Fiber',
  componentPath: '@/components/main/CoverageCheckFiber',
  description: 'Inline coverage check and Fiber inquiry section backed by Form Modules',
  icon: 'FaMapMarkedAlt',
  category: 'basic',
  defaultData: withCommon({
    introData: {
      label: { en: 'CHECK COVERAGE', id: 'CEK COVERAGE' },
      title: { en: 'Find Fiber Network from Linknet Fiber in Your Area', id: 'Temukan Jaringan Fiber dari Linknet Fiber di Area Anda' },
      description: { en: 'Check Coverage Availability Now & Discover service options in your location.', id: 'Cek Ketersediaan Coverage Sekarang & Temukan pilihan layanan di lokasi Anda.' },
      align: 'left',
    },
    bg_image: '/assets/bg/bg-usp-home.jpg',
    bg_position_classes: 'bg-right-top md:bg-right',
    bg_size_class: 'bg-cover',
    title: { en: 'Check Fiber coverage and submit your request', id: 'Cek cakupan Fiber dan kirim permintaan Anda' },
    description: { en: 'Verify coverage first, then submit the live Fiber inquiry form with the selected location.', id: 'Verifikasi coverage terlebih dahulu, lalu kirim form inquiry Fiber dengan lokasi yang dipilih.' },
    coverage_title: { en: 'Step 1. Verify fiber coverage', id: 'Langkah 1. Verifikasi cakupan fiber' },
    coverage_description: { en: 'Select a covered address or switch to manual location entry if the site is not listed.', id: 'Pilih alamat yang tercakup atau gunakan input manual jika lokasi tidak ditemukan.' },
    request_title: { en: 'Step 2. Choose your request type', id: 'Langkah 2. Pilih jenis permintaan' },
    request_description: { en: 'This value maps directly to the Fiber inquiry module field.', id: 'Nilai ini langsung dipetakan ke field inquiry Fiber.' },
    form_title: { en: 'Step 3. Complete the Fiber inquiry', id: 'Langkah 3. Lengkapi inquiry Fiber' },
    form_description: { en: 'Coverage fields are prefilled from Step 1 and submitted into CMS Form Modules.', id: 'Field coverage diisi dari langkah 1 dan dikirim ke CMS Form Modules.' },
    summary_title: { en: 'Coverage summary', id: 'Ringkasan coverage' },
    summary_description: { en: 'These values are attached to the submission payload.', id: 'Nilai ini ikut dikirim di payload submission.' },
    cms_title: { en: 'CMS integration', id: 'Integrasi CMS' },
    cms_description: { en: 'Reads the active Fiber form module and submits through the public forms API.', id: 'Membaca form module Fiber aktif dan submit lewat public forms API.' },
    submit_label: { en: 'Submit Fiber Inquiry', id: 'Kirim Inquiry Fiber' },
    submitting_label: { en: 'Submitting...', id: 'Mengirim...' },
    success_title: { en: 'Fiber request submitted', id: 'Permintaan Fiber berhasil dikirim' },
    success_description: { en: 'The Fiber team has received your coverage context and inquiry details.', id: 'Tim Fiber telah menerima konteks coverage dan detail inquiry Anda.' },
    business_unit: 'fiber',
    form_slug: 'fiber-inquiry',
  }),
};

function syncedMainComponent(
  type: string,
  name: string,
  componentPath: string,
  options: Partial<Pick<ComponentTypeDefinition, 'description' | 'icon' | 'category' | 'defaultData'>> = {}
): ComponentTypeDefinition {
  return {
    type,
    name,
    componentPath,
    description: options.description || `${name} component from web/components/main`,
    icon: options.icon || 'FaPuzzlePiece',
    category: options.category || 'basic',
    defaultData: options.defaultData || SYNCED_MAIN_DEFAULTS[type] || withCommon({
      name: 'default',
      title: { en: name, id: name },
      description: { en: '', id: '' },
    }),
  };
}

const SYNCED_MAIN_DEFAULTS: Record<string, Record<string, any>> = {
  hero: withCommon({
    name: 'mission',
    as: 'h2',
    config: {
      bgImage: '/assets/herosliders/mission-desktop.jpg',
      bgImageMobile: '/assets/herosliders/mission-mobile.jpg',
    },
    parentProduct: {
      iconImage: '',
      productName: { en: '', id: '' },
    },
    logoSrc: '',
    logoSquare: false,
    labelIconSrc: '',
    introData: {
      as: 'h2',
      label: { en: 'Our Mission', id: 'Misi Kami' },
      title: {
        en: 'Improving Lives and Supporting Indonesia\'s Digital Growth',
        id: 'Meningkatkan Kehidupan dan Mendukung Pertumbuhan Digital Indonesia',
      },
      description: {
        en: 'Linknet is dedicated to improving lives and supporting Indonesia\'s digital growth by delivering smart, reliable technology infrastructure.',
        id: 'Linknet berdedikasi untuk meningkatkan kehidupan dan mendukung pertumbuhan digital Indonesia melalui infrastruktur teknologi yang cerdas dan andal.',
      },
      align: 'left',
    },
    bgColor: 'bg-[#FFB800]',
    heroSize: 'md',
    theme: 'light',
    bgOverlay: false,
    ctaList: [
      {
        label: { en: 'Get to Know Us', id: 'Kenali Kami' },
        text: { en: 'Get to Know Us', id: 'Kenali Kami' },
        href: '/about-us',
        target: '_self',
        variant: 'primary',
        size: 'lg',
        link_type: 'url',
      },
    ],
  }),
  check_coverage: withCommon({
    name: 'enterprise',
    introData: {
      as: 'h2',
      label: { en: 'CHECK COVERAGE', id: 'CEK COVERAGE' },
      title: { en: 'Find Fiber Network from Linknet Fiber in Your Area', id: 'Temukan Jaringan Fiber dari Linknet Fiber di Area Anda' },
      description: { en: 'Check Coverage Availability Now & Discover service options in your location.', id: 'Cek Ketersediaan Coverage Sekarang & Temukan pilihan layanan di lokasi Anda.' },
      align: 'left',
    },
  }),
  event_hero: withCommon({
    variant: 'event_grid',
    introData: {
      as: 'h1',
      label: { en: 'FIND YOUR NEXT EXPERIENCE', id: 'TEMUKAN PENGALAMAN BERIKUTNYA' },
      title: { en: 'Discover & Promote Upcoming Event', id: 'Temukan & Promosikan Event Mendatang' },
      description: { en: '', id: '' },
      align: 'left',
    },
    config: {
      sectionId: 'featured-event',
      className: '',
    },
  }),
  footer: withCommon({
    cmsClosingData: null,
    cmsFooterData: null,
  }),
  footer_fiber: withCommon({}),
  footer_main: withCommon({
    cmsFooterData: null,
  }),
  footer_media: withCommon({}),
  form_registration: withCommon({}),
  form_registration_incomplete: withCommon({}),
  form_registration_success: withCommon({}),
  hero_sliders_tv_highlight: withCommon({
    name: 'today-highlight',
  }),
  hospitality: withCommon({}),
  layout_chrome: withCommon({}),
  maps_coverage_v1: withCommon({
    name: 'home',
    source: 'cms_map_coverage',
    widgetData: {
      instructionText: 'Click on a province on the map',
      statusCovered: 'Area Covered',
      statusNotCovered: 'Area Not Covered',
      title: 'Coverage Details',
      regionLabel: 'Area',
      searchPlaceholder: 'Search city',
      noCityFound: 'No cities found.',
      ctaText: 'Get a Free Quote',
      notCoveredMessage: "Sorry. Linknet hasn't reached this area yet. Follow us on Instagram @linknetfiber.id for updates when we cover this area.",
    },
  }),
  navbar: withCommon({
    menuData: [],
    defaultLocale: 'en',
  }),
  navbar_fiber: withCommon({
    menuData: [],
    defaultLocale: 'en',
  }),
  navbar_media: withCommon({}),
  navbar_newsroom: {
    label: { en: 'News', id: 'Berita' },
    category_sort_by: 'default',
  },
  news_teaser: withCommon({
    name: 'press-release',
    category_id: '',
    limit: 6,
    sort_by: 'news_date',
    sort_direction: 'desc',
    ctaList: [
      {
        text: { en: 'See More', id: 'Lihat Lainnya' },
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '',
        link_type: 'url',
        action_modal: '',
      },
    ],
  }),
  omni_channel_widget: withCommon({
    enabled: true,
    title: { en: 'Let\'s start new chat', id: 'Mulai percakapan baru' },
    subtitle: { en: 'How can we help you today?', id: 'Apa yang bisa kami bantu hari ini?' },
    whatsappUrl: 'https://wa.me/628111700700',
    submitEndpoint: '',
    sendToSalesForce: false,
  }),
  one_stream_plus: withCommon({}),
  report_grid: withCommon({
    report_type_id: '',
    report_section_id: '',
    limit: 9,
    sort_by: 'year',
    sort_direction: 'desc',
    card_style: 'cover',
    display_image: true,
    display_description: true,
    show_pagination: true,
    data: [],
  }),
  solutions_list: withCommon({
    introData: {
      as: 'h2',
      label: { en: 'SOLUTIONS', id: 'SOLUSI' },
      title: { en: 'Find the Right Solution for Your Business', id: 'Temukan Solusi yang Tepat untuk Bisnis Anda' },
      description: { en: '', id: '' },
      align: 'left',
    },
    order_by: 'sort_order',
    sort_direction: 'asc',
    show_filter_industry: true,
    show_filter_business_scale: true,
    show_filter_business_needs: true,
    max_data_per_category: 6,
  }),
  solutions_services_with_background: withCommon({
    name: 'enterprise',
  }),
  tv_channel_list: withCommon({
    name: 'enterprise',
    channel_ids: [],
    genre_ids: [],
    limit: 0,
    sort_by: 'manual',
    sort_direction: 'asc',
    ctaList: [
      {
        text: { en: '', id: '' },
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '',
        link_type: 'url',
        action_modal: '',
      },
    ],
    tabs: [
      { value: 'all', label: 'All Channel' },
      { value: 'sports', label: 'Sports' },
      { value: 'variety', label: 'Variety' },
      { value: 'movies', label: 'Movies' },
      { value: 'kids', label: 'Kids' },
      { value: 'news', label: 'News' },
      { value: 'indian', label: 'Indian' },
      { value: 'chinese', label: 'Chinese' },
    ],
  }),
  tv_channel_sneak_peek: withCommon({
    name: 'home',
    channel_ids: [],
    genre_ids: [],
    limit: 8,
    sort_by: 'manual',
    sort_direction: 'asc',
    ctaList: [
      {
        text: { en: '', id: '' },
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '',
        link_type: 'url',
        action_modal: '',
      },
    ],
  }),
  tv_highlight_sliders: withCommon({
    name: 'today-highlight',
    reel_item_ids: [],
    limit: 10,
    sort_by: 'manual',
    sort_direction: 'asc',
    ctaList: [
      {
        text: { en: '', id: '' },
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '',
        link_type: 'url',
        action_modal: '',
      },
    ],
  }),
  tv_highlight_sneek_peak: withCommon({
    name: 'home',
    show: true,
    highlight_categories: [],
    logo_display_limit: 10,
    limit: 9,
    sort_by: 'api_order',
    sort_direction: 'asc',
    ctaList: [
      {
        text: { en: '', id: '' },
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '',
        link_type: 'url',
        action_modal: '',
      },
    ],
  }),
};

const SYNCED_MAIN_COMPONENTS: ComponentTypeDefinition[] = [
  syncedMainComponent('hero', 'Hero', '@/components/main/Hero', { icon: 'FaStar' }),
  syncedMainComponent('career_detail', 'Career Detail', '@/components/main/CareerDetail', { icon: 'FaUserTie', category: 'main', defaultData: withCommon({ career: null, relatedCareers: [] }) }),
  syncedMainComponent('check_coverage', 'Check Coverage', '@/components/main/CheckCoverage', { icon: 'FaMapMarkedAlt' }),
  syncedMainComponent('content_highlights', 'Content Highlights', '@/components/main/ContentHighlights', {
    icon: 'FaLayerGroup',
    defaultData: withCommon({
      name: 'home',
      limit: 5,
      sort_by: 'published_at',
      sort_direction: 'desc',
      categories: [
        { label: 'Insight', value: 'business-insight', source: 'news', category_slug: 'press-release', is_visible: true },
        { label: 'News', value: 'news', source: 'news', category_slug: 'news', is_visible: true },
        { label: 'Event', value: 'event', source: 'events', category_slug: '', is_visible: true },
      ],
    }),
  }),
  syncedMainComponent('event_content', 'Event Content', '@/components/main/EventContent', { icon: 'FaCalendarAlt', category: 'main', defaultData: withCommon({ event: null }) }),
  syncedMainComponent('event_detail', 'Event Detail', '@/components/main/EventDetail', { icon: 'FaCalendarAlt', category: 'main', defaultData: withCommon({ event: null }) }),
  syncedMainComponent('event_hero', 'Event Hero', '@/components/main/EventHero', { icon: 'FaCalendarAlt' }),
  syncedMainComponent('event_registration_form', 'Event Registration Form', '@/components/main/EventRegistrationForm', { icon: 'FaWpforms', defaultData: withCommon({ event: null }) }),
  syncedMainComponent('event_related', 'Event Related', '@/components/main/EventRelated', {
    icon: 'FaCalendarAlt',
    category: 'main',
    defaultData: withCommon({
      introData: {
        as: 'h2',
        label: { en: 'MORE EVENTS', id: 'EVENT LAINNYA' },
        title: { en: 'Other Events', id: 'Event Lainnya' },
        description: { en: '', id: '' },
        align: 'left',
      },
      state: 'all',
      limit: 4,
      sort_by: 'start_date',
      sort_direction: 'desc',
    }),
  }),
  syncedMainComponent('event_related_news', 'Event Related News', '@/components/main/EventRelatedNews', { icon: 'FaNewspaper', defaultData: withCommon({ articles: [] }) }),
  syncedMainComponent('events_list', 'Events List', '@/components/main/EventsList', {
    icon: 'FaCalendarAlt',
    category: 'main',
    defaultData: withCommon({
      introData: {
        as: 'h2',
        label: { en: 'FIND YOUR NEXT EXPERIENCE', id: 'TEMUKAN PENGALAMAN BERIKUTNYA' },
        title: { en: 'Discover & Promote Upcoming Event', id: 'Temukan & Promosikan Event Mendatang' },
        description: { en: '', id: '' },
        align: 'left',
      },
      state: 'all',
      limit: 12,
      sort_by: 'start_date',
      sort_direction: 'asc',
      itemsPerRow: 3,
      showPagination: true,
    }),
  }),
  syncedMainComponent('footer', 'Footer', '@/components/main/Footer', { icon: 'FaGripLines' }),
  syncedMainComponent('footer_fiber', 'Footer Fiber', '@/components/main/FooterFiber', { icon: 'FaGripLines' }),
  syncedMainComponent('footer_main', 'Footer Main', '@/components/main/FooterMain', { icon: 'FaGripLines' }),
  syncedMainComponent('footer_media', 'Footer Media', '@/components/main/FooterMedia', { icon: 'FaGripLines' }),
  syncedMainComponent('form_registration', 'Form Registration', '@/components/main/FormRegistration', { icon: 'FaWpforms' }),
  syncedMainComponent('form_registration_incomplete', 'Form Registration Incomplete', '@/components/main/FormRegistrationIncomplete', { icon: 'FaWpforms' }),
  syncedMainComponent('form_registration_success', 'Form Registration Success', '@/components/main/FormRegistrationSuccess', { icon: 'FaWpforms' }),
  syncedMainComponent('hero_sliders_tv_highlight', 'Hero Sliders TV Highlight', '@/components/main/HeroSlidersTVHighlight', { icon: 'FaSlidersH' }),
  syncedMainComponent('hospitality', 'Hospitality', '@/components/main/Hospitality', { icon: 'FaHotel' }),
  syncedMainComponent('layout_chrome', 'Layout Chrome', '@/components/main/LayoutChrome', { icon: 'FaColumns' }),
  syncedMainComponent('list_report_home', 'List Report Home', '@/components/main/ListReportHome', {
    icon: 'FaFileInvoice',
    category: 'main',
    defaultData: withCommon({
      name: 'home',
      source: 'cms_reports_announcements',
      tabs: [
        { label: { en: 'Report', id: 'Laporan' }, value: 'report' },
        { label: { en: 'Announcement', id: 'Pengumuman' }, value: 'announcement' },
      ],
      items: {
        report: [],
        announcement: [],
      },
      report_type_id: '',
      report_section_id: '',
      limit: 12,
      sort_by: 'year',
      sort_direction: 'desc',
    }),
  }),
  syncedMainComponent('logo_running', 'Logo Running', '@/components/main/LogoRunning', { icon: 'FaImages', defaultData: withCommon({ name: 'default' }) }),
  syncedMainComponent('logo_running_with_border', 'Logo Running With Border', '@/components/main/LogoRunningWithBorder', { icon: 'FaImages', defaultData: withCommon({ name: 'default' }) }),
  syncedMainComponent('maps_coverage_v1', 'Maps Coverage V1', '@/components/main/MapsCoverage-v1', { icon: 'FaMapMarkedAlt', category: 'main' }),
  syncedMainComponent('navbar', 'Navbar', '@/components/main/Navbar', { icon: 'FaBars' }),
  syncedMainComponent('navbar_fiber', 'Navbar Fiber', '@/components/main/NavbarFiber', { icon: 'FaBars' }),
  syncedMainComponent('navbar_media', 'Navbar Media', '@/components/main/NavbarMedia', { icon: 'FaBars' }),
  syncedMainComponent('navbar_newsroom', 'Navbar Newsroom', '@/components/main/NavbarNewsroom', { icon: 'FaBars' }),
  syncedMainComponent('news_detail', 'News Detail', '@/components/main/NewsDetail', { icon: 'FaNewspaper', category: 'main', defaultData: withCommon({ article: null }) }),
  syncedMainComponent('news_feed', 'News Feed', '@/components/main/NewsFeed', {
    icon: 'FaNewspaper',
    category: 'main',
    defaultData: withCommon({
      categorySlug: 'latest',
      limit: 12,
      sort_by: 'news_date',
      sort_direction: 'desc',
    }),
  }),
  syncedMainComponent('news_related', 'News Related', '@/components/main/NewsRelated', { icon: 'FaNewspaper', defaultData: withCommon({ articles: [] }) }),
  syncedMainComponent('news_teaser', 'News Teaser', '@/components/main/NewsTeaser', { icon: 'FaNewspaper', category: 'main' }),
  syncedMainComponent('omni_channel_widget', 'Omni Channel Widget', '@/components/main/OmniChannelWidget', { icon: 'FaComments' }),
  syncedMainComponent('one_stream_plus', 'One Stream Plus', '@/components/main/OneStreamPlus', { icon: 'FaBox' }),
  syncedMainComponent('package_list', 'Package List', '@/components/main/PackageList', { icon: 'FaBoxOpen', defaultData: withCommon({ name: 'enterprise' }) }),
  syncedMainComponent('report_grid', 'Report Grid', '@/components/main/ReportGrid', { icon: 'FaFileInvoice', category: 'main' }),
  syncedMainComponent('report_list_part', 'Report List Part', '@/components/main/ReportListPart', {
    icon: 'FaFileInvoice',
    category: 'main',
    defaultData: withCommon({
      report_type_id: '',
      report_section_id: '',
      limit: 6,
      sort_by: 'year',
      sort_direction: 'desc',
      display_description: true,
      data: null,
      config: null,
    }),
  }),
  syncedMainComponent('solutions_list', 'Solutions List', '@/components/main/SolutionsList', {
    icon: 'FaListUl',
    category: 'main',
  }),
  syncedMainComponent('solution_services_home', 'Solution Services Home', '@/components/main/SolutionServicesHome', { icon: 'FaConciergeBell', defaultData: withCommon({ name: 'home', hideTabs: false }) }),
  syncedMainComponent('solutions_filtered', 'Solutions Filtered', '@/components/main/SolutionsFiltered', { icon: 'FaFilter', defaultData: withCommon({ name: 'enterprise' }) }),
  syncedMainComponent('solutions_services_with_background', 'Solutions Services With Background', '@/components/main/SolutionsServicesWithBackground', { icon: 'FaConciergeBell' }),
  syncedMainComponent('tv_channel_list', 'TV Channel List', '@/components/main/TVChannelList', { icon: 'FaTv' }),
  syncedMainComponent('tv_channel_sneak_peek', 'TV Channel Sneak Peek', '@/components/main/TVChannelSneakPeek', { icon: 'FaTv' }),
  syncedMainComponent('tv_highlight_sliders', 'TV Highlight Sliders', '@/components/main/TVHighlightSliders', { icon: 'FaSlidersH' }),
  syncedMainComponent('tv_highlight_sneek_peak', 'TV Highlight Sneek Peak', '@/components/main/TVHighlightSneekPeak', { icon: 'FaTv' }),
];

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

export const ALL_COMPONENT_TYPES: ComponentTypeDefinition[] = [
  // Basic
  TEXT_BLOCK,
  CKEDITOR,
  IMAGE,
  HERO_SECTION,
  SLIDERS_HERO,
  USP_GRID,
  USP_GRID_SLIDER,
  BUSINESS_TAB,
  KEY_HIGHLIGHT,
  ABOUT_WITH_MARQUEE,
  JOIN_FIRST_SQUAD,
  LIST_SERVICES,
  CARD_WITH_HIGHLIGHT_SUMMARY,
  HIGHLIGHTING_REAL_INITIATIVES,
  INFO_CONTACTS,
  INFORMATION_LIST,
  CONTACT_US,
  DOCUMENT_LIST,
  ACCORDION,
  TRADINGVIEW_SYMBOL_OVERVIEW,
  VISION_MISSION,
  MAPS_COVERAGE,
  MILESTONE,
  AWARDS_MARQUEE,
  PRODUCT_SHOWCASE,
  USP_STRIP,
  CLOSING_CTA,
  VIDEO_SECTION,
  EXTENDABLE_ARTICLE,
  STOCK_INFORMATION,
  TESTIMONIALS,
  FORM_REGISTRATION_ENTERPRISE,
  FORM_REGISTRATION_FIBER,
  FORM_REGISTRATION_MEDIA,
  COVERAGE_CHECK_FIBER,
  ...SYNCED_MAIN_COMPONENTS,
  // Main (DB-driven)
  NEWS_HIGHLIGHT,
  NEWS_LIST,
  CAREER_HIGHLIGHT,
  CAREER_LIST,
  MANAGEMENT_LIST,
  ANNOUNCEMENT_LIST,
  REPORT_LIST,
  AWARDS_LIST,
];

/**
 * Get all component types as a map
 */
export const COMPONENT_TYPE_MAP: Record<string, ComponentTypeDefinition> = {};
ALL_COMPONENT_TYPES.forEach((ct) => {
  COMPONENT_TYPE_MAP[ct.type] = ct;
});

/**
 * Get default component_data for a given type
 */
export function getDefaultComponentData(type: string): Record<string, any> | null {
  const def: ComponentTypeDefinition | undefined = COMPONENT_TYPE_MAP[type];
  return def ? JSON.parse(JSON.stringify(def.defaultData)) : null;
}

/**
 * Check if a type is a MAIN component (needs DB fetch)
 */
export function isMainComponent(type: string): boolean {
  const def = COMPONENT_TYPE_MAP[type];
  return def ? def.category === 'main' : false;
}

/**
 * Get available component types grouped by category
 */
export function getComponentTypesByCategory(): Record<string, ComponentTypeDefinition[]> {
  return ALL_COMPONENT_TYPES.reduce<Record<string, ComponentTypeDefinition[]>>((acc, ct) => {
    if (!acc[ct.category]) acc[ct.category] = [];
    acc[ct.category]!.push(ct);
    return acc;
  }, {});
}
