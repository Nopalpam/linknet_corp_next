'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import Icon from '../base/Icon';
import CoverageCheckInput, { COVERAGE_MODE } from '../base/forms/CoverageCheckInput';
import ModalFormInquiryFiberProvider, {
  useModalFormInquiryFiber,
} from '../base/modals/ModalFormInquiryFiber';
import ModalFormSubscribeInternetFiberProvider, {
  useModalFormSubscribeInternetFiber,
} from '../base/modals/ModalFormSubscribeInternetFiber';
import Intro from '../base/section/Intro';
import { CHECK_COVERAGE_DATA } from '@/data/components/checkCoverage';

const INITIAL_MANUAL_DATA = {
  province: '',
  city: '',
  zip: '',
  detailAddress: '',
};

function buildSectionData(resolvedData, fallbackSectionData) {
  const fallbackConfig = fallbackSectionData?.config || {};
  const fallbackIntroData = fallbackSectionData?.introData || {};

  return {
    config: {
      ...fallbackConfig,
      sectionId: resolvedData.sectionId || resolvedData.section_id || fallbackConfig.sectionId,
      className: [fallbackConfig.className, resolvedData.sectionClassName, resolvedData.custom_class]
        .filter(Boolean)
        .join(' '),
      bgImage: resolvedData.bgImage || resolvedData.background_image || fallbackConfig.bgImage,
      bgImageMobile:
        resolvedData.bgImageMobile || resolvedData.background_image_mobile || fallbackConfig.bgImageMobile,
      bgPositionClasses: resolvedData.bgPositionClasses || fallbackConfig.bgPositionClasses,
      bgSizeClass: resolvedData.bgSizeClass || fallbackConfig.bgSizeClass,
    },
    introData: {
      ...fallbackIntroData,
      as: resolvedData.as || fallbackIntroData.as,
      label: resolvedData.label || fallbackIntroData.label,
      title: resolvedData.title || resolvedData.coverage_title || fallbackIntroData.title,
      description:
        resolvedData.description || resolvedData.coverage_description || fallbackIntroData.description,
      align: resolvedData.align || fallbackIntroData.align,
    },
  };
}

function ActionCard({ title, description, imageSrc, imageAlt, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-[16px] border border-neutral bg-white px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 md:px-6"
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-[36px] w-[36px] object-contain md:h-[44px] md:w-[44px]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-headline-h6 font-bold leading-tight text-black">
          {title}
        </h3>
        <p className="mt-2 text-body-b5 leading-relaxed text-secondary">
          {description}
        </p>
      </div>
      <span className="flex shrink-0 items-center justify-center transition-colors duration-200 group-hover:border-warning">
        <Icon
          name="chevron-right"
          colorClass="text-black group-hover:text-warning"
          className="h-5 w-5"
        />
      </span>
    </button>
  );
}

