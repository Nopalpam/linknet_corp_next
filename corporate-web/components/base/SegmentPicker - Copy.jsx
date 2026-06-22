'use client';

import { useState, useRef, useEffect } from 'react';

export default function SegmentPicker({
  options = [],
  value,
  onChange,
  className = ""
}) {
  // Mencari index dari opsi yang sedang aktif
  const activeIndex = options.findIndex((opt) => opt.value === value) !== -1 
    ? options.findIndex((opt) => opt.value === value) 
    : 0;

  // State untuk menyimpan gaya dinamis (lebar dan posisi X)
  const [thumbStyle, setThumbStyle] = useState({ width: 0, transform: 'translateX(0px)' });
  
  // Referensi untuk menyimpan semua elemen tombol
  const buttonRefs = useRef([]);

  // Fungsi untuk mengukur dan memperbarui posisi/lebar thumb
  const updateThumbPosition = () => {
    const activeButton = buttonRefs.current[activeIndex];
    if (activeButton) {
      setThumbStyle({
        width: `${activeButton.offsetWidth}px`,
        transform: `translateX(${activeButton.offsetLeft}px)`
      });
    }
  };

  // Jalankan perhitungan saat komponen dimuat, activeIndex berubah, atau options berubah
  useEffect(() => {
    updateThumbPosition();
  }, [activeIndex, options]);

  // Tambahkan event listener agar posisi tetap akurat jika layar di-resize (orientasi berubah)
  useEffect(() => {
    window.addEventListener('resize', updateThumbPosition);
    return () => window.removeEventListener('resize', updateThumbPosition);
  }, [activeIndex]);

  return (
    // Container abu-abu dengan padding
    <div className={`relative w-full md:w-auto inline-flex p-1.5 bg-light-1 rounded-full overflow-hidden ${className}`}>
      
      {/* --- Animated Sliding Background (Thumb) --- */}
      {/* width dan transform sekarang dikontrol melalui React State */}
      <div
        className="absolute top-1.5 bottom-1.5 left-0 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out"
        style={thumbStyle}
      />

      {/* --- Tombol Options --- */}
      {options.map((option, index) => {
        const isActive = activeIndex === index;
        return (
          <button
            key={option.value}
            // Simpan setiap elemen tombol ke dalam array ref
            ref={(el) => (buttonRefs.current[index] = el)}
            onClick={() => onChange && onChange(option.value)}
            className={`relative z-10 flex-1 px-8 py-2.5 text-body-b4 md:text-body-b2 font-medium transition-colors duration-300 rounded-full outline-none select-none whitespace-nowrap
              ${isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}
            `}
          >
            {option.label}
          </button>
        );
      })}
      
    </div>
  );
}


// 'use client';

// import { useState } from 'react';
// import SegmentPicker from '@/components/base/SegmentPicker';
// // import CardReportHome from '@/components/base/cards/CardReportHome';

// export default function ReportSection() {
//   // State untuk menyimpan nilai tab yang aktif
//   const [activeTab, setActiveTab] = useState('report');

//   // Definisi opsi untuk Segment Picker
//   const tabOptions = [
//     { label: 'Report', value: 'report' },
//     { label: 'Announcement', value: 'announcement' }
//   ];

//   return (
//     <section className="py-20 px-4 md:px-10 flex flex-col items-center gap-12 bg-white">
      
//       {/* 1. Panggil Segment Picker */}
//       <SegmentPicker 
//         options={tabOptions}
//         value={activeTab}
//         onChange={(selectedValue) => setActiveTab(selectedValue)}
//       />

//       {/* 2. Konten Dinamis Berdasarkan Tab */}
//       <div className="w-full max-w-6xl">
//         {activeTab === 'report' && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Render CardReportHome di sini */}
//             <p className="text-center text-neutral-500 col-span-full">Menampilkan Konten Report...</p>
//           </div>
//         )}

//         {activeTab === 'announcement' && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <p className="text-center text-neutral-500 col-span-full">Menampilkan Konten Announcement...</p>
//           </div>
//         )}
//       </div>

//     </section>
//   );
// }