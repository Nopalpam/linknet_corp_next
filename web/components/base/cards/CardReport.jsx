import React from 'react';
import LinknetLink from '../Link'; 
import Icon from '../Icon';

export default function CardReport({
  variant = 'cover', // Pilihan: 'cover' | 'list'
  
  // Props Umum
  title,
  downloadUrl = "#",
  className = "",
  
  // Props Khusus variant="cover"
  image,
  year,
  fileSize,
  
  // Props Khusus variant="list"
  icon,
  suffixIcon,
  suffixHref,
  suffixTarget = "_blank",
  suffixRel = "noopener noreferrer",
  suffixLabel = "Download file",
  badges = [], // Array string, misal: ['Audited']
  category,
  date,
}) {
  const normalizedBadges = Array.isArray(badges)
    ? badges.filter((badge) => typeof badge === 'string' && badge.trim()).map((badge) => badge.trim())
    : [];
  const safeTitle = typeof title === 'string' ? title : '';
  const hasImage = typeof image === 'string' && image.trim();

  // ==========================================
  // VARIANT 2: LIST / ROW (Gambar Bawah)
  // ==========================================
  if (variant === 'list') {
    const actionHref = suffixHref || downloadUrl;
    const actionIcon = suffixIcon || <Icon name="download" className='text-current' style={{ '--icon-size': '20px' }} />;
    const hasMeta = normalizedBadges.length > 0 || category || date;

    return (
      <div
        className={`lnCardReport lnCardReport--list group flex items-center gap-4 rounded-[14px] border border-neutral-100 bg-white p-3 md:p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] ${className}`}
      >
        {/* Left: Icon Badge */}
        <div className="lnCardReport__iconWrap flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF7D8]">
          {icon ? (
            <img src={icon} alt="PDF Icon" className="lnCardReport__icon h-9 w-9 object-contain" />
          ) : (
            // Fallback jika tidak ada icon
            <span className="lnCardReport__iconFallback text-pink-600 font-bold text-xs">PDF</span>
          )}
        </div>

        {/* Right: Content */}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lnCardReport__body flex flex-col flex-1 min-w-0"
        >
          <h3 className="lnCardReport__title text-body-b4 font-semibold leading-snug text-neutral-950 transition-colors group-hover:text-black">
            {safeTitle}
          </h3>
          
          {hasMeta ? (
            <div className="lnCardReport__meta mt-2 flex flex-wrap items-center gap-2 text-caption-c1 text-neutral-500 md:mt-3">
              {/* Badges Pill */}
              {normalizedBadges.map((badge, index) => (
                <span 
                  key={index} 
                  className="lnCardReport__badge rounded-full bg-[#FFF2B3] px-3 py-1 text-caption-c1 font-semibold text-black transition-colors"
                >
                  {badge}
                </span>
              ))}
              
              {/* Meta Text */}
              {category && <span className="lnCardReport__metaText">{category}</span>}
              {date && <span className="lnCardReport__metaText before:mr-2 before:inline-block before:h-1 before:w-1 before:rounded-full before:bg-neutral-300 before:align-middle before:content-['']">{date}</span>}
            </div>
          ) : null}
        </a>

        {actionHref ? (
          <a
            href={actionHref}
            target={suffixTarget}
            rel={suffixRel}
            aria-label={suffixLabel}
            className="lnCardReport__suffixAction ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-100 bg-neutral-50 text-neutral-700 transition-colors duration-300 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
          >
            {typeof actionIcon === 'string' ? (
              <img src={actionIcon} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
            ) : (
              actionIcon
            )}
          </a>
        ) : null}
      </div>
    );
  }

  // ==========================================
  // VARIANT 1: COVER CARD (Gambar Atas)
  // ==========================================
  return (
    <div className={`lnCardReport lnCardReport--cover group flex min-h-[210px] flex-col overflow-hidden rounded-[16px] border border-neutral-100 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)] sm:min-h-[230px] ${className}`}>
      
      {/* Top: Cover Image */}
      <div className="lnCardReport__coverMedia relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-light-2">
        {hasImage ? (
          <img 
            src={image} 
            alt={safeTitle} 
            className="lnCardReport__coverImage h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
          />
        ) : (
          <div className="lnCardReport__coverImage lnCardReport__coverImage--fallback flex h-full w-full items-center justify-center bg-light-2">
            <Icon name="download" className="text-secondary" style={{ '--icon-size': '32px' }} />
          </div>
        )}
        {year && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-caption-c1 font-bold text-black shadow-sm backdrop-blur">
            {year}
          </span>
        )}
      </div>

      {/* Bottom: Content */}
      <div className="lnCardReport__coverBody relative z-10 flex flex-1 flex-col justify-between gap-5 bg-white p-4 md:p-5">
        
        <div className="lnCardReport__coverIntro">
          <p className="lnCardReport__title line-clamp-3 text-body-b4 font-semibold leading-snug text-neutral-950">
            {safeTitle}
          </p>
        </div>

        <div className="lnCardReport__coverFooter mt-auto flex items-center justify-between gap-3">
          {/* {fileSize && (
            <p className="text-caption-c1 text-neutral-400 mb-2">
              File size: {fileSize}
            </p>
          )} */}
          {fileSize ? (
            <span className="text-caption-c1 text-neutral-400">{fileSize}</span>
          ) : <span />}
          
          <LinknetLink
            href={downloadUrl}
            variant='secondary-plain'
            size='md'
            iconLeft={<Icon name="download" />}
            target="_blank"
            rel="noopener noreferrer"
            className="lnCardReport__download !gap-1.5 !py-0 font-semibold hover:!text-yellow-500"
          >
            Download
          </LinknetLink>
        </div>
      </div>
    </div>
  );
}

{/* <CardReport 
  variant="cover"
  image="/assets/images/report-cover.jpg"
  year="2023"
  title="Broadband Freedom"
  fileSize="16.20 MB"
  downloadUrl="/downloads/report-2023.pdf"
/>

<CardReport 
  variant="list"
  icon="/assets/icons/pdf-circle.png" // Path ke ikon PDF bulat merah muda
  title="Interim Consolidated Financial Statements as of 30 June 2025"
  badges={['Audited']}
  category="Announcement"
  date="18 June 2025"
  downloadUrl="/downloads/financial-2025.pdf"
/> */}
