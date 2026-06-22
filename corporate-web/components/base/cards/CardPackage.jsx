import React from 'react';
import LinknetLink from '../Link';

export default function CardPackage({
  title = 'Broadband',
  speed = '100',
  speedUnit = 'Mbps',
  badgeText = 'Up To',
  description = 'Connectivity package consisting of ONT and broadband connectivity up to 100 Mbps',
  price = 'IDR600.000',
  priceUnit = '/month',
  bodyTitle = "What you’ll get",
  features = [
    { url: '/assets/icons/home-wifi.svg', text: 'Unlimited Internet' },
    { url: '/assets/icons/plug-and-play.svg', text: 'Modem Internet' },
    { url: '/assets/icons/shield.svg', text: 'SLA 98,5%' },
  ],
  primaryCtaLabel = 'Sign Up Now',
  primaryCtaHref,
  primaryCtaProps = {},
  secondaryCtaLabel = 'Call Our Sales',
  secondaryCtaHref,
  secondaryCtaProps = {},
  className = '',
}) {
  return (
    <div
      className={`lnCardPackage lnCardPackage--default flex h-full w-full flex-col rounded-[20px] border border-[#E7E7E7] bg-white p-4 md:rounded-[24px] md:p-4 ${className}`}
    >
      <div className="lnCardPackage__head flex min-h-[240px] flex-col rounded-[16px] bg-white p-4 shadow-lg md:min-h-[264px] md:rounded-[24px] md:p-[24px]">
        <div className="lnCardPackage__headTop flex items-start justify-between gap-3">
          <h3 className="lnCardPackage__title text-headline-h5 font-bold text-[#31343B]">{title}</h3>

          {badgeText ? (
            <span className="lnCardPackage__badge inline-flex min-h-[28px] items-center rounded-full bg-[#FFF8E8] px-3 text-caption-c1 font-medium text-warning">
              {badgeText}
            </span>
          ) : null}
        </div>

        <div className="lnCardPackage__speedWrap flex items-end gap-1 leading-none">
          <span className="lnCardPackage__speed text-headline-h3 font-bold leading-none tracking-[-0.03em] text-warning">
            {speed}
          </span>
          <span className="lnCardPackage__speedUnit pb-1 text-body-b3 font-medium leading-none text-secondary">
            {speedUnit}
          </span>
        </div>

        {description ? (
          <p className="lnCardPackage__description mt-4 max-w-[260px] text-body-b5 font-regular leading-[1.35] text-secondary line-clamp-3">
            {description}
          </p>
        ) : null}

        <div className="lnCardPackage__priceWrap mt-auto flex items-end gap-1 pt-7">
          <span className="lnCardPackage__price text-body-b2 font-bold leading-none tracking-[-0.02em] text-black">
            {price}
          </span>
          <span className="lnCardPackage__priceUnit pb-[1px] text-body-b5 font-regular text-secondary">{priceUnit}</span>
        </div>
      </div>

      <div className="lnCardPackage__body h-full px-2 pb-1 pt-6">
        <h4 className="lnCardPackage__bodyTitle text-body-b5 font-regular text-secondary">{bodyTitle}</h4>

        <ul className="lnCardPackage__features mt-4 flex flex-col gap-3">
          {features.map((feature, index) => (
            <li key={`${feature.url || 'feature'}-${index}`} className="lnCardPackage__featureItem flex items-center gap-3">
              <span className="lnCardPackage__featureIconWrap flex h-6 w-6 shrink-0 items-center justify-center">
                {feature.url ? (
                  <img
                    src={feature.url}
                    alt=""
                    className="lnCardPackage__featureIcon h-6 w-6 object-contain"
                    loading="lazy"
                    aria-hidden="true"
                  />
                ) : null}
              </span>
              <span className="lnCardPackage__featureText text-body-b4 font-medium text-[#31343B]">{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="lnCardPackage__cta mt-8 border-t border-dashed border-[#D8D8D8] px-2 pt-6">
        <div className="lnCardPackage__ctaGroup flex flex-col gap-3">
          <LinknetLink
            href={primaryCtaHref || '#'}
            variant="primary"
            className="lnCardPackage__ctaPrimary w-full"
            size="lg"
            {...primaryCtaProps}
          >
            {primaryCtaLabel}
          </LinknetLink>

          <LinknetLink
            href={secondaryCtaHref || '#'}
            variant="secondary-outline"
            className="lnCardPackage__ctaSecondary w-full"
            size="lg"
            {...secondaryCtaProps}
          >
            {secondaryCtaLabel}
          </LinknetLink>
        </div>
      </div>
    </div>
  );
}
