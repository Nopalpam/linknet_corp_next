import { notFound } from 'next/navigation';
import CareerDetail from '@/components/main/CareerDetail'; // Sesuaikan path ini
import { getPublicSettings } from '@/lib/cmsApi';
import { buildBasicMetadata } from '@/lib/seo';
import { buildApiUrl, getServerApiBaseUrl, isApiDebugEnabled } from '@/lib/apiBaseUrl';
import { getFallbackCareerBySlug, getFallbackRelatedCareers } from '@/lib/fallbackContent';

const API_BASE_URL = getServerApiBaseUrl();

function stripHtml(input = '') {
  let output = '';
  let insideTag = false;
  let lastWasSpace = false;

  for (const char of String(input)) {
    if (char === '<') {
      insideTag = true;
      if (!lastWasSpace) {
        output += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    if (char === '>') {
      insideTag = false;
      continue;
    }

    if (insideTag) continue;

    const isWhitespace = char.trim() === '';
    if (isWhitespace) {
      if (!lastWasSpace) {
        output += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    output += char;
    lastWasSpace = false;
  }

  return output.trim();
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
    benefit: career.benefit || '',
  };
}

async function getCareerBySlug(slug) {
  try {
    const url = buildApiUrl(`/careers/${encodeURIComponent(slug)}`, API_BASE_URL);
    if (isApiDebugEnabled()) console.info(`[CareerDetailPage] -> GET ${url}`);
    const res = await fetch(url, { cache: 'no-store' });
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

    const url = buildApiUrl(`/careers?${params.toString()}`, API_BASE_URL);
    if (isApiDebugEnabled()) console.info(`[CareerDetailPage] related -> GET ${url}`);
    const res = await fetch(url, { cache: 'no-store' });
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
  const [career, publicSettings] = await Promise.all([
    getCareerBySlug(id).then((result) => result || getFallbackCareerBySlug(id)),
    getPublicSettings(),
  ]);

  if (!career) return { title: 'Career Not Found | Link Net' };

  const localizedDescription = locale === 'id'
    ? (career.descriptionId || career.description || '')
    : (career.description || career.descriptionId || '');

  const plainDescription = stripHtml(localizedDescription).substring(0, 160);

  return buildBasicMetadata({
    title: `We're Hiring ${career.position}`,
    description: plainDescription || 'Career opportunity at Link Net',
    locale,
    path: `career/${id}`,
    publicSettings,
  });
}

// 3. KOMPONEN UTAMA (Wajib tangkap 'id')
export default async function CareerDetailPage({ params }) {
  const resolvedParams = await params;
  const { id, locale } = resolvedParams;
  const career = await getCareerBySlug(id) || getFallbackCareerBySlug(id);

  if (!career) {
    notFound();
  }

  const relatedRows = await getRelatedCareers(career, 4);
  const resolvedRelatedRows = relatedRows.length > 0
    ? relatedRows
    : getFallbackRelatedCareers(career, 4);
  const careerForUi = mapCareerForUi(career, locale);
  const relatedCareers = resolvedRelatedRows.map((item) => mapCareerForUi(item, locale));

  return (
    <main className="bg-white">
      <CareerDetail 
        career={careerForUi}
        relatedCareers={relatedCareers}
      />
    </main>
  );
}
