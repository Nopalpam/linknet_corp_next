'use client';

import React, { forwardRef, useId } from 'react';
import Icon from '../Icon';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

const CheckboxCard = forwardRef(function CheckboxCard(
  {
    id,
    name,
    value,
    checked = false,
    disabled = false,
    onChange,
    onBlur,
    image,
    imageAlt,
    text,
    label,
    className = '',
    imageClassName = '',
    textClassName = '',
    children,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || `checkbox-card-${generatedId}`;
  const displayText = text || label;
  const hasImage = Boolean(image);
  const hasText = Boolean(displayText);

  return (
    <label
      htmlFor={inputId}
      className={cx(
        'lnCheckboxCard justify-center relative flex h-[180px] w-[180px] cursor-pointer flex-col rounded-[16px] border bg-white px-10 py-4 text-center transition-colors duration-200',
        checked
          ? 'border-success bg-success-surface'
          : 'border-[var(--stroke-default,#D9D9D9)] bg-white',
        disabled && 'cursor-not-allowed border-[var(--stroke-default,#D9D9D9)] bg-[var(--bg-light-3,#F5F5F7)] opacity-60',
        className,
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        className="sr-only"
        {...props}
      />

      {checked && (
        <span className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 items-center justify-center rounded-[8px] bg-[#08A88A] text-white">
          <Icon name="check" style={{ '--icon-size': '16px' }} />
        </span>
      )}

      <span className="flex w-full flex-col items-center">
        {hasImage && (
          <span className={cx('mb-7 block h-[52px] w-[52px] shrink-0', hasText ? '' : 'mb-0', imageClassName)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={imageAlt || displayText || 'Checkbox card image'}
              className="h-[52px] w-[52px] object-contain"
            />
          </span>
        )}

        {hasText && (
          <span
            className={cx(
              'text-body-b5 font-medium text-black line-clamp-2',
              disabled && 'text-secondary',
              textClassName,
            )}
          >
            {displayText}
          </span>
        )}

        {!hasImage && !hasText && children}
      </span>
    </label>
  );
});

export default CheckboxCard;
