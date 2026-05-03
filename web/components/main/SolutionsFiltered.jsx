'use client';

/**
 * SolutionsFiltered.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Komponen UI utama halaman Solutions dengan sidebar filter.
 *
 * Props:
 *   name  {string}  Key dari SOLUTIONS_FILTERED_CONFIG (default: 'enterprise')
 *
 * Contoh penggunaan:
 *   <SolutionsFiltered name="enterprise" />
 *   <SolutionsFiltered name="media-entertainment" />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import CardSolutions from '../base/cards/CardSolutions';
import Checkbox from '../base/forms/Checkbox';

import { SOLUTIONS_FILTERED_CONFIG } from '@/data/components/solutionsFiltered';
import { SOLUTIONS_DATA }            from '@/data/components/solutionsData';
import {
  ALL_INDUSTRY_VALUE,
  ALL_NEEDS_VALUE,
  ALL_SCALE_VALUE,
  BUSINESS_NEED_OPTIONS,
  BUSINESS_SCALE_OPTIONS,
  getBusinessScaleValuesFromSegments,
  getNeedTagsFromValues,
  INDUSTRY_OPTIONS,
  SOLUTION_INDUSTRY_MAP,
} from '@/data/constants/suggestEnterprise';
import Icon from '../base/Icon';

// ─── Konstanta ────────────────────────────────────────────────────────────────

const ALL_CATEGORY_VALUE = 'All Category';
const VISIBLE_NEEDS_COUNT = 5;

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Buat lookup map id → item dari flat array SOLUTIONS_DATA */
function buildLookupMap(dataArray) {
  return dataArray.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {});
}

function extractUnique(arr) {
  return [...new Set(arr)];
}

// ─── Icon Atoms ───────────────────────────────────────────────────────────────

function ChevronIcon() {
  return (
    <Icon name="chevron-down" aria-hidden="true" /> 
  );
}

