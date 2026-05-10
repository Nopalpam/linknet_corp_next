import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CoverageRegionSeed = {
  code: string;
  label: string;
  title: string;
  color: string;
  provinceKeys: string[];
  cities: string[];
  lat: number;
  lon: number;
  sortOrder: number;
};

const COVERAGE_COLORS = {
  primary: '#009b77',
  secondary: '#16a085',
  accent: '#2fbf9b',
};

/**
 * Initial Map Coverage data.
 *
 * Province keys follow `hc-key` values from the Indonesia topo reference, while
 * the coverage groups and city labels are normalized into CMS-owned regions so
 * future CRUD changes can update rows instead of editing component constants.
 */
export const MAP_COVERAGE_REGION_SEEDS: CoverageRegionSeed[] = [
  {
    code: 'SUMATERA',
    label: 'Area',
    title: 'Sumatera',
    color: COVERAGE_COLORS.primary,
    provinceKeys: ['id-su', 'id-kr', 'id-sl'],
    cities: ['Medan', 'Batam', 'Palembang'],
    lat: 2.36304,
    lon: 99.2161,
    sortOrder: 10,
  },
  {
    code: 'JAKARTA',
    label: 'Area',
    title: 'Jakarta',
    color: COVERAGE_COLORS.primary,
    provinceKeys: ['id-jk'],
    cities: ['Jabo 1', 'Jabo 2', 'Jabo 3'],
    lat: -6.22462,
    lon: 106.837,
    sortOrder: 20,
  },
  {
    code: 'WEST_JAVA',
    label: 'Area',
    title: 'West Java',
    color: COVERAGE_COLORS.secondary,
    provinceKeys: ['id-jr'],
    cities: [
      'Bandung',
      'Cirebon',
      'Cikampek',
      'Purwakarta',
      'Subang',
      'Sukabumi',
      'Sumedang',
      'Cianjur',
      'Ciamis',
      'Kuningan',
      'Indramayu',
    ],
    lat: -6.90763,
    lon: 107.638,
    sortOrder: 30,
  },
  {
    code: 'CENTRAL_JAVA',
    label: 'Area',
    title: 'Central Java',
    color: COVERAGE_COLORS.secondary,
    provinceKeys: ['id-jt', 'id-yo'],
    cities: [
      'Semarang',
      'Yogyakarta',
      'Solo',
      'Tegal',
      'Purwokerto',
      'Pemalang',
      'Mojokerto',
      'Demak',
      'Pati',
      'Banyumas',
      'Magelang',
      'Purbalingga',
      'Brebes',
      'Cilacap',
    ],
    lat: -7.2901,
    lon: 109.896,
    sortOrder: 40,
  },
  {
    code: 'EAST_JAVA_BALI',
    label: 'Area',
    title: 'East Java & Bali',
    color: COVERAGE_COLORS.accent,
    provinceKeys: ['id-ji', 'id-ba'],
    cities: [
      'Surabaya',
      'Gresik',
      'Sidoarjo',
      'Malang',
      'Kediri',
      'Madiun',
      'Bali',
      'Bojonegoro',
      'Tulungagung',
      'Probolinggo',
      'Ponorogo',
    ],
    lat: -7.88129,
    lon: 112.616,
    sortOrder: 50,
  },
];

export async function seedMapCoverage(prismaClient?: PrismaClient) {
  const client = prismaClient || prisma;
  console.log('Seeding map coverage regions...');

  for (const region of MAP_COVERAGE_REGION_SEEDS) {
    await (client as any).mapCoverageRegion.upsert({
      where: { code: region.code },
      update: {
        label: region.label,
        title: region.title,
        color: region.color,
        provinceKeys: region.provinceKeys,
        cities: region.cities,
        lat: region.lat,
        lon: region.lon,
        sortOrder: region.sortOrder,
        isActive: true,
        deletedAt: null,
        updatedBy: 'map-coverage-seed',
      },
      create: {
        ...region,
        isActive: true,
        createdBy: 'map-coverage-seed',
        updatedBy: 'map-coverage-seed',
      },
    });
  }

  console.log(`Seeded ${MAP_COVERAGE_REGION_SEEDS.length} map coverage regions`);
}

if (require.main === module) {
  seedMapCoverage()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
