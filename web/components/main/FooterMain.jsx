'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../base/Icon';

/**
 * FooterMain — Dynamic footer component driven by CMS data.
 * 
 * Receives footer data from CMS (via layout.tsx) including:
 * - Company info (logo, slogan, address, contact)
 * - Menu sections (from CMS Menu Management with position=FOOTER)
 * - Social media links
 * - Copyright text
 */
export default function FooterMain({ 
  cmsFooterData = null,
  className = "" 
}) {
  // If no CMS data provided, render nothing
  if (!cmsFooterData) return null;

  const {
    logo = '/assets/logos/linknet-logo.svg',
    slogan = '',
    address = '',
    contact = {},
    menus = [],
    socials = [],
    copyright = '',
  } = cmsFooterData;

  return (
    <div className={`lnFooter bg-light-2 mx-auto px-3 pt-4 sm:px-4 md:px-4 ${className}`}>
      {/* White Card */}
      <div className="bg-white rounded-[24px] md:rounded-[32px] py-8 md:py-12 pb-8 px-6 md:px-10 lg:px-12 shadow-md">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Left Column — Company Info */}
            <div className="lg:col-span-5 flex flex-col items-start">
                
                {/* Logo */}
                <div className="mb-8">
                    <img 
                      src={logo}
                      alt="Linknet Logo" 
                      className="h-8 md:h-10 w-auto object-contain"
                    />
                </div>

                {slogan && (
                  <h3 className="text-headline-h4 font-bold text-black mb-6">
                      {slogan}
                  </h3>
                )}

                {address && (
                  <div className="mb-6">
                      <span className="block text-caption-c1 font-medium text-secondary uppercase tracking-wider mb-2">
                          Office Location
                      </span>
                      <p className="block text-body-b4 font-medium text-black leading-relaxed max-w-sm">
                          {address}
                      </p>
                  </div>
                )}

                {(contact.email || contact.phone) && (
                  <div>
                    <span className="block text-caption-c1 font-medium text-secondary uppercase mb-3">
                        For further inquiry
                    </span>
                    <div className="flex flex-col gap-2.5 text-body-b4 font-medium text-black">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-yellow-500 transition-colors group">
                              <Icon name="mail" />
                              <span className="underline decoration-neutral-300 underline-offset-4 group-hover:decoration-yellow-500">{contact.email}</span>
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-3 hover:text-yellow-500 transition-colors group">
                              <Icon name="phone" className="text-black group-hover:text-yellow-500 transition-colors" />
                              <span className="underline decoration-neutral-300 underline-offset-4 group-hover:decoration-yellow-500">{contact.phone}</span>
                          </a>
                        )}
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column — Menu Links from CMS */}
            {menus.length > 0 && (
              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-4">
                  {menus.map((menu, index) => (
                  <div key={index}>
                      <h4 className="text-caption-c1 font-medium text-secondary uppercase tracking-wider mb-4 md:mb-4">
                      {menu.title}
                      </h4>
                      <ul className="flex flex-col gap-2 md:gap-3">
                      {(menu.links || []).map((link, idx) => (
                          <li key={idx}>
                          <Link 
                              href={link.href || '#'}
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
            )}
            
        </div>

        {/* Bottom Row: Social Media */}
        {socials.length > 0 && (
          <div className="flex flex-col md:flex-row items-center gap-6 pt-8 mt-8 border-t border-gray-200">
              <div className='flex items-center gap-3'>
                  <span className="hidden sm:block text-caption-c1 font-medium text-secondary uppercase tracking-wider">
                      Follow Us
                  </span>
                  <div className="flex items-center gap-4 text-black">
                      {socials.map((social, idx) => (
                          <a key={idx} href={social.href || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-500 transition-colors">
                          <Icon name={social.iconName || social.icon || 'link'} />
                          </a>
                      ))}
                  </div>
              </div>
          </div>
        )}
      </div>

      {/* Copyright */}
      {copyright && (
        <div className="container">
          <div className="text-center py-6 md:py-8 mt-0">
            <p className="text-body-b5 text-secondary font-regular">
              {copyright}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
