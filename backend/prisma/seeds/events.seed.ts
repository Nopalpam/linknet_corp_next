import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const DEFAULT_ORGANIZER = {
  label: 'Organized by',
  name: 'PT Link Net Tbk',
  logo: '/assets/logos/linknet-logo.svg',
};

type EventSeed = {
  slug: string;
  title: string;
  heroTitle: string;
  excerpt: string;
  content: string;
  image: string;
  location: string;
  venue: string;
  address: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  timeStart?: string;
  timeEnd?: string;
  registrationEndedTime: string;
  organizerName?: string;
  organizerLogo?: string;
  maxRegisterParticipants: number;
  relatedNewsSlugs?: string[];
};

type RegistrationSeed = {
  eventSlug: string;
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  companyAddress?: string;
  picName: string;
  picEmail: string;
  picPhone?: string;
  notes?: string;
  participants: Array<{
    name: string;
    email: string;
    phone?: string;
    jobTitle?: string;
  }>;
};

function createMapEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function createEventSeed(event: EventSeed) {
  const startValue = event.timeStart || event.date || event.startDate;
  if (!startValue) {
    throw new Error(`Missing start date for event seed: ${event.slug}`);
  }

  return {
    slug: event.slug,
    title: event.title,
    hero_title: event.heroTitle,
    excerpt: event.excerpt,
    content: event.content.trim(),
    cover_image: event.image,
    location: event.location,
    venue: event.venue,
    address: event.address,
    map_embed_url: createMapEmbedUrl(event.venue),
    organizer_label: DEFAULT_ORGANIZER.label,
    organizer_name: event.organizerName || DEFAULT_ORGANIZER.name,
    organizer_logo: event.organizerLogo || DEFAULT_ORGANIZER.logo,
    ticket_price: 'FREE',
    register_link: '#',
    registration_end_at: new Date(event.registrationEndedTime),
    max_register_participants: event.maxRegisterParticipants,
    start_date: new Date(startValue),
    end_date: event.timeEnd
      ? new Date(event.timeEnd)
      : event.endDate
        ? new Date(event.endDate)
        : event.date
          ? new Date(event.date)
          : null,
    status: 'PUBLISHED' as const,
    relatedNewsSlugs: event.relatedNewsSlugs || [],
  };
}

const EVENT_PERMISSIONS = [
  {
    name: 'View Events',
    slug: 'events.read',
    module: 'events',
    description: 'View event list and details',
  },
  {
    name: 'Create Event',
    slug: 'events.create',
    module: 'events',
    description: 'Create new event',
  },
  {
    name: 'Update Event',
    slug: 'events.update',
    module: 'events',
    description: 'Update existing event',
  },
  {
    name: 'Delete Event',
    slug: 'events.delete',
    module: 'events',
    description: 'Delete event',
  },
] as const;

