'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import CardSolutions from '../base/cards/CardSolutions';
import Intro from '../base/section/Intro';
import { hasIntroContent } from '../../../shared/presentation/intro';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const ALL_VALUE = '__all__';

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function getCategoryLabel(category, locale) {
  if (!category) return '';
  if (locale === 'id') return category.name_id || category.nameId || category.name || '';
  return category.name_en || category.nameEn || category.name || '';
}

function getSolutionTitle(item, locale) {
  if (locale === 'id') return item.title_id || item.titleId || item.title || '';
  return item.title_en || item.titleEn || item.title || '';
}

function getSolutionDescription(item, locale) {
  if (locale === 'id') return item.description_id || item.descriptionId || item.description || '';
  return item.description_en || item.descriptionEn || item.description || '';
}

function getFilterOptions(taxonomies, type, locale) {
  return normalizeList(taxonomies)
    .filter((category) => category.type === type)
    .sort((a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0))
    .map((category) => ({
      value: category.id,
      label: getCategoryLabel(category, locale),
    }))
    .filter((option) => option.value && option.label);
}

function solutionHasCategory(item, categoryId, key) {
  if (!categoryId || categoryId === ALL_VALUE) return true;
  return normalizeList(item[key]).some((category) => category.id === categoryId);
}

function solutionHasAnyNeed(item, needIds) {
  if (!needIds.length) return true;
  const solutionNeedIds = new Set(normalizeList(item.businessNeeds).map((need) => need.id));
  return needIds.some((id) => solutionNeedIds.has(id));
}

