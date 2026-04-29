'use client';

import { useId, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import SectionIntro from '../base/section/Intro';
import CardServices from '../base/cards/CardServices';
import Icon from '../base/Icon';

import { SOLUTIONS_SERVICES_WITH_BACKGROUND_DATA } from '@/data/components/solutionsServicesWithBackground';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SolutionsServicesWithBackground({
  name = 'enterprise',
  className = '',
}) {
  const data = SOLUTIONS_SERVICES_WITH_BACKGROUND_DATA[name];
  const swiperRef = useRef(null);
  const sectionInstanceId = useId().replace(/:/g, '');
  const prevButtonClassName = `lnSolutionsServicesWithBackground__navPrev--${sectionInstanceId}`;
  const nextButtonClassName = `lnSolutionsServicesWithBackground__navNext--${sectionInstanceId}`;

  if (!data) {
    console.warn(
      `[SolutionsServicesWithBackground] Key "${name}" tidak ditemukan di SOLUTIONS_SERVICES_WITH_BACKGROUND_DATA.`
    );
    return null;
  }

  const { config, introData, items = [] } = data;
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  return (
    <section
      id={sectionId}
      className={cn(
        'lnSection__solutionsServicesWithBackground bg-white py-16 md:py-24 overflow-hidden bg-no-repeat',
        bgPositionClasses,
        bgSizeClass,
        'bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]',
        configClassName,
        className
      )}
      style={sectionStyle}
    >
      <div className="lnSolutionsServicesWithBackground__inner container">
        <div className="lnSolutionsServicesWithBackground__header mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
          <SectionIntro
            as={introData.as}
            label={introData.label}
            title={introData.title}
            align={introData.align}
            className="lnSolutionsServicesWithBackground__intro !w-full"
          />

          <div className="lnSolutionsServicesWithBackground__nav hidden shrink-0 items-center gap-4 md:flex">
            <button
              aria-label="Slide sebelumnya"
              className={cn(
                'lnSolutionsServicesWithBackground__navPrev flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-[#31343B] shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] disabled:opacity-40',
                prevButtonClassName
              )}
            >
              <Icon name="chevron-left" />
            </button>

            <button
              aria-label="Slide berikutnya"
              className={cn(
                'lnSolutionsServicesWithBackground__navNext flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-[#31343B] shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] disabled:opacity-40',
                nextButtonClassName
              )}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>

        <div className="lnSolutionsServicesWithBackground__sliderWrap">
          <Swiper
            modules={[Navigation]}
            slidesPerView={1.2}
            spaceBetween={12}
            breakpoints={{
              1024: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
            }}
            navigation={{
              prevEl: `.${prevButtonClassName}`,
              nextEl: `.${nextButtonClassName}`,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="lnSolutionsServicesWithBackground__swiper !overflow-visible"
            grabCursor
            a11y={{ enabled: true }}
          >
            {items.map((item) => (
              <SwiperSlide
                key={item.id}
                className="lnSolutionsServicesWithBackground__slide !h-auto"
              >
                <div className="mx-auto h-full">
                  <CardServices
                    badgeIcon={item.badgeIcon}
                    badgeLabel={item.badgeLabel}
                    title={item.title}
                    subtitle={item.subtitle}
                    backgroundImage={item.backgroundImage}
                    backgroundAlt={item.backgroundAlt}
                    gradientHex={item.gradientHex}
                    href={item.href}
                    actionLabel={item.actionLabel}
                    className="max-w-none"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
