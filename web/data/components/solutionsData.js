/**
 * solutionsData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Bank data master seluruh item solusi.
 * Struktur: flat array of objects — tidak ada grouping kategori di sini.
 * Grouping kategori diatur di SolutionsFiltered.js via id reference.
 *
 * Field `segments` → array segment bisnis yang relevan (enterprise, sme, dll.)
 * Field `tags`     → array Business Needs untuk filter UI
 *
 * Pola penggunaan:
 *   import { SOLUTIONS_DATA } from '@/data/components/solutionsData';
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SOLUTIONS_DATA = [

  // ── CONNECTIVITY ──────────────────────────────────────────────────────────

  {
    id: 'dedicated-internet-access',
    segments: ['enterprise', 'sme'],
    thumbnail: '/assets/bg/dedicated-internet.jpg',
    category: 'Connectivity',
    categoryIcon: '/assets/icons/wifi.svg',
    title: 'Dedicated Internet Access',
    description:
      'Fully support your every step with fast and reliable internet service throughout your business operations.',
    href: '/solutions/dedicated-internet-access',
    tags: ['Internet', 'Proteksi Bisnis', 'Koneksi yang Handal'],
  },
  {
    id: 'datacomm',
    segments: ['enterprise', 'sme'],
    thumbnail: '/assets/bg/onestreamheroimage.jpg',
    category: 'Connectivity',
    categoryIcon: '/assets/icons/cookie.svg',
    title: 'Datacomm',
    description:
      'Berikan kelancaran transaksi data antar kantor cabang secara aman, cepat, dan andal untuk mendukung operasional bisnis Anda.',
    href: '/solutions/datacomm',
    tags: ['Jalin Komunikasi Efektif', 'Sistem Terintegrasi', 'Koneksi yang Handal'],
  },
  {
    id: 'vsat',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/vsat.jpg',
    category: 'Connectivity',
    categoryIcon: '/assets/icons/satellite.svg',
    title: 'VSAT',
    description:
      'Long-distance communication solutions via satellite to stay securely connected wherever your business operates.',
    href: '/solutions/vsat',
    tags: ['Jalin Komunikasi Efektif', 'Proteksi Bisnis', 'Koneksi yang Handal'],
  },
  {
    id: 'metro-ethernet',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/metro-ethernet.jpg',
    category: 'Connectivity',
    categoryIcon: '/assets/icons/network.svg',
    title: 'Metro Ethernet',
    description:
      'Solusi jaringan berbasis fiber optik berkecepatan tinggi untuk menghubungkan multi-site bisnis Anda di area metropolitan.',
    href: '/solutions/metro-ethernet',
    tags: ['Jalin Komunikasi Efektif', 'Sistem Terintegrasi', 'Koneksi yang Handal'],
  },

  // ── ICT SOLUTIONS ─────────────────────────────────────────────────────────

  {
    id: 'ict-solutions',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/ict-solutions.jpg',
    category: 'ICT Solutions',
    categoryIcon: '/assets/icons/monitor.svg',
    title: 'ICT Solutions',
    description:
      'Tingkatkan efisiensi bisnis Anda dengan solusi teknologi informasi dan komunikasi terpadu yang dirancang untuk kebutuhan enterprise.',
    href: '/solutions/ict-solutions',
    tags: ['Proteksi Bisnis', 'Transformasi Digital'],
  },
  {
    id: 'cybersecurity',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/cybersecurity.jpg',
    category: 'ICT Solutions',
    categoryIcon: '/assets/icons/shield.svg',
    title: 'Cybersecurity',
    description:
      'Lindungi aset digital dan data sensitif perusahaan Anda dari ancaman siber dengan solusi keamanan berlapis.',
    href: '/solutions/cybersecurity',
    tags: ['Proteksi Bisnis', 'Keamanan Data'],
  },
  {
    id: 'colocation',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/colocation.jpg',
    category: 'ICT Solutions',
    categoryIcon: '/assets/icons/server.svg',
    title: 'Colocation',
    description:
      'Tempatkan server dan perangkat IT Anda di data center kami yang berstandar tinggi dengan uptime terjamin.',
    href: '/solutions/colocation',
    tags: ['Proteksi Bisnis', 'Koneksi yang Handal', 'Transformasi Digital'],
  },

  // ── CLOUD ─────────────────────────────────────────────────────────────────

  {
    id: 'cloud-computing',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/cloud-computing.jpg',
    category: 'Cloud',
    categoryIcon: '/assets/icons/cloud.svg',
    title: 'Cloud Computing',
    description:
      'Skalakan infrastruktur IT bisnis Anda secara fleksibel dengan layanan cloud yang aman, andal, dan hemat biaya.',
    href: '/solutions/cloud-computing',
    tags: ['Proteksi Bisnis', 'Koneksi yang Handal', 'Transformasi Digital'],
  },
  {
    id: 'cloud-backup',
    segments: ['enterprise', 'sme'],
    thumbnail: '/assets/bg/cloud-backup.jpg',
    category: 'Cloud',
    categoryIcon: '/assets/icons/cloud-upload.svg',
    title: 'Cloud Backup',
    description:
      'Amankan data bisnis Anda secara otomatis dengan layanan backup berbasis cloud yang andal dan mudah dipulihkan kapan saja.',
    href: '/solutions/cloud-backup',
    tags: ['Proteksi Bisnis', 'Keamanan Data'],
  },
  {
    id: 'disaster-recovery',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/disaster-recovery.jpg',
    category: 'Cloud',
    categoryIcon: '/assets/icons/refresh.svg',
    title: 'Disaster Recovery',
    description:
      'Pastikan kelangsungan bisnis Anda dengan solusi pemulihan bencana yang cepat dan terpercaya saat terjadi gangguan sistem.',
    href: '/solutions/disaster-recovery',
    tags: ['Proteksi Bisnis', 'Keamanan Data', 'Koneksi yang Handal'],
  },

  // ── PROFESSIONAL SERVICE ──────────────────────────────────────────────────

  {
    id: 'professional-service',
    segments: ['enterprise', 'sme'],
    thumbnail: '/assets/bg/professional-service.jpg',
    category: 'Professional Service',
    categoryIcon: '/assets/icons/briefcase.svg',
    title: 'Professional Service',
    description:
      'Solusi yang menjamin efisiensi dan keandalan infrastruktur IT, membantu bisnis beroperasi tanpa hambatan.',
    href: '/solutions/professional-service',
    tags: ['Jalin Komunikasi Efektif', 'Proteksi Bisnis'],
  },
  {
    id: 'managed-service',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/managed-service.jpg',
    category: 'Professional Service',
    categoryIcon: '/assets/icons/settings.svg',
    title: 'Managed Service',
    description:
      'Optimalkan konektivitas & ICT Solution secara efisien melalui layanan pengelolaan IT menyeluruh dari tim ahli kami.',
    href: '/solutions/managed-service',
    tags: ['Jalin Komunikasi Efektif', 'Proteksi Bisnis', 'Koneksi yang Handal'],
  },
  {
    id: 'corporate-tv',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/corporate-tv.jpg',
    category: 'Professional Service',
    categoryIcon: '/assets/icons/monitor.svg',
    title: 'Corporate TV',
    description:
      'Penuhi ekspektasi dengan saluran TV berkualitas, siaran langsung olahraga, hiburan, dan konten bisnis premium.',
    href: '/solutions/corporate-tv',
    tags: ['Jalin Komunikasi Efektif', 'Proteksi Bisnis', 'Koneksi yang Handal'],
  },
  {
    id: 'network-consulting',
    segments: ['enterprise'],
    thumbnail: '/assets/bg/network-consulting.jpg',
    category: 'Professional Service',
    categoryIcon: '/assets/icons/users.svg',
    title: 'Network Consulting',
    description:
      'Dapatkan rekomendasi arsitektur jaringan terbaik dari konsultan berpengalaman kami untuk transformasi digital bisnis Anda.',
    href: '/solutions/network-consulting',
    tags: ['Transformasi Digital', 'Koneksi yang Handal'],
  },

];