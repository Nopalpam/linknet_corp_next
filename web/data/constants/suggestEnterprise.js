const DUMMY_ICON_URL = 'https://dummyimage.com/52x52/000/fff.png&text=Icon';

export const ALL_INDUSTRY_VALUE = 'all-industry';
export const ALL_SCALE_VALUE = 'all-scales';
export const ALL_NEEDS_VALUE = 'all-needs';

export const INDUSTRY_OPTIONS = [
  {
    value: ALL_INDUSTRY_VALUE,
    label: 'All Industry',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'agriculture-forestry-fishing',
    label: 'Agriculture, Forestry, Fishing',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'entertainment-media-advertising',
    label: 'Entertainment, Media & Advertising',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'financial-service-institutions',
    label: 'Financial Service Institutions',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'food-beverage',
    label: 'Food & Beverage',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'general-services',
    label: 'General Services',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'government-affairs',
    label: 'Government & Affairs',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'holding-company',
    label: 'Holding Company',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'hospitality-services',
    label: 'Hospitality Services',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'it-telecommunication',
    label: 'IT & Telecommunication',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'manufacturing',
    label: 'Manufacturing',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'mining-and-oil-gas',
    label: 'Mining and Oil & Gas',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'property-construction',
    label: 'Property & Construction',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'retail-trade',
    label: 'Retail Trade',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'services',
    label: 'Services',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'transportation-public-utilities',
    label: 'Transportation & Public Utilities',
    image: DUMMY_ICON_URL,
  },
];

export const BUSINESS_SCALE_OPTIONS = [
  {
    value: ALL_SCALE_VALUE,
    label: 'All Scales',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'small-business',
    label: 'Small Business (1-10 Employees)',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'medium-enterprise',
    label: 'Medium Enterprise (11-50 Employees)',
    image: DUMMY_ICON_URL,
  },
  {
    value: 'large-enterprise',
    label: 'Large Enterprise (50+ Employees)',
    image: DUMMY_ICON_URL,
  },
];

export const BUSINESS_NEED_OPTIONS = [
  {
    value: 'digital-transformation',
    label: 'Adjust the digital transformation',
    tags: ['Transformasi Digital', 'Sistem Terintegrasi'],
  },
  {
    value: 'business-process-automation',
    label: 'Business Process Automation',
    tags: ['Sistem Terintegrasi'],
  },
  {
    value: 'customer-engagement',
    label: 'Customer Engagement',
    tags: ['Jalin Komunikasi Efektif'],
  },
  {
    value: 'business-environment',
    label: 'Changing and uncertain business environment',
    tags: ['Proteksi Bisnis', 'Koneksi yang Handal'],
  },
  {
    value: 'data-security-privacy',
    label: 'Data Security and Privacy',
    tags: ['Keamanan Data'],
  },
];

export const ALL_INDUSTRY_FILTER_VALUES = INDUSTRY_OPTIONS
  .filter((option) => option.value !== ALL_INDUSTRY_VALUE)
  .map((option) => option.value);

export const ALL_BUSINESS_SCALE_FILTER_VALUES = BUSINESS_SCALE_OPTIONS
  .filter((option) => option.value !== ALL_SCALE_VALUE)
  .map((option) => option.value);

export const SOLUTION_INDUSTRY_MAP = {
  'dedicated-internet-access': ALL_INDUSTRY_FILTER_VALUES,
  datacomm: ALL_INDUSTRY_FILTER_VALUES,
  vsat: [
    'agriculture-forestry-fishing',
    'government-affairs',
    'manufacturing',
    'mining-and-oil-gas',
    'property-construction',
    'transportation-public-utilities',
  ],
  'metro-ethernet': [
    'financial-service-institutions',
    'government-affairs',
    'holding-company',
    'it-telecommunication',
    'manufacturing',
    'property-construction',
    'retail-trade',
    'services',
    'transportation-public-utilities',
  ],
  'ict-solutions': ALL_INDUSTRY_FILTER_VALUES,
  cybersecurity: [
    'financial-service-institutions',
    'government-affairs',
    'holding-company',
    'hospitality-services',
    'it-telecommunication',
    'manufacturing',
    'property-construction',
    'retail-trade',
    'services',
  ],
  colocation: [
    'entertainment-media-advertising',
    'financial-service-institutions',
    'government-affairs',
    'holding-company',
    'it-telecommunication',
    'manufacturing',
    'services',
  ],
  'cloud-computing': ALL_INDUSTRY_FILTER_VALUES,
  'cloud-backup': ALL_INDUSTRY_FILTER_VALUES,
  'disaster-recovery': [
    'financial-service-institutions',
    'government-affairs',
    'holding-company',
    'hospitality-services',
    'it-telecommunication',
    'manufacturing',
    'services',
    'transportation-public-utilities',
  ],
  'professional-service': ALL_INDUSTRY_FILTER_VALUES,
  'managed-service': ALL_INDUSTRY_FILTER_VALUES,
  'corporate-tv': [
    'entertainment-media-advertising',
    'food-beverage',
    'general-services',
    'government-affairs',
    'hospitality-services',
    'property-construction',
    'retail-trade',
    'services',
    'transportation-public-utilities',
  ],
  'network-consulting': ALL_INDUSTRY_FILTER_VALUES,
};

export function getBusinessScaleValuesFromSegments(segments = []) {
  const normalizedSegments = Array.isArray(segments) ? segments : [];
  const values = new Set();

  if (normalizedSegments.includes('sme')) {
    values.add('small-business');
    values.add('medium-enterprise');
  }

  if (normalizedSegments.includes('enterprise')) {
    values.add('medium-enterprise');
    values.add('large-enterprise');
  }

  return Array.from(values);
}

export function getNeedTagsFromValues(values = []) {
  const selectedValues = Array.isArray(values) ? values : [];

  return Array.from(
    new Set(
      BUSINESS_NEED_OPTIONS
        .filter((option) => selectedValues.includes(option.value))
        .flatMap((option) => option.tags)
    )
  );
}
