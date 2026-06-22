const DEFAULT_ORGANIZER = {
  label: 'Organized by',
  name: 'PT Link Net Tbk',
  logo: '/assets/logos/linknet-logo.svg',
};

function createMapEmbedUrl(query) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function createDirectionUrl(query) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

function getValidDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatShortMonthDay(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatEventDateLabel({ date, startDate, endDate }) {
  const singleDate = getValidDate(date);
  const rangeStart = getValidDate(startDate);
  const rangeEnd = getValidDate(endDate);

  if (singleDate) {
    return formatShortDate(singleDate);
  }

  if (rangeStart && rangeEnd) {
    const sameYear = rangeStart.getUTCFullYear() === rangeEnd.getUTCFullYear();

    if (sameYear) {
      return `${formatShortMonthDay(rangeStart)} - ${formatShortDate(rangeEnd)}`;
    }

    return `${formatShortDate(rangeStart)} - ${formatShortDate(rangeEnd)}`;
  }

  if (rangeStart) return formatShortDate(rangeStart);
  if (rangeEnd) return formatShortDate(rangeEnd);

  return '';
}

export function formatEventTimestamp(value) {
  const date = getValidDate(value);

  if (!date) return value || '-';

  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  return `${datePart}, ${timePart}`;
}

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
}

