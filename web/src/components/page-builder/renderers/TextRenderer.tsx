/**
 * Text Renderer
 * Simple text/content section with design system typography
 * Component type: "text"
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function TextRenderer({ data, locale }: Props) {
  const alignment = data.text_position || data.alignment || 'left';
  const alignClass = alignment === 'center' ? 'text-center mx-auto' : alignment === 'right' ? 'text-right ml-auto' : '';

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className={`container mx-auto px-4 md:px-0 max-w-4xl ${alignClass}`}>
        {data.label && (
          <div className="text-caption-c1 font-bold uppercase text-warning tracking-wider leading-none">
            {t(data.label, locale)}
          </div>
        )}

        {(data.title || data.heading) && (
          <h2 className="text-headline-h3 font-bold text-black mt-3 leading-tight">
            {t(data.title || data.heading, locale)}
          </h2>
        )}

        {data.subtitle && (
          <h3 className="text-body-b3 font-medium text-neutral-600 mt-2">
            {t(data.subtitle, locale)}
          </h3>
        )}

        {(data.description || data.content) && (
          <div
            className="mt-4 text-body-b4 text-secondary leading-relaxed prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: t(data.description || data.content, locale) || '' }}
          />
        )}

        {t(data.cta_text, locale) && (
          <a href={data.cta_link || '#'} className="btn btn-secondary-outline btn-lg mt-6 inline-flex">
            {t(data.cta_text, locale)}
          </a>
        )}
      </div>
    </section>
  );
}
