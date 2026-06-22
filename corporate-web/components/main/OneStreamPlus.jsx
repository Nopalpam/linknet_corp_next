'use client';
import { useState } from 'react';
import React from 'react';

import { useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Icon from '../base/Icon';   // Pastikan path sesuai struktur foldermu
import Button from '../base/Button'; // Pastikan path sesuai struktur foldermu
import UspCard from '../base/cards/UspCard';
import Modal from '../base/Modal';

import { useModalRegistry } from '../hooks/useModalRegistry';

import './styles/section.sass';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import SplitText from '../base/text/SplitText';

gsap.registerPlugin(ScrollTrigger);



export default function OneStreamPlus() {
   
    const [prevEl, setPrevEl] = useState(null);
    const [nextEl, setNextEl] = useState(null);
    const [paginationEl, setPaginationEl] = useState(null);
    

    const sectionRef = useRef(null);
    const cardRef = useRef(null);

    const { activeModalId, closeModal, openModal, isModalOpen } = useModalRegistry();

    const t = useTranslations('OneStreamPlus');
    const uspList = t.raw('usp');
    const specifications = t.raw('specifications');
    const order = t.raw('order');

useEffect(() => {
const mm = gsap.matchMedia();

mm.add({
    // Tentukan breakpoint Anda di sini
    isDesktop: "(min-width: 768px)",
    isMobile: "(max-width: 767px)"
}, (context) => {
    const { isMobile } = context.conditions;

    // ANIMASI EXPAND
    gsap.fromTo(cardRef.current, 
        {
            // Kondisi awal: Mobile lebih lebar sedikit agar tidak terlalu kecil
            width: isMobile ? "92%" : "85%",
            borderRadius: isMobile ? "24px" : "48px",
        },
        {
            // Kondisi akhir: Mobile biasanya lebih bagus benar-benar full (100%)
            width: isMobile ? "100%" : "98%",
            borderRadius: isMobile ? "0px" : "24px",
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "center center",
                scrub: 1,
            }
        }
    );
}, sectionRef);

return () => mm.revert(); // Membersihkan semua animasi & matchMedia
}, []);

  return (
    <section id="one-stream-plus" className="sectionProduct relative md:min-h-screen overflow-hidden">
        
      <div className="container mx-auto py-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between relative gap-10 md:gap-4">
            <div className="sectionHead mb-8 md:mb-0 md:max-w-[48%]" data-aos="fade-up">
                    <img src="https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-onestreamplus-white.png" className="h-6 md:h-8 w-auto" alt="" />
                    <h2 className="text-headline-h3 md:text-headline-h2 text-white mt-4">
                        <SplitText
                            text={t('title')}
                            delay={100}
                            duration={0.5}
                            ease="power3.out"
                            splitType="words"
                            from={{ opacity: 0, y: 40 }}
                            to={{ opacity: 1, y: 0 }}
                            threshold={0.1}
                            textAlign="left"
                        />
                    </h2>
                    <p className="text-body-b5 md:text-body-b4 text-neutral-400 mt-3">
                        {t('desc')}
                    </p>
                    <div className="flex flex-wrap mt-8 gap-5 md:gap-6 opacity-40">
                      <img src="https://d2fsl11s4twg7t.cloudfront.net/assets/logos/BANG_OLUFSEN.svg" className='w-auto h-6 md:h-8' alt="Audio by BANG & OLUFSEN" />
                      <img src="https://d2fsl11s4twg7t.cloudfront.net/assets/logos/DOLBY_VISION_ATMOS.svg" className='w-auto h-6 md:h-8' alt="Dolby Vision Atmos" />
                      <img src="https://d2fsl11s4twg7t.cloudfront.net/assets/logos/POWERED_BY_ANDROIDTV.svg" className='w-auto h-6 md:h-8' alt="Powered by AndroidTV" />
                    </div>
                    <div className="cta flex flex-wrap mt-10 gap-4">
                        <Button size='lg' variant='secondary-outline' onClick={() => openModal('get-onestreamplus')}>
                            {t('textCTA')}
                        </Button>
                        <Button size='lg' variant='secondary-plain' onClick={() => openModal('onestreamplus-specs')}>
                            {t('textCTA_secondary')}
                        </Button>
                    </div>

            </div>
            <div className="device-image device-image__right osplus-image w-full md:h-full" data-aos="fade-up" data-aos-delay="200">
                <img className='img-full img-updown' src="https://d2fsl11s4twg7t.cloudfront.net/assets/devices/device-osplus-full.png" alt="One Stream Plus Device" />
            </div>
        </div>

        {/* --- SWIPER CAROUSEL --- */}
        <div className="swiperUSP relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24} // Jarak antar card (var(--space-24))
            slidesPerView={1.2} // Mobile: Intip sedikit card sebelahnya
            grabCursor={true}
            // Konfigurasi Navigasi Custom
            navigation={{
                prevEl: prevEl,
                nextEl: nextEl,
            }}
            pagination={{
                el: paginationEl, // Use a valid DOM element here
                type: "bullets",
                clickable: true,
                // bulletClass: "bg-amber-400",
                // bulletActiveClass: "bg-green-400",
            }}
            // Responsive Breakpoints
            breakpoints={{
              640: {
                slidesPerView: 2.2, // Tablet portrait
              },
              1024: {
                slidesPerView: 3.2, // Tablet landscape / Laptop
              },
              1280: {
                slidesPerView: 4, // Desktop lebar
              },
            }}
            className="pb-16" // Padding bawah untuk tempat pagination/navigasi
          >
            {uspList.map((item) => (
              <SwiperSlide key={item.id} className="h-auto"> 
                {/* h-auto penting agar semua card tingginya sama rata */}
                <UspCard 
                  iconSrc={item.iconSrc}
                  title={item.title}
                  desc={item.desc}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* --- CUSTOM NAVIGATION BUTTONS (Bottom Right) --- */}
          <div className="relative mt-5 w-full gap-5 z-20 flex items-center justify-end">
            <div className="swiper-pagination-usp w-auto hidden md:block" ref={(node) => setPaginationEl(node)}></div>
            <div className="flex gap-2">
                {/* Prev Button */}
                <button 
                    ref={(node) => setPrevEl(node)}
                    className="w-14 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Icon name="chevron-left" style={{ width: '24px', height: '24px' }} />
                </button>

                {/* Next Button */}
                <button 
                    ref={(node) => setNextEl(node)}
                    className="w-14 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Icon name="chevron-right" style={{ width: '24px', height: '24px' }} />
                </button>
            </div>
          </div>

        </div>

        <p className='text-white/40 text-body-b5 mt-10 leading-relaxed italic whitespace-pre-line'>
          {t('note')}
        </p>

        <Modal 
          isOpen={isModalOpen('onestreamplus-specs')} 
          onClose={closeModal} 
          title={specifications.title}
          size="md" // Ukuran width 560px
          footer={null}
        >
          {/* Modal Body */}

          {specifications.items.map((section, idx) => {
            // Logika check: Apakah kategori ada dan tidak kosong?
            const hasCategory = section.category && section.category.trim() !== "";

            return (
              <div key={idx} className={hasCategory ? "mb-8 last:mb-0" : "mb-6"}>
                {/* IF: Render judul jika kategori ada */}
                {hasCategory && (
                  <h4 className="text-white font-bold mb-5 text-body-b4">
                    {section.category}
                  </h4>
                )}

                {/* Render daftar spesifikasi (selalu muncul) */}
                <div className="space-y-5 md:space-y-4">
                  {section.specs.map((item, sIdx) => (
                    <div key={sIdx} className="flex justify-between border-b border-white/5 pb-5 md:pb-4 last:pb-0 last:border-b-0 text-body-b5">
                      <span className="text-white/40">{item.label}</span>
                      <span className="text-white font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* End Modal Body */}
        </Modal>


        <Modal 
          isOpen={isModalOpen('get-onestreamplus')} 
          onClose={closeModal} 
          title={order.title} // Menggunakan title dari JS
          size="md" 
          footer={null}
        >
          <div className="space-y-12">

            {/* --- SECTION 1: RETAIL PARTNERS --- */}
            <section className="space-y-6">
              <h4 className="text-body-b4 text-white/40 leading-relaxed max-w-md mb-5">
                {order.by.retail.title} {/* */}
              </h4>

              {order.by.retail.list.map((item, index) => (
                <div key={index} className="flex flex-row gap-4 items-start">
                  <div className="shrink-0 bg-white p-2 rounded-lg">
                    <img 
                      src={item.url_logo} //
                      alt={item.name} 
                      className="w-6 h-6 md:w-8 md:h-8 object-contain" 
                    />
                  </div>

                  <div className='space-y-2'>
                    <p className='text-body-b4 font-medium'>{item.name}</p> {/* */}
                    <p className="text-neutral-300 text-body-b5 md:text-body-b3 leading-relaxed">
                      {item.desc} {/* */}
                    </p>
                  </div>
                </div>
              ))}
            </section>

            {/* --- SECTION 2: CONTACT PARTNERSHIP --- */}
            <section className="space-y-8">
              <h4 className="text-body-b4 text-white/40 leading-relaxed max-w-md mb-5">
                {order.by.contact.title} {/* */}
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {order.by.contact.list.map((contact, index) => (
                  <React.Fragment key={index}>
                    {/* Item: Whatsapp */}
                    <a 
                      href={`https://wa.me/${contact.whatsapp_no}`} // Otomatis link WA
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 group cursor-pointer w-full px-[16px] py-[12px] md:px-5 md:py-4 border border-white/10 rounded-[12px] hover:bg-white/5 transition-colors"
                    >
                      <div className="w-[40px] h-[40px] bg-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white group-hover:text-black rounded-full">
                        <Icon name="whatsapp" className="w-8 h-8" />
                      </div>
                      
                      <div className="flex flex-col flex-1">
                          <span className="text-secondary text-caption-c1 md:text-body-b4 font-medium group-hover:text-white transition-colors mb-[4px] md:mb-[6px]">
                            Whatsapp
                          </span>
                          <span className="text-white text-body-b4 font-medium group-hover:text-white/80 transition-colors">
                            +{contact.whatsapp_no.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '$1 $2 $3 $4')} {/* Format rapi */}
                          </span>
                      </div>

                      <div className="hidden md:block">
                        <Icon name="arrow-top-right" className="group-hover:text-white transition-colors" />
                      </div>
                    </a>

                    {/* Item: Email */}
                    <a 
                      href={`mailto:${contact.email}`} // Menggunakan mailto
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 group cursor-pointer w-full px-[16px] py-[12px] md:px-5 md:py-4 border border-white/10 rounded-[12px] hover:bg-white/5 transition-colors"
                    >
                      <div className="w-[40px] h-[40px] bg-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white group-hover:text-black rounded-full">
                        <Icon name="email" className="w-8 h-8" />
                      </div>
                      
                      <div className="flex flex-col flex-1">
                          <span className="text-secondary text-caption-c1 md:text-body-b4 font-medium group-hover:text-white transition-colors mb-[4px] md:mb-[6px]">
                            Email
                          </span>
                          <span className="text-white text-body-b4 font-medium group-hover:text-black transition-colors">
                            {contact.email} {/* */}
                          </span>
                      </div>

                      <div className="hidden md:block">
                        <Icon name="arrow-top-right" className="group-hover:text-white transition-colors" />
                      </div>
                    </a>
                  </React.Fragment>
                ))}
              </div>
            </section>

          </div>
        </Modal>
        
        
      </div>
      <div className="image-ornament w-full">
          <img src="https://d2fsl11s4twg7t.cloudfront.net/assets/bg/soundwave.webp" className='w-full' alt="Soundwave" />
      </div>

      <section 
        ref={sectionRef} 
        className="flex mt-10 flex-col items-center justify-center overflow-hidden"
      >
  
        {/* CARD CONTAINER (Target Animasi) 
            - Kita set mx-auto agar start dari tengah
            - height diset fix (misal 600px) atau aspect-ratio
        */}
        <div 
          ref={cardRef}
          className="relative h-[300px] md:h-[700px] bg-neutral-900 overflow-hidden shadow-2xl mx-auto"
        >
          
          {/* IMAGE ASSET */}
          <img 
            src="https://d2fsl11s4twg7t.cloudfront.net/assets/img/onestreamplus-tv.jpg" 
            alt="Family in living room" 
            className="w-full h-full object-cover"
          />
  
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-500" />
  
          {/* CONTENT CENTER */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            
            {/* Play Button */}
            <button className="hidden group relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-md border border-white/30 rounded-full transition-transform duration-300 hover:scale-110 hover:bg-white/20 cursor-pointer">
              <Icon name="play" className="text-white w-8 h-8 md:w-12 md:h-12 ml-1" />
            </button>
  
            {/* <h3 className="mt-8 text-headline-h4 md:text-headline-h2 text-white font-bold drop-shadow-lg text-center px-4">
              Entertainment for everyone.
            </h3> */}
            
          </div>
  
        </div>
      </section>
        
    </section>
    
  );
}