import { notFound } from 'next/navigation';
import CareerDetail from '@/components/main/CareerDetail'; // Sesuaikan path ini

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function stripHtml(input = '') {
  return String(input).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapCareerForUi(career, locale = 'en') {
  const isId = locale === 'id';

  return {
    id: career.id,
    title: career.position,
    department: career.division || '',
    employment_type: career.type || '',
    location: career.location || '',
    applyURL: career.linkJob || '#',
    detailURL: career.slug ? `/career/${career.slug}` : '#',
    description: isId
      ? (career.descriptionId || career.description || '')
      : (career.description || career.descriptionId || ''),
    requirements: isId
      ? (career.requirementsId || career.requirements || '')
      : (career.requirements || career.requirementsId || ''),
  };
}

async function getCareerBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/careers/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? json.data : null;
  } catch {
    return null;
  }
}

async function getRelatedCareers(career, limit = 4) {
  try {
    const params = new URLSearchParams();
    params.set('limit', '20');
    if (career?.division) params.set('division', career.division);

    const res = await fetch(`${API_BASE_URL}/careers?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    return rows.filter((item) => item.slug !== career.slug).slice(0, limit);
  } catch {
    return [];
  }
}

// 2. GENERATE METADATA (Wajib tangkap 'id')
export async function generateMetadata({ params }) {
  const resolvedParams = await params; // Wajib di-await di Next.js 14/15
  const { id, locale } = resolvedParams;
  const career = await getCareerBySlug(id);

  if (!career) return { title: 'Career Not Found | Link Net' };

  const localizedDescription = locale === 'id'
    ? (career.descriptionId || career.description || '')
    : (career.description || career.descriptionId || '');

  const plainDescription = stripHtml(localizedDescription).substring(0, 160);

  return {
    title: `We're Hiring ${career.position}`,
    description: plainDescription || 'Career opportunity at Link Net',
  };
}

// 3. KOMPONEN UTAMA (Wajib tangkap 'id')
export default async function CareerDetailPage({ params }) {
  const resolvedParams = await params;
  const { id, locale } = resolvedParams;
  const career = await getCareerBySlug(id);

  if (!career) {
    notFound();
  }

  const relatedRows = await getRelatedCareers(career, 4);
  const careerForUi = mapCareerForUi(career, locale);
  const relatedCareers = relatedRows.map((item) => mapCareerForUi(item, locale));

  return (
    <main className="bg-white">
      <CareerDetail 
        career={careerForUi}
        relatedCareers={relatedCareers}
      />
    </main>
  );
}
