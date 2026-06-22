'use client';

import { useRef, useEffect } from 'react';

/**
 * SegmentPicker
 * Props:
 *  - options  : { label, value }[]
 *  - value    : string  (controlled)
 *  - onChange : (value: string) => void  — optional, if omitted component is display-only
 *  - className: string
 */
export default function SegmentPicker({ options = [], value, onChange, className = '' }) {
  const activeIndex = Math.max(options.findIndex(o => o.value === value), 0);
  const thumbRef = useRef(null);
  const buttonRefs = useRef([]);

  const updateThumb = () => {
    const btn = buttonRefs.current[activeIndex];
    const thumb = thumbRef.current;

    if (btn && thumb) {
      thumb.style.width = `${btn.offsetWidth}px`;
      thumb.style.transform = `translateX(${btn.offsetLeft}px)`;
    }
  };

  useEffect(() => { updateThumb(); }, [activeIndex, options]);

  useEffect(() => {
    window.addEventListener('resize', updateThumb);
    return () => window.removeEventListener('resize', updateThumb);
  }, [activeIndex]);

  return (
    <div className={`relative inline-flex w-full px-1.5 py-1.5 bg-light-1 rounded-full overflow-hidden ${className}`}>
      {/* Sliding thumb */}
      <div
        ref={thumbRef}
        className="absolute top-1 bottom-1 left-0 bg-white rounded-full shadow-md transition-all duration-300 ease-out"
        style={{ width: 0, transform: 'translateX(0px)' }}
      />

      {options.map((opt, i) => {
        const active = activeIndex === i;
        return (
          <button
            key={opt.value}
            type="button"
            ref={el => (buttonRefs.current[i] = el)}
            {...(onChange ? { onClick: () => onChange(opt.value) } : {})}
            style={!onChange ? { pointerEvents: 'none', cursor: 'default' } : {}}
            className={`
              relative z-10 flex-1 flex items-center justify-center gap-1.5
              px-6 py-2 rounded-full text-body-b5 font-medium
              transition-colors duration-200 outline-none select-none whitespace-nowrap
              ${active ? 'text-neutral-900' : 'text-neutral-500'}
            `}
          >
            {opt.icon && (
              <span className={`flex items-center justify-center transition-colors duration-200 ${active ? 'text-black' : 'text-secondary'}`}>
                {opt.icon}
              </span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}