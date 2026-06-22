'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Icon from '../base/Icon'; // Sesuaikan path jika berbeda
import Button from '../base/Button'; // Sesuaikan path jika berbeda

function stripHtml(input = '') {
  let output = '';
  let insideTag = false;
  let lastWasSpace = false;

  for (const char of String(input)) {
    if (char === '<') {
      insideTag = true;
      if (!lastWasSpace) {
        output += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    if (char === '>') {
      insideTag = false;
      continue;
    }

    if (insideTag) continue;

    const isWhitespace = char.trim() === '';
    if (isWhitespace) {
      if (!lastWasSpace) {
        output += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    output += char;
    lastWasSpace = false;
  }

  return output.trim();
}

function formatNewsDate(value, locale, timeZone) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    console.error('[News Detail] invalid news date', { value });
    return '';
  }

  const options = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };

  try {
    return date.toLocaleDateString(locale, { ...options, timeZone });
  } catch (error) {
    console.error('[News Detail] invalid timezone, using runtime default', {
      timeZone,
      error: error instanceof Error ? error.message : String(error),
    });
    return date.toLocaleDateString(locale, options);
  }
}

export default function NewsDetail({ article, settings = {} }) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const [isCopied, setIsCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef(null);

  // 1. Kalkulasi Estimasi Waktu Baca Otomatis
  const readingTime = useMemo(() => {
    const content = article?.content || article?.content_en || article?.content_id || '';
    if (!content) return 1;
    const text = stripHtml(content);
    const words = text.split(/\s+/).length;
    const wpm = 200; // Rata-rata kecepatan baca: 200 kata per menit
    return Math.ceil(words / wpm);
  }, [article?.content, article?.content_en, article?.content_id]);

  // 2. Logic Klik di Luar untuk Menutup Dropdown Share
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 3. Fungsi Social Media Share URLs
  const getShareUrl = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(article?.title || 'Link Net News');
    
    switch (platform) {
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'linkedin': return `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
      case 'twitter': return `https://twitter.com/intent/tweet?url=${url}&text=${title}`; // X
      case 'threads': return `https://threads.net/intent/post?text=${title}%20${url}`;
      case 'whatsapp': return `https://api.whatsapp.com/send?text=${title}%20${url}`;
      default: return '#';
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;

    // Fungsi sukses
    const onCopySuccess = () => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
        setIsShareMenuOpen(false);
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
    window.open(getShareUrl(platform), '_blank', 'noopener,noreferrer');
    setIsShareMenuOpen(false);
  };

  if (!article) return null;

  const localizedValue = (value, fallback = '') => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value[locale] || value.en || value.id || fallback;
    }

    return value || fallback;
  };

  const title = locale === 'id' && article.title_id ? article.title_id : (article.title || article.title_en || '');
  const content = locale === 'id' && article.content_id ? article.content_id : (article.content || article.content_en || '');
  const excerpt = locale === 'id' && article.excerpt_id ? article.excerpt_id : (article.excerpt || article.excerpt_en || '');
  const image = article.image || article.news_thumbnail || '';
  const newsDate = article.newsDate || article.news_date;
  const category = article.news_categories || article.category || {};
  const categoryLabel = locale === 'id' && category.name_id ? category.name_id : (category.label || category.name_en || category.name || 'News');
  const mediaContacts = Array.isArray(settings.general_branding?.media_contacts?.items)
    ? settings.general_branding.media_contacts.items
    : [];
  const aboutTitle = locale === 'id' ? 'Tentang Linknet' : 'About Linknet';
  const aboutContent = localizedValue(settings.general_branding?.about?.content);
  const timezone = settings.general_branding?.site?.timezone || 'Asia/Jakarta';
  const dateLocale = locale === 'id' ? 'id-ID' : 'en-US';
  const formattedNewsDate = formatNewsDate(newsDate, dateLocale, timezone);

  return (
    <article className="min-h-screen">
      <div className="px-2 md:px-3 pt-0">
        
        {/* HERO SECTION DENGAN GAMBAR BACKGROUND */}
        <div 
          className="relative w-full rounded-[24px] min-h-[600px] md:min-h-[640px] flex flex-col justify-end bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        >
          {/* Overlay Gradient (Semakin gelap ke bawah agar teks & tombol terbaca) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20 rounded-[24px]"></div>
          
          <div className="container relative z-10 py-8 md:py-8">
            {/* CONTENT POSISI DI BOTTOM HERO */}
            <header className="max-w-4xl mx-auto">
              <span className="text-caption-c1 uppercase tracking-widest text-yellow-500 font-bold mb-3 md:mb-4 block drop-shadow-md">
                {categoryLabel}
              </span>
              
              <h1 className="text-headline-h3 md:text-headline-h3 font-bold text-white leading-tight mb-6 md:mb-4 drop-shadow-lg">
                {title}
              </h1>
              
              <div className="flex flex-row md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5 md:gap-4 text-body-b5 text-neutral-200 font-regular">
                  <time dateTime={newsDate} className='font-medium'>
                    {formattedNewsDate}
                  </time>
                  <div className="w-1 h-1 rounded-full bg-neutral-400 hidden md:block"></div>
                  <div className="flex items-center gap-1">
                    <Icon name="flash" style={{ '--icon-size': '18px' }} className="text-neutral-300" />
                    <span>Waktu Baca {readingTime} Menit</span>
                  </div>
                </div>

                {/* CONTAINER TOMBOL BAGIKAN & DROPDOWN */}
                <div className="relative" ref={shareMenuRef}>
                  <Button
                    variant='secondary-outline'
                    size='md'
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                    // Custom style agar tombol terlihat estetik di atas gambar gelap (Glassmorphism)
                    className={`flex transition-all hover:border-white hover:!text-black ${
                      isShareMenuOpen 
                        ? '!bg-white !text-black border-white' 
                        : 'bg-white/10 !text-white border-white/40 backdrop-blur-sm hover:bg-white/20'
                    }`}
                    iconLeft={<Icon name="share" style={{ '--icon-size': '18px' }} />}
                  >
                    <span>Bagikan</span>
                  </Button>

                  {/* SHARE DROPDOWN */}
                  {isShareMenuOpen && (
                    <div className="absolute bottom-full mb-3 left-0 md:left-auto md:right-0 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      
                      <button onClick={handleCopyLink} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left">
                        <Icon name={isCopied ? "check" : "copy"} style={{ '--icon-size': '18px' }} />
                        {isCopied ? "Tautan Disalin!" : "Salin Tautan"}
                      </button>
                      <div className="h-px w-full bg-neutral-100"></div>
                      
                      <button onClick={() => openShare('whatsapp')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left">
                        <Icon name="whatsapp" style={{ '--icon-size': '18px' }} />
                        WhatsApp
                      </button>
                      
                      <button onClick={() => openShare('facebook')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left">
                        <Icon name="facebook" style={{ '--icon-size': '18px' }} />
                        Facebook
                      </button>
                      
                      <button onClick={() => openShare('linkedin')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left">
                        <Icon name="linkedin" style={{ '--icon-size': '18px' }} />
                        LinkedIn
                      </button>
                      
                      <button onClick={() => openShare('twitter')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left">
                        <Icon name="twitter-x" style={{ '--icon-size': '18px' }} />
                        X (Twitter)
                      </button>
                      
                      <button onClick={() => openShare('threads')} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-sm font-medium text-black transition-colors text-left">
                        {/* Jika icon threads belum ada, gunakan text atau icon default */}
                        <Icon name="threads" style={{ '--icon-size': '18px' }} />
                        Threads
                      </button>

                    </div>
                  )}
                </div>
              </div>
            </header>
          </div>
        </div>

        {/* BODY CONTENT SECTION */}
        <div className="container">
          {/* EXCERPT dipindahkan ke sini sebagai ringkasan pembuka */}
          {excerpt && (
             <div className="md:max-w-4xl mx-auto mt-10 text-body-b4 font-regular text-neutral-500 italic border-l-2 border-yellow-500 pl-4 md:pl-6">
               {excerpt}
             </div>
          )}

          <div 
            className={`
              md:max-w-4xl mx-auto text-black text-body-b4 mt-8 md:mt-10 leading-relaxed 
              
              /* Typography Dasar */
              [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4
              
              /* Breakout Teknik untuk Gambar di Dalam Konten */
              [&_img]:w-[90vw] [&_img]:max-w-5xl 
              [&_img]:ml-[50%] [&_img]:-translate-x-1/2 
              [&_img]:rounded-xl md:[&_img]:rounded-2xl 
              [&_img]:my-10 [&_img]:shadow-sm
            `}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {/* ========================================= */}
          {/* TAMBAHAN: SEPARATOR TIGA TITIK */}
          {/* ========================================= */}
          <div className="md:max-w-4xl mx-auto text-center mt-8 mb-12">
            <span className="text-3xl font-bold tracking-[8px] text-neutral-800">
              <Icon name="view-more"></Icon>
            </span>
          </div>

          {/* ========================================= */}
          {/* TAMBAHAN: KONTAK PERS */}
          {/* ========================================= */}
          {mediaContacts.length > 0 && (
          <div className="md:max-w-4xl mx-auto mb-16 p-6 md:p-8 border border-neutral-100 bg-white rounded-[16px] md:rounded-[20px]">
            <h3 className="text-body-b2 font-bold text-black mb-4 md:mb-4">
              {locale === 'id' ? 'Kontak Media' : 'Media Contacts'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
              {mediaContacts.map((contact, index) => (
                <div key={`${contact.email || contact.name || 'contact'}-${index}`}>
                  <h4 className="text-body-b4 font-medium text-black mb-1">{contact.name}</h4>
                  {(contact.role || contact.position) && (
                    <p className="text-body-b5 text-secondary mb-2">{contact.role || contact.position}</p>
                  )}
                  <div className="text-body-b5 text-secondary space-y-1">
                    {contact.phone && <p>M: {contact.phone}</p>}
                    {contact.email && <p>E: {contact.email}</p>}
                  </div>
                </div>
              ))}

            </div>
          </div>
          )}

          {/* ========================================= */}
          {/* TAMBAHAN: TENTANG LINKNET */}
          {/* ========================================= */}
          {aboutContent && (
          <div className="md:max-w-4xl mx-auto mb-20 md:mb-32">
            <h3 className="text-body-b5 font-medium text-neutral-400 mb-4">{aboutTitle}</h3>
            
            <div
              className="text-body-b5 text-neutral-300 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: aboutContent }}
            />
          </div>
          )}

        </div>
      </div>
    </article>
  );
}
