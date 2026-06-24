'use client';

import React, { useCallback, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import CardPackage from '../base/cards/CardPackage';
import CoverageCheckInput, { COVERAGE_MODE } from '../base/forms/CoverageCheckInput';
import Icon from '../base/Icon';
import { useModalFormRegistrationEnterpriseSMB } from '../base/modals/ModalFormRegistrationEnterpriseSMB';
import Intro from '../base/section/Intro';

import { PACKAGE_LIST_DATA } from '@/data/components/packageList';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

const INITIAL_MANUAL_DATA = {
  province: '',
  city: '',
  zip: '',
  detailAddress: '',
};

function HighlightItem({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-body-b5 font-regular text-secondary">
      <Icon
        name={icon}
        className="text-secondary"
        style={{ '--icon-size': '18px' }}
      />
      <span>{text}</span>
    </div>
  );
}

export default function PackageList({
  name = 'enterprise',
  className = '',
  cmsData = null,
  slidesPerViewMobile = 1.1,
  slidesPerViewDesktop = 3,
}) {
  const sectionData = cmsData || PACKAGE_LIST_DATA[name];
  const { openModal } = useModalFormRegistrationEnterpriseSMB();

  const [coverageMode, setCoverageMode] = useState(COVERAGE_MODE.SEARCH);
  const [siteId, setSiteId] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [manualData, setManualData] = useState(INITIAL_MANUAL_DATA);

  const handleAddressDetailChange = useCallback((event) => {
    setAddressDetail(event.target.value);
  }, []);

  const handleManualDataChange = useCallback((nextManualData) => {
    setManualData(nextManualData);
  }, []);

  const handleModeChange = useCallback((nextMode) => {
    setCoverageMode(nextMode);
  }, []);

  const handleAddressSelect = useCallback(({ site_id, address }) => {
    setSiteId(site_id || '');
    setSelectedAddress(address || '');
  }, []);

  const handleAddressReset = useCallback(() => {
    setCoverageMode(COVERAGE_MODE.SEARCH);
    setSiteId('');
    setSelectedAddress('');
    setAddressDetail('');
    setManualData(INITIAL_MANUAL_DATA);
  }, []);

  const handlePrimaryCtaClick = useCallback(
    (item) => (event) => {
      event.preventDefault();

      openModal({
        internetService: item.registrationInternetService || '',
        site_id: coverageMode === COVERAGE_MODE.COVERED ? siteId : '',
        address: coverageMode === COVERAGE_MODE.COVERED ? selectedAddress : '',
      });
    },
    [coverageMode, openModal, selectedAddress, siteId]
  );

  if (!sectionData) return null;

  const { config, introData, highlights = [], packages = [], footerText } = sectionData;
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};
  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);

  return (
    <section
      id={sectionId}
      className={`lnSection__packageList bg-white py-16 md:py-24 lg:py-[120px] overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
    >
      <div className="container-sm mx-auto px-4 md:px-0">
        <div className="mx-auto max-w-[860px]">
          {introData ? (
            <Intro
              as={introData.as || 'h2'}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || 'center'}
              className="!w-full"
            />
          ) : null}

          {highlights.length > 0 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {highlights.map((item, index) => (
                <HighlightItem
                  key={`${item.icon}-${index}`}
                  icon={item.icon}
                  text={item.text}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-8 md:mt-10">
            <CoverageCheckInput
              site_id={siteId}
              addressDetail={addressDetail}
              onAddressDetailChange={handleAddressDetailChange}
              manualData={manualData}
              onManualDataChange={handleManualDataChange}
              onModeChange={handleModeChange}
              onAddressSelect={handleAddressSelect}
              onAddressReset={handleAddressReset}
              showNotFoundAction={false}
              showAddressDetailInput={false}
              className={[
                'mx-auto max-w-[760px]',
                coverageMode === COVERAGE_MODE.MANUAL ? 'max-w-[960px]' : '',
              ].join(' ')}
            />
          </div>
        </div>

        {packages.length > 0 ? (
          <div className="mx-auto mt-12 max-w-[1180px] md:mt-10 lg:mt-12">
            <Swiper
              spaceBetween={12}
              slidesPerView={slidesPerViewMobile}
              centeredSlides
              watchOverflow
              breakpoints={{
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                  centeredSlides: false,
                },
                1024: {
                  slidesPerView: slidesPerViewDesktop,
                  spaceBetween: 24,
                  centeredSlides: false,
                },
              }}
              className="!overflow-visible"
            >
              {packages.map((item) => (
                <SwiperSlide key={item.id} className="!h-auto">
                  <div className="h-full">
                    <CardPackage
                      title={item.title}
                      speed={item.speed}
                      speedUnit={item.speedUnit}
                      badgeText={item.badgeText}
                      description={item.description}
                      price={item.price}
                      priceUnit={item.priceUnit}
                      bodyTitle={item.bodyTitle}
                      features={item.features}
                      primaryCtaLabel={item.primaryCtaLabel}
                      primaryCtaHref={item.primaryCtaHref}
                      primaryCtaProps={{ onClick: handlePrimaryCtaClick(item) }}
                      secondaryCtaLabel={item.secondaryCtaLabel}
                      secondaryCtaHref={item.secondaryCtaHref}
                      className="h-full"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : null}

        {footerText ? (
          <div className="mx-auto mt-10 md:max-w-[840px] text-center md:mt-14">
            <p className="text-body-b5 font-regular leading-relaxed text-secondary">
              {footerText}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
