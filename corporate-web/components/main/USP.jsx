'use client';

import { useRef, useLayoutEffect } from 'react';
import React from 'react';

import { useTranslations } from 'next-intl';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { globalData } from '../../messages/globalData-en'; 


// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function UspSection({ cmsData = null }) {
  const sectionRef = useRef(null);

  const { usp } = globalData;


  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Animasi muncul halus saat scroll
      gsap.from(".usp-content", {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.3,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const t = useTranslations('global.usp');
  const uspListRaw = t.raw('list');
  const uspList = cmsData?.items || uspListRaw;

  return (
    <section 
      ref={sectionRef} 
      className="w-full py-16 md:py-24 pt-32"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          {uspList.map((item, index) => (
            <React.Fragment key={index}>
              {/* Konten USP */}
              <div className="usp-content flex-1 text-center md:px-10">
                <h3 className="text-white font-bold text-body-b3 md:text-xl tracking-wider uppercase mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-400 text-sm md:text-base">
                  {item.desc}
                </p>
              </div>

              {/* Divider: Hanya muncul di antara item (bukan setelah item terakhir) dan hanya di desktop */}
              {index < usp.list.length - 1 && (
                <div className="hidden md:block w-[1px] h-16 bg-white/20" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}