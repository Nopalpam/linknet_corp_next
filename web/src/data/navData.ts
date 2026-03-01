/**
 * Navigation Data
 * Adapted from ln-corporate/data/navData.js
 * Data sementara (static), bisa diganti dengan API fetch nanti
 */

export interface NavSection {
  title: string;
  items: { label: string; url: string }[];
}

export interface NavItem {
  id: string;
  label: string;
  url: string;
  sections?: NavSection[];
}

export const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    url: '/',
  },
  {
    id: 'about',
    label: 'About',
    url: '/about',
    sections: [
      {
        title: 'Company Profile',
        items: [
          { label: 'Corporate Information', url: '/about/info' },
          { label: 'Corporate Overview', url: '/about/overview' },
          { label: 'Milestones', url: '/about/milestones' },
        ],
      },
      {
        title: 'Leadership & Structure',
        items: [
          { label: 'Group Structures', url: '/about/group-structure' },
          { label: 'Managements', url: '/about/management' },
          { label: 'Awards', url: '/about/awards' },
        ],
      },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    url: '/business',
    sections: [
      {
        title: '',
        items: [
          { label: 'Linknet Enterprise', url: '/business/enterprise' },
          { label: 'Linknet Fiber', url: '/business/fiber' },
          { label: 'Linknet Media', url: '/business/media' },
        ],
      },
    ],
  },
  {
    id: 'governance',
    label: 'Corporate Governance',
    url: '/governance',
    sections: [
      {
        title: 'Framework & Principles',
        items: [
          { label: 'Structure', url: '/governance/structure' },
          { label: 'Principle', url: '/governance/principle' },
          { label: 'Guidance', url: '/governance/guidance' },
          { label: 'Article of Association', url: '/governance/aoa' },
          { label: 'Code of Conduct', url: '/governance/code-of-conduct' },
        ],
      },
      {
        title: 'Committee & Privacy',
        items: [
          { label: 'Organization Structures', url: '/governance/org-structures' },
          { label: 'Board & Committe Charters', url: '/governance/charters' },
          { label: 'Data Privacy Policy', url: '/governance/privacy' },
          { label: 'GDS Policy', url: '/governance/gds' },
        ],
      },
      {
        title: 'Compliance & Systems',
        items: [
          { label: 'Whistleblowing System', url: '/governance/wbs' },
          { label: 'Whistleblowing Policy', url: '/governance/wbs-policy' },
          { label: 'ABAC Policy', url: '/governance/abac-policy' },
          { label: 'ABAC Clause', url: '/governance/abac-clause' },
          { label: 'Certified for Standarization', url: '/governance/iso' },
        ],
      },
    ],
  },
  {
    id: 'investor',
    label: 'Investor',
    url: '/investor',
    sections: [
      {
        title: 'Stock',
        items: [
          { label: 'Stock Price', url: '/investor/stock' },
        ],
      },
      {
        title: 'Announcements',
        items: [
          { label: 'GMS Announcement', url: '/investor/gms' },
          { label: 'Emiten Announcement', url: '/investor/emiten' },
          { label: 'Public Expose Announcement', url: '/investor/public-expose' },
        ],
      },
      {
        title: 'Financial Data',
        items: [
          { label: 'Financial Statement', url: '/investor/financial' },
          { label: 'Annual Report', url: '/investor/annual-report' },
          { label: 'Sustainability Report', url: '/investor/sustainability-report' },
        ],
      },
    ],
  },
  {
    id: 'media',
    label: 'Media',
    url: '/media',
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    url: '/sustainability',
  },
  {
    id: 'career',
    label: 'Career',
    url: '/career',
  },
];

/** Social media / footer contact links */
export const contactLinks = [
  {
    id: 'instagram',
    icon: 'instagram',
    value: 'https://www.instagram.com/linknetmedia',
  },
  {
    id: 'youtube',
    icon: 'youtube',
    value: 'https://www.youtube.com/@Linknetmedia',
  },
  {
    id: 'linkedin',
    icon: 'linkedin',
    value: 'https://www.linkedin.com/company/linknet',
  },
];
