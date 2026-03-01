/**
 * About With Marquee / Running Photos Renderer
 * Visual design adapted from ln-corporate AboutWithRunningPhotos.jsx
 * Polaroid-style photo marquee with rotation effects
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AboutWithMarqueeRenderer({ data, locale }: Props) {
  const intro = data.intro || {};
  const photos = data.photos || [];

  const duplicatedPhotos = photos.length > 0 ? [...photos, ...photos, ...photos, ...photos] : [];
  const rotations = ['-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3'];

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      {/* Marquee CSS animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes photo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-photo-marquee {
          display: flex;
          width: max-content;
          animation: photo-marquee ${data.marquee_speed || 35}s linear infinite;
        }
        .animate-photo-marquee:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="container mx-auto px-4 md:px-0">
        {/* Section Intro */}
        {(t(intro.label, locale) || t(intro.title, locale)) && (
          <div className="mb-8 md:mb-12">
            {t(intro.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(intro.label, locale)}
              </div>
            )}
            {t(intro.title, locale) && (
              <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
                {t(intro.title, locale)}
              </h2>
            )}
            {t(intro.description, locale) && (
              <p className="text-body-b4 text-secondary mt-4 max-w-2xl">
                {t(intro.description, locale)}
              </p>
            )}
            {t(intro.cta_text, locale) && (
              <a href={intro.cta_link || '#'} className="btn btn-secondary-outline btn-lg mt-6 inline-flex">
                {t(intro.cta_text, locale)}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Running Photos — Full Width */}
      {duplicatedPhotos.length > 0 && (
        <div className="w-full relative pb-10 pt-4">
          {/* Fade mask left/right */}
          <div className="absolute inset-0 z-10 pointer-events-none [mask-image:_linear-gradient(to_right,white_0%,transparent_5%,transparent_95%,white_100%)] bg-white/50 hidden md:block" />

          <div className="animate-photo-marquee gap-6 md:gap-10 px-4 md:px-0 items-center">
            {duplicatedPhotos.map((photo: any, index: number) => {
              const rotateClass = rotations[index % rotations.length];
              const src = typeof photo === 'string' ? photo : photo.url;
              const alt = typeof photo === 'string' ? `Photo ${index}` : (photo.alt || `Photo ${index}`);

              return (
                <div
                  key={index}
                  className={`flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:z-20 ${rotateClass}`}
                >
                  {/* Polaroid Style Card */}
                  <div className="bg-white p-2 pb-8 md:p-3 md:pb-12 shadow-lg rounded-sm w-[240px] md:w-[320px]">
                    <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                      <img
                        src={src}
                        alt={alt}
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