function getFirstCta(item, locale) {
  const cta = normalizeList(item.ctaList || item.cta_list)[0] || {};
  const labelSource = cta.label || cta.text || cta.button_text || {};
  const label = typeof labelSource === 'object'
    ? (locale === 'id' ? labelSource.id || labelSource.en : labelSource.en || labelSource.id)
    : labelSource;

  return {
    label: label || (locale === 'id' ? 'Selengkapnya' : 'Learn More'),
    href: cta.href || cta.url || item.href || `/solutions/${item.slug}`,
  };
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        'px-4 py-2 rounded-full border text-body-b5 font-medium transition-colors',
        active
          ? 'bg-primary border-primary text-black'
          : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-500 hover:text-black',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, options, value, values, onSelect, onToggle, multi = false }) {
  if (!options.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-b5 font-semibold text-black">{title}</p>
      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={multi ? values.length === 0 : value === ALL_VALUE}
          onClick={() => (multi ? onSelect([]) : onSelect(ALL_VALUE))}
        >
          All
        </FilterButton>
        {options.map((option) => (
          <FilterButton
            key={option.value}
            active={multi ? values.includes(option.value) : value === option.value}
            onClick={() => (multi ? onToggle(option.value) : onSelect(option.value))}
          >
            {option.label}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}

export default function SolutionsList({
  cmsData = null,
  mainData = null,
  locale = 'en',
  className = '',
}) {
  const introData = cmsData?.introData || null;
  const showIndustryFilter = cmsData?.show_filter_industry !== false && cmsData?.showFilterIndustry !== false;
  const showBusinessScaleFilter = cmsData?.show_filter_business_scale !== false && cmsData?.showFilterBusinessScale !== false;
  const showBusinessNeedsFilter = cmsData?.show_filter_business_needs !== false && cmsData?.showFilterBusinessNeeds !== false;
  const maxPerCategory = Number(cmsData?.max_data_per_category || cmsData?.maxDataPerCategory || 6);
  const sortBy = cmsData?.order_by || cmsData?.orderBy || cmsData?.sort_by || 'sort_order';
  const sortDirection = cmsData?.sort_direction || cmsData?.sortDirection || 'asc';

  const [items, setItems] = useState(() => normalizeList(mainData?.items || mainData?.solutions));
  const [taxonomies, setTaxonomies] = useState(() => normalizeList(mainData?.taxonomies));
  const [isLoading, setIsLoading] = useState(!mainData);
  const [industryId, setIndustryId] = useState(ALL_VALUE);
  const [businessScaleId, setBusinessScaleId] = useState(ALL_VALUE);
  const [businessNeedIds, setBusinessNeedIds] = useState([]);

  const fetchSolutions = useCallback(async () => {
    if (mainData) return;
    setIsLoading(true);

    try {
      const query = new URLSearchParams({
        limit: '200',
        sortBy,
        sortOrder: String(sortDirection).toLowerCase() === 'desc' ? 'desc' : 'asc',
      });
      const res = await fetch(`${API_BASE_URL}/solutions?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch solutions');
      const json = await res.json();
      setItems(normalizeList(json.data || json.items || json.solutions));
      setTaxonomies(normalizeList(json.taxonomies));
    } catch (error) {
      console.error('SolutionsList fetch failed:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [mainData, sortBy, sortDirection]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  useEffect(() => {
    if (!mainData) return;
    setItems(normalizeList(mainData.items || mainData.solutions));
    setTaxonomies(normalizeList(mainData.taxonomies));
  }, [mainData]);

  const industryOptions = useMemo(() => getFilterOptions(taxonomies, 'INDUSTRY', locale), [taxonomies, locale]);
  const scaleOptions = useMemo(() => getFilterOptions(taxonomies, 'BUSINESS_SCALE', locale), [taxonomies, locale]);
  const needOptions = useMemo(() => getFilterOptions(taxonomies, 'BUSINESS_NEED', locale), [taxonomies, locale]);

  const filteredItems = useMemo(() => (
    items.filter((item) => (
      solutionHasCategory(item, industryId, 'industries') &&
      solutionHasCategory(item, businessScaleId, 'businessScales') &&
      solutionHasAnyNeed(item, businessNeedIds)
    ))
  ), [items, industryId, businessScaleId, businessNeedIds]);

  const groupedItems = useMemo(() => {
    const groups = new Map();

    filteredItems.forEach((item) => {
      const industries = normalizeList(item.industries);
      const groupCategory = industries[0] || { id: 'uncategorized', name: locale === 'id' ? 'Lainnya' : 'Other', icon: '' };
      const key = groupCategory.id || groupCategory.slug || 'uncategorized';

      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          title: getCategoryLabel(groupCategory, locale) || groupCategory.name || 'Solutions',
          icon: groupCategory.icon || '',
          sortOrder: groupCategory.sortOrder || groupCategory.sort_order || 0,
          items: [],
        });
      }

      if (!Number.isFinite(maxPerCategory) || groups.get(key).items.length < maxPerCategory) {
        groups.get(key).items.push(item);
      }
    });

    return Array.from(groups.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [filteredItems, locale, maxPerCategory]);

  const toggleNeed = (needId) => {
    setBusinessNeedIds((current) => (
      current.includes(needId)
        ? current.filter((id) => id !== needId)
        : [...current, needId]
    ));
  };

  const resetFilters = () => {
    setIndustryId(ALL_VALUE);
    setBusinessScaleId(ALL_VALUE);
    setBusinessNeedIds([]);
  };

  const hasActiveFilter = industryId !== ALL_VALUE || businessScaleId !== ALL_VALUE || businessNeedIds.length > 0;

  return (
    <section className={`lnSolutionsList py-10 md:py-16 bg-light ${className}`}>
      <div className="container mx-auto">
        {hasIntroContent(introData) && (
          <div className="mb-8">
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'left'}
            />
          </div>
        )}

        {(showIndustryFilter || showBusinessScaleFilter || showBusinessNeedsFilter) && (
          <div className="mb-8 rounded-2xl border border-neutral-100 bg-white p-4 md:p-6 shadow-sm">
            <div className="flex flex-col gap-5">
              {showIndustryFilter && (
                <FilterGroup title="Industry" options={industryOptions} value={industryId} onSelect={setIndustryId} />
              )}
              {showBusinessScaleFilter && (
                <FilterGroup title="Business Scale" options={scaleOptions} value={businessScaleId} onSelect={setBusinessScaleId} />
              )}
              {showBusinessNeedsFilter && (
                <FilterGroup
                  title="Business Needs"
                  options={needOptions}
                  values={businessNeedIds}
                  onSelect={setBusinessNeedIds}
                  onToggle={toggleNeed}
                  multi
                />
              )}
              {hasActiveFilter && (
                <div>
                  <button type="button" onClick={resetFilters} className="text-body-b5 font-semibold text-warning hover:underline">
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="h-9 w-9 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && groupedItems.length === 0 && (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center">
            <p className="text-body-b4 font-semibold text-black">
              {locale === 'id' ? 'Tidak ada solusi ditemukan' : 'No solutions found'}
            </p>
            <p className="mt-2 text-body-b5 text-secondary">
              {locale === 'id' ? 'Coba ubah filter yang dipilih.' : 'Try changing the selected filters.'}
            </p>
            {hasActiveFilter && (
              <button type="button" onClick={resetFilters} className="btn btn-primary mt-5 rounded-full px-6 py-2.5 text-body-b5 font-semibold">
                Reset Filter
              </button>
            )}
          </div>
        )}

        {!isLoading && groupedItems.length > 0 && (
          <div className="space-y-12">
            {groupedItems.map((group) => (
              <div key={group.id}>
                <div className="mb-5 flex items-center gap-3">
                  {group.icon && <img src={group.icon} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />}
                  <h3 className="text-headline-h4 font-bold text-black">{group.title}</h3>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const cta = getFirstCta(item, locale);
                    const industry = normalizeList(item.industries)[0];
                    return (
                      <CardSolutions
                        key={item.id}
                        variant="child"
                        thumbnail={item.thumbnail || item.image || item.bannerImage || '/assets/illustrations/ill-search-not-found.svg'}
                        thumbnailAlt={getSolutionTitle(item, locale)}
                        category={getCategoryLabel(industry, locale)}
                        categoryIcon={industry?.icon || ''}
                        title={getSolutionTitle(item, locale)}
                        description={getSolutionDescription(item, locale)}
                        href={cta.href}
                        ctaLabel={cta.label}
                        tags={normalizeList(item.businessNeeds).map((need) => getCategoryLabel(need, locale)).filter(Boolean)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
