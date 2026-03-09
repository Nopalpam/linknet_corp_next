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
 * Common fields available on all components:
 * - custom_id, custom_class
 * - bg_type, bg_color, bg_image, bg_position
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ComponentTypeDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: 'basic' | 'main';
  defaultData: Record<string, any>;
}

// ============================================================================
// COMMON FIELDS (merged into every default)
// ============================================================================

const COMMON_FIELDS = {
  custom_id: '',
  custom_class: '',
  bg_type: 'color',
  bg_color: '',
  bg_image: '',
  bg_position: 'center',
};

function withCommon(data: Record<string, any>): Record<string, any> {
  return { ...COMMON_FIELDS, ...data };
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
    label: '',
    title: { en: 'Section Title', id: 'Judul Bagian' },
    description: { en: 'Section description goes here.', id: 'Deskripsi bagian di sini.' },
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
  name: 'Hero Section',
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
  name: 'Hero Slider',
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
  name: 'USP Grid',
  description: 'Grid of unique selling points with icons',
  icon: 'FaTh',
  category: 'basic',
  defaultData: withCommon({
    items: [
      { icon: 'FaWifi', title: { en: 'Fast Connection', id: 'Koneksi Cepat' }, description: { en: 'High-speed fiber optic network', id: 'Jaringan fiber optik berkecepatan tinggi' } },
      { icon: 'FaShieldAlt', title: { en: 'Secure Network', id: 'Jaringan Aman' }, description: { en: 'Enterprise-grade security', id: 'Keamanan tingkat enterprise' } },
      { icon: 'FaHeadset', title: { en: '24/7 Support', id: 'Dukungan 24/7' }, description: { en: 'Round-the-clock customer support', id: 'Dukungan pelanggan sepanjang waktu' } },
    ],
  }),
};

const USP_GRID_SLIDER: ComponentTypeDefinition = {
  type: 'usp_grid_slider',
  name: 'USP Grid Slider',
  description: 'USP items displayed as a slider/carousel',
  icon: 'FaThList',
  category: 'basic',
  defaultData: withCommon({
    items: [
      { icon: 'FaWifi', title: { en: 'Fast Connection', id: 'Koneksi Cepat' }, description: { en: 'High-speed fiber optic', id: 'Fiber optik berkecepatan tinggi' } },
      { icon: 'FaShieldAlt', title: { en: 'Secure', id: 'Aman' }, description: { en: 'Enterprise security', id: 'Keamanan enterprise' } },
      { icon: 'FaHeadset', title: { en: 'Support', id: 'Dukungan' }, description: { en: '24/7 support', id: 'Dukungan 24/7' } },
      { icon: 'FaRocket', title: { en: 'Innovation', id: 'Inovasi' }, description: { en: 'Latest technology', id: 'Teknologi terkini' } },
    ],
    autoplay: true,
    slides_per_view: 3,
  }),
};

const BUSINESS_TAB: ComponentTypeDefinition = {
  type: 'business_tab',
  name: 'Business Tab',
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
        logo_image: '',
        cta_text: { en: 'Learn More', id: 'Selengkapnya' },
        cta_link: '#',
      },
      {
        name: { en: 'Residential', id: 'Residensial' },
        title: { en: 'Home Solutions', id: 'Solusi Rumah' },
        description: { en: 'Fast and reliable internet for your home.', id: 'Internet cepat dan andal untuk rumah Anda.' },
        background_image: '',
        logo_image: '',
        cta_text: { en: 'Learn More', id: 'Selengkapnya' },
        cta_link: '#',
      },
    ],
  }),
};

const TABS_WITH_CARD: ComponentTypeDefinition = {
  type: 'tabs_with_card',
  name: 'Tabs with Cards',
  description: 'Tabbed interface with card grids inside each panel',
  icon: 'FaFolder',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Our Services', id: 'Layanan Kami' },
    tabs: [
      { key: 'tab1', label: { en: 'Internet', id: 'Internet' } },
      { key: 'tab2', label: { en: 'TV Cable', id: 'TV Kabel' } },
    ],
    tab_panels: {
      tab1: {
        cards: [
          { title: { en: 'Fiber 50', id: 'Fiber 50' }, description: { en: '50 Mbps speed', id: 'Kecepatan 50 Mbps' }, image: '', link: '#' },
          { title: { en: 'Fiber 100', id: 'Fiber 100' }, description: { en: '100 Mbps speed', id: 'Kecepatan 100 Mbps' }, image: '', link: '#' },
        ],
      },
      tab2: {
        cards: [
          { title: { en: 'Basic Package', id: 'Paket Dasar' }, description: { en: '100+ channels', id: '100+ saluran' }, image: '', link: '#' },
        ],
      },
    },
  }),
};

