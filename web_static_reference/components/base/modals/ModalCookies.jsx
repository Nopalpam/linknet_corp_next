'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import Icon from '../Icon';
import Button from '../Button';
import LinknetLink from '../Link';
import { POPUP_COOKIES_DATA } from '@/data/components/modalCookies';

// =========================================
// CONSTANTS
// =========================================
const STORAGE_KEY      = 'ln_cookie_accepted';
const EXPIRY_MONTHS    = 6;
const ANIM_DURATION    = 0.5;
const ANIM_EASE        = 'power3.out';

// =========================================
// HELPERS
// =========================================

/** Cek apakah consent masih valid (belum expired) */
function isConsentValid() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { acceptedAt } = JSON.parse(raw);
    if (!acceptedAt) return false;

    const expiry = new Date(acceptedAt);
    expiry.setMonth(expiry.getMonth() + EXPIRY_MONTHS);
    return new Date() < expiry;
  } catch {
    return false;
  }
}

/** Simpan consent dengan timestamp saat ini */
function saveConsent() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ acceptedAt: new Date().toISOString() })
    );
  } catch {
    // localStorage tidak tersedia (private mode, dll) — abaikan
  }
}

// =========================================
// MAIN COMPONENT
// =========================================
export default function ModalCookies({ name = 'default', className = '' }) {
  const popupRef  = useRef(null);
  const [visible, setVisible] = useState(false);

  const data = POPUP_COOKIES_DATA[name];

  // =========================================
  // CEK APAKAH POPUP PERLU DITAMPILKAN
  // =========================================
  useEffect(() => {
    if (!data) return;

    // Jika consent belum ada atau sudah expired → tampilkan popup
    if (!isConsentValid()) {
      setVisible(true);
    }
  }, [data]);

  // =========================================
  // ANIMASI MASUK
  // =========================================
  useEffect(() => {
    if (!visible || !popupRef.current) return;

    gsap.fromTo(
      popupRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: ANIM_DURATION, ease: ANIM_EASE }
    );
  }, [visible]);

  // =========================================
  // HANDLERS
  // =========================================
  const handleAccept = () => {
    if (!popupRef.current) return;

    saveConsent();

    // Animasi keluar sebelum unmount
    gsap.to(popupRef.current, {
      y: 40,
      opacity: 0,
      duration: ANIM_DURATION,
      ease: 'power3.in',
      onComplete: () => setVisible(false),
    });
  };

  // =========================================
  // RENDER
  // =========================================
  if (!data || !visible) return null;

  const { icon, title, description, moreInfoLabel, moreInfoUrl, acceptLabel } = data;

  return (
    <div
      ref={popupRef}
      className={`
        lnPopupCookies
        fixed bottom-6 left-1/2 -translate-x-1/2
        w-[calc(100%-2rem)] max-w-[820px]
        bg-white rounded-[16px] shadow-lg
        border border-[#F0F0F0]
        px-5 py-4 md:px-6 md:py-4
        flex flex-col md:flex-row md:items-center gap-4 md:gap-8
        z-[9999]
        ${className}
      `}
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >

      {/* ===================================== */}
      {/* LEFT — Icon + Text                    */}
      {/* ===================================== */}
      <div className="flex items-start gap-4 flex-1 min-w-0">

        {/* Cookie icon */}
        <div className="flex-shrink-0 mt-0.5">
          <img src="/assets/icons/cookie.svg" className='w-8 h-8' alt="Cookie Icon" />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-headline-h6 text-black mb-1">{title}</p>
          <p className="text-body-b5 text-secondary leading-relaxed">{description}</p>
        </div>
      </div>

      {/* ===================================== */}
      {/* RIGHT — Actions                       */}
      {/* ===================================== */}
      <div className="flex items-end md:items-center gap-4 flex-shrink-0 self-end md:self-auto">

        {/* More Info — ghost / text button */}
        <LinknetLink
          as="a"
          href={moreInfoUrl}
          variant="secondary-plain"
          size="md"
          className="underline whitespace-nowrap"
        >
          {moreInfoLabel}
        </LinknetLink>

        {/* Accept — primary button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleAccept}
          className="whitespace-nowrap"
        >
          {acceptLabel}
        </Button>

      </div>
    </div>
  );
}