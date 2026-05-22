import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Icon from '../Icon';

export default function ModalManagement({
  isOpen,
  onClose,
  selectedManager,
  filteredData,
  navigateProfile,
  hasPrev,
  hasNext,
}) {
  const overlayRef = useRef(null);
  const modalBoxRef = useRef(null);

  // 2. Logika Animasi GSAP (Masuk & Keluar)
  useEffect(() => {
    if (!overlayRef.current || !modalBoxRef.current) return;

    if (isOpen) {
      // --- ANIMASI MASUK (Enter) ---
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );

      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, y: 80 }, 
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power3.out', 
          delay: 0.1 
        }
      );

    } else {
      // --- ANIMASI KELUAR (Exit) ---
      gsap.to(overlayRef.current, { 
        opacity: 0, 
        duration: 0.3, 
        ease: 'power2.in' 
      });

      gsap.to(modalBoxRef.current, {
        opacity: 0, 
        y: 80, 
        duration: 0.3, 
        ease: 'power3.in'
      });
    }
  }, [isOpen]);

  // Jika belum di-mount atau data tidak ada, jangan render HTML-nya
  if (!selectedManager) return null;

  // Mencari data Prev dan Next
  const currentIndex = filteredData.findIndex((m) => m.id === selectedManager.id);
  const prevManager = hasPrev ? filteredData[currentIndex - 1] : null;
  const nextManager = hasNext ? filteredData[currentIndex + 1] : null;

  return (
    // Backdrop / Overlay
    // overscroll-none membantu mencegah 'scroll chaining' (scroll bocor ke body) di perangkat mobile
    <div 
      ref={overlayRef}
      aria-hidden={!isOpen}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overscroll-none lnManagementModal ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      onClick={onClose} 
    >
      {/* Modal Content */}
      <div 
        ref={modalBoxRef}
        className="relative w-full max-w-5xl bg-white rounded-[20px] md:rounded-[24px] overflow-hidden shadow-2xl lnManagementModal__shell flex flex-col h-[85vh] md:h-[80vh]"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Tombol Close */}
        <button 
          type="button" 
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/80 backdrop-blur-sm hover:bg-gray-100 rounded-full flex items-center justify-center transition-colors shadow-sm lnManagementModal__close" 
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" style={{ '--icon-size': '24px' }} />
        </button>

        {/* Grid Container */}
        <div className="flex flex-col md:flex-row h-full overflow-hidden lnManagementModal__grid">
          
          {/* KIRI: Foto */}
          <aside className="hidden md:block w-full md:w-2/5 bg-neutral-100 shrink-0 h-full overflow-hidden relative lnManagementModal__media">
            <img 
              key={`img-${selectedManager.id}`}
              id="mgmtModalPhoto" 
              src={selectedManager.imgSrc} 
              alt={selectedManager.name} 
              className="w-full h-full object-cover object-top animate-slide-fade"
            />
          </aside>

          {/* KANAN: Konten */}
          <section className="w-full md:w-3/5 flex flex-col h-full overflow-hidden p-6 md:p-6 bg-white relative lnManagementModal__content">
            
            {/* Wrapper Animasi Konten Teks */}
            <div key={`content-${selectedManager.id}`} className="flex flex-col h-full overflow-hidden animate-slide-fade">
              
              {/* Header */}
              <header className="flex items-center gap-4 mb-5 shrink-0 lnManagementModal__header">
                <img 
                  id="mgmtModalPhotoSm" 
                  className="w-16 h-16 rounded-full object-cover object-top block md:hidden lnManagementModal__avatar shadow-sm" 
                  src={selectedManager.imgSrc} 
                  alt={selectedManager.name} 
                />
                <div className="lnManagementModal__titleWrap">
                  <h3 id="mgmtModalName" className="text-headline-h3 font-bold text-black m-0 mb-1 leading-tight">
                    {selectedManager.name}
                  </h3>
                  <p id="mgmtModalRole" className="text-body-b5 font-medium text-yellow-500">
                    {selectedManager.role}
                  </p>
                </div>
              </header>

              {/* Body (Scrollable Text) */}
              {/* overscroll-contain membantu memastikan scroll berhenti di sini jika sudah mentok */}
              <div className="flex-1 overflow-y-auto overscroll-contain pr-4 custom-scrollbar lnManagementModal__body">
                <div 
                  id="mgmtModalBio" 
                  className="text-neutral-600 leading-relaxed text-sm md:text-base pb-4"
                  dangerouslySetInnerHTML={{ __html: selectedManager.about }}
                />
              </div>

            </div>

            {/* Footer (Navigasi Prev/Next - Sticky) */}
            <footer className="flex flex-row items-center gap-2 md:gap-3 shrink-0 mt-auto bg-white z-10 lnManagementModal__footer">
              
              {/* Tombol Sebelumnya */}
              <button 
                type="button" 
                disabled={!hasPrev}
                onClick={() => navigateProfile('prev')}
                className={`w-full flex-1 flex items-center justify-between gap-2 p-3 md:px-4 md:py-2 rounded-[12px] border transition-all lnMgmtNav lnMgmtNav--prev js-mgmt-prev ${
                  hasPrev ? 'hover:bg-neutral-50 border-secondary cursor-pointer hover:shadow-sm' : 'opacity-40 cursor-not-allowed border-neutral-100'
                }`}
              >
                <span className="lnMgmtNav__icon shrink-0 text-secondary">
                  <Icon name="chevron-left" />
                </span>
                <span className="lnMgmtNav__meta text-right w-full overflow-hidden">
                  <p className="text-caption-c1 text-secondary font-regular mb-1">Sebelumnya</p>
                  <strong className="text-body-b5 font-bold line-clamp-1 text-neutral-900" id="mgmtPrevName" title={prevManager?.name}>
                     {prevManager ? prevManager.name : '—'}
                  </strong>
                </span>
              </button>

              {/* Tombol Selanjutnya */}
              <button 
                type="button" 
                disabled={!hasNext}
                onClick={() => navigateProfile('next')}
                className={`w-full flex-1 flex items-center justify-between gap-2 p-3 md:px-4 md:py-2 rounded-[12px] border transition-all lnMgmtNav lnMgmtNav--next js-mgmt-next ${
                  hasNext ? 'hover:bg-neutral-50 border-secondary cursor-pointer hover:shadow-sm' : 'opacity-40 cursor-not-allowed border-neutral-100'
                }`}
              >
                <span className="lnMgmtNav__meta text-left w-full overflow-hidden">
                  <p className="text-caption-c1 text-secondary font-regular mb-1">Selanjutnya</p>
                  <strong className="text-body-b5 font-bold line-clamp-1 text-neutral-900" id="mgmtNextName" title={nextManager?.name}>
                    {nextManager ? nextManager.name : '—'}
                  </strong>
                </span>
                <span className="lnMgmtNav__icon shrink-0 text-secondary">
                  <Icon name="chevron-right" />
                </span>
              </button>

            </footer>

          </section>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a3a3a3; }

        @keyframes slideFade {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-fade {
          animation: slideFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}