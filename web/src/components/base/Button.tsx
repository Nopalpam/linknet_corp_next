/**
 * Button Component
 * Adapted from ln-corporate/components/base/Button.jsx
 * Uses CSS class-based button system from design system (_buttons.sass)
 */

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'warning' | 'info' | 'danger' | 'link' | 'secondary-outline' | 'secondary-plain';
  outline?: boolean;
  plain?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  outline = false,
  plain = false,
  size = 'md',
  className = '',
  disabled = false,
  iconLeft,
  iconRight,
  ...props
}: ButtonProps) {
  const getVariantClass = () => {
    if (variant === 'link') return 'btn-link';
    if (disabled) return outline ? 'btn-disabled-outline' : 'btn-disabled';

    // Handle compound variants like 'secondary-outline', 'secondary-plain'
    if (variant.includes('-')) return `btn-${variant}`;

    let baseClass = `btn-${variant}`;
    if (outline) baseClass += '-outline';
    else if (plain) baseClass += '-plain';

    return baseClass;
  };

  const getSizeClass = () => {
    if (size === 'sm') return 'btn-sm';
    if (size === 'lg') return 'btn-lg';
    return '';
  };

  return (
    <button
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {iconLeft && <span style={{ display: 'flex' }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'flex' }}>{iconRight}</span>}
    </button>
  );
}
