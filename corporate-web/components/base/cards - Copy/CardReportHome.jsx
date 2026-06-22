'use client';

import LinknetLink from '../Link'; 

export default function CardReportHome({
  iconSrc = "/assets/icons/icon-pdf-circle.svg", 
  title = "Annual Reports",
  description = "Temukan perjalanan pertumbuhan, strategi, dan pencapaian kami setiap tahunnya.",
  ctaText = "View More",
  ctaLink = "#",
  year = "2025",
  className = ""
}) {
  return (
   <div 
      className={`relative flex flex-col rounded-[24px] overflow-hidden w-full max-w-[400px] hover:-translate-y-1 duration-200 transition-transform h-full ${className}`}
    >
      
      {/* Bagian Atas (Putih) */}
      <div className="flex-1 p-8 flex flex-col items-start bg-light-2 relative rounded-[20px]">
        
        {/* Icon */}
        <div className="w-full h-auto mb-6">
          <img 
            src={iconSrc} 
            alt={`${title} icon`} 
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Title */}
        <h3 className="text-body-b2 font-bold text-black mb-3 tracking-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-body-b5 font-regular text-secondary mb-10 flex-1">
          {description}
        </p>

        {/* Menggunakan Custom Component <Link> */}
        <LinknetLink 
          href={ctaLink || '#'} 
          variant="secondary-outline" 
          size='md' 
          className="flex transition-colors"
        >
          <span>{ctaText}</span>
        </LinknetLink>
      </div>

      {/* Bagian Bawah (Footer Kuning) */}
      <div className="py-2 pt-6 -mt-4 w-full flex items-center justify-center"
        style={{ 
          backgroundImage: `url('/assets/bg/yellow-marble.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <span className="text-black font-bold text-body-b4">
          {year}
        </span>
      </div>
      
    </div>
  );
}