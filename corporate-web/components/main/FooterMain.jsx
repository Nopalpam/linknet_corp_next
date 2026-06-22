'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../base/Icon'; // Sesuaikan path Icon
import { MAIN_FOOTER_DATA } from '@/data/components/footerMain';

export default function FooterMain({
  name = 'default',
  cmsFooterData = null,
  className = ""
}) {
  const fallback = MAIN_FOOTER_DATA[name];
  const main = cmsFooterData
    ? {
        ...fallback,
        ...cmsFooterData,
        contact: {
          ...(fallback?.contact || {}),
          ...(cmsFooterData.contact || {}),
        },
        menus: Array.isArray(cmsFooterData.menus) && cmsFooterData.menus.length > 0
          ? cmsFooterData.menus
          : fallback?.menus || [],
        socials: Array.isArray(cmsFooterData.socials) && cmsFooterData.socials.length > 0
          ? cmsFooterData.socials
          : fallback?.socials || [],
      }
    : fallback;

  if (!main) return null;

  const email = main.contact?.email?.trim() || '';
  const phoneNumbers = Array.isArray(main.contact?.phoneNumbers)
    ? main.contact.phoneNumbers
    : [
        main.contact?.phone ? { type: 'phone', label: 'Phone', number: main.contact.phone } : null,
        main.contact?.whatsapp_no ? { type: 'whatsapp', label: 'WhatsApp', number: main.contact.whatsapp_no } : null,
      ].filter(Boolean);
  const hasInquiryContact = Boolean(email || phoneNumbers.length > 0);

  const normalizePhoneNumber = (number = '') => number.replace(/[^\d+]/g, '');
  const normalizeWhatsAppNumber = (number = '') => {
    const cleaned = normalizePhoneNumber(number).replace(/^\+/, '');
    if (cleaned.startsWith('0')) return `62${cleaned.slice(1)}`;
    return cleaned;
  };

  return (
    <div className={`lnFooter bg-light-2 mx-auto px-3 pt-4 sm:px-4 md:px-4 ${className}`}>
      {/* Kartu Putih */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] py-8 md:py-12 pb-8 px-6 md:px-10 lg:px-12 shadow-md">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

            {/* Kolom Kiri */}
            <div className="lg:col-span-5 flex flex-col items-start">

                {/* --- UPDATE: MENGGUNAKAN IMAGE LOGO --- */}
                <div className="mb-8">
                    <img
                      src={main.logo}
                      alt="Linknet Logo"
                      className="h-8 md:h-10 w-auto object-contain"
                    />
                </div>

                <h3 className="text-headline-h4 font-bold text-black mb-6 md:w-[80%]">
                    {main.slogan}
                </h3>

                <div className="mb-6">
                    <span className="block text-caption-c1 font-medium text-secondary uppercase tracking-wider mb-2">
                        Office Location
                    </span>
                    <p className="block text-body-b4 font-medium text-black leading-relaxed max-w-sm">
                        {main.address}
                    </p>
                </div>

                {hasInquiryContact && (
                  <div>
                    <span className="block text-caption-c1 font-medium text-secondary uppercase mb-3">
                      For further inquiry
                    </span>
                    <div className="flex flex-col gap-2.5 text-body-b4 font-medium text-black">
                      {email && (
                        <a href={`mailto:${email}`} className="flex items-center gap-3 hover:text-yellow-500 transition-colors group">
                          <Icon name="mail" />
                          <span className="underline decoration-neutral-300 underline-offset-4 group-hover:decoration-yellow-500">{email}</span>
                        </a>
                      )}
                      {phoneNumbers.map((item, index) => {
                        const isWhatsApp = item.type === 'whatsapp';
                        const href = isWhatsApp
                          ? `https://wa.me/${normalizeWhatsAppNumber(item.number)}`
                          : `tel:${normalizePhoneNumber(item.number)}`;

                        return (
                        <a
                          key={`${item.type || 'phone'}-${item.number || index}`}
                          href={href}
                          target={isWhatsApp ? '_blank' : undefined}
                          rel={isWhatsApp ? 'noopener noreferrer' : undefined}
                          className="flex items-center gap-3 hover:text-yellow-500 transition-colors group"
                        >
                          <Icon name={isWhatsApp ? 'whatsapp' : 'phone'} className="text-black group-hover:text-yellow-500 transition-colors" />
                          <span className="underline decoration-neutral-300 underline-offset-4 group-hover:decoration-yellow-500">
                            {item.label ? `${item.label}: ` : ''}{item.number}
                          </span>
                        </a>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            {/* Kolom Kanan (Menu Links) */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-4">
                {main.menus.map((menu, index) => (
                <div key={index}>
                    <h4 className="text-caption-c1 font-medium text-secondary uppercase tracking-wider mb-4 md:mb-4">
                    {menu.title}
                    </h4>
                    <ul className="m-0 flex list-none flex-col gap-2 p-0 md:gap-3">
                    {menu.links.map((link, idx) => (
                        <li key={link.href || `${menu.title}-${idx}`} className="m-0 list-none p-0">
                        <Link
                            href={link.href}
                            className="text-body-b4 font-medium text-black hover:text-[#FFB800] transition-colors"
                        >
                            {link.label}
                        </Link>
                        </li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>

        </div>

        {/* Baris Bawah: Social Media & Language Dropdown */}
        <div className="flex flex-col md:flex-row items-center gap-6 pt-8 mt-8 border-t border-gray-200">

            {/* Follow Us */}
            <div className='flex items-center gap-3'>
                <span className="hidden sm:block text-caption-c1 font-medium text-secondary uppercase tracking-wider">
                    Follow Us
                </span>
                <div className="flex items-center gap-4 text-black">
                    {(main.socials || []).map((social, idx) => {
                      const iconName = social.iconName || social.icon || social.name;
                      const isImageIcon = typeof iconName === 'string' && (iconName.startsWith('/') || iconName.startsWith('http'));

                      return (
                        <a
                          key={idx}
                          href={social.href || social.url || '#'}
                          target={social.target || '_blank'}
                          rel="noopener noreferrer"
                          aria-label={social.label || iconName || 'Social media'}
                          className="hover:text-yellow-500 transition-colors"
                        >
                          {isImageIcon ? (
                            <img src={iconName} alt="" className="h-5 w-5 object-contain" />
                          ) : (
                            <Icon name={iconName} />
                          )}
                        </a>
                      );
                    })}
                </div>
            </div>


        </div>
      </div>

      {/* Copyright */}
      <div className="container">
        <div className="text-center py-6 md:py-8 mt-0">
          <p className="text-body-b5 text-secondary font-regular">
            {main.copyright}
          </p>
        </div>
      </div>
    </div>
  );
}
