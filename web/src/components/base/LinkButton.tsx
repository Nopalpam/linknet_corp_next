/**
 * Link Component (Anchor styled as Button)
 * Adapted from ln-corporate/components/base/Link.jsx
 */

import { type AnchorHTMLAttributes, type ReactNode } from 'react';

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'warning' | 'info' | 'danger' | 'link' | 'secondary-outline' | 'secondary-plain';
  outline?: boolean;
  plain?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  disabled?: boolean;
}

export default function LinkButton({
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
}: LinkButtonProps) {
  const getVariantClass = () => {
    if (variant === 'link') return 'btn-link';
    if (disabled) return outline ? 'btn-disabled-outline' : 'btn-disabled';

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
    <a
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      {...props}
    >
      {iconLeft && <span style={{ display: 'flex' }}>{iconLeft}</span>}
      {children}
      {iconRight && <span style={{ display: 'flex' }}>{iconRight}</span>}
    </a>
  );
}
