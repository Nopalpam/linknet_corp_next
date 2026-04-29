/**
 * solutionServicesHome.js
 * Data source untuk komponen SolutionServicesHome.
 *
 * Cara penggunaan di komponen:
 *   import { SOLUTION_SERVICES_HOME_DATA } from '@/data/components/solutionServicesHome';
 *   const data = SOLUTION_SERVICES_HOME_DATA['home'];
 */

export const SOLUTION_SERVICES_HOME_DATA = {
  // ─── Key 'home' → digunakan di halaman utama ────────────────────────────────
  home: {
    config: {
      sectionId: "section-solution-services",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },

    // Data untuk komponen <SectionIntro />
    introData: {
      as: 'h2',
      label: 'OUR SERVICES',
      title: 'Empowering your business with\nsolutions that fit your goals perfectly.',
      align: 'left',
    },

    // Tampilkan/sembunyikan SegmentPicker (override oleh prop hideTabs di komponen)
    tabsVisible: true,

    // Opsi untuk <SegmentPicker /> — urutan menentukan tab default (index 0)
    tabs: [
      { label: 'Enterprise', value: 'enterprise' },
      { label: 'SME',        value: 'sme' },
    ],

    // Kartu solusi dikelompokkan per value tab.
    // Satu item bisa muncul di banyak tab dengan mendaftarkan id-nya di segments[].
    // Field 'segments' digunakan komponen untuk filter via useMemo.
    items: {
      enterprise: [
        {
          id: 'dedicated-internet',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/bg/mateusz-zatorski-wN9oyogyjQc-unsplash.jpg',
          thumbnailAlt: 'Professional working on laptop in modern office',
          category: 'Connectivity',
          categoryIcon: '/assets/icons/cookie.svg',
          title: 'Dedicated Internet',
          description:
            'Reliable connectivity for seamless communication, productivity, and business growth.',
          href: '/solutions/dedicated-internet',
          ctaLabel: 'View Details',
        },
        {
          id: 'anti-ddos',
          segments: ['enterprise'],
          variant: 'parent',
          thumbnail: '/assets/bg/room-interior-hotel-bedroom.jpg',
          thumbnailAlt: 'Cybersecurity shield hologram on laptop keyboard',
          category: 'ICT Solutions',
          categoryIcon: '/assets/icons/settings.svg',
          title: 'Anti-DDoS',
          description:
            'Advanced',
          href: '/solutions/anti-ddos',
          ctaLabel: 'View Details',
        },
        {
          id: 'managed-service',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/managed-service.jpg',
          thumbnailAlt: 'Smart city skyline with network connectivity lights',
          category: 'Professional Service',
          categoryIcon: '/assets/icons/smartphone.svg',
          title: 'Managed Service',
          description:
            'Providing professional support for IT infrastructure maintenance to ensure smooth business operations.',
          href: '/solutions/managed-service',
          ctaLabel: 'View Details',
        },
        {
          id: 'cloud-connect',
          segments: ['enterprise'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/cloud-connect.jpg',
          thumbnailAlt: 'Cloud infrastructure visualization',
          category: 'Cloud',
          categoryIcon: '/assets/icons/cloud.svg',
          title: 'Cloud Connect',
          description:
            'Seamless, secure cloud connectivity that scales with your enterprise infrastructure demands.',
          href: '/solutions/cloud-connect',
          ctaLabel: 'View Details',
        },
        {
          id: 'colocation',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/colocation.jpg',
          thumbnailAlt: 'Data center server racks',
          category: 'ICT Solutions',
          categoryIcon: '/assets/icons/server.svg',
          title: 'Colocation',
          description:
            'House your servers in our world-class data centers with 99.9% uptime guarantee.',
          href: '/solutions/colocation',
          ctaLabel: 'View Details',
        },
        {
          id: 'mpls-vpn',
          segments: ['enterprise'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/mpls-vpn.jpg',
          thumbnailAlt: 'Global network topology diagram',
          category: 'Connectivity',
          categoryIcon: '/assets/icons/globe.svg',
          title: 'MPLS VPN',
          description:
            'Private, high-performance wide area network connecting all your branches securely.',
          href: '/solutions/mpls-vpn',
          ctaLabel: 'View Details',
        },
      ],

      sme: [
        {
          id: 'business-wifi',
          segments: ['sme'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/business-wifi.jpg',
          thumbnailAlt: 'Business WiFi setup in office',
          category: 'Connectivity',
          categoryIcon: '/assets/icons/wifi.svg',
          title: 'Business WiFi',
          description:
            'Enterprise-grade wireless connectivity tailored for small and medium businesses.',
          href: '/solutions/business-wifi',
          ctaLabel: 'View Details',
        },
        {
          id: 'managed-service',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/managed-service.jpg',
          thumbnailAlt: 'Smart city skyline with network connectivity lights',
          category: 'Professional Service',
          categoryIcon: '/assets/icons/smartphone.svg',
          title: 'Managed Service',
          description:
            'Providing professional support for IT infrastructure maintenance to ensure smooth business operations.',
          href: '/solutions/managed-service',
          ctaLabel: 'View Details',
        },
        {
          id: 'colocation',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/colocation.jpg',
          thumbnailAlt: 'Data center server racks',
          category: 'ICT Solutions',
          categoryIcon: '/assets/icons/server.svg',
          title: 'Colocation',
          description:
            'House your servers in our world-class data centers with 99.9% uptime guarantee.',
          href: '/solutions/colocation',
          ctaLabel: 'View Details',
        },
        {
          id: 'linknet-one',
          segments: ['sme'],
          variant: 'parent',
          thumbnail: '/assets/images/solutions/linknet-one.jpg',
          thumbnailAlt: 'SME business owner using tablet',
          category: 'Bundled Solution',
          categoryIcon: '/assets/icons/package.svg',
          title: 'Linknet One',
          description:
            'All-in-one internet and communication package designed specifically for growing SMEs.',
          href: '/solutions/linknet-one',
          ctaLabel: 'View Details',
        },
      ],
    },

    // CTA di bawah slider
    ctaList: [
      {
        text: 'Browse All Solutions',
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '/solutions',
      },
    ],
  },

  fiberPreview: {
    config: {
      sectionId: "section-solution-services-fiber-preview",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: 'h2',
      label: 'OUR SERVICES',
      title: 'Empowering your business with\nsolutions that fit your goals perfectly.',
      align: 'left',
    },
    tabsVisible: false,
    tabs: [
      { label: 'Enterprise', value: 'enterprise' },
      { label: 'SME', value: 'sme' },
    ],
    items: {
      enterprise: [
        {
          id: 'build-to-suit-ftth-network',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/ftth.jpg',
          thumbnailAlt: 'Build to Suit FTTH Network',
          category: '',
          categoryIcon: '',
          title: 'Build to Suit FTTH Network',
          description:
            'Customized fiber-to-the-home network deployment tailored to your operational requirements.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'data-center-services',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/data-center.jpg',
          thumbnailAlt: 'Data Center Services',
          category: '',
          categoryIcon: '',
          title: 'Data Center Services',
          description:
            'Secure and scalable data center support for hosting critical infrastructure and workloads.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'nap-services-ip-transit',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/nap.jpg',
          thumbnailAlt: 'NAP Services (IP Transit)',
          category: '',
          categoryIcon: '',
          title: 'NAP Services (IP Transit)',
          description:
            'High-capacity IP transit service for reliable interconnection and internet backbone access.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'localized-content-cdn',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/nap.jpg',
          thumbnailAlt: 'Localized Content (CDN)',
          category: '',
          categoryIcon: '',
          title: 'Localized Content (CDN)',
          description:
            'Content delivery support designed to improve access speed and distribution efficiency.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'leased-capacity',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/ftth.jpg',
          thumbnailAlt: 'Leased Capacity',
          category: '',
          categoryIcon: '',
          title: 'Leased Capacity',
          description:
            'Dedicated network capacity to support high-volume traffic and long-term connectivity needs.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'operation-and-maintenance',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/data-center.jpg',
          thumbnailAlt: 'Operation & Maintenance',
          category: '',
          categoryIcon: '',
          title: 'Operation & Maintenance',
          description:
            'Operational and maintenance services to help keep network performance stable and efficient.',
          href: '#',
          ctaLabel: 'View Details',
        },
      ],
      sme: [
        {
          id: 'build-to-suit-ftth-network',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/ftth.jpg',
          thumbnailAlt: 'Build to Suit FTTH Network',
          category: '',
          categoryIcon: '',
          title: 'Build to Suit FTTH Network',
          description:
            'Customized fiber-to-the-home network deployment tailored to your operational requirements.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'data-center-services',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/data-center.jpg',
          thumbnailAlt: 'Data Center Services',
          category: '',
          categoryIcon: '',
          title: 'Data Center Services',
          description:
            'Secure and scalable data center support for hosting critical infrastructure and workloads.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'nap-services-ip-transit',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/nap.jpg',
          thumbnailAlt: 'NAP Services (IP Transit)',
          category: '',
          categoryIcon: '',
          title: 'NAP Services (IP Transit)',
          description:
            'High-capacity IP transit service for reliable interconnection and internet backbone access.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'localized-content-cdn',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/nap.jpg',
          thumbnailAlt: 'Localized Content (CDN)',
          category: '',
          categoryIcon: '',
          title: 'Localized Content (CDN)',
          description:
            'Content delivery support designed to improve access speed and distribution efficiency.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'leased-capacity',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/ftth.jpg',
          thumbnailAlt: 'Leased Capacity',
          category: '',
          categoryIcon: '',
          title: 'Leased Capacity',
          description:
            'Dedicated network capacity to support high-volume traffic and long-term connectivity needs.',
          href: '#',
          ctaLabel: 'View Details',
        },
        {
          id: 'operation-and-maintenance',
          segments: ['enterprise', 'sme'],
          variant: 'parent',
          thumbnail: '/assets/img/product/data-center.jpg',
          thumbnailAlt: 'Operation & Maintenance',
          category: '',
          categoryIcon: '',
          title: 'Operation & Maintenance',
          description:
            'Operational and maintenance services to help keep network performance stable and efficient.',
          href: '#',
          ctaLabel: 'View Details',
        },
      ],
    },
    ctaList: [
      {
        text: 'Browse All Solutions',
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '/solutions',
      },
    ],
  },

  // ─── Key tambahan bisa ditambahkan di sini ────────────────────────────────
  // Contoh: key 'solutions-page' untuk halaman /solutions dengan konfigurasi berbeda
  // 'solutions-page': { ... }
};
