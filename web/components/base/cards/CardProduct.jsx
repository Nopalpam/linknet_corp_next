'use client';

import React from 'react';
import Icon from '../Icon'; // Sesuaikan path jika berbeda
import CTAList from '../section/CTAList';

export default function CardProduct({
  logo,
  title,
  desc,
  ctaList = [],
  bodyTitle,
  list = [],
  note,
  className = ""
}) {
  const normalizedCtaList = Array.isArray(ctaList)
    ? ctaList.filter((cta) => cta && (cta.text || cta.label) && (cta.href || cta.url || cta.action || cta.actionModal || cta.action_modal))
    : [];

  return (
    // Pastikan h-full agar SwiperSlide memiliki tinggi yang sama
    <div className={`lnCardProduct cardProduct flex flex-col bg-light-2 w-full h-full rounded-[20px] md:rounded-[24px] ${className}`}>
      
      {/* ========================================= */}
      {/* CARD HEADER (White Box) */}
      {/* ========================================= */}
      {/* h-full dan flex flex-col di sini agar deskripsi terdorong ke bawah jika logo&title ringkas */}
      <div className="lnCardProduct__header cardHeader bg-white rounded-[20px] md:rounded-[24px] shadow-md p-6 md:p-[24px] flex flex-col min-h-[200px] md:min-h-[220px] m-2">
        
        {/* Kontainer Logo & Title dengan justify-between vertikal */}
        {/* Kita beri min-h agar konsisten jika tinggi logo bervariasi */}
        {logo && (
        <div className="lnCardProduct__head flex flex-col justify-between items-start flex-grow mb-6 gap-4">
          {logo && (
            <img 
              src={logo} 
              alt={title || "Product Logo"} 
              className="lnCardProduct__logo w-12 h-12 md:w-14 md:h-14 object-contain block" 
            />
          )}
        </div>
        )}

        <div className="lnCardProduct__intro">
          {title && (
            <h3 className="lnCardProduct__title text-body-b3 font-bold text-neutral-900 mt-auto">
              {title}
            </h3>
            )}
          
          {desc && (
            <p className="lnCardProduct__desc text-body-b5 text-secondary mt-4">
              {desc}
            </p>
          )}

          {normalizedCtaList.length > 0 && (
            <CTAList
              ctaList={normalizedCtaList}
              defaultVariant="secondary-outline"
              defaultSize="md"
              className="mt-5 gap-3"
            />
          )}
        </div>
      </div>

      {/* ========================================= */}
      {/* CARD BODY (List & Note) */}
      {/* ========================================= */}
      {(bodyTitle || list.length > 0 || note) && (
        <div className="lnCardProduct__body cardBody pt-2 px-[16px] md:px-[20px] flex-shrink-0">
          
          {bodyTitle && (
            <h4 className="lnCardProduct__bodyTitle text-body-b5 text-secondary mb-3">
              {bodyTitle}
            </h4>
          )}
          
          {list.length > 0 && (
            <ul className="lnCardProduct__list flex flex-col gap-5">
              {list.map((item, index) => (
                <li key={index} className="lnCardProduct__listItem flex items-start gap-3">
                  <div className="lnCardProduct__listIconWrap flex-shrink-0 mt-0.5">
                    {typeof item.icon === 'string' ? (
                      <Icon 
                        name={item.icon} 
                        className="lnCardProduct__listIcon text-neutral-500" 
                        style={{ '--icon-size': '24px' }} 
                      />
                    ) : (
                      item.icon
                    )}
                  </div>
                  <span className="lnCardProduct__listText text-body-b5 font-medium text-black">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {note && (
            <p className="lnCardProduct__note mt-6 text-caption-c1 text-neutral-400">
              {note}
            </p>
          )}
        </div>
      )}
      
    </div>
  );
}
