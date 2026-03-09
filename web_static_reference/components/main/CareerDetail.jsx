'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

import HeroStatic from './HeroStatic';
import CardCareer from '../base/cards/CardCareer';
import Intro from '../base/section/Intro'; 
import LinknetLink from '../base/Link'; 
import Icon from '../base/Icon'; 
import Button from '../base/Button'; 

export default function CareerDetail({ 
  career, 
  relatedCareers = [] 
}) {

    const params = useParams();
    const locale = params.locale || 'en';


  // 1. STATE UNTUK SHARE FITUR
  const [isCopied, setIsCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  // Karena ada 2 dropdown (desktop & mobile) yang di-render bersaman namun di-hide via CSS, 
  // kita pisahkan ref-nya agar klik di luar (outside click) bekerja sempurna.
  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  // 2. LOGIKA KLIK DI LUAR DROPDOWN
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target);
      const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!career) return null;

  // 3. FUNGSI SHARE URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Let's join Linknet and become First Squad! Check out this role: ${career.title}`;

    const handleCopyLink = () => {
    const url = window.location.href;

    // Fungsi sukses
    const onCopySuccess = () => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsShareOpen(false);
      }, 2000);
    };

    // Fungsi Fallback (Cara lama untuk copy text)
    const fallbackCopy = (text) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Sembunyikan elemen textarea dari layar
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        onCopySuccess();
      } catch (err) {
        console.error('Gagal menyalin tautan via fallback', err);
      }
      
      document.body.removeChild(textArea);
    };

    // Cek apakah Clipboard API modern tersedia (Biasanya hanya di HTTPS atau localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(onCopySuccess)
        .catch(() => fallbackCopy(url)); // Jika modern gagal, pakai fallback
    } else {
      // Jika tidak ada Clipboard API, langsung pakai fallback
      fallbackCopy(url);
    }
  };

  const openShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    let url = '';

    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'threads':
        url = `https://threads.net/intent/post?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    setIsShareOpen(false); 
  };

  return (
    <main className="relative bg-white pb-28 md:pb-16">
      
      {/* 1. HERO SECTION */}
      <HeroStatic 
        as="h1"
        labelText={career.department}
        title={career.title}
        bgImageDesktop='/assets/bg/bg-career-detail.jpg'
        bgColor="bg-[#FFB800]"
        theme="light"
        heroSize="sm"
        ctaText="" 
        className=""
        note={
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-body-b5 text-shadow-sm text-black border border-white/10">
                <Icon name="briefcase-filled" style={{ '--icon-size': '14px' }} />
                <span className="font-regular">{career.employment_type}</span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-body-b5 text-shadow-sm text-black border border-white/10">
                <Icon name="pin-filled" style={{ '--icon-size': '14px' }} />
                <span className="font-regular line-clamp-1">{career.location}</span>
            </div>
          </div>
        }
      />

      {/* 2. MAIN CONTENT & SIDEBAR */}
      <section className="container py-6 md:py-12">
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16 relative">
          
          {/* --- KIRI: Rich Text Content --- */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-10">
            {career.description && (
              <div>
                <h2 className="text-headline-h5 font-bold text-black mb-4">About the Role</h2>
                <div className="text-body-b4 text-black space-y-3" dangerouslySetInnerHTML={{ __html: career.description }} />
              </div>
            )}
            {career.requirements && (
              <div>
                <h2 className="text-headline-h5 font-bold text-black mb-4">Requirements</h2>
                <div className="text-body-b4 text-black" dangerouslySetInnerHTML={{ __html: career.requirements }} />
              </div>
            )}
            {career.benefit && (
              <div>
                <h2 className="text-headline-h5 font-bold text-black mb-4">Benefit</h2>
                <div className="text-body-b4 text-black" dangerouslySetInnerHTML={{ __html: career.benefit }} />
              </div>
            )}
          </div>

          {/* --- KANAN: Desktop Sticky Sidebar --- */}
          <div className="hidden md:block w-full md:w-1/3 lg:w-1/4">
            <div className="sticky top-28 border border-gray-100 rounded-[16px] p-6 shadow-lg bg-white">
              
              <LinknetLink 
                href={career.applyURL || "#"}
                variant='primary'
                size='md'
                className="w-full flex justify-center mb-3"
              >
                Apply this Position
              </LinknetLink>
              
              {/* --- BAGIAN SHARE (DESKTOP) --- */}
                <div className="relative" ref={desktopDropdownRef}>
                    <Button
                        variant='secondary-outline'
                        onClick={() => setIsShareOpen(!isShareOpen)}
                        className="flex items-center justify-between w-full"
                        iconLeft={<Icon name="share" />}
                    >
                        <span className="flex items-center gap-2">
                        Share Now
                        </span>
                    </Button>

                    {/* Dropdown Desktop (Muncul ke bawah: top-full mt-2) */}
                    {isShareOpen && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-neutral-200 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <button onClick={handleCopyLink} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                                <Icon name={isCopied ? "check" : "copy"} style={{ '--icon-size': '18px' }} />
                                {isCopied ? "Tautan Disalin!" : "Salin Tautan"}
                            </button>
                            <div className="h-px w-full bg-neutral-100"></div>
                            
                            <button onClick={() => openShare('whatsapp')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                                <Icon name="whatsapp" style={{ '--icon-size': '18px' }} />
                                WhatsApp
                            </button>
                            
                            <button onClick={() => openShare('facebook')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                                <Icon name="facebook" style={{ '--icon-size': '18px' }} />
                                Facebook
                            </button>
                            
                            <button onClick={() => openShare('linkedin')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                                <Icon name="linkedin" style={{ '--icon-size': '18px' }} />
                                LinkedIn
                            </button>
                            
                            <button onClick={() => openShare('twitter')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                                <Icon name="twitter-x" style={{ '--icon-size': '18px' }} />
                                X (Twitter)
                            </button>
                            
                            <button onClick={() => openShare('threads')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                                <Icon name="threads" style={{ '--icon-size': '18px' }} />
                                Threads
                            </button>
                        </div>
                    )}
                </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. OTHERS SECTION (Related Careers) */}
        {relatedCareers && relatedCareers.length > 0 && (
        <section className="container mx-auto px-4 md:px-8 max-w-7xl pt-10 pb-16 border-t border-gray-100">
            <div className="mb-8">
                <Intro title="Others" align="left" as="h2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Cukup map relatedCareers secara langsung */}
            {relatedCareers.map((job) => (
                <CardCareer 
                key={job.id}
                department={job.department}
                title={job.title}
                type={job.employment_type}
                location={job.location}
                applyUrl={job.applyURL}
                // Perhatikan locale-nya, jika sebelumnya memakai id, kita harus tangani locale-nya. 
                // Contoh menggunakan next/navigation:
                detailUrl={job.detailURL} 
                />
            ))}
            </div>
            <div className="flex justify-center">
            <LinknetLink 
                href={`/${locale}/life-at-linknet/career`} 
                variant='secondary-outline'
                size='lg'
                className="transition-colors">
                    Back to Career
            </LinknetLink>
            </div>
        </section>
        )}

      {/* 4. MOBILE STICKY WIDGET */}
      <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 p-4 pb-safe z-[60] md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center gap-3">
        
        {/* --- BAGIAN SHARE (MOBILE) --- */}
        <div className="relative shrink-0" ref={mobileDropdownRef}>
            <Button
                variant='secondary-outline'
                onClick={() => setIsShareOpen(!isShareOpen)}
                className="flex items-center justify-center p-3.5"
                iconLeft={<Icon name="share" />}
            />

            {/* Dropdown Mobile (Muncul ke atas: bottom-full mb-2, animasi dari bawah) */}
            {isShareOpen && (
                <div className="absolute bottom-full left-0 mb-3 w-56 bg-white border border-neutral-200 rounded-xl shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.15)] z-50 flex flex-col overflow-hidden animate-in z-50 fade-in slide-in-from-bottom-2">
                    <button onClick={handleCopyLink} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                        <Icon name={isCopied ? "check" : "copy"} style={{ '--icon-size': '18px' }} />
                        {isCopied ? "Tautan Disalin!" : "Salin Tautan"}
                    </button>
                    <div className="h-px w-full bg-neutral-100"></div>
                    
                    <button onClick={() => openShare('whatsapp')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                        <Icon name="whatsapp" style={{ '--icon-size': '18px' }} />
                        WhatsApp
                    </button>
                    
                    <button onClick={() => openShare('facebook')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                        <Icon name="facebook" style={{ '--icon-size': '18px' }} />
                        Facebook
                    </button>
                    
                    <button onClick={() => openShare('linkedin')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                        <Icon name="linkedin" style={{ '--icon-size': '18px' }} />
                        LinkedIn
                    </button>
                    
                    <button onClick={() => openShare('twitter')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                        <Icon name="twitter-x" style={{ '--icon-size': '18px' }} />
                        X (Twitter)
                    </button>
                    
                    <button onClick={() => openShare('threads')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left w-full">
                        <Icon name="threads" style={{ '--icon-size': '18px' }} />
                        Threads
                    </button>
                </div>
            )}
        </div>
        
        {/* Tombol Apply */}
        <LinknetLink 
          href={career.applyURL || "#"}
          className="w-full flex justify-center items-center py-3.5 rounded-full bg-[#FFB800] text-gray-900 font-semibold hover:bg-yellow-500 transition-colors"
        >
          Apply this Position
        </LinknetLink>
      </div>

    </main>
  );
}