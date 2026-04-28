'use client';

import Button from '../Button';
import LinknetLink from '../Link';
import Icon from '../Icon';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function CTAList({
  ctaList = [],
  align = 'left',
  className = '',
  itemClassName = '',
  ctaClassName = '',
  useButton = false,
  stackOnMobile = false,
  defaultVariant = 'primary',
  defaultSize,
}) {
  if (!ctaList || ctaList.length === 0) return null;

  const alignClassMap = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const Component = useButton ? Button : LinknetLink;

  return (
    <div
      className={cx(
        'lnSection__cta flex flex-wrap gap-4',
        stackOnMobile ? 'flex-col sm:flex-row items-center' : '',
        alignClassMap[align] || 'justify-start',
        className
      )}
    >
      {ctaList.map((cta, index) => (
        <div key={index} className={itemClassName}>
          <Component
            variant={cta.variant || defaultVariant}
            size={cta.size || defaultSize}
            href={cta.href}
            className={ctaClassName}
            iconLeft={cta.iconLeft ? <Icon name={cta.iconLeft} /> : undefined}
            iconRight={cta.iconRight ? <Icon name={cta.iconRight} /> : undefined}
          >
            {cta.text}
          </Component>
        </div>
      ))}
    </div>
  );
}
