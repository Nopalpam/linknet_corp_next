import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function DocumentListRenderer({ data, locale }: Props) {
  const sections = data.sections || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t(data.title, locale)}</h2>}
        {sections.length > 0 ? (
          <div className="space-y-10">
            {sections.map((sec: any, i: number) => (
              <div key={i}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">{t(sec.title, locale)}</h3>
                <div className="space-y-2">
                  {(sec.documents || []).map((doc: any, j: number) => (
                    <a key={j} href={doc.file_url || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">{t(doc.title, locale) || doc.file_name}</div>
                          {doc.file_size && <div className="text-xs text-gray-500 mt-0.5">{doc.file_size}</div>}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flat list fallback */
          <div className="space-y-2">
            {(data.documents || []).map((doc: any, i: number) => (
              <a key={i} href={doc.file_url || '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-brand-50/30 transition-colors">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-900">{t(doc.title, locale) || doc.file_name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
