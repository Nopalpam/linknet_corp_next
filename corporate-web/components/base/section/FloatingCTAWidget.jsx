'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

const DEFAULT_ITEMS = [
  {
    id: 'download-katalog',
    label: 'Download Katalog',
    href: '#',
    iconSrc: '/assets/icons/floating/download.svg',
  },
  {
    id: 'whatsapp',
    label: 'Kirim Pesan Whatsapp',
    href: 'https://wa.me/6280000000000',
    iconSrc: '/assets/icons/floating/whatsapp.svg',
  },
  {
    id: 'form-inquiry',
    label: 'Isi Form Inquiry',
    href: '#',
    iconSrc: '/assets/icons/floating/chat.svg',
  },
];

export default function FloatingCTAWidget({
  items = DEFAULT_ITEMS,
  className = '',
  defaultOpen = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const closeButtonRef = useRef(null);
  const launcherRef = useRef(null);
  const launcherIconRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);

    gsap.set(listRef.current, {
      autoAlpha: defaultOpen ? 1 : 0,
      y: defaultOpen ? 0 : 12,
      pointerEvents: defaultOpen ? 'auto' : 'none',
    });
    gsap.set(cards, {
      autoAlpha: defaultOpen ? 1 : 0,
      x: defaultOpen ? 0 : 32,
      y: defaultOpen ? 0 : 12,
      scale: defaultOpen ? 1 : 0.96,
    });
    gsap.set(closeButtonRef.current, {
      autoAlpha: defaultOpen ? 1 : 0,
      scale: defaultOpen ? 1 : 0.82,
      pointerEvents: defaultOpen ? 'auto' : 'none',
    });
    gsap.set(launcherRef.current, {
      autoAlpha: defaultOpen ? 0 : 1,
      scale: defaultOpen ? 0.82 : 1,
      pointerEvents: defaultOpen ? 'none' : 'auto',
    });
    gsap.set(launcherIconRef.current, {
      rotate: defaultOpen ? 90 : 0,
    });
  }, [defaultOpen]);

  useEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

    if (isOpen) {
      tl.set(listRef.current, {
        pointerEvents: 'auto',
      })
        .to(
          launcherRef.current,
          {
            autoAlpha: 0,
            scale: 0.82,
            duration: 0.18,
            ease: 'power2.inOut',
            onComplete: () => {
              if (launcherRef.current) launcherRef.current.style.pointerEvents = 'none';
            },
          },
          0
        )
        .to(
          listRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.2,
            ease: 'power2.out',
          },
          0.04
        )
        .fromTo(
          cards,
          {
            autoAlpha: 0,
            x: 36,
            y: 14,
            scale: 0.96,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.45,
            stagger: 0.08,
            ease: 'back.out(1.22)',
          },
          0.06
        )
        .fromTo(
          closeButtonRef.current,
          {
            autoAlpha: 0,
            scale: 0.82,
          },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.28,
            ease: 'power2.out',
            onStart: () => {
              if (closeButtonRef.current) closeButtonRef.current.style.pointerEvents = 'auto';
            },
          },
          0.18
        );
    } else {
      tl.to(closeButtonRef.current, {
        autoAlpha: 0,
        scale: 0.82,
        duration: 0.16,
        ease: 'power2.in',
        onComplete: () => {
          if (closeButtonRef.current) closeButtonRef.current.style.pointerEvents = 'none';
        },
      })
        .to(
          cards,
          {
            autoAlpha: 0,
            x: 36,
            y: 14,
            scale: 0.96,
            duration: 0.22,
            stagger: {
              each: 0.05,
              from: 'end',
            },
            ease: 'power2.in',
          },
          0
        )
        .to(
          listRef.current,
          {
            autoAlpha: 0,
            y: 12,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => {
              if (listRef.current) listRef.current.style.pointerEvents = 'none';
            },
          },
          0.04
        )
        .to(
          launcherRef.current,
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.22,
            ease: 'power2.out',
            onStart: () => {
              if (launcherRef.current) launcherRef.current.style.pointerEvents = 'auto';
            },
          },
          0.12
        );
    }
  }, [isOpen]);


  return (
    <div ref={rootRef} className={`fixed bottom-5 right-5 z-[9999] ${className}`.trim()}>
      <div className="relative flex items-end justify-end">
        <div
          ref={listRef}
          className="absolute bottom-[68px] md:bottom-[80px] right-0 flex w-max max-w-[calc(100vw-48px)] flex-col items-end gap-2.5"
          aria-hidden={!isOpen}
        >
          {items.map((item, index) => {
            const content = (
              <>
                <Image
                  src={item.iconSrc}
                  alt=""
                  className="h-[28px] w-[28px] shrink-0"
                  aria-hidden="true"
                  width={28}
                  height={28}
                />
                <span className="text-body-b4 font-medium leading-none text-[#31343B]">
                  {item.label}
                </span>
              </>
            );

            const sharedProps = {
              ref: (element) => {
                cardRefs.current[index] = element;
              },
              className:
                'flex h-[56px] w-auto items-center gap-2 rounded-full border border-[#f3f3f3] bg-white px-[24px] py-[10px] text-left shadow-md outline-none',
            };

            if (item.href) {
              return (
                <a
                  key={item.id || item.label}
                  {...sharedProps}
                  href={item.href}
                  target={item.target}
                  rel={item.target === '_blank' ? 'noreferrer' : undefined}
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={item.id || item.label}
                {...sharedProps}
                type="button"
                onClick={item.onClick}
              >
                {content}
              </button>
            );
          })}
        </div>

        <button
          ref={launcherRef}
          type="button"
          aria-expanded={isOpen}
          aria-label="Open floating CTA widget"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary shadow-[0_8px_24px_rgba(251,191,36,0.5)] transition-transform duration-200 active:scale-95"
        >
          <span ref={launcherIconRef} className="inline-flex">
            <Image
              src="/assets/icons/floating/menu-square.svg"
              alt=""
              className="h-7 w-7"
              aria-hidden="true"
              width={28}
              height={28}
            />
          </span>
        </button>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => setIsOpen(false)}
          aria-hidden={!isOpen}
          aria-label="Close floating CTA widget"
          className="fixed bottom-5 right-5 cursor-pointer flex h-12 w-12 items-center justify-center rounded-full bg-white text-secondary border border-[#f3f3f3] shadow-md"
        >
          <X className="h-[24px] w-[24px]" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
