/**
 * Footer Component
 * Adapted from ln-corporate/components/main/Footer.jsx
 * 
 * Design: IDENTICAL to ln-corporate
 * Changes: Removed next-intl, converted to TypeScript, uses static data
 */

'use client';

import NextLink from 'next/link';
import Icon from '@/components/base/Icon';
import Button from '@/components/base/Button';
import { contactLinks } from '@/data/navData';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="relative bg-[#020202] text-white pt-10 overflow-hidden">
      {/* CONTAINER */}
      <div className="relative z-10 container mx-auto px-6">
        {/* 1. TOP ROW: Navigation & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
          {/* Left: Text Links */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 gap-y-0 md:gap-8 text-sm font-medium text-neutral-200">
            <a
              href="mailto:contact@linknet.co.id"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary-plain btn-lg"
            >
              Advertise with Us
            </a>
            <NextLink href="/contact" className="btn btn-secondary-plain btn-lg">
              Contact Us
            </NextLink>

            {/* Back To Top Button */}
            <Button
              variant="secondary-plain"
              size="lg"
              onClick={scrollToTop}
              iconRight={<Icon name="chevron-up" />}
            >
              Back to Top
            </Button>
          </div>

          {/* Right: Social Media Icons */}
          <div className="flex items-center gap-6">
            {contactLinks.map((item) => (
              <a
                key={item.id}
                href={item.value}
                aria-label={item.id}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-neutral-400 transition-colors"
              >
                <Icon
                  name={item.icon}
                  style={{ '--icon-size': '28px' } as React.CSSProperties}
                />
              </a>
            ))}
          </div>
        </div>

        {/* 2. DIVIDER LINE */}
        <div className="w-full h-[1px] bg-white/10 my-6" />

        {/* 3. COPYRIGHT */}
        <p className="text-body-b5 text-neutral-500 mb-12 text-center md:text-left">
          {new Date().getFullYear()} © PT Link Net Tbk. All rights reserved.
        </p>

        {/* 4. LOGOS ROW */}
        <div className="flex flex-row items-center md:items-start justify-center md:justify-start gap-8 mb-6 md:mb-4">
          <img
            src="/assets/logos/linknet-logo.svg"
            alt="Link Net"
            className="h-6 md:h-7 w-auto object-contain brightness-0 invert"
          />
        </div>
      </div>

      {/* 5. GIANT BACKGROUND TEXT (WATERMARK) */}
      <div className="relative bottom-0 left-0 right-0 pointer-events-none select-none flex justify-center overflow-hidden translate-y-[0%] md:mb-[-10]">
        <div className="w-full h-auto max-w-[1600px] opacity-[0.05] text-center">
          <span className="text-[120px] md:text-[200px] font-bold text-white leading-none tracking-tighter">
            LINKNET
          </span>
        </div>
      </div>
    </footer>
  );
}
