'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

import Modal from '../../base/Modal'; // Sesuaikan path
import Icon from '../../base/Icon';   // Sesuaikan path
import { useModalRegistry } from '../../hooks/useModalRegistry';

export default function GetStartedModal() {
  // Panggil hook di sini agar komponen ini 'sadar' kapan harus membuka dirinya sendiri
  const { isModalOpen, closeModal } = useModalRegistry();
  const MODAL_ID = 'get-started'; // ID unik untuk modal ini

const t = useTranslations('global');
 const getStarted = t.raw('getStarted');

  return (
    <Modal 
      isOpen={isModalOpen(MODAL_ID)} 
      onClose={closeModal} 
      title={getStarted.title}
      size="md" 
      footer={null}
    >
      <div className="space-y-12 py-2">

        {/* --- SECTION 1: RETAIL PARTNERS --- */}
        <section className="space-y-6">
          <h4 className="text-body-b4 text-white/40 leading-relaxed max-w-md mb-5">
            {getStarted.by.retail.title}
          </h4>

          {getStarted.by.retail.list.map((item, index) => (
            <div key={index} className="flex flex-row gap-4 items-start">
              <div className="shrink-0 bg-white p-2 rounded-lg">
                <img 
                  src={item.url_logo}
                  alt={item.name} 
                  className="w-6 h-6 md:w-8 md:h-8 object-contain" 
                />
              </div>

              <div className='space-y-2'>
                <p className='text-body-b4 font-medium text-white'>{item.name}</p>
                <p className="text-neutral-300 text-body-b5 md:text-body-b3 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* --- SECTION 2: CONTACT PARTNERSHIP --- */}
        <section className="space-y-8">
          <h4 className="text-body-b4 text-white/40 leading-relaxed max-w-md mb-5">
            {getStarted.by.contact.title}
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {getStarted.by.contact.list.map((contact, index) => (
              <React.Fragment key={index}>
                
                {/* Item: Whatsapp */}
                <a 
                  href={`https://wa.me/${contact.whatsapp_no}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group cursor-pointer w-full px-[16px] py-[12px] md:px-5 md:py-4 border border-white/10 rounded-[12px] hover:bg-white/5 transition-colors"
                >
                  <div className="w-[40px] h-[40px] bg-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white group-hover:text-black rounded-full">
                    <Icon name="whatsapp" className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                      <span className="text-secondary text-caption-c1 md:text-body-b4 font-medium text-white/60 group-hover:text-white transition-colors mb-[4px] md:mb-[6px]">
                        Whatsapp
                      </span>
                      <span className="text-white text-body-b4 font-medium group-hover:text-white/80 transition-colors">
                        +{contact.whatsapp_no.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '$1 $2 $3 $4')}
                      </span>
                  </div>

                  <div className="hidden md:block">
                    <Icon name="arrow-top-right" className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </a>

                {/* Item: Email */}
                <a 
                  href={`mailto:${contact.email}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group cursor-pointer w-full px-[16px] py-[12px] md:px-5 md:py-4 border border-white/10 rounded-[12px] hover:bg-white/5 transition-colors"
                >
                  <div className="w-[40px] h-[40px] bg-white/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white group-hover:text-black rounded-full">
                    <Icon name="email" className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  
                  <div className="flex flex-col flex-1">
                      <span className="text-secondary text-caption-c1 md:text-body-b4 font-medium text-white/60 group-hover:text-white transition-colors mb-[4px] md:mb-[6px]">
                        Email
                      </span>
                      <span className="text-white text-body-b4 font-medium group-hover:text-white transition-colors">
                        {contact.email}
                      </span>
                  </div>

                  <div className="hidden md:block">
                    <Icon name="arrow-top-right" className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </a>

              </React.Fragment>
            ))}
          </div>
        </section>

      </div>
    </Modal>
  );
}