const KEY_HIGHLIGHT: ComponentTypeDefinition = {
  type: 'key_highlight',
  name: 'Key Highlights',
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
  name: 'About with Marquee',
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
        icon: 'FaGlobe',
        title: { en: 'Internet Service', id: 'Layanan Internet' },
        description: { en: 'High-speed internet connectivity.', id: 'Konektivitas internet berkecepatan tinggi.' },
        products: [
          { name: { en: 'Fiber 50 Mbps', id: 'Fiber 50 Mbps' }, link: '#' },
          { name: { en: 'Fiber 100 Mbps', id: 'Fiber 100 Mbps' }, link: '#' },
        ],
      },
      {
        icon: 'FaTv',
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
  name: 'Contact Information',
  description: 'Contact details with icons (phone, email, address, etc.)',
  icon: 'FaAddressBook',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Contact Us', id: 'Hubungi Kami' },
    contact_items: [
      { type: 'phone', icon: 'FaPhone', label: { en: 'Phone', id: 'Telepon' }, value: '+62 21 2996 0808', url: 'tel:+622129960808' },
      { type: 'email', icon: 'FaEnvelope', label: { en: 'Email', id: 'Email' }, value: 'info@linknet.co.id', url: 'mailto:info@linknet.co.id' },
      { type: 'address', icon: 'FaMapMarkerAlt', label: { en: 'Address', id: 'Alamat' }, value: 'Jakarta, Indonesia', url: '' },
    ],
  }),
};

const INFORMATION_LIST: ComponentTypeDefinition = {
  type: 'information_list',
  name: 'Information List',
  description: 'HTML content sections with related articles and document downloads',
  icon: 'FaListUl',
  category: 'basic',
  defaultData: withCommon({
    info_sections: [
      {
        title: { en: 'General Information', id: 'Informasi Umum' },
        content: { en: '<p>General information content here.</p>', id: '<p>Konten informasi umum di sini.</p>' },
        related_articles: [
          { title: { en: 'Related Article 1', id: 'Artikel Terkait 1' }, url: '#' },
        ],
        documents: [
          { title: { en: 'Document 1', id: 'Dokumen 1' }, url: '#', file_type: 'pdf', file_size: '2.5 MB' },
        ],
      },
    ],
  }),
};

const CONTACT_US: ComponentTypeDefinition = {
  type: 'contact_us',
  name: 'Contact Us Section',
  description: 'Contact form section with title, description, and contact details',
  icon: 'FaEnvelopeOpen',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Get in Touch', id: 'Hubungi Kami' },
    description: { en: 'Have a question? We would love to hear from you.', id: 'Punya pertanyaan? Kami senang mendengar dari Anda.' },
    email: 'info@linknet.co.id',
    phone: '+62 21 2996 0808',
    address: { en: 'Jakarta, Indonesia', id: 'Jakarta, Indonesia' },
    show_form: true,
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
  name: 'Accordion',
  description: 'Collapsible FAQ/content sections',
  icon: 'FaListAlt',
  category: 'basic',
  defaultData: withCommon({
    style: 'default',
    allow_multiple: false,
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
  name: 'News Highlights',
  description: 'Featured and grid news articles from database',
  icon: 'FaNewspaper',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Latest News', id: 'Berita Terbaru' },
    featured_count: 1,
    grid_count: 4,
    order: 'latest',
    show_category: true,
    show_date: true,
    cta_text: { en: 'View All News', id: 'Lihat Semua Berita' },
    cta_link: '/news',
  }),
};

const NEWS_LIST: ComponentTypeDefinition = {
  type: 'news_list',
  name: 'News List',
  description: 'Paginated news listing from database with filters',
  icon: 'FaList',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'News', id: 'Berita' },
    source: 'all',
    category_id: null,
    max_data: 12,
    order: 'latest',
    show_pagination: true,
    show_search: true,
    show_category_filter: true,
    layout: 'grid',
  }),
};

