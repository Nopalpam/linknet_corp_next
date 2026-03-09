import React from 'react';
import Link from 'next/link';
import Icon from '../Icon';

const formatDate = (isoString) => {
  if (!isoString) return "";
  const dateObj = new Date(isoString);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
};

export default function CardNews({
  variant = 'default',
  logo,      // Prop baru untuk logo di atas gambar
  desc,      // Prop baru untuk deskripsi/excerpt
  image,
  title,
  author,
  date,
  badgeText,
  href = "#",
  className = ""
}) {
  
  // --- VARIANT: WITH LOGO (Gambar C / Highlighting Initiatives) ---
  if (variant === 'with-logo') {
    return (
      <Link 
        href={href} 
        className={`flex flex-col bg-white rounded-[16px] md:rounded-[20px] shadow-md group hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 h-full ${className}`}
      >
        {/* Logo Top */}
        {logo && (
          <div className="px-6 py-4 flex items-center justify-start shrink-0">
            <img 
              src={logo} 
              alt="Partner Logo" 
              className="h-8 object-contain" 
            />
          </div>
        )}
        
        {/* Image Full Width */}
        <div className="cardThumbnail mx-2">
          <div className="w-full aspect-[4/3] sm:aspect-[3/2] mb-6 rounded-[12px] md:rounded-[16px] overflow-hidden bg-neutral-100 relative shrink-0">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="cardBody px-[20px] flex flex-col flex-grow">
          <h3 className="text-body-b3 leading-tight font-bold text-neutral-900 group-hover:text-yellow-500 transition-colors mb-3 line-clamp-2">
            {title}
          </h3>
          
          {desc && (
            <p className="text-body-b5 text-secondary line-clamp-2 mb-6">
              {desc}
            </p>
          )}
        </div>

        {/* Footer (Date & Arrow Button) */}
        <div className="cardFooter p-[20px] flex items-center justify-between mt-auto pt-2">
          <span className="text-body-b5 font-regular text-secondary">
            {formatDate(date)}
          </span>
          
          {/* Arrow Circle */}
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:border-neutral-300 group-hover:bg-neutral-50 transition-all shrink-0 text-black">
            <Icon name="chevron-right" />
          </div>
        </div>
      </Link>
    );
  }

  // --- VARIANT: FEATURED (Gambar B) ---
  if (variant === 'featured') {
    return (
      <Link 
        href={href} 
        className={`flex flex-col bg-white border border-neutral-100 rounded-[16px] overflow-hidden group hover:shadow-lg transition-all duration-300 ${className}`}
      >
        {/* Image Full Top */}
        <div className="w-full aspect-[3/2] overflow-hidden bg-neutral-100 relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        </div>

        {/* Content Bottom */}
        <div className="p-5 md:p-6 flex flex-col flex-1">
          {badgeText && (
            <span className="text-warning font-bold text-caption-c1 tracking-wider uppercase mb-2">
              {badgeText}
            </span>
          )}

          <h3 className="text-body-b2 leading-snug font-bold text-neutral-900 group-hover:text-primary mb-4 line-clamp-3">
            {title}
          </h3>
          <div className="mt-auto pt-2">
            <span className="text-body-b5 text-neutral-600">
              By {author} &middot; {formatDate(date)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // --- VARIANT: DEFAULT ROW ---
  if (variant === 'default-row'){
    return(
      <Link 
        href={href} 
        className={`flex items-start justify-between gap-4 md:gap-6 group ${className}`}
      >
        {/* Text Content (Kiri) */}
        <div className="flex-1 flex flex-col order-1 h-full">
          <h3 className="text-[16px] md:text-[18px] leading-snug font-bold text-neutral-900 group-hover:text-primary mb-2 line-clamp-2">
            {title}
          </h3>
          
          <span className="text-[13px] md:text-sm text-neutral-500 mb-3 md:mb-4">
            By {author} &middot; {formatDate(date)}
          </span>
          
          {badgeText && (
            <div className="mt-auto">
              <span className="inline-block px-2 py-1 text-caption-c1 text-secondary border border-neutral-200 rounded-[8px]">
                {badgeText}
              </span>
            </div>
          )}
        </div>
        
        {/* Image (Kanan) */}
        <div className="w-[80px] sm:w-[90px] md:w-[90px] shrink-0 order-2">
          <div className="aspect-[4/4] rounded-[8px] md:rounded-[12px] overflow-hidden bg-neutral-100 relative">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              loading="lazy"
            />
          </div>
        </div>
      </Link>
    );
  }

  // --- VARIANT: DEFAULT (Gambar A) ---
  return (
    <Link 
      href={href} 
      // Ubah direction menjadi row (mobile) dan col (desktop)
      className={`flex flex-row md:flex-col items-start justify-between md:justify-start gap-4 md:gap-5 group ${className}`}
    >
      {/* Image Container */}
      {/* order-2 (Mobile: dikanan) | md:order-1 (Desktop: diatas) */}
      <div className="w-[90px] sm:w-[140px] md:w-full shrink-0 order-2 md:order-1">
        <div className="aspect-[1] md:aspect-[3/2] rounded-[8px] md:rounded-[12px] overflow-hidden bg-neutral-100 relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            loading="lazy"
          />
        </div>
      </div>

      {/* Text Content */}
      {/* order-1 (Mobile: dikiri) | md:order-2 (Desktop: dibawah) */}
      <div className="flex-1 flex flex-col order-1 md:order-2 h-full w-full">
        <h3 className="text-body-b3 leading-snug font-bold text-neutral-900 group-hover:text-primary mb-2 line-clamp-3 md:line-clamp-2">
            {title}
        </h3>

        <span className="text-body-b5 text-secondary mb-3 md:mb-4">
          By {author} &middot; {formatDate(date)}
        </span>
        
        {badgeText && (
          <div className="mt-auto md:mt-0 pt-1">
            <span className="inline-block px-2 py-1 text-caption-c1 text-secondary border border-neutral-200 rounded-[8px]">
              {badgeText}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}