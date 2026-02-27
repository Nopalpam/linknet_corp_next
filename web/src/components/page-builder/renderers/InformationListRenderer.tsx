import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function InformationListRenderer({ data, locale }: Props) {
  const sections = data.sections || [];
  const articles = data.articles || [];
  const documents = data.documents || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t(data.title, locale)}</h2>}

        {/* HTML Sections */}
        {sections.length > 0 && (
          <div className="space-y-8 mb-12">
            {sections.map((s: any, i: number) => (
              <div key={i} className="prose prose-lg max-w-none">
                {s.title && <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(s.title, locale)}</h3>}
                <div dangerouslySetInnerHTML={{ __html: t(s.content, locale) || '' }} />
              </div>
            ))}
          </div>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {articles.map((a: any, i: number) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-900">{t(a.title, locale)}</h3>
                <p className="mt-2 text-gray-600 text-sm line-clamp-3">{t(a.summary, locale)}</p>
                {a.link && (
                  <a href={a.link} className="mt-3 inline-block text-brand-600 text-sm font-medium hover:underline">
                    {t(a.link_text, locale) || 'Read more'} →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t(data.documents_title, locale) || 'Documents'}</h3>
            {documents.map((d: any, i: number) => (
              <a key={i} href={d.file_url || d.link || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-brand-50 transition-colors">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700 text-sm font-medium">{t(d.title, locale) || d.file_name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
