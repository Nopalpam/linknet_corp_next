import { careers as fallbackCareers } from '@/data/components/careerList';
import { NEWS_LIST } from '@/data/components/newsList';

function normalizeCareer(career) {
  if (!career) return null;

  const slug = career.slug || career.id;

  return {
    id: career.id,
    slug,
    position: career.position || career.title || '',
    division: career.division || career.department || '',
    type: career.type || career.employment_type || '',
    location: career.location || '',
    linkJob: career.linkJob || career.applyURL || '#',
    description: career.description || '',
    descriptionId: career.descriptionId || career.description || '',
    requirements: career.requirements || '',
    requirementsId: career.requirementsId || career.requirements || '',
    benefit: career.benefit || '',
  };
}

export function getFallbackCareerBySlug(slug) {
  const cleanSlug = String(slug || '').trim();
  if (!cleanSlug) return null;

  const career = fallbackCareers.find((item) => {
    const itemSlug = item.slug || item.id;
    return itemSlug === cleanSlug || item.id === cleanSlug || item.detailURL?.replace(/\/+$/, '').endsWith(`/${cleanSlug}`);
  });

  return normalizeCareer(career);
}

export function getFallbackRelatedCareers(currentCareer, limit = 4) {
  const currentSlug = currentCareer?.slug || currentCareer?.id;
  const currentDivision = currentCareer?.division || currentCareer?.department || '';
  const normalized = fallbackCareers.map(normalizeCareer).filter(Boolean);
  const otherCareers = normalized.filter((item) => item.slug !== currentSlug && item.id !== currentCareer?.id);
  const sameDivision = otherCareers.filter((item) => item.division && item.division === currentDivision);
  const differentDivision = otherCareers.filter((item) => !item.division || item.division !== currentDivision);

  return [...sameDivision, ...differentDivision].slice(0, limit);
}

export function getFallbackNewsBySlug(slug) {
  const cleanSlug = String(slug || '').trim();
  if (!cleanSlug) return null;

  return NEWS_LIST.find((item) => item.slug === cleanSlug && item.status === 'active') || null;
}

export function getFallbackRelatedNews(currentArticle, limit = 3) {
  if (!currentArticle) return [];

  const currentCategorySlug =
    currentArticle.news_categories?.slug ||
    currentArticle.category?.slug ||
    currentArticle.category_slug ||
    '';

  const activeNews = NEWS_LIST.filter((item) => item.status === 'active' && item.id !== currentArticle.id);
  const sameCategory = activeNews.filter((item) => item.category?.slug && item.category.slug === currentCategorySlug);
  const differentCategory = activeNews.filter((item) => !item.category?.slug || item.category.slug !== currentCategorySlug);

  return [...sameCategory, ...differentCategory].slice(0, limit);
}

export function getFallbackNewsStaticParams() {
  const seen = new Set();

  return NEWS_LIST
    .filter((item) => item.status === 'active' && item.slug)
    .filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    })
    .map((item) => ({ slug: item.slug }));
}
