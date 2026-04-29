export const navItems = [
  {
    id: 'home',
    label: 'Home',
    url: '/',
  },
  {
    id: 'product-services',
    label: 'Product & Services',
    url: '/product-services',
    sections: [
      {
        title: 'Our Services',
        items: [
          { label: 'OTT Solutions', url: '/product-services/ott-solutions' },
          { label: 'IPTV Services', url: '/product-services/iptv-services' },
          { label: 'Hospitality Entertainment', url: '/product-services/hospitality-entertainment' },
          { label: 'Media Advertising', url: '/product-services/media-advertising' },
        ],
      },
    ],
  },
  {
    id: 'tv',
    label: 'Explore TV',
    url: '/tv',
    sections: [
      {
        title: 'Explore TV',
        items: [
          { label: 'TV Highlight', url: '/tv-highlight' },
          { label: 'TV Channel', url: '/tv-channel' },
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    url: '/about',
  },
  {
    id: 'insight',
    label: 'Insight',
    url: '/insight',
  },
  {
    id: 'event',
    label: 'Event',
    url: '/event',
  },
];
