'use client';

import React from 'react';
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import Icon from '../base/Icon';

import { INFO_LIST_DATA } from '@/data/components/informationList';

export default function InformationList({
  name = 'media',
  cmsData = null,
  className = ""
}) {
  const sectionData = cmsData || INFO_LIST_DATA[name];

  if (!sectionData) return null;

  // ctaList dihapus dari sini karena sekarang ada di dalam masing-masing 'item'
  const { config = {}, id, introData, items = [] } = sectionData;
  const {
    sectionId = id,
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

  if (!items || items.length === 0) return null;

  return (
    <section
      id={sectionId}
      className={`lnSection__informationList py-16 md:py-24 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* ========================================= */}
        {/* HEADER SECTION (Menggunakan Intro) */}
        {/* ========================================= */}
        {introData && (
          <div className="mb-12 md:mb-16">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "left"}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* LIST SECTION */}
        {/* ========================================= */}
        <div className="flex flex-col">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-12 border-t border-neutral-50 first:border-t-0 first:pt-0 last:pb-0"
            >

              {/* Kolom Kiri: Judul Section */}
              <div className="md:col-span-4 lg:col-span-3">
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900">
                  {item.title}
                </h3>
              </div>

              {/* Kolom Kanan: Konten Utama */}
              <div className="md:col-span-8 lg:col-span-9">

                {/* 1. Paragraf Teks */}
                {item.contents && (
                  <div
                    className="text-body-b4 text-secondary leading-relaxed [&>p]:mb-6 last:[&>p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: item.contents }}
                  />
                )}

                {/* 2. Kotak Related Article */}
                {item.relatedArticles && item.relatedArticles.length > 0 && (
                  <div className="mt-10 border border-neutral-100 rounded-[16px] p-6">
                    <div className="text-body-b5 text-secondary mb-4">Related Article</div>
                    <div className="flex flex-col gap-5">
                      {item.relatedArticles.map((article, aIdx) => (
                        <a
                          key={aIdx}
                          href={article.url}
                          className="flex items-start md:items-center justify-between group gap-4"
                        >
                          <span className="text-body-b4 font-bold text-neutral-800 group-hover:text-yellow-500 transition-colors">
                            {article.text}
                          </span>
                          <Icon
                            name="arrow-top-right"
                            className="text-neutral-400 group-hover:text-yellow-500 transition-colors flex-shrink-0 mt-1 md:mt-0"
                            style={{ '--icon-size': '24px' }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Daftar Dokumen (PDF) */}
                {item.documents && item.documents.length > 0 && (
                  <div className="mt-10">
                    <div className="text-body-b5 text-secondary mb-3">Documents</div>
                    <ul className="flex flex-col gap-2">
                      {item.documents.map((doc, dIdx) => (
                        <li key={dIdx}>
                          <a href={doc.url} className="flex items-center gap-4 group hover:bg-neutral-50/50 rounded-[12px] py-2 md:py-3 md:p-4">
                            <img
                              src={doc.icon || "/assets/icons/pdf-circlesvg.svg"}
                              alt="PDF"
                              className="w-10 h-10 flex-shrink-0"
                            />
                            <div className="flex flex-col pt-0.5">
                              <span className="text-body-b4 font-bold text-neutral-900 group-hover:text-yellow-500 transition-colors">
                                {doc.title}
                              </span>
                              <span className="text-body-b5 text-secondary mt-1">
                                {doc.date}
                              </span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Item-Specific CTA SECTION (PERBAIKAN DI SINI) */}
                {/* Menggunakan item.ctaList, bukan ctaList */}
                <CTAList
                  ctaList={item.ctaList}
                  align="left"
                  className="mt-12 md:mt-16"
                />

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
