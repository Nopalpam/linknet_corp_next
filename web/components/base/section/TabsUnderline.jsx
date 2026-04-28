'use client';

import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TabsUnderline({
  items = [],
  value,
  onChange,
  className = '',
  swiperClassName = '',
  slideClassName = '',
  buttonClassName = '',
  activeButtonClassName = '',
  inactiveButtonClassName = '',
  ariaLabel = 'Tabs underline'
}) {
  const swiperRef = useRef(null);
  const safeItems = items || [];

  const activeValue = value ?? safeItems[0]?.value ?? safeItems[0]?.id;
  const activeIndex = safeItems.findIndex((item) => {
    const itemValue = item.value ?? item.id;
    return itemValue === activeValue;
  });

  useEffect(() => {
    if (!swiperRef.current || activeIndex < 0) return;
    swiperRef.current.slideTo(activeIndex, 300);
  }, [activeIndex]);

  if (safeItems.length === 0) return null;

  return (
    <div className={cx('lnTabs-underline w-full border-b border-secondary', className)}>
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        slidesPerView="auto"
        spaceBetween={0}
        className={cx('lnTabs-underline__swiper w-full !overflow-visible', swiperClassName)}
        aria-label={ariaLabel}
      >
        {safeItems.map((item) => {
          const itemValue = item.value ?? item.id;
          const isActive = activeValue === itemValue;

          return (
            <SwiperSlide
              key={itemValue}
              className={cx('lnTabs-underline__slide !h-auto !w-auto', slideClassName)}
            >
              <button
                type="button"
                onClick={() => onChange?.(itemValue, item)}
                className={cx(
                  'lnTabs-underline__button inline-flex h-[44px] items-center justify-center whitespace-nowrap border-b-2 border-transparent px-[14px] py-[8px] -mb-px text-body-b4 font-medium transition-colors duration-300',
                  isActive
                    ? 'lnTabs-underline__button--active border-warning text-black'
                    : 'text-secondary hover:text-black',
                  isActive ? activeButtonClassName : inactiveButtonClassName,
                  buttonClassName
                )}
                aria-pressed={isActive}
              >
                <span className="lnTabs-underline__label">{item.label}</span>
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
