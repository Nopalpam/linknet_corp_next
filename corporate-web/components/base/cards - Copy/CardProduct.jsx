'use client';

import React from 'react';
import Icon from '../Icon'; // Sesuaikan path jika berbeda

export default function CardProduct({
  logo,
  title,
  desc,
  bodyTitle,
  list = [],
  note,
  className = ""
}) {
  return (
    // Pastikan h-full agar SwiperSlide memiliki tinggi yang sama
    <div className={`cardProduct flex flex-col bg-light-2 w-full h-full rounded-[20px] md:rounded-[24px] ${className}`}>
      
      {/* ========================================= */}
      {/* CARD HEADER (White Box) */}
      {/* ========================================= */}
      {/* h-full dan flex flex-col di sini agar deskripsi terdorong ke bawah jika logo&title ringkas */}
      <div className="cardHeader bg-white rounded-[20px] md:rounded-[24px] shadow-md p-6 md:p-[24px] flex flex-col min-h-[200px] md:min-h-[220px] m-2">
        
        {/* Kontainer Logo & Title dengan justify-between vertikal */}
        {/* Kita beri min-h agar konsisten jika tinggi logo bervariasi */}
        <div className="flex flex-col justify-between items-start flex-grow mb-6 gap-4">
          {logo && (
            <img 
              src={logo} 
              alt={title || "Product Logo"} 
              className="w-12 h-12 md:w-14 md:h-14 object-contain block" 
            />
          )}
        </div>

        <div>
          {title && (
            <h3 className="text-body-b3 font-bold text-neutral-900 mt-auto">
              {title}
            </h3>
            )}
          
          {desc && (
            <p className="text-body-b5 text-secondary mt-4">
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* CARD BODY (List & Note) */}
      {/* ========================================= */}
      {(bodyTitle || list.length > 0 || note) && (
        <div className="cardBody pt-2 px-[16px] md:px-[20px] flex-shrink-0">
          
          {bodyTitle && (
            <h4 className="text-body-b5 text-secondary mb-3">
              {bodyTitle}
            </h4>
          )}
          
          {list.length > 0 && (
            <ul className="flex flex-col gap-5">
              {list.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {typeof item.icon === 'string' ? (
                      <Icon 
                        name={item.icon} 
                        className="text-neutral-500" 
                        style={{ '--icon-size': '24px' }} 
                      />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <span className="text-body-b5 font-medium text-black">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {note && (
            <p className="mt-6 text-caption-c1 text-neutral-400">
              {note}
            </p>
          )}
        </div>
      )}
      
    </div>
  );
}