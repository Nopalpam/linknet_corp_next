import React from 'react';

export default function CardAward({ 
  logo, 
  title, 
  year, 
  className = "" 
}) {
  return (
    <div className={`lnCardAward relative flex flex-col items-center justify-center overflow-hidden group hover:shadow-lg transition-shadow duration-300 ${className}`}>
      
      {/* --- GAMBAR LAUREL WREATH (KIRI) --- */}
      <div className="lnCardAward__decoration lnCardAward__decoration--left absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 md:w-14 h-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <img 
          src="/assets/img/awardLeft.svg" 
          alt="Decoration Left" 
          className="lnCardAward__decorationImage w-full h-auto object-contain"
        />
      </div>

      {/* --- GAMBAR LAUREL WREATH (KANAN) --- */}
      <div className="lnCardAward__decoration lnCardAward__decoration--right absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 md:w-14 h-auto opacity-70 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <img 
          src="/assets/img/awardRight.svg" 
          alt="Decoration Right" 
          className="lnCardAward__decorationImage w-full h-auto object-contain"
        />
      </div>

      {/* --- KONTEN TENGAH --- */}
      <div className="lnCardAward__content relative z-10 flex flex-col items-center justify-center text-center gap-1 max-w-[65%] md:max-w-[70%]">
        
        {/* 1. Logo (Opsional jika berupa teks biru seperti 'Jawa Pos') */}
       <div className="lnCardAward__contentInner">
         {logo && (
          <div className="lnCardAward__logoWrap h-12 flex items-center justify-center">
            <img 
              src={logo} 
              alt="Award Logo" 
              className="lnCardAward__logo h-full w-auto"
            />
          </div>
        )}

        {/* 2. Title (Warna Emas) */}
        {title && (
          <h4 className="lnCardAward__title text-body-b4 font-bold text-warning leading-snug line-clamp-2 mt-2 px-2 transition-transform duration-300">
            {title}
          </h4>
        )}
       </div>

        {/* 3. Year (Warna Gelap) */}
        {year && (
          <p className="lnCardAward__year text-body-b5 font-bold text-primary mt-1">
            {year}
          </p>
        )}

      </div>
      
    </div>
  );
}
