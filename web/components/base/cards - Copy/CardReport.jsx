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
  badges = [], // Array string, misal: ['Audited']
  category,
  date,
}) {

  // ==========================================
  // VARIANT 2: LIST / ROW (Gambar Bawah)
  // ==========================================
  if (variant === 'list') {
    return (
      <a 
        href={downloadUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-start gap-4 group !pr-5 md:px-3 py-3 rounded-[16px] group hover:bg-neutral-50 transition-colors duration-300 ${className}`}
      >
        {/* Left: Icon Badge */}
        <div className="shrink-0 w-10 h-10 md:w-10 md:h-10 flex items-center justify-center">
          {icon ? (
            <img src={icon} alt="PDF Icon" className="w-full h-full object-cover" />
          ) : (
            // Fallback jika tidak ada icon
            <span className="text-pink-600 font-bold text-xs">PDF</span>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex flex-col flex-1 mt-0.5">
          <h3 className="text-body-b4 text-black font-regular transition-colors mb-2 md:mb-3">
            {title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
            {/* Badges Pill */}
            {badges.map((badge, index) => (
              <span 
                key={index} 
                className="px-3 py-1 bg-neutral-50 text-black font-medium rounded-full text-caption-c1 transition-colors group-hover:bg-yellow-500"
              >
                {badge}
              </span>
            ))}
            
            {/* Meta Text */}
            {category && <span>{category}</span>}
            {date && <span>{date}</span>}
          </div>
        </div>
      </a>
    );
  }

  // ==========================================
  // VARIANT 1: COVER CARD (Gambar Atas)
  // ==========================================
  return (
    <div className={`flex flex-row bg-white rounded-[16px] h-[180px] shadow-md border border-neutral-50 overflow-hidden transition-shadow duration-300 ${className}`}>
      
      {/* Left: Cover Image */}
      <div className="w-[120px] h-auto shrink-0 relative m-1.5">
        {/* Aspect ratio di mobile agak kotak, di desktop mengikuti tinggi konten via h-full absolute */}
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover rounded-[12px]" 
          loading="lazy"
        />
      </div>

      {/* Right: Content */}
      <div className="p-4 !pl-3 md:p-4 flex flex-col !justify-between flex-1 bg-white relative z-10">
        
        <div>
          {year && (
            <h3 className="text-headline-h5 font-bold text-black mb-1">
              {year}
            </h3>
          )}
          
          <p className="text-body-b4 text-black font-regular mb-4 line-clamp-2">
            {title}
          </p>
        </div>

        <div className="mt-auto">
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
            className="!py-0 !gap-1.5 hover:!text-yellow-500"
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