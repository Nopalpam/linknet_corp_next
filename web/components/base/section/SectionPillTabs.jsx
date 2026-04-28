'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SectionPillTabs({
  items = [],
  value,
  onChange,
  className = '',
  swiperClassName = '',
  slideClassName = '',
  buttonClassName = '',
  activeButtonClassName = '',
  inactiveButtonClassName = '',
  ariaLabel = 'Section tabs'
}) {
  if (!items || items.length === 0) return null;

  const activeValue = value ?? items[0]?.value;

  return (
    <div className={cx('lnSectionPillTabs w-full', className)}>
      <Swiper
        slidesPerView="auto"
        spaceBetween={12}
        className={cx('!overflow-visible', swiperClassName)}
        aria-label={ariaLabel}
      >
        {items.map((item) => {
          const itemValue = item.value ?? item.id;
          const isActive = activeValue === itemValue;

          return (
            <SwiperSlide key={itemValue} className={cx('!h-auto !w-auto', slideClassName)}>
              <button
                type="button"
                onClick={() => onChange?.(itemValue)}
                className={cx(
                  'inline-flex min-h-[24px] items-center justify-center whitespace-nowrap rounded-full border px-5 py-2 text-body-b4 font-medium transition-all duration-300',
                  isActive
                    ? 'border-warning bg-warning text-black shadow-sm'
                    : 'border-secondary bg-transparent text-black hover:border-neutral-400',
                  isActive ? activeButtonClassName : inactiveButtonClassName,
                  buttonClassName
                )}
                aria-pressed={isActive}
              >
                {item.label}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
