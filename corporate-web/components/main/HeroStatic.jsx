'use client';

import CTAList from '../base/section/CTAList';
import SplitText from '../base/text/SplitText';

function normalizeTitleLineBreaks(value = '') {
    let normalized = '';
    let index = 0;

    while (index < value.length) {
        if (value[index] === '<') {
            const tagEnd = value.indexOf('>', index + 1);

            if (tagEnd !== -1) {
                const tagName = value.slice(index + 1, tagEnd).trim().toLowerCase();

                if (tagName === 'br' || tagName === 'br/') {
                    normalized += '\n';
                    index = tagEnd + 1;
                    continue;
                }
            }
        }

        normalized += value[index];
        index += 1;
    }

    return normalized;
}

function getBackgroundUtilityClassName(className = '') {
  return className
    .split(/\s+/)
    .filter((token) => (
      token.startsWith('bg-') ||
      token.startsWith('from-') ||
      token.startsWith('via-') ||
      token.startsWith('to-')
    ))
    .join(' ');
}

function resolveGradientColor(token = '') {
  const color = token.replace(/^(from|via|to)-/, '');
  const arbitrary = color.match(/^\[(.+)\]$/);

  if (arbitrary) return arbitrary[1];

  const colorMap = {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  };

  return colorMap[color] || null;
}

function getGradientBackgroundStyle(className = '') {
  const tokens = className.split(/\s+/).filter(Boolean);
  const directionToken = tokens.find((token) => token.startsWith('bg-gradient-to-'));
  if (!directionToken) return {};

  const directionMap = {
    t: 'top',
    tr: 'top right',
    r: 'right',
    br: 'bottom right',
    b: 'bottom',
    bl: 'bottom left',
    l: 'left',
    tl: 'top left',
  };
  const direction = directionMap[directionToken.replace('bg-gradient-to-', '')] || 'bottom';
  const fromColor = resolveGradientColor(tokens.find((token) => token.startsWith('from-')) || '');
  const viaColor = resolveGradientColor(tokens.find((token) => token.startsWith('via-')) || '');
  const toColor = resolveGradientColor(tokens.find((token) => token.startsWith('to-')) || '');

  if (!fromColor && !toColor) return {};

  const stops = [fromColor, viaColor, toColor].filter(Boolean);
  return {
    backgroundImage: `linear-gradient(to ${direction}, ${stops.join(', ')})`,
  };
}

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
  // Normalize CTA list: an explicit empty ctaList means "render no CTA".
  const normalizedCtaList = Array.isArray(ctaList)
    ? ctaList.filter((cta) => cta && (cta.text || cta.label))
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

  const hasBgImage = resolvedBgImageDesktop || resolvedBgImageMobile;

  // Menentukan class ukuran hero berdasarkan heroSize
  const heightClass = heroSize === 'sm'
    ? 'h-[560px] md:h-[520px]'
    : 'h-[600px] md:h-[660px]';

  // Kondisi untuk warna text berdasarkan theme
  const isDark = theme === 'dark';
  const backgroundUtilityClassName = getBackgroundUtilityClassName(`${configClassName} ${className}`);
  const gradientBackgroundStyle = getGradientBackgroundStyle(`${configClassName} ${className}`);

  if (!title && !hasBgImage && !bgColor) return null;

  return (
    <section
        id={sectionId}
        className={`lnSection__heroStatic p-2 pt-0
          ${configClassName} ${className}`}
    >
        {/* Tambahkan heightClass dinamis ke container ini */}
        <div className={`relative w-full ${heightClass} flex items-center overflow-hidden rounded-[20px] md:rounded-[24px] bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
          ${!hasBgImage ? bgColor : ''} ${backgroundUtilityClassName}`}
          style={gradientBackgroundStyle}
        >

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
                                text={normalizeTitleLineBreaks(title)}
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
                            <p className={`text-body-b5 font-regular ${isDark ? 'text-white' : 'text-neutral-900'}`}>
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
                        <CTAList
                          ctaList={normalizedCtaList}
                          className="mt-4"
                          ctaClassName="transition-all duration-300 group flex"
                          defaultVariant={isDark ? "secondary-outline--white" : "secondary-outline--black"}
                          defaultSize="lg"
                        />
                    )}

                </div>
            </div>

        </div>
    </section>
  );
}
