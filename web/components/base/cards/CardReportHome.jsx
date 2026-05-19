'use client';

import LinknetLink from '../Link'; 
import Icon from '../Icon';

const DEFAULT_REPORT_ICON_SRC = 'http://localhost:3001/assets/icons/pdf-circle.svg';

function isImageSource(value) {
  return /^https?:\/\//i.test(value)
    || value.startsWith('/')
    || value.startsWith('data:')
    || /\.(svg|png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(value);
}

export default function CardReportHome({
  iconSrc = "", 
  title = "",
  description = "",
  ctaText = "",
  ctaLink = "",
  ctaList = [],
  year = "",
  className = ""
}) {
  const primaryCta = Array.isArray(ctaList) && ctaList.length > 0 ? ctaList[0] : null;
  const label = primaryCta?.label || primaryCta?.text || ctaText;
  const href = primaryCta?.href || primaryCta?.url || ctaLink;
  const resolvedIcon = iconSrc || DEFAULT_REPORT_ICON_SRC;

  return (
   <div 
      className={`lnCardReportHome relative flex flex-col rounded-[24px] overflow-hidden w-full max-w-[400px] hover:-translate-y-1 duration-200 transition-transform h-full ${className}`}
    >
      
      {/* Bagian Atas (Putih) */}
      <div className="lnCardReportHome__body flex-1 p-8 flex flex-col items-start bg-light-2 relative rounded-[20px]">
        
        {/* Icon */}
        <div className="lnCardReportHome__iconWrap w-full h-auto mb-6">
          {isImageSource(resolvedIcon) ? (
            <img
              src={resolvedIcon}
              alt={title ? `${title} icon` : 'Report icon'}
              className="lnCardReportHome__icon w-12 h-12 object-contain"
            />
          ) : (
            <Icon
              name={resolvedIcon}
              className="lnCardReportHome__icon text-secondary"
              style={{ '--icon-size': '48px' }}
            />
          )}
        </div>

        {/* Title */}
        <h3 className="lnCardReportHome__title text-body-b2 font-bold text-black mb-3 tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="lnCardReportHome__description text-body-b5 font-regular text-secondary mb-10 flex-1">
          {description}
        </p>

        {label && (
          <LinknetLink 
            href={href || '#'} 
            variant={primaryCta?.variant || 'secondary-outline'} 
            size={primaryCta?.size || 'md'} 
            className="lnCardReportHome__cta flex transition-colors"
          >
            <span>{label}</span>
          </LinknetLink>
        )}
      </div>

      {/* Bagian Bawah (Footer Kuning) */}
      {year && (
      <div className="lnCardReportHome__footer py-2 pt-6 -mt-4 w-full flex items-center justify-center"
        style={{ 
          backgroundImage: `url('/assets/bg/yellow-marble.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <span className="lnCardReportHome__year text-black font-bold text-body-b4">
          {year}
        </span>
      </div>
      )}
      
    </div>
  );
}