const CAREER_HIGHLIGHT: ComponentTypeDefinition = {
  type: 'career_highlight',
  name: 'Career Highlights',
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
  name: 'Career List',
  description: 'Full career listing with search and filters',
  icon: 'FaBriefcase',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Open Positions', id: 'Posisi Terbuka' },
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
  name: 'Management List',
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
  description: 'Announcements listing from database with type/section filters',
  icon: 'FaBullhorn',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Announcements', id: 'Pengumuman' },
    show_type_filter: true,
    show_section_filter: true,
    show_search: true,
    show_pagination: true,
    per_page: 10,
    order: 'latest',
  }),
};

const REPORT_LIST: ComponentTypeDefinition = {
  type: 'report_list',
  name: 'Report List',
  description: 'Financial and corporate reports from database',
  icon: 'FaFileInvoice',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Reports', id: 'Laporan' },
    report_type: null,
    show_year_filter: true,
    show_type_filter: true,
    show_search: true,
    layout: 'grid',
    per_page: 12,
  }),
};

const AWARDS_LIST: ComponentTypeDefinition = {
  type: 'awards_list',
  name: 'Awards List',
  description: 'Company awards and achievements from database',
  icon: 'FaTrophy',
  category: 'main',
  defaultData: withCommon({
    title: { en: 'Awards & Achievements', id: 'Penghargaan & Pencapaian' },
    show_year_filter: true,
    show_image: true,
    layout: 'grid',
    columns: 3,
    order: 'latest',
  }),
};

// ============================================================================
// NEW COMPONENTS (from web_static_reference design)
// ============================================================================

const VISION_MISSION: ComponentTypeDefinition = {
  type: 'vision_mission',
  name: 'Vision & Mission',
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
  name: 'Coverage Map',
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
  name: 'Milestone Timeline',
  description: 'Company timeline with year-based milestones',
  icon: 'FaStream',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Our Journey', id: 'Perjalanan Kami' },
    milestones: [
      { year: '2000', title: { en: 'Founded', id: 'Didirikan' }, description: { en: 'Company was established.', id: 'Perusahaan didirikan.' }, image: '' },
      { year: '2010', title: { en: 'Expansion', id: 'Ekspansi' }, description: { en: 'Nationwide expansion.', id: 'Ekspansi nasional.' }, image: '' },
    ],
  }),
};

const AWARDS_MARQUEE: ComponentTypeDefinition = {
  type: 'awards_marquee',
  name: 'Awards Marquee',
  description: 'Scrolling marquee of awards and achievements',
  icon: 'FaMedal',
  category: 'basic',
  defaultData: withCommon({
    title: { en: 'Awards & Recognition', id: 'Penghargaan & Pengakuan' },
    cta_text: { en: 'View All', id: 'Lihat Semua' },
    cta_link: '/awards',
    marquee_speed: 30,
    marquee_direction: 'left',
  }),
};

const PRODUCT_SHOWCASE: ComponentTypeDefinition = {
  type: 'product_showcase',
  name: 'Product Showcase',
  description: 'Product section with device images, USP cards, and specs/order modals',
  icon: 'FaBox',
  category: 'basic',
  defaultData: withCommon({
    product_name: { en: 'Product Name', id: 'Nama Produk' },
    product_description: { en: 'Product description.', id: 'Deskripsi produk.' },
    product_image: '',
    logo_image: '',
    usp_items: [
      { icon: '', title: { en: 'Feature 1', id: 'Fitur 1' }, description: { en: 'Description', id: 'Deskripsi' } },
    ],
    cta_text: { en: 'Order Now', id: 'Pesan Sekarang' },
    cta_link: '#',
    show_specs: true,
  }),
};

const USP_STRIP: ComponentTypeDefinition = {
  type: 'usp_strip',
  name: 'USP Strip',
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
  name: 'Closing CTA',
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
  name: 'Video Section',
  description: 'Scroll-expanding video/image section with play button',
  icon: 'FaPlayCircle',
  category: 'basic',
  defaultData: withCommon({
    video_url: '',
    poster_image: '',
    autoplay: false,
  }),
};

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
  TABS_WITH_CARD,
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
