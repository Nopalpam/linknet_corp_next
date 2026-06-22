'use client';

import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import Icon from '../Icon';

export function getModalStepStatus(stepNumber, currentStep) {
  if (stepNumber < currentStep) return 'finish';
  if (stepNumber === currentStep) return 'active';
  return 'disabled';
}

export default function FormStepperModal({
  steps = [],
  currentStep = 1,
  className = '',
  align = 'center',
}) {
  const swiperRef = useRef(null);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed) return;

    const activeIdx = steps.findIndex((step) => {
      const status = step.status || getModalStepStatus(step.step, currentStep);
      return status === 'active';
    });

    if (activeIdx === -1) return;

    swiper.slideTo(activeIdx, 400);
  }, [currentStep, steps]);

  return (
    <nav
      aria-label="Form progress"
      className={['lnStepperModal w-full', className].filter(Boolean).join(' ')}
    >
      <Swiper
        modules={[FreeMode]}
        centeredSlides={align !== 'start'}
        breakpoints={{
          0: {
            slidesPerView: 'auto',
            centeredSlides: align !== 'start',
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 'auto',
            spaceBetween: 12,
            centeredSlides: false,
          },
        }}
        className="lnStepperNav__swiper !overflow-visible"
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
      >
        {steps.map((step, index) => {
          const status = step.status || getModalStepStatus(step.step, currentStep);
          const isFinish = status === 'finish';
          const isActive = status === 'active';

          return (
            <SwiperSlide
              key={step.step}
              className="lnStepperModal__slide !w-auto"
            >
              <div className="lnStepperModal__item flex items-center gap-1.5 pr-1">
                <span
                  aria-hidden="true"
                  className={[
                    'lnStepperModal__badge flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0',
                    'text-caption-c1 font-semibold transition-colors duration-300',
                    isFinish
                      ? 'bg-success text-white'
                      : isActive
                        ? 'bg-warning text-white'
                        : 'bg-[#F1F3F5] text-secondary',
                  ].join(' ')}
                >
                  {isFinish ? (
                    <Icon
                      name="check"
                      className="text-white"
                      style={{ '--icon-size': '14px' }}
                    />
                  ) : (
                    step.step
                  )}
                </span>

                <span
                  className={[
                    'lnStepperModal__label text-body-b5 font-medium transition-colors duration-300',
                    isActive || isFinish ? 'text-black' : 'text-secondary',
                  ].join(' ')}
                >
                  {step.label || step.step_name}
                </span>

                {index < steps.length - 1 ? (
                  <Icon
                    name="chevron-right"
                    aria-hidden="true"
                    className="text-secondary ml-1 flex-shrink-0"
                    style={{ '--icon-size': '18px' }}
                  />
                ) : null}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </nav>
  );
}