const EVENT_SEEDS = [
  createEventSeed({
    slug: 'national-technology-summit-2025',
    title: 'National Technology Summit 2025',
    heroTitle: 'Linknet Strengthens the Digital Ecosystem Through the National Technology Summit 2025',
    excerpt:
      'A strategic forum that brought together industry leaders, regulators, and partners to accelerate Indonesia\'s digital ecosystem development.',
    image: '/assets/img/event/639871181_17927220654212551_7824130188111952002_n.jpg',
    location: 'Jakarta',
    startDate: '2026-09-14T05:00:00Z',
    endDate: '2026-09-20T14:00:00Z',
    registrationEndedTime: '2026-02-19T08:00:00Z',
    venue: 'Pullman Jakarta Indonesia Thamrin CBD',
    address:
      'Jl. M.H. Thamrin No.59, Gondangdia, Kec. Menteng, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10350',
    maxRegisterParticipants: 5,
    content: `
      <p>Linknet, in collaboration with the Indonesian Internet Service Providers Association (APJII), held the National Technology Summit 2025 as a strategic forum to discuss the direction of Indonesia's digital ecosystem development.</p>
      <p>Carrying the theme “We LINK The Nation for Sustainable Future,” the event brought together business leaders, regulators, and association representatives to formulate concrete steps for strengthening national digital transformation.</p>
      <p>Linknet positioned the summit as a collaborative platform for partners across one ecosystem to align on shared goals in enterprise innovation and connectivity.</p>
    `,
  }),
  createEventSeed({
    slug: 'golf-gala-2025-linknet-enterprise',
    title: 'Golf Gala 2025 by Linknet Enterprise',
    heroTitle: 'Linknet Enterprise Builds Closer Executive Partnerships Through Golf Gala 2025',
    excerpt:
      'An invitation-only networking experience designed to strengthen collaboration with enterprise customers and strategic partners.',
    image: '/assets/img/event/648799062_17929129512212551_232502929899933272_n.jpg',
    location: 'Bogor',
    date: '2025-12-04T07:00:00Z',
    timeStart: '2025-12-04T07:00:00Z',
    timeEnd: '2025-12-04T16:00:00Z',
    registrationEndedTime: '2025-10-10T09:00:00Z',
    organizerName: 'Linknet Enterprise',
    organizerLogo: '/assets/logos/logo-linknet-enterprise.png',
    venue: 'Rainbow Hills Golf Club',
    address: 'Jl. Bukit Pelangi Golf No.1, Gunung Geulis, Sukaraja, Kabupaten Bogor, Jawa Barat',
    maxRegisterParticipants: 4,
    relatedNewsSlugs: [
      'perkuat-hubungan-dengan-stakeholder-linknet-enterprise-gelar-golf-gala-untuk-kedua-kalinya',
    ],
    content: `
      <p>Golf Gala 2025 by Linknet Enterprise is designed as an executive gathering that combines relationship building with strategic business conversations in a relaxed setting.</p>
      <p>The event welcomes enterprise decision makers, channel partners, and Linknet leadership for networking sessions, customer appreciation moments, and solution showcases.</p>
      <p>Through this event, Linknet aims to strengthen long-term trust with partners while opening new collaboration opportunities across enterprise connectivity and managed services.</p>
    `,
  }),
  createEventSeed({
    slug: 'channel-partner-program-launch',
    title: 'Peluncuran dan Sosialisasi Program Channel Partner PT Link Net',
    heroTitle: 'Linknet Introduces Its Channel Partner Program to Accelerate Regional Business Growth',
    excerpt:
      'A launch event for Linknet\'s channel partner program focused on expanding collaboration with regional sales and delivery partners.',
    image: '/assets/img/event/658550647_17934304989212551_5721423078563669016_n.jpg',
    location: 'Solo',
    date: '2025-11-27T09:00:00Z',
    timeStart: '2025-11-27T09:00:00Z',
    timeEnd: '2025-11-27T13:00:00Z',
    registrationEndedTime: '2025-11-01T09:00:00Z',
    venue: 'Alila Solo',
    address: 'Jl. Slamet Riyadi No.562, Jajar, Laweyan, Kota Surakarta, Jawa Tengah',
    maxRegisterParticipants: 1,
    content: `
      <p>This launch event marked an important step in Linknet's go-to-market expansion through a stronger channel ecosystem in key regional markets.</p>
      <p>Attendees were introduced to the program structure, commercial opportunities, service support model, and joint growth framework prepared for future partners.</p>
      <p>The session highlighted how Linknet plans to collaborate more closely with local business communities to deliver faster, more relevant connectivity solutions.</p>
    `,
  }),
  createEventSeed({
    slug: 'linknet-courage-run-2025',
    title: '25 Tahun Linknet bersama Linknet Courage Run 2025',
    heroTitle: 'Linknet Celebrates 25 Years of Impact Through Courage Run 2025',
    excerpt:
      'A milestone celebration that combines employee engagement, community spirit, and Linknet\'s anniversary momentum.',
    image: '/assets/img/event/660038768_17933355159212551_2002275764996607793_n.jpg',
    location: 'Tangerang Selatan',
    date: '2025-11-16T05:30:00Z',
    timeStart: '2025-11-16T05:30:00Z',
    timeEnd: '2025-11-16T10:00:00Z',
    registrationEndedTime: '2025-09-12T10:00:00Z',
    venue: 'ICE BSD City',
    address: 'Jl. BSD Grand Boulevard No.1, Pagedangan, Kabupaten Tangerang, Banten',
    maxRegisterParticipants: 5,
    relatedNewsSlugs: [
      'pt-link-net-tbk-rayakan-ulang-tahun-ke-25-dengan-berbagi-kebahagiaan-di-bulan-ramadan',
    ],
    content: `
      <p>Linknet Courage Run 2025 was held as part of the company's 25th anniversary celebration, creating a memorable experience that brought together employees, families, and communities.</p>
      <p>Beyond the running program, the event reflected Linknet's spirit of resilience, collaboration, and commitment to creating positive impact beyond the workplace.</p>
      <p>The anniversary celebration also served as a moment to reaffirm the company's purpose and its continued ambition to connect Indonesia with better services and stronger partnerships.</p>
    `,
  }),
  createEventSeed({
    slug: 'optimizing-manufacturing-performance-smart-solutions',
    title: 'Optimizing Manufacturing Performance with Smart Solutions',
    heroTitle: 'Linknet Showcases Smart Infrastructure Strategies for Manufacturing Leaders',
    excerpt:
      'A focused session for manufacturing companies looking to improve operational visibility, resilience, and plant connectivity.',
    image: '/assets/img/event/660624264_17933490015212551_4475227640034839453_n.jpg',
    location: 'Jakarta Selatan',
    date: '2025-11-10T10:00:00Z',
    timeStart: '2025-11-10T10:00:00Z',
    timeEnd: '2025-11-10T14:30:00Z',
    registrationEndedTime: '2025-10-20T09:00:00Z',
    organizerName: 'Linknet Enterprise',
    organizerLogo: '/assets/logos/logo-linknet-enterprise.png',
    venue: 'Ayana Midplaza Jakarta',
    address: 'Jl. Jend. Sudirman Kav.10-11, Karet Tengsin, Jakarta Pusat',
    maxRegisterParticipants: 3,
    content: `
      <p>This event explored how manufacturers can improve uptime, streamline communication across facilities, and strengthen business continuity through smarter network architecture.</p>
      <p>Linknet's team shared practical approaches to integrating connectivity, monitoring, and managed services into operational environments where reliability is essential.</p>
      <p>The session concluded with a discussion on how digital infrastructure can support both production efficiency and future automation initiatives.</p>
    `,
  }),
  createEventSeed({
    slug: 'connected-protected-cyber-security',
    title: 'Connected & Protected: Elevating Business with Cyber Security',
    heroTitle: 'Linknet Highlights the Role of Secure Connectivity in Modern Business Operations',
    excerpt:
      'An event dedicated to helping enterprises improve cyber resilience while maintaining reliable operational connectivity.',
    image: '/assets/img/event/671094639_17934697173212551_2271980180594313648_n.jpg',
    location: 'Tangerang Selatan',
    startDate: '2025-11-07T09:00:00Z',
    endDate: '2025-11-08T15:00:00Z',
    registrationEndedTime: '2025-10-15T08:30:00Z',
    organizerName: 'Linknet Enterprise',
    organizerLogo: '/assets/logos/logo-linknet-enterprise.png',
    venue: 'Mercure Serpong Alam Sutera',
    address: 'Jl. Alam Sutera Boulevard Kav.23, Pakulonan, Kota Tangerang Selatan, Banten',
    maxRegisterParticipants: 2,
    content: `
      <p>Connected &amp; Protected focused on the growing need to secure enterprise environments without compromising user experience or network performance.</p>
      <p>Speakers discussed real-world cyber risks, the importance of layered protection, and the role of managed connectivity in supporting a more resilient business foundation.</p>
      <p>Participants also gained insight into how Linknet combines infrastructure capabilities with security-oriented service design for enterprise customers.</p>
    `,
  }),
  createEventSeed({
    slug: 'connexion-2025-infinite-links-technology-renaissance',
    title: 'Connexion 2025 - Infinite Links: Technology Renaissance',
    heroTitle: 'Connexion 2025 Explores New Opportunities in the Technology Renaissance Era',
    excerpt:
      'A regional forum connecting customers and technology partners through fresh ideas on digital transformation and future-ready infrastructure.',
    image: '/assets/img/event/671157205_17934436344212551_2177749797805957794_n.jpg',
    location: 'Palembang',
    startDate: '2025-09-24T09:30:00Z',
    endDate: '2025-09-25T16:00:00Z',
    registrationEndedTime: '2025-08-28T09:00:00Z',
    venue: 'The Alts Hotel',
    address: 'Jl. Rajawali No.8, 9 Ilir, Ilir Timur II, Kota Palembang, Sumatera Selatan',
    maxRegisterParticipants: 3,
    content: `
      <p>Connexion 2025 presented a forward-looking conversation about infrastructure modernization, digital collaboration, and the technologies shaping the next era of business growth.</p>
      <p>The event brought together customers, technology providers, and Linknet representatives in one setting to discuss current challenges and actionable transformation strategies.</p>
      <p>Through expert sessions and networking opportunities, the program reinforced Linknet's role as a partner in sustainable digital advancement.</p>
    `,
  }),
  createEventSeed({
    slug: 'limitless-opportunities-breaking-barriers',
    title: 'Limitless Opportunities, Breaking Barriers',
    heroTitle: 'Linknet Encourages Regional Businesses to Break Barriers Through Better Connectivity',
    excerpt:
      'A leadership session centered on market opportunity, scalability, and the role of digital infrastructure in enabling business growth.',
    image: '/assets/img/event/671282726_17935587006212551_7575947850528018564_n.jpg',
    location: 'Cianjur',
    startDate: '2025-01-20T08:30:00Z',
    endDate: '2025-01-21T14:00:00Z',
    registrationEndedTime: '2025-01-03T09:00:00Z',
    venue: 'Le Eminence Puncak Hotel Convention & Resort',
    address: 'Jl. Hanjawar No.19, Ciloto, Cipanas, Kabupaten Cianjur, Jawa Barat',
    maxRegisterParticipants: 2,
    content: `
      <p>Limitless Opportunities, Breaking Barriers highlighted the importance of strategic connectivity in helping businesses overcome operational limitations and expand with confidence.</p>
      <p>The event featured discussions on infrastructure readiness, customer experience, and the value of having a dependable digital foundation for future growth.</p>
      <p>Linknet used the event to strengthen conversations with local business leaders and demonstrate how scalable solutions can support both immediate and long-term priorities.</p>
    `,
  }),
  createEventSeed({
    slug: 'linknet-enterprise-forum-2025',
    title: 'Link Net Enterprise Forum 2025',
    heroTitle: 'Linknet Enterprise Forum 2025 Brings Decision Makers Together Around Future Infrastructure',
    excerpt:
      'A multi-session forum tailored for enterprise leaders looking to align infrastructure, reliability, and service experience.',
    image: '/assets/img/event/671290252_17935741032212551_8315232644474886061_n.jpg',
    location: 'Bandung',
    date: '2025-12-12T09:00:00Z',
    timeStart: '2025-12-12T09:00:00Z',
    timeEnd: '2025-12-12T15:30:00Z',
    registrationEndedTime: '2025-11-01T10:00:00Z',
    organizerName: 'Linknet Enterprise',
    organizerLogo: '/assets/logos/logo-linknet-enterprise.png',
    venue: 'InterContinental Bandung Dago Pakar',
    address: 'Jl. Resor Dago Pakar Raya 2B, Mekarsaluyu, Cimenyan, Kabupaten Bandung, Jawa Barat',
    maxRegisterParticipants: 4,
    content: `
      <p>Link Net Enterprise Forum 2025 is built to connect decision makers with practical insights on modern infrastructure planning, service continuity, and digital experience delivery.</p>
      <p>The program includes keynote sessions, customer stories, and solution discussions that focus on how enterprises can move faster while maintaining stability and operational control.</p>
      <p>As one of Linknet's key upcoming forums, the event is expected to strengthen conversations with enterprise stakeholders across multiple sectors.</p>
    `,
  }),
];