function CheckCoverageContent({ sectionData, className = '', ...sectionProps }) {
  const pathname = usePathname();
  const { openModal: openInquiryModal } = useModalFormInquiryFiber();
  const { openModal: openSubscribeModal } = useModalFormSubscribeInternetFiber();

  const [coverageMode, setCoverageMode] = useState(COVERAGE_MODE.SEARCH);
  const [siteId, setSiteId] = useState('');
  const [selectedCoverage, setSelectedCoverage] = useState(null);
  const [manualData, setManualData] = useState(INITIAL_MANUAL_DATA);
  const [manualCoverageChecked, setManualCoverageChecked] = useState(false);

  const showChoices =
    coverageMode === COVERAGE_MODE.COVERED
    || (coverageMode === COVERAGE_MODE.MANUAL && manualCoverageChecked);
  const canCheckProvider =
    coverageMode === COVERAGE_MODE.COVERED && Boolean(siteId);

  const normalizeCoverageProviders = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value === null || value === undefined || value === '') {
      return [];
    }
    return [value];
  };

  const handleAddressSelect = ({ site_id, address = '', raw, providers = [] }) => {
    setSiteId(site_id || '');
    setSelectedCoverage(
      site_id
        ? {
            site_id,
            address: address || '',
            raw: raw ?? null,
            providers: normalizeCoverageProviders(providers),
          }
        : null,
    );
    setManualCoverageChecked(false);
  };

  const handleAddressReset = () => {
    setCoverageMode(COVERAGE_MODE.SEARCH);
    setSiteId('');
    setSelectedCoverage(null);
    setManualData(INITIAL_MANUAL_DATA);
    setManualCoverageChecked(false);
  };

  const handleManualDataChange = (nextManualData) => {
    setManualData(nextManualData);
    setManualCoverageChecked(false);
  };

  const handleManualCheckCoverage = () => {
    setManualCoverageChecked(true);
  };

  const handleCheckAvailableProvider = () => {
    if (!canCheckProvider) {
      return;
    }

    const rawSource = selectedCoverage?.providers?.length > 0
      ? selectedCoverage.providers
      : (selectedCoverage?.raw?.providers
          ?? (selectedCoverage?.raw?.data && Array.isArray(selectedCoverage.raw.data) ? selectedCoverage.raw.data[0]?.providers : undefined)
          ?? (Array.isArray(selectedCoverage?.raw) ? selectedCoverage.raw[0]?.providers : undefined)
          ?? selectedCoverage?.raw
          ?? '');

    const normalizeProviders = (src) => {
      if (!src && src !== 0) return [];
      if (Array.isArray(src)) {
        return src.flatMap((p) => (typeof p === 'string' ? p.split(',') : [String(p)]))
          .map((p) => String(p).trim())
          .filter(Boolean);
      }

      if (typeof src === 'string') {
        return src.split(',').map((p) => p.trim()).filter(Boolean);
      }

      if (typeof src === 'object') {
        const cand = src.providers ?? src.provider ?? src.name ?? src.label ?? src.value;
        return normalizeProviders(cand);
      }

      return [String(src).trim()].filter(Boolean);
    };

    const providerArray = normalizeProviders(rawSource);

    openSubscribeModal({
      Promo_Website__c: 'Check Coverage',
      Page_Website__c: pathname || '/coverage',
      Source_Website__c: 'Coverage Website',
      SiteID: siteId,
      address: selectedCoverage?.address || '',
      raw: selectedCoverage?.raw,
      providers: providerArray.length > 0 ? providerArray : rawSource,
    });
  };

  if (!sectionData) {
    return null;
  }

  const {
    config = {},
    introData = {},
  } = sectionData;
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config;
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  return (
    <section
      id={sectionId}
      className={`relative overflow-hidden bg-[#FBFBF8] py-16 md:py-24 lg:py-[120px]
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
      {...sectionProps}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_top,_rgba(255,255,255,0.78),_rgba(251,251,248,0.64)_42%,_rgba(247,247,243,0.52)_100%)]" />
      </div>

      <div className="container relative z-10 mx-auto w-full px-4 md:px-0">
        <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="flex min-w-0 flex-col justify-between gap-10 md:gap-14 lg:gap-16">
            <div>
              <Intro
                as={introData.as || 'h2'}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || 'left'}
                fluid
                className="max-w-[720px]"
                titleClassName="!mt-5"
              />

              <div className="mt-6 max-w-[760px] md:mt-8">
                <CoverageCheckInput
                  site_id={siteId}
                  addressDetail=""
                  onModeChange={setCoverageMode}
                  onAddressSelect={handleAddressSelect}
                  onAddressReset={handleAddressReset}
                  manualData={manualData}
                  onManualDataChange={handleManualDataChange}
                  showAddressDetailInput={false}
                  showManualDetailAddress={false}
                  manualCheckCtaLabel="Check Coverage"
                  onManualCheckCoverage={handleManualCheckCoverage}
                  coveredHeaderText="Linknet Network Covered Addresses"
                  coveredActionIconName="pencil"
                  className={
                    coverageMode === COVERAGE_MODE.MANUAL ? 'max-w-[920px]' : ''
                  }
                />
              </div>

              {showChoices ? (
                <div className="mt-6 max-w-[760px] rounded-[16px] bg-white p-5 shadow-lg ring-1 ring-black/[0.04] backdrop-blur-sm md:p-7">
                  <p className="text-body-b4 font-regular leading-none text-secondary">
                    I want to..
                  </p>

                  <div className="mt-5 space-y-4">
                    <ActionCard
                      title="Form Inquiry / Support / Partnership"
                      description="Need technical assistance or want to partner? We're ready to help."
                      imageSrc="/assets/illustrations/ill-building.svg"
                      imageAlt="Inquiry support illustration"
                      onClick={openInquiryModal}
                    />

                    {coverageMode === COVERAGE_MODE.COVERED ? (
                      <ActionCard
                        title="Check Available Provider"
                        description="Proceed to select the provider you want."
                        imageSrc="/assets/illustrations/ill-house.svg"
                        imageAlt="Provider availability illustration"
                        onClick={handleCheckAvailableProvider}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CheckCoverage({
  name = 'enterprise',
  className = '',
  data,
  cmsData,
  ...sectionProps
}) {
  const resolvedData = cmsData || data || {};
  const fallbackSectionData = CHECK_COVERAGE_DATA[name] || CHECK_COVERAGE_DATA.enterprise;
  const sectionData = useMemo(
    () => buildSectionData(resolvedData, fallbackSectionData),
    [fallbackSectionData, resolvedData],
  );

  return (
    <ModalFormInquiryFiberProvider>
      <ModalFormSubscribeInternetFiberProvider>
        <CheckCoverageContent
          sectionData={sectionData}
          className={className}
          {...sectionProps}
        />
      </ModalFormSubscribeInternetFiberProvider>
    </ModalFormInquiryFiberProvider>
  );
}