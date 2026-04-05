'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Button from '../Button';
import LinknetLink from '../Link';

// =========================================
// CONSTANTS
// =========================================
const STORAGE_KEY      = 'ln_cookie_accepted';
const EXPIRY_MONTHS    = 6;
const ANIM_DURATION    = 0.5;
const ANIM_EASE        = 'power3.out';
const API_BASE_URL     = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// =========================================
// HELPERS
// =========================================

/** Check if consent is still valid (not expired) */
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

/** Save consent with current timestamp */
function saveConsent() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ acceptedAt: new Date().toISOString() })
    );
  } catch {
    // localStorage not available (private mode, etc) — ignore
  }
}

/** Generate a simple browser fingerprint (UUID-based) */
function getOrCreateFingerprint() {
  try {
    const FP_KEY = 'ln_device_fp';
    let fp = localStorage.getItem(FP_KEY);
    if (!fp) {
      fp = 'fp_' + crypto.randomUUID();
      localStorage.setItem(FP_KEY, fp);
    }
    return fp;
  } catch {
    return null;
  }
}

/** Send consent data to backend API */
async function sendConsentToAPI(fingerprint) {
  try {
    await fetch(`${API_BASE_URL}/cookies/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint }),
    });
  } catch {
    // Silently fail — consent is already saved locally
    // API logging is best-effort, should not block UX
  }
}

// =========================================
// MAIN COMPONENT
// =========================================

/**
 * ModalCookies — CMS-driven cookie consent popup.
 * 
 * Receives config via cmsData prop:
 * - enabled: boolean — whether to show cookies modal
 * - title: string
 * - description: string
 * - moreInfoLabel: string
 * - moreInfoUrl: string
 * - acceptLabel: string
 * - iconUrl: string (optional)
 * - expiryMonths: number (optional, defaults to 6)
 * 
 * Shows a floating consent bar at bottom of screen.
 * Remembers user acceptance in localStorage for configurable months.
 */
export default function ModalCookies({ cmsData = null, className = '' }) {
  const popupRef  = useRef(null);
  const [visible, setVisible] = useState(false);

  // Check if popup should be shown
  useEffect(() => {
    if (!cmsData || cmsData.enabled === false) return;

    // If consent not present or expired → show popup (delayed to avoid cascading render)
    const timer = setTimeout(() => {
      if (!isConsentValid()) {
        setVisible(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [cmsData]);

  // Enter animation
  useEffect(() => {
    if (!visible || !popupRef.current) return;

    gsap.fromTo(
      popupRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: ANIM_DURATION, ease: ANIM_EASE }
    );
  }, [visible]);

  // Accept handler
  const handleAccept = () => {
    if (!popupRef.current) return;

    // 1. Save consent locally
    saveConsent();

    // 2. Send consent to backend API (best-effort, non-blocking)
    const fingerprint = getOrCreateFingerprint();
    sendConsentToAPI(fingerprint);

    // 3. Animate out
    gsap.to(popupRef.current, {
      y: 40,
      opacity: 0,
      duration: ANIM_DURATION,
      ease: 'power3.in',
      onComplete: () => setVisible(false),
    });
  };

  // Render nothing if disabled or no data or already accepted
  if (!cmsData || cmsData.enabled === false || !visible) return null;

  const { 
    title = 'Our Website Uses Cookies', 
    description = 'We use cookies to ensure that we give the best experience on our website.', 
    moreInfoLabel = 'More Info', 
    moreInfoUrl = '/privacy-policy', 
    acceptLabel = 'Accept',
    iconUrl = '',
  } = cmsData;

  // Resolve icon: use CMS value, fallback to default, or null to avoid empty src
  const resolvedIconUrl = iconUrl || '/assets/icons/cookie.svg';

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

      {/* LEFT — Icon + Text */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Cookie icon */}
        <div className="flex-shrink-0 mt-0.5">
          {resolvedIconUrl && <img src={resolvedIconUrl} className='w-8 h-8' alt="Cookie Icon" />}
        </div>

        {/* Text */}
        <div className="min-w-0">
          <p className="text-headline-h6 text-black mb-1">{title}</p>
          <p className="text-body-b5 text-secondary leading-relaxed">{description}</p>
        </div>
      </div>

      {/* RIGHT — Actions */}
      <div className="flex items-end md:items-center gap-4 flex-shrink-0 self-end md:self-auto">
        {/* More Info */}
        <LinknetLink
          as="a"
          href={moreInfoUrl}
          variant="secondary-plain"
          size="md"
          className="underline whitespace-nowrap"
        >
          {moreInfoLabel}
        </LinknetLink>

        {/* Accept Button */}
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
