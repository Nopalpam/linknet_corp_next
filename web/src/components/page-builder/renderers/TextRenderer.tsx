/**
 * Text Renderer
 * 
 * Renders a simple text/content section with optional title and rich HTML content.
 * Component type: "text"
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function TextRenderer({ data, locale }: Props) {
  const alignment = data.text_position || data.alignment || 'left';

  return (
    <div className="py-16 px-4">
      <div className={`max-w-4xl mx-auto text-${alignment}`}>
        {data.label && (
          <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
            {t(data.label, locale)}
          </span>
        )}

        {(data.title || data.heading) && (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            {t(data.title || data.heading, locale)}
          </h2>
        )}

        {data.subtitle && (
          <h3 className="text-xl md:text-2xl font-medium text-gray-700 mt-2">
            {t(data.subtitle, locale)}
          </h3>
        )}

        {(data.description || data.content) && (
          <div
            className="mt-4 text-lg text-gray-600 leading-relaxed prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: t(data.description || data.content, locale) || '' }}
          />
        )}

        {t(data.cta_text, locale) && (
          <a
            href={data.cta_link || '#'}
            className="inline-block mt-6 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            {t(data.cta_text, locale)}
          </a>
        )}
      </div>
    </div>
  );
}