export function formatEventTimeLabel({ timeStart, timeEnd, date, startDate, endDate }) {
  const start = getValidDate(timeStart || date || startDate);
  const end = getValidDate(timeEnd || endDate);

  if (start && end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  if (start) return formatTime(start);
  if (end) return formatTime(end);

  return '';
}

function createEvent({
  id,
  slug,
  image,
  title,
  heroTitle,
  excerpt,
  status,
  publishStatus = 'active',
  location,
  date,
  startDate,
  endDate,
  timeStart,
  timeEnd,
  registrationEndedTime,
  organizer = DEFAULT_ORGANIZER,
  venue,
  ticketPrice = 'FREE',
  registerLink = '#',
  content,
  articleIds = [],
  mapEmbed,
  address,
  maxRegisterParticipants = 5,
}) {
  const directionQuery = address || [venue, location].filter(Boolean).join(', ');

  return {
    id,
    slug,
    image,
    posterImage: image,
    thumbnailImage: image,
    title,
    heroTitle,
    excerpt,
    status,
    publishStatus,
    location,
    date,
    startDate,
    endDate,
    badgeText: status === 'ongoing' ? 'On Going' : undefined,
    timeStart,
    timeEnd,
    registrationEndedTime,
    venue,
    ticketPrice,
    registerLink,
    content,
    articleIds,
    maxRegisterParticipants,
    organizer: {
      ...DEFAULT_ORGANIZER,
      ...organizer,
    },
    heroLocation: [venue, location].filter(Boolean).join(', '),
    locationSection: {
      title: 'Event Location',
      mapEmbedUrl: mapEmbed,
      name: venue,
      address,
      directionsLink: createDirectionUrl(directionQuery),
    },
  };
}

export const EVENT_LIST = [
  createEvent({
    id: 'event-001',
    slug: 'national-technology-summit-2025',
    image: '/assets/img/event/639871181_17927220654212551_7824130188111952002_n.jpg',
    title: 'National Technology Summit 2025',
    heroTitle: 'Linknet Strengthens the Digital Ecosystem Through the National Technology Summit 2025',
    excerpt: 'A strategic forum that brought together industry leaders, regulators, and partners to accelerate Indonesia’s digital ecosystem development.',
    status: 'ongoing',
    location: 'Jakarta',
    startDate: '2026-09-14T05:00:00Z',
    endDate: '2026-09-20T14:00:00Z',
    registrationEndedTime: '2026-02-19T08:00:00Z',
    organizer: {
      name: 'PT Link Net Tbk',
      logo: '/assets/logos/linknet-logo.svg',
    },
    maxRegisterParticipants: 5,
    venue: 'Pullman Jakarta Indonesia Thamrin CBD',
    registerLink: '#',
    mapEmbed: createMapEmbedUrl('Pullman Jakarta Indonesia Thamrin CBD'),
    address: 'Jl. M.H. Thamrin No.59, Gondangdia, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10350',
    content: `
      <p>Linknet, in collaboration with the Indonesian Internet Service Providers Association (APJII), held the National Technology Summit 2025 as a strategic forum to discuss the direction of Indonesia&rsquo;s digital ecosystem development.</p>
      <p>Carrying the theme “We LINK The Nation for Sustainable Future,” the event brought together business leaders, regulators, and association representatives to formulate concrete steps for strengthening national digital transformation.</p>
      <p>Linknet&rsquo;s President Director &amp; CEO, Kanishka Gayan Wickrama, opened the event by emphasizing that this year&rsquo;s theme reflects Linknet&rsquo;s 25-year commitment to serving Indonesia through meaningful connectivity and enterprise innovation.</p>
      <blockquote>“We organize the National Technology Summit 2025 as a collaborative platform for all partners within one ecosystem, enabling us to achieve our shared goals,” said Kanishka in his opening remarks.</blockquote>
    `,
  }),
  createEvent({
    id: 'event-002',
    slug: 'golf-gala-2025-linknet-enterprise',
    image: '/assets/img/event/648799062_17929129512212551_232502929899933272_n.jpg',
    title: 'Golf Gala 2025 by Linknet Enterprise',
    heroTitle: 'Linknet Enterprise Builds Closer Executive Partnerships Through Golf Gala 2025',
    excerpt: 'An invitation-only networking experience designed to strengthen collaboration with enterprise customers and strategic partners.',
    status: 'upcoming',
    location: 'Bogor',
    date: '2025-12-04T07:00:00Z',
    timeStart: '2025-12-04T07:00:00Z',
    timeEnd: '2025-12-04T16:00:00Z',
    registrationEndedTime: '2025-10-10T09:00:00Z',
    organizer: {
      name: 'Linknet Enterprise',
      logo: '/assets/logos/logo-linknet-enterprise.png',
    },
    maxRegisterParticipants: 4,
    venue: 'Rainbow Hills Golf Club',
    registerLink: '#',
    articleIds: ['news-002'],
    mapEmbed: createMapEmbedUrl('Rainbow Hills Golf Club Bogor'),
    address: 'Jl. Bukit Pelangi Golf No.1, Gunung Geulis, Sukaraja, Kabupaten Bogor, Jawa Barat',
    content: `
      <p>Golf Gala 2025 by Linknet Enterprise is designed as an intimate executive gathering that combines relationship building with strategic business conversations in a relaxed setting.</p>
      <p>The event will welcome enterprise decision makers, channel partners, and Linknet leadership for a full-day program consisting of networking sessions, customer appreciation moments, and solution showcases.</p>
      <p>Through this event, Linknet aims to strengthen long-term trust with partners while opening new collaboration opportunities across enterprise connectivity, managed services, and digital infrastructure.</p>
    `,
  }),
  createEvent({
    id: 'event-003',
    slug: 'channel-partner-program-launch',
    image: '/assets/img/event/658550647_17934304989212551_5721423078563669016_n.jpg',
    title: 'Peluncuran dan Sosialisasi Program Channel Partner PT Link Net',
    heroTitle: 'Linknet Introduces Its Channel Partner Program to Accelerate Regional Business Growth',
    excerpt: 'A launch event for Linknet’s channel partner program focused on expanding collaboration with regional sales and delivery partners.',
    status: 'ended',
    location: 'Solo',
    date: '2025-11-27T09:00:00Z',
    timeStart: '2025-11-27T09:00:00Z',
    timeEnd: '2025-11-27T13:00:00Z',
    registrationEndedTime: '2025-11-01T09:00:00Z',
    organizer: {
      name: 'PT Link Net Tbk',
      logo: '/assets/logos/linknet-logo.svg',
    },
    maxRegisterParticipants: 1,
    venue: 'Alila Solo',
    registerLink: '#',
    articleIds: ['news-003'],
    mapEmbed: createMapEmbedUrl('Alila Solo'),
    address: 'Jl. Slamet Riyadi No.562, Jajar, Laweyan, Kota Surakarta, Jawa Tengah',
    content: `
      <p>This launch event marked an important step in Linknet’s go-to-market expansion through a stronger channel ecosystem in key regional markets.</p>
      <p>Attendees were introduced to the program structure, commercial opportunities, service support model, and joint growth framework prepared for future partners.</p>
      <p>The session also highlighted how Linknet plans to collaborate more closely with local business communities to deliver faster, more relevant connectivity solutions.</p>
    `,
  }),
  createEvent({
    id: 'event-004',
    slug: 'linknet-courage-run-2025',
    image: '/assets/img/event/660038768_17933355159212551_2002275764996607793_n.jpg',
    title: '25 Tahun Linknet bersama Linknet Courage Run 2025',
    heroTitle: 'Linknet Celebrates 25 Years of Impact Through Courage Run 2025',
    excerpt: 'A milestone celebration that combines employee engagement, community spirit, and Linknet’s anniversary momentum.',
    status: 'ended',
    location: 'Tangerang Selatan',
    date: '2025-11-16T05:30:00Z',
    timeStart: '2025-11-16T05:30:00Z',
    timeEnd: '2025-11-16T10:00:00Z',
    registrationEndedTime: '2025-09-12T10:00:00Z',
    organizer: {
      name: 'PT Link Net Tbk',
      logo: '/assets/logos/linknet-logo.svg',
    },
    venue: 'ICE BSD City',
    registerLink: '#',
    articleIds: ['news-004'],
    mapEmbed: createMapEmbedUrl('ICE BSD City'),
    address: 'Jl. BSD Grand Boulevard No.1, Pagedangan, Kabupaten Tangerang, Banten',
    content: `
      <p>Linknet Courage Run 2025 was held as part of the company’s 25th anniversary celebration, creating a memorable experience that brought together employees, families, and communities.</p>
      <p>Beyond the running program, the event reflected Linknet’s spirit of resilience, collaboration, and commitment to creating positive impact beyond the workplace.</p>
      <p>The anniversary celebration also served as a moment to reaffirm the company’s purpose and its continued ambition to connect Indonesia with better services and stronger partnerships.</p>
    `,
  }),
  createEvent({
    id: 'event-005',
    slug: 'optimizing-manufacturing-performance-smart-solutions',
    image: '/assets/img/event/660624264_17933490015212551_4475227640034839453_n.jpg',
    title: 'Optimizing Manufacturing Performance with Smart Solutions',
    heroTitle: 'Linknet Showcases Smart Infrastructure Strategies for Manufacturing Leaders',
    excerpt: 'A focused session for manufacturing companies looking to improve operational visibility, resilience, and plant connectivity.',
    status: 'ended',
    location: 'Jakarta Selatan',
    date: '2025-11-10T10:00:00Z',
    timeStart: '2025-11-10T10:00:00Z',
    timeEnd: '2025-11-10T14:30:00Z',
    registrationEndedTime: '2025-10-20T09:00:00Z',
    organizer: {
      name: 'Linknet Enterprise',
      logo: '/assets/logos/logo-linknet-enterprise.png',
    },
    venue: 'Ayana Midplaza Jakarta',
    registerLink: '#',
    articleIds: ['news-005'],
    mapEmbed: createMapEmbedUrl('Ayana Midplaza Jakarta'),
    address: 'Jl. Jend. Sudirman Kav.10-11, Karet Tengsin, Jakarta Pusat',
    content: `
      <p>This event explored how manufacturers can improve uptime, streamline communication across facilities, and strengthen business continuity through smarter network architecture.</p>
      <p>Linknet’s team shared practical approaches to integrating connectivity, monitoring, and managed services into operational environments where reliability is essential.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
    `,
  }),
  createEvent({
    id: 'event-006',
    slug: 'connected-protected-cyber-security',
    image: '/assets/img/event/671094639_17934697173212551_2271980180594313648_n.jpg',
    title: 'Connected & Protected: Elevating Business with Cyber Security',
    heroTitle: 'Linknet Highlights the Role of Secure Connectivity in Modern Business Operations',
    excerpt: 'An event dedicated to helping enterprises improve cyber resilience while maintaining reliable operational connectivity.',
    status: 'ended',
    location: 'Tangerang Selatan',
    startDate: '2025-11-07T09:00:00Z',
    endDate: '2025-11-08T15:00:00Z',
    registrationEndedTime: '2025-10-15T08:30:00Z',
    organizer: {
      name: 'Linknet Enterprise',
      logo: '/assets/logos/logo-linknet-enterprise.png',
    },
    venue: 'Mercure Serpong Alam Sutera',
    registerLink: '#',
    articleIds: ['news-007'],
    mapEmbed: createMapEmbedUrl('Mercure Serpong Alam Sutera'),
    address: 'Jl. Alam Sutera Boulevard Kav.23, Pakulonan, Kota Tangerang Selatan, Banten',
    content: `
      <p>Connected &amp; Protected focused on the growing need to secure enterprise environments without compromising user experience or network performance.</p>
      <p>Speakers discussed real-world cyber risks, the importance of layered protection, and the role of managed connectivity in supporting a more resilient business foundation.</p>
      <p>Participants also gained insight into how Linknet combines infrastructure capabilities with security-oriented service design for enterprise customers.</p>
    `,
  }),
  createEvent({
    id: 'event-007',
    slug: 'connexion-2025-infinite-links-technology-renaissance',
    image: '/assets/img/event/671157205_17934436344212551_2177749797805957794_n.jpg',
    title: 'Connexion 2025 - Infinite Links: Technology Renaissance',
    heroTitle: 'Connexion 2025 Explores New Opportunities in the Technology Renaissance Era',
    excerpt: 'A regional forum connecting customers and technology partners through fresh ideas on digital transformation and future-ready infrastructure.',
    status: 'ended',
    location: 'Palembang',
    startDate: '2025-09-24T09:30:00Z',
    endDate: '2025-09-25T16:00:00Z',
    registrationEndedTime: '2025-08-28T09:00:00Z',
    organizer: {
      name: 'PT Link Net Tbk',
      logo: '/assets/logos/linknet-logo.svg',
    },
    venue: 'The Alts Hotel',
    registerLink: '#',
    articleIds: ['news-008'],
    mapEmbed: createMapEmbedUrl('The Alts Hotel Palembang'),
    address: 'Jl. Rajawali No.8, 9 Ilir, Ilir Timur II, Kota Palembang, Sumatera Selatan',
    content: `
      <p>Connexion 2025 presented a forward-looking conversation about infrastructure modernization, digital collaboration, and the technologies shaping the next era of business growth.</p>
      <p>The event brought together customers, technology providers, and Linknet representatives in one setting to discuss current challenges and actionable transformation strategies.</p>
      <p>Through expert sessions and networking opportunities, the program reinforced Linknet’s role as a partner in sustainable digital advancement.</p>
    `,
  }),
  createEvent({
    id: 'event-008',
    slug: 'limitless-opportunities-breaking-barriers',
    image: '/assets/img/event/671282726_17935587006212551_7575947850528018564_n.jpg',
    title: 'Limitless Opportunities, Breaking Barriers',
    heroTitle: 'Linknet Encourages Regional Businesses to Break Barriers Through Better Connectivity',
    excerpt: 'A leadership session centered on market opportunity, scalability, and the role of digital infrastructure in enabling business growth.',
    status: 'ended',
    location: 'Cianjur',
    startDate: '2025-01-20T08:30:00Z',
    endDate: '2025-01-21T14:00:00Z',
    registrationEndedTime: '2025-01-03T09:00:00Z',
    organizer: {
      name: 'PT Link Net Tbk',
      logo: '/assets/logos/linknet-logo.svg',
    },
    venue: 'Le Eminence Puncak Hotel Convention & Resort',
    registerLink: '#',
    articleIds: ['news-009'],
    mapEmbed: createMapEmbedUrl('Le Eminence Puncak Hotel Convention Resort Puncak'),
    address: 'Jl. Hanjawar No.19, Ciloto, Cipanas, Kabupaten Cianjur, Jawa Barat',
    content: `
      <p>Limitless Opportunities, Breaking Barriers highlighted the importance of strategic connectivity in helping businesses overcome operational limitations and expand with confidence.</p>
      <p>The event featured discussions on infrastructure readiness, customer experience, and the value of having a dependable digital foundation for future growth.</p>
      <p>Linknet used the event to strengthen conversations with local business leaders and demonstrate how scalable solutions can support both immediate and long-term priorities.</p>
    `,
  }),
  createEvent({
    id: 'event-009',
    slug: 'linknet-enterprise-forum-2025',
    image: '/assets/img/event/671290252_17935741032212551_8315232644474886061_n.jpg',
    title: 'Link Net Enterprise Forum 2025',
    heroTitle: 'Linknet Enterprise Forum 2025 Brings Decision Makers Together Around Future Infrastructure',
    excerpt: 'A multi-session forum tailored for enterprise leaders looking to align infrastructure, reliability, and service experience.',
    status: 'upcoming',
    location: 'Bandung',
    date: '2025-12-12T09:00:00Z',
    timeStart: '2025-12-12T09:00:00Z',
    timeEnd: '2025-12-12T15:30:00Z',
    registrationEndedTime: '2025-11-01T10:00:00Z',
    organizer: {
      name: 'Linknet Enterprise',
      logo: '/assets/logos/logo-linknet-enterprise.png',
    },
    venue: 'InterContinental Bandung Dago Pakar',
    registerLink: '#',
    articleIds: ['news-010'],
    mapEmbed: createMapEmbedUrl('InterContinental Bandung Dago Pakar'),
    address: 'Jl. Resor Dago Pakar Raya 2B, Mekarsaluyu, Cimenyan, Kabupaten Bandung, Jawa Barat',
    content: `
      <p>Link Net Enterprise Forum 2025 is built to connect decision makers with practical insights on modern infrastructure planning, service continuity, and digital experience delivery.</p>
      <p>The program includes keynote sessions, customer stories, and solution discussions that focus on how enterprises can move faster while maintaining stability and operational control.</p>
      <p>As one of Linknet’s key upcoming forums, the event is expected to strengthen conversations with enterprise stakeholders across multiple sectors.</p>
    `,
  }),
];