const REGISTRATION_SEEDS: RegistrationSeed[] = [
  {
    eventSlug: 'national-technology-summit-2025',
    companyName: 'PT Maju Digital Indonesia',
    companyEmail: 'it@majudigital.co.id',
    companyPhone: '+62 21 555 0101',
    companyAddress: 'Menara Digital Lantai 12, Jakarta Selatan',
    picName: 'Rizky Pratama',
    picEmail: 'rizky.pratama@majudigital.co.id',
    picPhone: '+62 812 1000 2000',
    notes: 'Tim ingin mendalami managed connectivity dan enterprise SLA.',
    participants: [
      {
        name: 'Rizky Pratama',
        email: 'rizky.pratama@majudigital.co.id',
        phone: '+62 812 1000 2000',
        jobTitle: 'IT Infrastructure Manager',
      },
      {
        name: 'Nadia Putri',
        email: 'nadia.putri@majudigital.co.id',
        phone: '+62 812 1000 2001',
        jobTitle: 'Procurement Lead',
      },
    ],
  },
  {
    eventSlug: 'golf-gala-2025-linknet-enterprise',
    companyName: 'PT Sinar Data Nusantara',
    companyEmail: 'partnership@sinar-data.co.id',
    companyPhone: '+62 31 7000 8899',
    companyAddress: 'Graha Data Nusantara, Surabaya',
    picName: 'Michael Hartono',
    picEmail: 'michael.hartono@sinar-data.co.id',
    picPhone: '+62 811 8899 1100',
    notes: 'Membawa tamu eksekutif dan partner regional.',
    participants: [
      {
        name: 'Michael Hartono',
        email: 'michael.hartono@sinar-data.co.id',
        phone: '+62 811 8899 1100',
        jobTitle: 'Commercial Director',
      },
      {
        name: 'Siska Wulandari',
        email: 'siska.wulandari@sinar-data.co.id',
        phone: '+62 811 8899 1101',
        jobTitle: 'Key Account Manager',
      },
    ],
  },
];

