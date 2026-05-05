'use client';

import LinknetLink from '../base/Link';
import SplitText from '../base/text/SplitText';

export default function Hero({
    config,
    as: Tag = "h1",
    logoSrc = "",
    logoSquare,
    labelWithBg,
    labelText = "",
    labelIconSrc = "",
    title = "",
    description = "",
    ctaText = "",
    ctaLink = "#",
    ctaTarget = "_self",
    ctaList,
    bgImageDesktop = "",
    bgImageMobile = "",
    bgColor = "bg-[#FFB800]",
    bgOverlay = false,
    heroSize = "md",
    theme = "light",
    className,
    note
}) {
  // Normalize CTA list: prefer ctaList array, fall back to single ctaText/ctaLink
  const normalizedCtaList = Array.isArray(ctaList) && ctaList.length > 0
    ? ctaList
    : (ctaText ? [{ text: ctaText, href: ctaLink, target: ctaTarget }] : []);
  const {
    sectionId,
    className: configClassName = "",
    bgImage: configBgImageDesktop = "",
    bgImageMobile: configBgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};
  const resolvedBgImageDesktop = configBgImageDesktop || bgImageDesktop;
  const resolvedBgImageMobile = configBgImageMobile || bgImageMobile;
  const sectionStyle = {
    '--bg-image-desktop': resolvedBgImageDesktop ? `url('${resolvedBgImageDesktop}')` : 'none',
    '--bg-image-mobile': resolvedBgImageMobile ? `url('${resolvedBgImageMobile}')` : (resolvedBgImageDesktop ? `url('${resolvedBgImageDesktop}')` : 'none')
  };

  const hasBgImage = resolvedBgImageDesktop || resolvedBgImageMobile;

  // Menentukan class ukuran hero berdasarkan heroSize
  const heightClass = heroSize === 'sm'
    ? 'h-[56vh] md:h-[64vh]'
    : 'h-[68vh] md:h-[70vh]';

  // Kondisi untuk warna text berdasarkan theme
  const isDark = theme === 'dark';

  if (!title && !hasBgImage && !bgColor) return null;

  return (
    <section
        id={sectionId}
        className={`lnSection__heroStatic p-2 pt-0 bg-white
          ${configClassName} ${className}`}
        style={sectionStyle}
    >
        {/* Tambahkan heightClass dinamis ke container ini */}
        <div className={`relative w-full ${heightClass} flex items-center overflow-hidden rounded-[20px] md:rounded-[24px] bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
          bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)] ${!hasBgImage ? bgColor : ''}`}>

            {/* ======================================= */}
            {/* 1. BACKGROUND LAYER (Z-INDEX: 0)        */}
            {/* ======================================= */}
            {hasBgImage && (
                <>
                    {/* Desktop Image: Tetap hanya muncul di layar md ke atas */}
                    {resolvedBgImageDesktop && (
                    <img
                        src={resolvedBgImageDesktop}
                        alt="Hero Background Desktop"
                        className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
                    />
                    )}

                    {/* Mobile Image: Muncul di layar kecil.
                        Jika bgImageMobile tidak ada, dia akan merender bgImageDesktop */}
                    {(resolvedBgImageMobile || resolvedBgImageDesktop) && (
                    <img
                        src={resolvedBgImageMobile || resolvedBgImageDesktop}
                        alt="Hero Background Mobile"
                        className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
                    />
                    )}
                </>
            )}

            {/* ======================================= */}
            {/* 2. OVERLAY LAYER (Z-INDEX: 1)           */}
            {/* ======================================= */}
            {bgOverlay && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#13131356] to-[#13131372] z-[1] pointer-events-none"></div>
            )}

            {/* ======================================= */}
            {/* 3. CONTENT LAYER (Z-INDEX: 10)          */}
            {/* ======================================= */}
            {/* Catatan: Naikkan z-index content agar berada di atas overlay */}
            <div className="relative z-10 w-full p-6 md:p-8 lg:p-12 mx-auto h-full flex flex-col justify-end">
                <div className="max-w-full md:max-w-[560px] flex flex-col items-start gap-2 md:gap-2 animate-fade-in-up">

                    {/* COMPONENT 1: BRAND LOGO */}
                    {logoSrc && (
                    <div className="mb-3">
                        <img
                            src={logoSrc}
                            alt="Brand Logo"
                            className={`w-auto object-contain transition-all duration-300 ${
                                logoSquare
                                ? 'h-16 md:h-18' // Ukuran untuk logo Square
                                : 'h-8 md:h-10'  // Ukuran standar (Landscape)
                            }`}
                        />
                    </div>
                    )}

                    {/* COMPONENT 2: LABEL PILL */}
                    {(labelText || labelIconSrc) && (
                        // Gunakan backticks (`) bukan tanda kutip biasa (')
                        <div className={`inline-flex items-center gap-2.5 ${labelWithBg ? "px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-[2px] text-caption-c1" : "text-body-b5"} mb-1`}>
                            {labelIconSrc && (
                                <img
                                src={labelIconSrc}
                                alt="Icon"
                                className="w-4 h-auto rounded-[1px] shadow-sm"
                                />
                            )}
                            {labelText && (
                                <span className={`font-medium tracking-wide ${isDark ? 'text-white text-shadow-sm' : 'text-black'}`}>
                                    {labelText}
                                </span>
                            )}
                        </div>
                    )}

                    {/* COMPONENT 3: TITLE */}
                    {title && (
                        <Tag className={`text-headline-h3 font-bold tracking-tight drop-shadow-sm ${isDark ? 'text-white text-shadow-sm' : 'text-black'}`}>
                            <SplitText
                                text={title.replace(/<br\s*\/?>/gi, '\n')}
                                delay={240}
                                duration={0.5}
                                ease="power3.out"
                                splitType="lines"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                textAlign="left"
                                className='whitespace-pre-line'
                            />
                        </Tag>
                    )}

                    {/* COMPONENT 4: DESCRIPTION */}
                    {description && (
                        <div className="flex items-start gap-3 max-w-[95%] md:max-w-[85%]">
                            <p className={`text-body-b5 md:text-body-b4 font-regular ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                {description}
                            </p>
                        </div>
                    )}

                    {/* COMPONENT 4: DESCRIPTION */}
                    {note && (
                        <div className="hero__note">
                        {note}
                        </div>
                    )}

                    {/* COMPONENT 5: CTA BUTTONS (ctaList with fallback to ctaText/ctaLink) */}
                    {normalizedCtaList.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            {normalizedCtaList.map((cta, index) => (
                                <LinknetLink
                                    key={cta.id || index}
                                    href={cta.href || cta.url || '#'}
                                    variant={cta.variant || (isDark ? "secondary-outline--white" : "secondary-outline--black")}
                                    size={cta.size || "lg"}
                                    target={cta.target || '_self'}
                                    className="transition-all duration-300 group flex"
                                >
                                    <span>{cta.text || cta.label}</span>
                                </LinknetLink>
                            ))}
                        </div>
                    )}

                </div>
            </div>

        </div>
    </section>
  );
}
