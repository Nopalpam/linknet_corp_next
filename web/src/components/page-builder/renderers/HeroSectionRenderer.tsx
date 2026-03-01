/**
 * Hero Section Renderer
 * Visual design adapted from ln-corporate/components/main/Hero.jsx
 * Data-driven from Page Builder component_data
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function HeroSectionRenderer({ data, locale }: Props) {
  const bgImageDesktop = data.background_image || data.bg_image_desktop || '';
  const bgImageMobile = data.bg_image_mobile || bgImageDesktop;
  const bgColor = data.bg_color || '#FFB800';
  const hasBgImage = bgImageDesktop || bgImageMobile;

  return (
    <div className="p-2 pt-0 bg-white">
      <div
        className={`relative w-full h-[68vh] min-h-[600px] max-h-[900px] flex items-center overflow-hidden rounded-[20px] md:rounded-[24px] ${
          !hasBgImage ? '' : ''
        }`}
        style={!hasBgImage ? { backgroundColor: bgColor } : undefined}
      >
        {/* BACKGROUND LAYER */}
        {hasBgImage && (
          <>
            {bgImageDesktop && (
              <img
                src={bgImageDesktop}
                alt="Hero Background"
                className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
              />
            )}
            {bgImageMobile && bgImageMobile !== bgImageDesktop && (
              <img
                src={bgImageMobile}
                alt="Hero Background Mobile"
                className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
              />
            )}
          </>
        )}

        {/* Gradient overlay */}
        {data.gradient_visible !== false && hasBgImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-[1]" />
        )}

        {/* CONTENT LAYER */}
        <div className="relative z-10 w-full p-6 md:p-8 lg:p-12 mx-auto h-full flex flex-col justify-end">
          <div className="max-w-full md:max-w-[560px] flex flex-col items-start gap-2 md:gap-2">
            {/* BRAND LOGO */}
            {data.logo_src && (
              <div className="mb-2">
                <img
                  src={data.logo_src}
                  alt="Brand Logo"
                  className="h-8 md:h-10 w-auto object-contain"
                />
              </div>
            )}

            {/* LABEL PILL */}
            {t(data.pill_text, locale) && (
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-[2px] border border-neutral-900/5">
                <span className="text-caption-c1 font-medium text-black tracking-wide">
                  {t(data.pill_text, locale)}
                </span>
              </div>
            )}

            {/* TITLE */}
            <h1 className="text-headline-h3 font-medium text-black tracking-tight drop-shadow-sm">
              {t(data.title, locale)}
            </h1>

            {/* DESCRIPTION */}
            {t(data.description, locale) && (
              <div className="flex items-start gap-3 max-w-[95%] md:max-w-[85%]">
                <p className="text-body-b5 md:text-body-b4 text-neutral-900 font-regular">
                  {t(data.description, locale)}
                </p>
              </div>
            )}

            {/* CTA BUTTON */}
            {t(data.button_text, locale) && (
              <div className="mt-4">
                <a
                  href={data.button_link || '#'}
                  target={data.button_target || '_self'}
                  className="btn btn-secondary-outline btn-lg !border-neutral-900 !text-neutral-900 hover:!border-white hover:bg-neutral-900 hover:text-white transition-all duration-300"
                >
                  {t(data.button_text, locale)}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
