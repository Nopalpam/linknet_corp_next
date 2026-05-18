'use client';

import React, { useState } from 'react';
import CardReport from '../base/cards/CardReport';
import Modal from '../base/Modal';
import Link from '../base/Link';
import Button from '../base/Button';
import Icon from '../base/Icon';
import { useModalRegistry } from '../hooks/useModalRegistry';

// UBAH: Terima prop 'data' secara langsung
export default function ReportListPart({ data, config, className = "", cardVariant = "list" }) {
  // 2. Gunakan Hook
  const { openModal, closeModal, isModalOpen } = useModalRegistry();

  if (!data || !data.items || data.items.length === 0) return null;
  const { header, items, id: groupId } = data; // Ambil ID unik dari data (misal: "financial-2025")
  const {
    sectionId = groupId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  // Buat ID Modal yang unik untuk list ini
  const modalId = `report-list-${groupId}`;

  const MAX_VISIBLE = 4;
  const visibleItems = items.slice(0, MAX_VISIBLE);
  const hasMore = items.length > MAX_VISIBLE;
  const normalizedCardVariant = cardVariant === 'cover' ? 'cover' : 'list';
  const itemGridClass = normalizedCardVariant === 'cover'
    ? 'grid grid-cols-1 gap-5 md:grid-cols-2'
    : 'grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4';

  const getPdfIcon = (type) => {
    return type === 'Consolidated'
      ? '/assets/icons/pdf-circle-consolidated.svg'
      : '/assets/icons/pdf-circle.svg';
  };

  return (
    <section
      id={sectionId}
      className={`lnSection__reportListPart rounded-[18px] border border-neutral-100 bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.05)] md:p-7
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >

      {/* HEADER SECTION (Tanpa Dropdown) */}
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-neutral-100 pb-5 lg:flex-row lg:items-end">
          <div className="flex-1">
            <h2 className="text-headline-h5 md:text-headline-h4 font-bold text-black">
              {header.title}
            </h2>
            {header.desc && (
              <p className="mt-2 max-w-3xl text-body-b5 md:text-body-b4 text-secondary">
                {header.desc}
              </p>
            )}
          </div>
        </div>

        {/* GRID LIST ITEMS (Max 6) */}
        <div className={itemGridClass}>
          {visibleItems.map((item) => (
            <CardReport
              key={item.id}
              variant={normalizedCardVariant}
              icon={getPdfIcon(item.dataType || item.reportType)}
              image={item.image}
              year={item.year}
              title={item.title || ''}
              fileSize={item.fileSize}
              badges={item.auditStatus ? [item.auditStatus] : []}
              category={item.category}
              date={item.date}
              downloadUrl={item.downloadUrl}
            />
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button
                variant='secondary-outline'
                size='md'
                onClick={() => openModal(modalId)}
                className="hover:!bg-neutral-50 transition-all bg-white"
            >
              View More
            </Button>
          </div>
        )}

         {/* MODAL VIEW */}
        <Modal
          isOpen={isModalOpen(modalId)} // Cek apakah ID modal ini yang sedang aktif di URL
          onClose={closeModal}
          mobilePosition="bottom"
          desktopPosition="center"
          maxWidth="max-w-2xl"
          title={
            <div className="flex flex-col">
              <span className="text-headline-h5 font-bold text-neutral-900 mb-1">{header.title}</span>
              {header.desc && <span className="text-body-b5 text-secondary font-normal">{header.desc}</span>}
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <CardReport
                key={item.id}
                variant={normalizedCardVariant}
                icon={getPdfIcon(item.dataType || item.reportType)}
                image={item.image}
                year={item.year}
                title={item.title || ''}
                fileSize={item.fileSize}
                badges={item.auditStatus ? [item.auditStatus] : []}
                category={item.category}
                date={item.date}
                downloadUrl={item.downloadUrl}
                className=""
              />
            ))}
          </div>
        </Modal>

    </section>
  );
}