async function seedEventPermissions() {
  const permissions = await Promise.all(
    EVENT_PERMISSIONS.map((permission) =>
      prisma.permission.upsert({
        where: { slug: permission.slug },
        update: {
          name: permission.name,
          module: permission.module,
          description: permission.description,
        },
        create: permission,
      })
    )
  );

  const roles = await prisma.role.findMany({
    where: {
      slug: { in: ['super-admin', 'admin', 'editor'] },
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  const permissionBySlug = new Map(permissions.map((permission) => [permission.slug, permission]));
  const roleBySlug = new Map(roles.map((role) => [role.slug, role]));

  const rolePermissionMatrix: Record<string, string[]> = {
    'super-admin': ['events.read', 'events.create', 'events.update', 'events.delete'],
    admin: ['events.read', 'events.create', 'events.update', 'events.delete'],
    editor: ['events.read', 'events.create', 'events.update'],
  };

  for (const [roleSlug, permissionSlugs] of Object.entries(rolePermissionMatrix)) {
    const role = roleBySlug.get(roleSlug);
    if (!role) {
      console.log(`- Skipped role permission seed for missing role: ${roleSlug}`);
      continue;
    }

    for (const permissionSlug of permissionSlugs) {
      const permission = permissionBySlug.get(permissionSlug);
      if (!permission) {
        continue;
      }

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log(`- Event permissions synced: ${permissions.length}`);
}

async function seedEvents() {
  const allRelatedNewsSlugs = Array.from(
    new Set(EVENT_SEEDS.flatMap((event) => event.relatedNewsSlugs))
  );

  const relatedNewsRows = allRelatedNewsSlugs.length
    ? await prisma.news.findMany({
        where: {
          slug: { in: allRelatedNewsSlugs },
          deleted_at: null,
        },
        select: {
          id: true,
          slug: true,
        },
      })
    : [];

  const relatedNewsBySlug = new Map(relatedNewsRows.map((news) => [news.slug, news.id]));
  const eventIdBySlug = new Map<string, string>();

  for (const seed of EVENT_SEEDS) {
    const eventRecord = await prisma.events.upsert({
      where: { slug: seed.slug },
      update: {
        title: seed.title,
        hero_title: seed.hero_title,
        excerpt: seed.excerpt,
        content: seed.content,
        cover_image: seed.cover_image,
        location: seed.location,
        venue: seed.venue,
        address: seed.address,
        map_embed_url: seed.map_embed_url,
        organizer_label: seed.organizer_label,
        organizer_name: seed.organizer_name,
        organizer_logo: seed.organizer_logo,
        ticket_price: seed.ticket_price,
        register_link: seed.register_link,
        registration_end_at: seed.registration_end_at,
        max_register_participants: seed.max_register_participants,
        start_date: seed.start_date,
        end_date: seed.end_date,
        status: seed.status,
        updated_at: new Date(),
      },
      create: {
        id: randomUUID(),
        title: seed.title,
        hero_title: seed.hero_title,
        slug: seed.slug,
        excerpt: seed.excerpt,
        content: seed.content,
        cover_image: seed.cover_image,
        location: seed.location,
        venue: seed.venue,
        address: seed.address,
        map_embed_url: seed.map_embed_url,
        organizer_label: seed.organizer_label,
        organizer_name: seed.organizer_name,
        organizer_logo: seed.organizer_logo,
        ticket_price: seed.ticket_price,
        register_link: seed.register_link,
        registration_end_at: seed.registration_end_at,
        max_register_participants: seed.max_register_participants,
        start_date: seed.start_date,
        end_date: seed.end_date,
        status: seed.status,
        updated_at: new Date(),
      },
      select: {
        id: true,
        slug: true,
      },
    });

    eventIdBySlug.set(eventRecord.slug, eventRecord.id);

    await prisma.event_news_relations.deleteMany({
      where: { event_id: eventRecord.id },
    });

    const relatedNewsIds = seed.relatedNewsSlugs
      .map((slug) => relatedNewsBySlug.get(slug))
      .filter((value): value is string => Boolean(value));

    if (relatedNewsIds.length) {
      await prisma.event_news_relations.createMany({
        data: relatedNewsIds.map((newsId, index) => ({
          id: randomUUID(),
          event_id: eventRecord.id,
          news_id: newsId,
          position: index,
          updated_at: new Date(),
        })),
      });
    }
  }

  console.log(`- Events synced: ${EVENT_SEEDS.length}`);
  console.log(`- Related news linked: ${relatedNewsRows.length}`);

  return eventIdBySlug;
}

async function seedRegistrations(eventIdBySlug: Map<string, string>) {
  let syncedCount = 0;

  for (const seed of REGISTRATION_SEEDS) {
    const eventId = eventIdBySlug.get(seed.eventSlug);
    if (!eventId) {
      console.log(`- Skipped registration seed for missing event: ${seed.eventSlug}`);
      continue;
    }

    const existingRegistration = await prisma.event_registrations.findFirst({
      where: {
        event_id: eventId,
        company_email: seed.companyEmail.toLowerCase(),
      },
      select: { id: true },
    });

    const updatedAt = new Date();

    if (existingRegistration) {
      await prisma.event_registrations.update({
        where: { id: existingRegistration.id },
        data: {
          company_name: seed.companyName,
          company_email: seed.companyEmail.toLowerCase(),
          company_phone: seed.companyPhone || null,
          company_address: seed.companyAddress || null,
          pic_name: seed.picName,
          pic_email: seed.picEmail.toLowerCase(),
          pic_phone: seed.picPhone || null,
          notes: seed.notes || null,
          participant_count: seed.participants.length,
          status: 'NEW',
          updated_at: updatedAt,
        },
      });

      await prisma.event_registration_participants.deleteMany({
        where: { registration_id: existingRegistration.id },
      });

      await prisma.event_registration_participants.createMany({
        data: seed.participants.map((participant) => ({
          id: randomUUID(),
          registration_id: existingRegistration.id,
          name: participant.name,
          email: participant.email.toLowerCase(),
          phone: participant.phone || null,
          job_title: participant.jobTitle || null,
          updated_at: updatedAt,
        })),
      });
    } else {
      await prisma.event_registrations.create({
        data: {
          id: randomUUID(),
          event_id: eventId,
          company_name: seed.companyName,
          company_email: seed.companyEmail.toLowerCase(),
          company_phone: seed.companyPhone || null,
          company_address: seed.companyAddress || null,
          pic_name: seed.picName,
          pic_email: seed.picEmail.toLowerCase(),
          pic_phone: seed.picPhone || null,
          notes: seed.notes || null,
          participant_count: seed.participants.length,
          status: 'NEW',
          updated_at: updatedAt,
          event_registration_participants: {
            create: seed.participants.map((participant) => ({
              id: randomUUID(),
              name: participant.name,
              email: participant.email.toLowerCase(),
              phone: participant.phone || null,
              job_title: participant.jobTitle || null,
              updated_at: updatedAt,
            })),
          },
        },
      });
    }

    syncedCount += 1;
  }

  console.log(`- Sample registrations synced: ${syncedCount}`);
}

async function main() {
  console.log('Seeding Event module only...');
  await seedEventPermissions();
  const eventIdBySlug = await seedEvents();
  await seedRegistrations(eventIdBySlug);
  console.log('Event module seed completed.');
}

main()
  .catch((error) => {
    console.error('Event module seed failed.');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });