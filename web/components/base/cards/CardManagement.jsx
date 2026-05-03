import React from 'react';
import Link from 'next/link'; // Gunakan next/link atau komponen Link kustom milikmu
import Icon from '../Icon';

export default function CardManagement({
  imageSrc,
  name,
  role,
  href = '#',
  className = '',
}) {
  return (
    <Link 
      href={href}
      className={`lnManagementCard group relative flex flex-col bg-white rounded-[16px] md:rounded-[20px] border border-secondary h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}
    >
      {/* --- IMAGE SECTION --- */}
      {/* Menggunakan aspect-[4/5] agar proporsi foto pas, atau ubah ke aspect-square jika ingin kotak */}
      <div className="lnManagementCard__media relative w-full aspect-square bg-[#F8F8F8] overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            className="lnManagementCard__image w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          // Fallback jika tidak ada gambar
          <div className="lnManagementCard__placeholder w-full h-full flex items-center justify-center text-neutral-300">
            No Image
          </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="lnManagementCard__content relative flex flex-row justify-between items-end gap-4 flex-grow p-[16px] md:p-[20px] pb-4 md:pb-6">
        
        {/* Teks dibatasi padding kanannya agar tidak menabrak ikon panah */}
        <div className="lnManagementCard__text flex flex-col justify-between h-full">
          <h3 
            className="lnManagementCard__name text-headline-h5 line-clamp-2 leading-tight mb-2 h-[56px]"
            title={name} // Tooltip bawaan browser jika nama terpotong
          >
            {name}
          </h3>
          <p className="lnManagementCard__role text-body-b5 text-secondary line-clamp-2">
            {role}
          </p>
        </div>

        {/* --- ICON CIRCLE --- */}
        {/* Posisi absolut di kanan bawah */}
        <div className='lnManagementCard__actionWrap hidden md:block'>
            <div className="lnManagementCard__action relative w-10 h-10 text-body-b4 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 group-hover:bg-[#FFB800] group-hover:border-[#FFB800] group-hover:text-white transition-all duration-300">
                <Icon name="arrow-top-right" className="lnManagementCard__actionIcon" />
            </div>
        </div>
        
      </div>
    </Link>
  );
}
