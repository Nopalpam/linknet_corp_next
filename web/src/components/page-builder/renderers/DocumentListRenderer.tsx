/**
 * Document List Renderer
 * Document download list with design system icons
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function DocumentListRenderer({ data, locale }: Props) {
  const sections = data.sections || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-4xl">
        {data.title && (
          <h2 className="text-headline-h3 font-bold text-black text-center mb-10 leading-tight">
            {t(data.title, locale)}
          </h2>
        )}

        {sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((sec: any, i: number) => (
              <div key={i}>
                <h3 className="text-body-b3 font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-3">
                  {t(sec.title, locale)}
                </h3>
                <div className="space-y-2">
                  {(sec.documents || []).map((doc: any, j: number) => (
                    <a key={j} href={doc.file_url || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-light-2 rounded-xl hover:bg-warning/5 border border-neutral-100 hover:border-warning/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="icon icon__document text-red-500 flex-shrink-0" style={{ '--icon-size': '28px' } as React.CSSProperties} />
                        <div>
                          <div className="text-body-b5 font-bold text-neutral-900">{t(doc.title, locale) || doc.file_name}</div>
                          {doc.file_size && <div className="text-caption-c2 text-neutral-400 mt-0.5">{doc.file_size}</div>}
                        </div>
                      </div>
                      <span className="icon icon__download text-neutral-400 group-hover:text-warning transition-colors" style={{ '--icon-size': '20px' } as React.CSSProperties} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(data.documents || []).map((doc: any, i: number) => (
              <a key={i} href={doc.file_url || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-light-2 rounded-xl hover:bg-warning/5 border border-neutral-100 transition-all">
                <span className="icon icon__document text-red-500 flex-shrink-0" style={{ '--icon-size': '24px' } as React.CSSProperties} />
                <span className="text-body-b5 font-bold text-neutral-900">{t(doc.title, locale) || doc.file_name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
