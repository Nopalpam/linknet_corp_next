/**
 * Info Contacts Renderer
 * Visual design adapted from ln-corporate/components/main/InfoContact.jsx
 * Pill-style contact buttons with icons
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function InfoContactsRenderer({ data, locale }: Props) {
  const contacts = data.contacts || data.items || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        {/* HEADER */}
        {(t(data.label, locale) || t(data.title, locale)) && (
          <div className="mb-10 text-center">
            {t(data.label, locale) && (
              <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
                {t(data.label, locale)}
              </div>
            )}
            {t(data.title, locale) && (
              <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
                {t(data.title, locale)}
              </h2>
            )}
            {t(data.description, locale) && (
              <p className="text-body-b4 mt-4 text-secondary leading-relaxed mx-auto md:w-[60%]">
                {t(data.description, locale)}
              </p>
            )}
          </div>
        )}

        {/* CONTACT BUTTONS (PILL STYLE) */}
        {contacts.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {contacts.map((c: any, i: number) => (
              <a
                key={i}
                href={c.link || c.href || '#'}
                target={c.target || '_self'}
                rel={c.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 px-6 md:px-8 py-3 bg-light-1 hover:!bg-neutral-50 transition-colors duration-300 rounded-[32px] md:rounded-full border border-transparent hover:border-neutral-200 w-full sm:w-auto group"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <span
                    className={`icon icon__${c.icon || 'mail'} text-neutral-700 group-hover:text-yellow-500 transition-colors`}
                    style={{ '--icon-size': '24px' } as React.CSSProperties}
                  />
                </div>
                {/* Text */}
                <div>
                  <div className="text-body-b4 font-bold text-neutral-800">
                    {t(c.label, locale)}
                  </div>
                  {t(c.value, locale) && (
                    <div className="text-body-b5 text-neutral-500">
                      {t(c.value, locale)}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
