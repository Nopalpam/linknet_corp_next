'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Icon from '@/components/base/Icon';
import ModalFormSuggestEnterpriseProvider, {
  useModalFormSuggestEnterprise,
} from '@/components/base/modals/ModalFormSuggestEnterprise';

const ACTIVE_TEXTS = ['Industry', 'Scale', 'Needs'];
const ROTATION_INTERVAL = 2200;

function FlipWord({ text, mode }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsActive(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const enteringStyle = isActive
    ? { transform: 'translateY(0)', opacity: 1 }
    : { transform: 'translateY(100%)', opacity: 0 };

  const leavingStyle = isActive
    ? { transform: 'translateY(-100%)', opacity: 0 }
    : { transform: 'translateY(0)', opacity: 1 };

  return (
    <span
      aria-hidden={mode === 'previous'}
      className="pointer-events-none absolute inset-0 whitespace-nowrap text-body-b5 md:text-body-b4 font-bold leading-none transition-all duration-500 ease-out"
      style={mode === 'current' ? enteringStyle : leavingStyle}
    >
      {text}
    </span>
  );
}

function EnterpriseSolutionFinderCTAButton({
  className = '',
  onClick,
}) {
  const { openModal } = useModalFormSuggestEnterprise();
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState(null);
  const measureRef = useRef(null);
  const widthRef = useRef(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        setPreviousIndex(currentIndex);
        return (currentIndex + 1) % ACTIVE_TEXTS.length;
      });
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (!measureRef.current || !widthRef.current) return;
      widthRef.current.style.width = `${measureRef.current.scrollWidth}px`;
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, [activeIndex]);

  const handleClick = onClick || openModal;

  return (
    <div className={`flex justify-center px-1 ${className}`.trim()}>
      <button
        type="button"
        onClick={handleClick}
        className="group flex h-[56px] w-fit w-full md:w-auto md:min-w-[400px] max-w-full items-center justify-between gap-4 rounded-full bg-white px-[16px] py-[16px] shadow-lg border border-[#f3f3f3] transition-transform duration-300 hover:-translate-y-0.5"
      >
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img
              src="/assets/icons/lamp-colors.svg"
              alt="Solution Finder"
              className="object-cover"
            />
          </div>

          <p className="text-body-b5 md:text-body-b4 flex min-w-0 items-center gap-2 font-medium text-black">
            <span className="whitespace-nowrap">Find Solutions Based on</span>
            <span className="relative inline-flex -mb-[8px] md:mb-[5px] align-bottom text-[#FFB800]">
              <span
                ref={measureRef}
                className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-body-b5 md:text-body-b4 font-bold opacity-0"
                aria-hidden="true"
              >
                {ACTIVE_TEXTS[activeIndex]}
              </span>

              <span
                ref={widthRef}
                className="relative inline-block h-[1.4em] overflow-hidden transition-[width] duration-500 ease-out"
                style={{ width: 'auto' }}
              >
                {previousIndex !== null && previousIndex !== activeIndex ? (
                  <FlipWord
                    key={`prev-${previousIndex}-${activeIndex}`}
                    text={ACTIVE_TEXTS[previousIndex]}
                    mode="previous"
                  />
                ) : null}

                <FlipWord
                  key={`active-${activeIndex}`}
                  text={ACTIVE_TEXTS[activeIndex]}
                  mode="current"
                />
              </span>
            </span>
          </p>
        </div>

        <Icon
          name="chevron-right"
          className="h-6 w-6 shrink-0 text-black transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}

export default function EnterpriseSolutionFinderCTA(props) {
  return (
    <ModalFormSuggestEnterpriseProvider>
      <EnterpriseSolutionFinderCTAButton {...props} />
    </ModalFormSuggestEnterpriseProvider>
  );
}
