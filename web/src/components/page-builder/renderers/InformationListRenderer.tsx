/**
 * Information List Renderer
 * Generic information page with sections, articles, and documents
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function InformationListRenderer({ data, locale }: Props) {
  const sections = data.sections || [];
  const articles = data.articles || [];
  const documents = data.documents || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        {data.title && <h2 className="text-headline-h3 font-bold text-black text-center mb-12 leading-tight">{t(data.title, locale)}</h2>}

        {/* HTML Sections */}
        {sections.length > 0 && (
          <div className="space-y-8 mb-12">
            {sections.map((s: any, i: number) => (
              <div key={i} className="prose prose-neutral max-w-none text-body-b4 text-secondary">
                {s.title && <h3 className="text-body-b3 font-bold text-black mb-3">{t(s.title, locale)}</h3>}
                <div dangerouslySetInnerHTML={{ __html: t(s.content, locale) || '' }} />
              </div>
            ))}
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {articles.map((a: any, i: number) => (
              <div key={i} className="bg-light-2 rounded-2xl border border-neutral-100 p-6 hover:shadow-sm transition-all">
                <h3 className="text-body-b4 font-bold text-neutral-900">{t(a.title, locale)}</h3>
                <p className="mt-2 text-caption-c2 text-secondary line-clamp-3">{t(a.summary, locale)}</p>
                {a.link && (
                  <a href={a.link} className="mt-3 inline-flex items-center gap-1 text-warning text-caption-c2 font-medium hover:underline">
                    {t(a.link_text, locale) || 'Read more'}
                    <span className="icon icon__arrow-right" style={{ '--icon-size': '14px' } as React.CSSProperties} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-body-b3 font-bold text-black mb-4">{t(data.documents_title, locale) || 'Documents'}</h3>
            {documents.map((d: any, i: number) => (
              <a key={i} href={d.file_url || d.link || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-light-2 rounded-xl border border-neutral-100 hover:border-warning/30 hover:shadow-sm transition-all group">
                <span className="icon icon__document text-warning flex-shrink-0" style={{ '--icon-size': '20px' } as React.CSSProperties} />
                <span className="text-body-b5 font-medium text-neutral-700 group-hover:text-warning transition-colors">{t(d.title, locale) || d.file_name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
