/**
 * Icon Component
 * Adapted from ln-corporate/components/base/Icon.jsx
 * Uses CSS mask-based SVG icons from the design system (_icons.sass)
 */

interface IconProps {
  name: string;
  colorClass?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Icon({ name, colorClass = '', className = '', style = {} }: IconProps) {
  return (
    <span
      className={`icon icon__${name} ${colorClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