function CloseIcon() {
  return (
    <Icon name="close" aria-hidden="true" /> 
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Category Pills
// ═════════════════════════════════════════════════════════════════════════════

function OptionPills({ options, activeValue, onSelect }) {
  return (
    <div className="lnSolutionsFiltered__categoryPills flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = activeValue === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(option.value)}
            className={[
              'lnSolutionsFiltered__pill px-4 py-2 rounded-full text-body-b5 font-regular',
              'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400',
              isActive
                ? 'bg-primary text-black border border-transparent'
                : 'bg-transparent text-black border border-neutral-200 hover:border-neutral-500',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Single Select Checkboxes
// ═════════════════════════════════════════════════════════════════════════════

function SingleSelectCheckboxFilter({
  options,
  allId,
  allLabel,
  activeValue,
  onSelect,
}) {
  return (
    <div className="lnSolutionsFiltered__businessNeeds flex flex-col gap-2">
      <Checkbox
        id={allId}
        label={allLabel}
        checked={!activeValue}
        onChange={() => onSelect('')}
        className='!items-start !px-0 !py-1 !bg-transparent'
      />
      {options.map((option) => (
        <Checkbox
          key={option.value}
          id={`${allId}-${option.value}`}
          label={option.label}
          checked={activeValue === option.value}
          onChange={() => onSelect(option.value)}
          className='!items-start !px-0 !py-1 !bg-transparent'
        />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Business Needs Checkboxes
// ═════════════════════════════════════════════════════════════════════════════

function BusinessNeedsFilter({ options, activeNeeds, onToggle }) {
  return (
    <div className="lnSolutionsFiltered__businessNeeds flex flex-col gap-2">
      <Checkbox
        id="need-all"
        label="All Needs"
        checked={activeNeeds.length === 0}
        onChange={() => onToggle(ALL_NEEDS_VALUE)}
        className='!items-start !px-0 !py-1 !bg-transparent'
      />
      {options.map((option) => (
        <Checkbox
          key={option.value}
          id={`need-${option.value}`}
          label={option.label}
          checked={activeNeeds.includes(option.value)}
          onChange={() => onToggle(option.value)}
          className='!items-start !px-0 !py-1 !bg-transparent'
        />
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Collapsible Filter Group
// ═════════════════════════════════════════════════════════════════════════════

function CollapsibleFilterGroup({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="lnSolutionsFiltered__filterGroup">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="lnSolutionsFiltered__filterGroupToggle w-full flex items-center justify-between mb-3 focus:outline-none group"
        aria-expanded={isOpen}
      >
        <span className="text-body-b4 font-medium text-black">{title}</span>
        <span
          className={[
            'text-neutral-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0',
          ].join(' ')}
        >
          <ChevronIcon />
        </span>
      </button>

      {/* Collapsible body — CSS max-height transition untuk smooth */}
      <div
        className={[
          'lnSolutionsFiltered__filterGroupBody overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Desktop Sidebar
// ═════════════════════════════════════════════════════════════════════════════

function FilterSidebar({
  labelSection,
  titleSection,
  categoryOptions,
  activeCategory,
  onCategorySelect,
  industryOptions,
  activeIndustry,
  onIndustrySelect,
  businessScaleOptions,
  activeBusinessScale,
  onBusinessScaleSelect,
  businessNeedOptions,
  activeNeeds,
  onNeedToggle,
  onReset,
  showAllIndustry,
  onToggleShowAllIndustry,
  showAllBusinessScale,
  onToggleShowAllBusinessScale,
  showAllNeeds,
  onToggleShowAllNeeds,
  hasActiveFilter,
}) {
  const displayedIndustryOptions = showAllIndustry
    ? industryOptions.filter((option) => option.value !== ALL_INDUSTRY_VALUE)
    : industryOptions.filter((option) => option.value !== ALL_INDUSTRY_VALUE).slice(0, VISIBLE_NEEDS_COUNT);
  const displayedBusinessScaleOptions = showAllBusinessScale
    ? businessScaleOptions.filter((option) => option.value !== ALL_SCALE_VALUE)
    : businessScaleOptions.filter((option) => option.value !== ALL_SCALE_VALUE).slice(0, VISIBLE_NEEDS_COUNT);
  const displayedNeeds = showAllNeeds
    ? businessNeedOptions
    : businessNeedOptions.slice(0, VISIBLE_NEEDS_COUNT);

  return (
    <aside className="lnSolutionsFiltered__sidebar hidden lg:flex flex-col gap-6 sticky top-6 self-start">

      {/* Section Intro */}
      <div className="lnSolutionsFiltered__sectionIntro">
        {labelSection && (
          <span className="lnSolutionsFiltered__label text-caption-c1 font-semibold uppercase tracking-widest text-warning block">
            {labelSection}
          </span>
        )}
        {titleSection && (
          <h2 className="lnSolutionsFiltered__title text-headline-h4 font-bold text-black mt-1 leading-snug">
            {titleSection}
          </h2>
        )}
      </div>

      {/* Filter Panel */}
      <div className="lnSolutionsFiltered__filterPanel">

        {/* Header — Reset hanya muncul saat ada filter aktif */}
        <div className="lnSolutionsFiltered__filterHeader flex items-center justify-between mb-5">
          <span className="text-body-b4 font-semibold text-black">Filter</span>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={onReset}
              className="lnSolutionsFiltered__resetBtn text-body-b5 font-medium text-warning hover:underline focus:outline-none"
            >
              Reset
            </button>
          )}
        </div>

        {/* Category — collapsible */}
        <CollapsibleFilterGroup title="Category" defaultOpen={true}>
          <div className="pb-1">
            <OptionPills options={categoryOptions} activeValue={activeCategory} onSelect={onCategorySelect} />
          </div>
        </CollapsibleFilterGroup>

        <div className="border-t border-neutral-100 my-5" />

        <CollapsibleFilterGroup title="Industry" defaultOpen={true}>
          <div className="pb-1">
            <SingleSelectCheckboxFilter
              options={displayedIndustryOptions}
              allId="industry-all"
              allLabel="All Industry"
              activeValue={activeIndustry === ALL_INDUSTRY_VALUE ? '' : activeIndustry}
              onSelect={(value) => onIndustrySelect(value || ALL_INDUSTRY_VALUE)}
            />
            {industryOptions.length - 1 > VISIBLE_NEEDS_COUNT && (
              <button
                type="button"
                onClick={onToggleShowAllIndustry}
                className="lnSolutionsFiltered__showAllBtn mt-3 text-body-b5 font-medium text-neutral-500 hover:text-black focus:outline-none"
              >
                {showAllIndustry ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
        </CollapsibleFilterGroup>

        <div className="border-t border-neutral-100 my-5" />

        <CollapsibleFilterGroup title="Business Scale" defaultOpen={true}>
          <div className="pb-1">
            <SingleSelectCheckboxFilter
              options={displayedBusinessScaleOptions}
              allId="business-scale-all"
              allLabel="All Scales"
              activeValue={activeBusinessScale === ALL_SCALE_VALUE ? '' : activeBusinessScale}
              onSelect={(value) => onBusinessScaleSelect(value || ALL_SCALE_VALUE)}
            />
            {businessScaleOptions.length - 1 > VISIBLE_NEEDS_COUNT && (
              <button
                type="button"
                onClick={onToggleShowAllBusinessScale}
                className="lnSolutionsFiltered__showAllBtn mt-3 text-body-b5 font-medium text-neutral-500 hover:text-black focus:outline-none"
              >
                {showAllBusinessScale ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
        </CollapsibleFilterGroup>

        <div className="border-t border-neutral-100 my-5" />

        {/* Business Needs — collapsible */}
        <CollapsibleFilterGroup title="Business Needs" defaultOpen={true}>
          <div className="pb-1">
            <BusinessNeedsFilter
              options={displayedNeeds}
              activeNeeds={activeNeeds}
              onToggle={onNeedToggle}
            />
            {businessNeedOptions.length > VISIBLE_NEEDS_COUNT && (
              <button
                type="button"
                onClick={onToggleShowAllNeeds}
                className="lnSolutionsFiltered__showAllBtn mt-3 text-body-b5 font-medium text-neutral-500 hover:text-black focus:outline-none"
              >
                {showAllNeeds ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
        </CollapsibleFilterGroup>

      </div>
    </aside>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Mobile Drawer
// ═════════════════════════════════════════════════════════════════════════════

function MobileFilterDrawer({
  isOpen,
  onClose,
  categoryOptions,
  activeCategory,
  onCategorySelect,
  industryOptions,
  activeIndustry,
  onIndustrySelect,
  businessScaleOptions,
  activeBusinessScale,
  onBusinessScaleSelect,
  businessNeedOptions,
  activeNeeds,
  onNeedToggle,
  onReset,
  showAllIndustry,
  onToggleShowAllIndustry,
  showAllBusinessScale,
  onToggleShowAllBusinessScale,
  showAllNeeds,
  onToggleShowAllNeeds,
  activeCount,
}) {
  const displayedIndustryOptions = showAllIndustry
    ? industryOptions.filter((option) => option.value !== ALL_INDUSTRY_VALUE)
    : industryOptions.filter((option) => option.value !== ALL_INDUSTRY_VALUE).slice(0, VISIBLE_NEEDS_COUNT);
  const displayedBusinessScaleOptions = showAllBusinessScale
    ? businessScaleOptions.filter((option) => option.value !== ALL_SCALE_VALUE)
    : businessScaleOptions.filter((option) => option.value !== ALL_SCALE_VALUE).slice(0, VISIBLE_NEEDS_COUNT);
  const displayedNeeds = showAllNeeds
    ? businessNeedOptions
    : businessNeedOptions.slice(0, VISIBLE_NEEDS_COUNT);

  // Body scroll lock + cleanup
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          'lnSolutionsFiltered__backdrop fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter solusi"
        className={[
          'lnSolutionsFiltered__drawer fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-lg',
          'flex flex-col max-h-[85vh] transition-transform duration-300 ease-out lg:hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-neutral-100" />
        </div>

        {/* Header — Reset hanya muncul saat ada filter aktif */}
        <div className="lnSolutionsFiltered__drawerHeader flex items-center justify-between px-5 py-4 border-b border-neutral flex-shrink-0">
          <span className="text-body-b4 font-semibold text-black">Filter</span>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                className="text-body-b5 text-warning font-medium hover:underline focus:outline-none"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup filter"
              className="lnSolutionsFiltered__closeBtn w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Scrollable content — filter groups juga collapsible */}
        <div className="lnSolutionsFiltered__drawerContent flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <CollapsibleFilterGroup title="Category" defaultOpen={true}>
            <div className="pb-2">
              <OptionPills options={categoryOptions} activeValue={activeCategory} onSelect={onCategorySelect} />
            </div>
          </CollapsibleFilterGroup>
          <div className="border-t border-gray-100" />
          <CollapsibleFilterGroup title="Industry" defaultOpen={true}>
            <div className="pb-2">
              <SingleSelectCheckboxFilter
                options={displayedIndustryOptions}
                allId="mobile-industry-all"
                allLabel="All Industry"
                activeValue={activeIndustry === ALL_INDUSTRY_VALUE ? '' : activeIndustry}
                onSelect={(value) => onIndustrySelect(value || ALL_INDUSTRY_VALUE)}
              />
              {industryOptions.length - 1 > VISIBLE_NEEDS_COUNT && (
                <button
                  type="button"
                  onClick={onToggleShowAllIndustry}
                  className="lnSolutionsFiltered__showAllBtn mt-3 text-body-b5 font-medium text-neutral-500 hover:text-black focus:outline-none"
                >
                  {showAllIndustry ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
          </CollapsibleFilterGroup>
          <div className="border-t border-gray-100" />
          <CollapsibleFilterGroup title="Business Scale" defaultOpen={true}>
            <div className="pb-2">
              <SingleSelectCheckboxFilter
                options={displayedBusinessScaleOptions}
                allId="mobile-business-scale-all"
                allLabel="All Scales"
                activeValue={activeBusinessScale === ALL_SCALE_VALUE ? '' : activeBusinessScale}
                onSelect={(value) => onBusinessScaleSelect(value || ALL_SCALE_VALUE)}
              />
              {businessScaleOptions.length - 1 > VISIBLE_NEEDS_COUNT && (
                <button
                  type="button"
                  onClick={onToggleShowAllBusinessScale}
                  className="lnSolutionsFiltered__showAllBtn mt-3 text-body-b5 font-medium text-neutral-500 hover:text-black focus:outline-none"
                >
                  {showAllBusinessScale ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
          </CollapsibleFilterGroup>
          <div className="border-t border-gray-100" />
          <CollapsibleFilterGroup title="Business Needs" defaultOpen={true}>
            <div className="pb-2">
              <BusinessNeedsFilter
                options={displayedNeeds}
                activeNeeds={activeNeeds}
                onToggle={onNeedToggle}
              />
              {businessNeedOptions.length > VISIBLE_NEEDS_COUNT && (
                <button
                  type="button"
                  onClick={onToggleShowAllNeeds}
                  className="lnSolutionsFiltered__showAllBtn mt-3 text-body-b5 font-medium text-neutral-500 hover:text-black focus:outline-none"
                >
                  {showAllNeeds ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
          </CollapsibleFilterGroup>
        </div>

        {/* Footer */}
        <div className="lnSolutionsFiltered__drawerFooter px-5 py-4 border-t border-neutral flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="lnSolutionsFiltered__applyBtn w-full btn btn-primary rounded-xl py-3 text-body-b4 font-semibold"
          >
            Terapkan Filter
            {activeCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-caption-c1 font-bold">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SUB-KOMPONEN: Category Group + Cards Grid
// ═════════════════════════════════════════════════════════════════════════════

function SolutionsCategoryGroup({ titleCategory, descCategory, items }) {
  if (!items?.length) return null;

  return (
    <div className="lnSolutionsFiltered__categoryGroup">
      <div className="lnSolutionsFiltered__categoryHeading mb-6">
        <h3 className="text-headline-h4 font-bold text-black">{titleCategory}</h3>
        {descCategory && (
          <p className="text-body-b5 text-secondary mt-2 max-w-2xl">{descCategory}</p>
        )}
      </div>

      <div className="lnSolutionsFiltered__grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((item) => (
          <CardSolutions
            key={item.id}
            variant="child"
            thumbnail={item.thumbnail}
            thumbnailAlt={item.thumbnailAlt}
            category={item.category}
            categoryIcon={item.categoryIcon}
            title={item.title}
            description={item.description}
            href={item.href}
            tags={item.tags}
          />
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// KOMPONEN UTAMA
// ═════════════════════════════════════════════════════════════════════════════

/** Lookup map dibuat sekali di module level (tidak perlu re-compute per render) */
const SOLUTIONS_LOOKUP = buildLookupMap(SOLUTIONS_DATA);

export default function SolutionsFiltered({ name = 'enterprise', cmsData = null }) {
  const searchParams = useSearchParams();
  const initialIndustryFilter = useMemo(() => {
    const queryIndustry = searchParams.get('industry');

    return INDUSTRY_OPTIONS.some((option) => option.value === queryIndustry)
      ? queryIndustry
      : ALL_INDUSTRY_VALUE;
  }, [searchParams]);
  const initialBusinessScaleFilter = useMemo(() => {
    const queryScale = searchParams.get('scale');

    return BUSINESS_SCALE_OPTIONS.some((option) => option.value === queryScale)
      ? queryScale
      : ALL_SCALE_VALUE;
  }, [searchParams]);
  const initialNeedFilters = useMemo(
    () =>
      searchParams
        .getAll('needs')
        .filter((value) =>
          BUSINESS_NEED_OPTIONS.some((option) => option.value === value)
        ),
    [searchParams]
  );

  // ── 1. Ambil config ────────────────────────────────────────────────────────
  const config = cmsData || SOLUTIONS_FILTERED_CONFIG[name];

  // ── 2. Resolve semua kategori beserta item-itemnya ─────────────────────────
  //    Setiap entry di config.category diubah menjadi:
  //    { slug, titleCategory, descCategory, items: [resolvedSolutionItem, ...] }
  const resolvedCategories = useMemo(() => {
    if (!config) return [];
    return Object.entries(config.category).map(([slug, catConfig]) => ({
      slug,
      titleCategory: catConfig.titleCategory,
      descCategory: catConfig.descCategory,
      items: catConfig.solutions
        .map((id) => SOLUTIONS_LOOKUP[id])
        .filter(Boolean), // skip id yang tidak ditemukan di solutionsData
    }));
  }, [config]);

  // ── 3. State filter ────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory]       = useState(ALL_CATEGORY_VALUE);
  const [activeIndustry, setActiveIndustry]       = useState(initialIndustryFilter);
  const [activeBusinessScale, setActiveBusinessScale] = useState(initialBusinessScaleFilter);
  const [activeNeeds, setActiveNeeds]             = useState(initialNeedFilters);
  const [isMobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAllIndustry, setShowAllIndustry]     = useState(false);
  const [showAllBusinessScale, setShowAllBusinessScale] = useState(false);
  const [showAllNeeds, setShowAllNeeds]           = useState(false);

  // ── 4. Derived: daftar titleCategory unik untuk pills ─────────────────────
  const categoryOptions = useMemo(
    () => [
      { value: ALL_CATEGORY_VALUE, label: ALL_CATEGORY_VALUE },
      ...resolvedCategories.map((category) => ({
        value: category.titleCategory,
        label: category.titleCategory,
      })),
    ],
    [resolvedCategories]
  );

  // ── 5. Derived: semua tags unik dari seluruh item (untuk Business Needs) ───
  const businessNeedOptions = useMemo(
    () =>
      BUSINESS_NEED_OPTIONS.filter((option) =>
        resolvedCategories.some((category) =>
          category.items.some((item) =>
            option.tags.some((tag) => item.tags?.includes(tag))
          )
        )
      ),
    [resolvedCategories]
  );

  // ── 6. Derived: data kategori + item setelah difilter ─────────────────────
  const filteredData = useMemo(() => {
    const selectedNeedTags = getNeedTagsFromValues(activeNeeds);

    return resolvedCategories.reduce((acc, cat) => {
      // Filter by Category pill
      const isCatMatch =
        activeCategory === ALL_CATEGORY_VALUE ||
        cat.titleCategory === activeCategory;
      if (!isCatMatch) return acc;

      const filteredItems = cat.items.filter((item) => {
        const itemIndustryValues = SOLUTION_INDUSTRY_MAP[item.id] || INDUSTRY_OPTIONS
          .filter((option) => option.value !== ALL_INDUSTRY_VALUE)
          .map((option) => option.value);
        const itemBusinessScaleValues = getBusinessScaleValuesFromSegments(item.segments);

        const matchesIndustry =
          activeIndustry === ALL_INDUSTRY_VALUE ||
          itemIndustryValues.includes(activeIndustry);
        const matchesBusinessScale =
          activeBusinessScale === ALL_SCALE_VALUE ||
          itemBusinessScaleValues.includes(activeBusinessScale);
        const matchesNeeds =
          selectedNeedTags.length === 0 ||
          selectedNeedTags.some((needTag) => item.tags?.includes(needTag));

        return matchesIndustry && matchesBusinessScale && matchesNeeds;
      });

      if (!filteredItems.length) return acc;

      acc.push({ ...cat, items: filteredItems });
      return acc;
    }, []);
  }, [resolvedCategories, activeCategory, activeIndustry, activeBusinessScale, activeNeeds]);

  // ── 7. Handlers ────────────────────────────────────────────────────────────
  const handleCategorySelect  = useCallback((cat) => setActiveCategory(cat), []);
  const handleIndustrySelect = useCallback((industry) => setActiveIndustry(industry), []);
  const handleBusinessScaleSelect = useCallback((scale) => setActiveBusinessScale(scale), []);

  const handleNeedToggle = useCallback((need) => {
    if (need === ALL_NEEDS_VALUE) {
      setActiveNeeds([]);
      return;
    }
    setActiveNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  }, []);

  const handleReset         = useCallback(() => {
    setActiveCategory(ALL_CATEGORY_VALUE);
    setActiveIndustry(ALL_INDUSTRY_VALUE);
    setActiveBusinessScale(ALL_SCALE_VALUE);
    setActiveNeeds([]);
  }, []);

  const handleMobileOpen    = useCallback(() => setMobileFilterOpen(true), []);
  const handleMobileClose   = useCallback(() => setMobileFilterOpen(false), []);
  const handleToggleShowAllIndustry = useCallback(() => setShowAllIndustry((v) => !v), []);
  const handleToggleShowAllBusinessScale = useCallback(() => setShowAllBusinessScale((v) => !v), []);
  const handleToggleShowAllNeeds = useCallback(() => setShowAllNeeds((v) => !v), []);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (!config) return null;

  const { labelSection, titleSection } = config;
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config.config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };
  const activeFilterCount =
    (activeCategory !== ALL_CATEGORY_VALUE ? 1 : 0) +
    (activeIndustry !== ALL_INDUSTRY_VALUE ? 1 : 0) +
    (activeBusinessScale !== ALL_SCALE_VALUE ? 1 : 0) +
    activeNeeds.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      id={sectionId}
      className={`lnSection__solutionsFiltered lnSolutionsFiltered w-full py-10 lg:py-16 bg-light
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName}`}
      style={sectionStyle}
    >
      <div className="lnSolutionsFiltered__container container mx-auto">

        {/* ── Mobile: section intro + filter trigger ── */}
        <div className="lnSolutionsFiltered__mobileHeader lg:hidden mb-6">
          {(labelSection || titleSection) && (
            <div className="mb-5">
              {labelSection && (
                <span className="text-caption-c1 font-semibold uppercase tracking-widest text-warning block mb-1">
                  {labelSection}
                </span>
              )}
              {titleSection && (
                <h2 className="text-headline-h3 font-bold text-black">{titleSection}</h2>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleMobileOpen}
            aria-expanded={isMobileFilterOpen}
            className="lnSolutionsFiltered__filterTrigger inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-100 bg-white text-body-b5 font-medium text-neutral-700 hover:border-neutral-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <FilterIcon />
            Filter
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-caption-c1 font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Desktop: 2-column layout ── */}
        <div className="lnSolutionsFiltered__layout flex flex-col lg:flex-row lg:gap-10 lg:items-start">

          {/* Sidebar */}
          <div className="lnSolutionsFiltered__sidebarWrapper w-full lg:w-72 xl:w-64 flex-shrink-0">
            <FilterSidebar
              labelSection={labelSection}
              titleSection={titleSection}
              categoryOptions={categoryOptions}
              activeCategory={activeCategory}
              onCategorySelect={handleCategorySelect}
              industryOptions={INDUSTRY_OPTIONS}
              activeIndustry={activeIndustry}
              onIndustrySelect={handleIndustrySelect}
              businessScaleOptions={BUSINESS_SCALE_OPTIONS}
              activeBusinessScale={activeBusinessScale}
              onBusinessScaleSelect={handleBusinessScaleSelect}
              businessNeedOptions={businessNeedOptions}
              activeNeeds={activeNeeds}
              onNeedToggle={handleNeedToggle}
              onReset={handleReset}
              showAllIndustry={showAllIndustry}
              onToggleShowAllIndustry={handleToggleShowAllIndustry}
              showAllBusinessScale={showAllBusinessScale}
              onToggleShowAllBusinessScale={handleToggleShowAllBusinessScale}
              showAllNeeds={showAllNeeds}
              onToggleShowAllNeeds={handleToggleShowAllNeeds}
              hasActiveFilter={activeFilterCount > 0}
            />
          </div>

          {/* Content area */}
          <div className="lnSolutionsFiltered__content flex-1 min-w-0">
            {filteredData.length === 0 ? (

              /* Empty state */
              <div className="lnSolutionsFiltered__empty flex flex-col items-center justify-center py-24 text-center">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mb-4 opacity-30" aria-hidden="true">
                  <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 28h16M28 20v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-body-b4 font-semibold text-neutral-400 mb-1">
                  Tidak ada solusi ditemukan
                </p>
                <p className="text-body-b5 text-neutral-400 mb-4">
                  Coba ubah atau reset filter Anda.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-primary px-6 py-2.5 rounded-full text-body-b5 font-semibold"
                >
                  Reset Filter
                </button>
              </div>

            ) : (

              /* Category groups */
              <div className="lnSolutionsFiltered__groups space-y-14">
                {filteredData.map((cat) => (
                  <SolutionsCategoryGroup
                    key={cat.slug}
                    titleCategory={cat.titleCategory}
                    descCategory={cat.descCategory}
                    items={cat.items}
                  />
                ))}
              </div>

            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={handleMobileClose}
        categoryOptions={categoryOptions}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelect}
        industryOptions={INDUSTRY_OPTIONS}
        activeIndustry={activeIndustry}
        onIndustrySelect={handleIndustrySelect}
        businessScaleOptions={BUSINESS_SCALE_OPTIONS}
        activeBusinessScale={activeBusinessScale}
        onBusinessScaleSelect={handleBusinessScaleSelect}
        businessNeedOptions={businessNeedOptions}
        activeNeeds={activeNeeds}
        onNeedToggle={handleNeedToggle}
        onReset={handleReset}
        showAllIndustry={showAllIndustry}
        onToggleShowAllIndustry={handleToggleShowAllIndustry}
        showAllBusinessScale={showAllBusinessScale}
        onToggleShowAllBusinessScale={handleToggleShowAllBusinessScale}
        showAllNeeds={showAllNeeds}
        onToggleShowAllNeeds={handleToggleShowAllNeeds}
        activeCount={activeFilterCount}
      />
    </section>
  );
}
