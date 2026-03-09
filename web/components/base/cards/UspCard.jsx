import React from 'react';

export default function UspCard({ 
  iconSrc, 
  title, 
  desc, 
  className = '' 
}) {
  return (
    <div 
      className={`bg__glassBorder rounded-[20px] p-5 flex flex-col justify-between min-h-[320px] transition-all ${className}`}
    >
      {/* Icon Wrapper */}
      <div className="mb-6 self-start">
        {/* Menggunakan img tag sesuai request */}
        <img 
          src={iconSrc} 
          alt={title} 
          className="w-12 h-12 md:w-14 md:h-14 object-contain" 
          // Tips: object-contain menjaga proporsi icon agar tidak gepeng
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3">
        <h3 className="text-headline-h5 text-white font-bold leading-tight">
          {title}
        </h3>
        <p className="text-body-b5 text-neutral-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}