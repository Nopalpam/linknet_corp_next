import React from 'react';
import LinknetLink from '../Link'; 
import Icon from '../Icon';

export default function CardReport({
  variant = 'cover', // Pilihan: 'cover' | 'list'
  
  // Props Umum
  title,
  subDescription,
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
  const safeSubDescription = typeof subDescription === 'string' ? subDescription : '';
  const hasImage = typeof image === 'string' && image.trim();

  // ==========================================
  // VARIANT 2: LIST / ROW (Gambar Bawah)
  // ==========================================
  if (variant === 'list') {
    const actionHref = suffixHref || downloadUrl;
    const actionIcon = suffixIcon || <Icon name="download" className='text-secondary' style={{ '--icon-size': '24px' }} />;
    const hasMeta = normalizedBadges.length > 0 || category || date;

    return (
      <div
        className={`lnCardReport lnCardReport--list flex items-center gap-4 group !pr-5 md:px-3 py-3 rounded-[16px] hover:bg-neutral-50 transition-colors duration-300 ${className}`}
      >
        {/* Left: Icon Badge */}
        <div className="lnCardReport__iconWrap shrink-0 w-10 h-10 md:w-10 md:h-10 flex items-center justify-center">
          {icon ? (
            <img src={icon} alt="PDF Icon" className="lnCardReport__icon w-full h-full object-cover" />
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
          <h3 className="lnCardReport__title text-body-b4 text-black font-regular transition-colors">
            {safeTitle}
          </h3>
          
          {hasMeta ? (
            <div className="lnCardReport__meta flex flex-wrap items-center gap-3 text-caption-c1 text-secondary mt-2">
              {/* Badges Pill */}
              {normalizedBadges.map((badge, index) => (
                <span 
                  key={index} 
                  className="lnCardReport__badge px-3 py-1 bg-neutral-50 text-black font-medium rounded-full text-caption-c1 transition-colors group-hover:bg-yellow-500"
                >
                  {badge}
                </span>
              ))}
              
              {/* Meta Text */}
              {/* {category && <span className="lnCardReport__metaText">{category}</span>} */}
              {date && <span className="lnCardReport__metaText">{date}</span>}
            </div>
          ) : null}
        </a>

        {actionHref ? (
          <a
            href={actionHref}
            target={suffixTarget}
            rel={suffixRel}
            aria-label={suffixLabel}
            className="lnCardReport__suffixAction ml-auto mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center text-black transition-colors duration-300 hover:text-yellow-500"
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
    <div className={`lnCardReport lnCardReport--cover flex flex-row bg-white rounded-[16px] h-[180px] shadow-md border border-neutral-50 overflow-hidden transition-shadow duration-300 ${className}`}>
      
      {/* Left: Cover Image */}
      <div className="lnCardReport__coverMedia w-[120px] h-auto shrink-0 relative m-1.5">
        {hasImage ? (
          <img 
            src={image} 
            alt={safeTitle} 
            className="lnCardReport__coverImage w-full h-full object-cover rounded-[12px]"
            loading="lazy"
          />
        ) : (
          <div className="lnCardReport__coverImage lnCardReport__coverImage--fallback flex h-full w-full items-center justify-center rounded-[12px] bg-light-2">
            <Icon name="download" className="text-secondary" style={{ '--icon-size': '32px' }} />
          </div>
        )}
      </div>

      {/* Right: Content */}
      <div className="lnCardReport__coverBody p-4 !pl-3 md:p-4 flex flex-col !justify-between flex-1 bg-white relative z-10">
        
        <div className="lnCardReport__coverIntro">
          {safeTitle && (
            <h3 className="lnCardReport__year text-headline-h5 font-bold text-black mb-1">
              {safeTitle}
            </h3>
          )}

          {safeSubDescription && (
            <p className="lnCardReport__title text-body-b4 text-black font-regular mb-4 line-clamp-2">
              {safeSubDescription}
            </p>
          )}
        </div>

        <div className="lnCardReport__coverFooter mt-auto">
          {/* {fileSize && (
            <p className="text-caption-c1 text-neutral-400 mb-2">
              File size: {fileSize}
            </p>
          )} */}
          <LinknetLink
            href={downloadUrl}
            variant='secondary-plain'
            size='md'
            iconLeft={<Icon name="download" />}
            target="_blank"
            rel="noopener noreferrer"
            className="lnCardReport__download !py-0 !gap-1.5 hover:!text-yellow-500"
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
