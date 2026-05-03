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
import Intro from '../base/section/Intro';

// Import Hooks
import { useModalRegistry } from '../hooks/useModalRegistry';

export default function Management({ cmsData = null, data = null, mainData = null, config = {}, className = '' }) {
  const source = cmsData || data || {};
  const sourceMainData = mainData || source.mainData || {};
  const introData = source.introData || source.sectionIntro || source.intro || null;
  const categories = useMemo(() => {
    const cmsCategories = sourceMainData.categories || source.categories;
    if (!Array.isArray(cmsCategories) || cmsCategories.length === 0) return managementCategories;

    return cmsCategories.map((category) => ({
      id: category.id,
      label: category.label || category.name || category.title || '',
    }));
  }, [sourceMainData.categories, source.categories]);
  const items = useMemo(() => {
    const cmsItems = sourceMainData.managements || source.items || source.managements;
    if (!Array.isArray(cmsItems) || cmsItems.length === 0) return managementData;

    return cmsItems.map((item) => ({
      id: item.id || item.slug || item.name,
      name: item.name || item.full_name || '',
      role: item.role || item.position || item.title || '',
      categoryId: item.categoryId || item.category_id || item.management_category_id || item.managementCategory?.id,
      imgSrc: item.imgSrc || item.image || item.photo || item.photo_url || item.thumbnail || '',
      about: item.about || item.description || item.bio || '',
    }));
  }, [sourceMainData.managements, source.items, source.managements]);
  const [activeTab, setActiveTab] = useState(categories[0]?.id || '');
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
  } = { ...(source.config || {}), ...(config || {}) };
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const gridRef = useRef(null);

  const filteredData = useMemo(() => {
    return items.filter((item) => item.categoryId === activeTab);
  }, [activeTab, items]);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeTab)) {
      setActiveTab(categories[0]?.id || '');
    }
  }, [activeTab, categories]);

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

      {introData && (introData.label || introData.title || introData.description) && (
        <div className="mb-8">
          <Intro
            as={introData.as || 'h2'}
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align || 'left'}
          />
        </div>
      )}

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
