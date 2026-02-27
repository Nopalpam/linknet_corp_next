import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ReportListRenderer({ data, locale, mainData }: Props) {
  const reports = mainData || [];
  const groupByYear = data.group_by_year !== false;

  // Group reports by year
  const grouped = groupByYear
    ? reports.reduce((acc: Record<string, any[]>, r: any) => {
        const year = r.year || (r.publishedAt ? new Date(r.publishedAt).getFullYear().toString() : 'Other');
        if (!acc[year]) acc[year] = [];
        acc[year].push(r);
        return acc;
      }, {} as Record<string, any[]>)
    : null;

  const years = grouped ? Object.keys(grouped).sort((a, b) => b.localeCompare(a)) : [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t(data.title, locale)}</h2>

        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-10">{locale === 'id' ? 'Belum ada laporan.' : 'No reports available.'}</p>
        ) : grouped ? (
          <div className="space-y-10">
            {years.map(year => (
              <div key={year}>
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">{year}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[year].map((r: any) => (
                    <a key={r.id} href={r.file_url || '#'} target="_blank" rel="noopener noreferrer"
                      className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-brand-300 transition-all group">
                      {r.thumbnail && (
                        <div className="h-32 mb-3 overflow-hidden rounded bg-gray-50">
                          <img src={r.thumbnail} alt={t(r.title, locale)} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <h4 className="font-medium text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{t(r.title, locale)}</h4>
                      {r.type && <span className="text-xs text-gray-500 mt-1 block">{r.type}</span>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r: any) => (
              <a key={r.id} href={r.file_url || '#'} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all">
                <h4 className="font-medium text-gray-900 text-sm">{t(r.title, locale)}</h4>
                {r.year && <span className="text-xs text-gray-500">{r.year}</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
