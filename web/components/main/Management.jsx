'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import gsap from 'gsap';

// Import Data
import { managementData } from '../../data/components/managementData';
import { managementCategories } from '../../data/components/managementCategory';

// Import Components
import CardManagement from '../base/cards/CardManagement';
import ModalManagement from '../base/modals/ModalManagement'; // IMPORT MODAL BARU DI SINI

// Import Hooks
import { useModalRegistry } from '../hooks/useModalRegistry';

export default function Management({ config = {}, className = '' }) {
  const [activeTab, setActiveTab] = useState(managementCategories[0].id);
  const [selectedManager, setSelectedManager] = useState(null);

  const { openModal, closeModal, isModalOpen } = useModalRegistry();
  const modalId = 'management-detail';
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const gridRef = useRef(null);

  const filteredData = useMemo(() => {
    return managementData.filter((item) => item.categoryId === activeTab);
  }, [activeTab]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".management-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [activeTab]);

  const handleOpenProfile = (manager) => {
    setSelectedManager(manager);
    openModal(modalId);
  };

  const navigateProfile = (direction) => {
    const currentIndex = filteredData.findIndex((m) => m.id === selectedManager.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < filteredData.length) {
      setSelectedManager(filteredData[nextIndex]);
    }
  };

  // Pengecekan status tombol prev/next
  const hasNext = filteredData.findIndex((m) => m.id === selectedManager?.id) < filteredData.length - 1;
  const hasPrev = filteredData.findIndex((m) => m.id === selectedManager?.id) > 0;

  return (
    <section
      id={sectionId}
      className={`lnSection__management container mx-auto py-12 px-4
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >

      {/* --- TAB NAVIGATION --- */}
      <div className="mb-4">
        <Swiper slidesPerView="auto" spaceBetween={12} className="!pb-4">
          {managementCategories.map((cat) => (
            <SwiperSlide key={cat.id} className="!w-auto !h-auto">
              <button
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-2.5 rounded-[16px] border text-body-b5 font-medium transition-all duration-300 h-full min-w-[140px] max-w-[240px] md:min-w-[175px] md:max-w-[240px] overflow-hidden ${
                  activeTab === cat.id
                    ? 'bg-warning border-transparent text-black shadow-md'
                    : 'bg-white border-secondary text-black hover:border-neutral-400'
                }`}
              >
                {cat.label}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- GRID CARDS --- */}
      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenProfile(item)}
            className="management-card cursor-pointer opacity-0"
          >
            <CardManagement
              name={item.name}
              role={item.role}
              imageSrc={item.imgSrc}
              href="#"
            />
          </div>
        ))}
      </div>

      {/* --- MODAL DETAIL --- */}
      <ModalManagement
        isOpen={isModalOpen(modalId)}
        onClose={closeModal}
        selectedManager={selectedManager}
        filteredData={filteredData}
        navigateProfile={navigateProfile}
        hasPrev={hasPrev}
        hasNext={hasNext}
      />


    </section>
  );
}
