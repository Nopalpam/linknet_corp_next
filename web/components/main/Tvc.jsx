'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Icon from '../base/Icon'; 

gsap.registerPlugin(ScrollTrigger);

export default function TvcSection() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // ANIMASI EXPAND TO FULL WIDTH
      gsap.fromTo(cardRef.current, 
        {
          width: "85%",        // Mulai: Lebar 85% (seperti container)
          borderRadius: "48px", // Mulai: Sudut bulat
        },
        {
          width: "96%",       // Akhir: Lebar 100% (Full Width)
          borderRadius: "32px",  // Akhir: Sudut tajam (menyatu dengan layar)
          ease: "none",        // Linear (dikontrol scroll)
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",   // Mulai saat section masuk dari bawah
            end: "center center",  // Selesai saat section di tengah
            scrub: 1,              // Smooth scrubbing
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    // Section pembungkus (Full Width)
    <section 
      ref={sectionRef} 
      className="flex flex-col items-center justify-center overflow-hidden"
    >

      {/* CARD CONTAINER (Target Animasi) 
          - Kita set mx-auto agar start dari tengah
          - height diset fix (misal 600px) atau aspect-ratio
      */}
      <div 
        ref={cardRef}
        className="relative h-[500px] md:h-[700px] bg-neutral-900 overflow-hidden shadow-2xl mx-auto"
      >
        
        {/* IMAGE ASSET */}
        <img 
          src="https://d2fsl11s4twg7t.cloudfront.net/assets/bg/family-in-livingroom.png" 
          alt="Family in living room" 
          className="w-full h-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-500" />

        {/* CONTENT CENTER */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Play Button */}
          <button className="group relative flex items-center justify-center w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-md border border-white/30 rounded-full transition-transform duration-300 hover:scale-110 hover:bg-white/20 cursor-pointer">
            <Icon name="play" className="text-white w-8 h-8 md:w-12 md:h-12 ml-1" />
          </button>

          <h3 className="mt-8 text-headline-h4 md:text-headline-h2 text-white font-bold drop-shadow-lg text-center px-4">
            Entertainment for everyone.
          </h3>
          
        </div>

      </div>
    </section>
  );
}