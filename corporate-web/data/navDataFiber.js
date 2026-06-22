export const navItems = [
  {
    id: 'home',
    label: 'Home',
    url: '/',
  },
  {
    id: 'service',
    label: 'Service',
    url: '/service',
    sections: [
      {
        title: 'Our Services',
        items: [
          { label: 'Build to Suit FTTH Network', url: '/service/build-to-suit-ftth-network' },
          { label: 'Data Center Services', url: '/service/data-center-services' },
          { label: 'NAP Services (IP Transit)', url: '/service/nap-services-ip-transit' },
          { label: 'Localized Content (CDN)', url: '/service/localized-content-cdn' },
          { label: 'Leased Capacity', url: '/service/leased-capacity' },
          { label: 'Operation & Maintenance', url: '/service/operation-maintenance' },
        ],
      },
    ],
  },
  {
    id: 'coverage',
    label: 'Coverage',
    url: '/coverage',
  },
  {
    id: 'insight',
    label: 'Insight',
    url: '/insight',
  },
  {
    id: 'about',
    label: 'About',
    url: '/about',
  },
  {
    id: 'registration',
    label: 'Registration',
    url: '/registration',
  },
];
