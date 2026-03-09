'use client';

import Icon from '../base/Icon'; // Sesuaikan path import
import Button from '../base/Button'; // Sesuaikan path import


import { globalData } from '../../messages/globalData-en'; 

export default function Footer() {
  
  // Logic Scroll to Top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

    const { contact } = globalData;

  return (
    <footer className="relative bg-[#020202] text-white pt-10 overflow-hidden">
        
        {/* --- CONTAINER --- */}
        <div className="relative z-10 container mx-auto px-6">

            {/* 1. TOP ROW: Navigation & Socials */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0">
                
                {/* Left: Text Links */}
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 gap-y-0 md:gap-8 text-sm font-medium text-neutral-200">
                    <a href="mailto:contact@firstmedia.com" target='_blank' className="btn btn-secondary-plain btn-lg">
                        Advertise with Us
                    </a>
                    <a href="http://wa.me/6287790508830" target='_blank' className="btn btn-secondary-plain btn-lg">
                        Contact Us
                    </a>
                    
                    {/* Back To Top Button */}
                    <Button variant="secondary-plain" size="lg" onClick={scrollToTop} iconRight={<Icon name="chevron-up" />}>
                        Back to Top
                    </Button>
                </div>

                {/* Right: Social Media Icons */}
                <div className="flex items-center gap-6">
                    {contact.list.map((item) => (
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
                            style={{ '--icon-size': '28px' }} 
                        />
                        </a>
                    ))}
                </div>
            </div>

            {/* 2. DIVIDER LINE */}
            <div className="w-full h-[1px] bg-white/10 my-6" />

            {/* 3. COPYRIGHT */}
            <p className="text-body-b5 text-neutral-500 mb-12 text-center md:text-left">
                2025 © One Stream part of PT Link Net Tbk.
            </p>

            {/* 4. LOGOS ROW */}
            <div className="flex flex-row items-center md:items-start justify-center md:justify-start gap-8 mb-6 md:mb-4">
                {/* Pastikan file logo tersedia di folder publichttps://d2fsl11s4twg7t.cloudfront.net/assets/logo/ */}
                
                {/* Logo One Stream+ */}
                <img 
                    src="https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-onestreamplus-white.png" 
                    alt="One Stream+" 
                    className="h-6 md:h-7 w-auto object-contain" 
                />
                
                {/* Logo One Stream */}
                <img 
                    src="https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-onestream-white.svg" 
                    alt="One Stream" 
                    className="h-6 md:h-7 w-auto object-contain opacity-80" 
                />
            </div>

        </div>

        {/* --- 5. GIANT BACKGROUND TEXT (WATERMARK) --- */}
        {/* Pointer-events-none agar tidak mengganggu klik */}
        <div className="relative bottom-0 left-0 right-0 pointer-events-none select-none flex justify-center overflow-hidden translate-y-[0%] md:mb-[-10]">
            <img 
                src="https://d2fsl11s4twg7t.cloudfront.net/assets/bg/footer.svg" 
                alt="One Stream Watermark" 
                className="w-full h-auto max-w-[1600px] opacity-[0.4]" // Opacity 3% sesuai desain teks sebelumnya
            />
        </div>

    </footer>
  );
}