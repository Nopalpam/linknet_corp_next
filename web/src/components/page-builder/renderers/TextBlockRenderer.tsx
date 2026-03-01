/**
 * Text Block Renderer
 * Visual design adapted from ln-corporate design system
 * Supports label, title, description, CTA, and background options
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function TextBlockRenderer({ data, locale }: Props) {
  const align = data.text_position || data.align || 'center';
  const alignClass = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-0">
        <div className={`flex flex-col ${alignClass} max-w-4xl ${align === 'center' ? 'mx-auto' : ''}`}>
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
            <p className="text-body-b4 mt-4 text-secondary leading-relaxed md:w-[80%]">
              {t(data.description, locale)}
            </p>
          )}

          {t(data.cta_text, locale) && (
            <div className="mt-6">
              <a
                href={data.cta_link || '#'}
                target={data.cta_target || '_self'}
                className="btn btn-primary btn-lg"
              >
                {t(data.cta_text, locale)}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
