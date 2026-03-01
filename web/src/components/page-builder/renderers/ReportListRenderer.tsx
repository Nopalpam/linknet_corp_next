/**
 * Report List Renderer
 * Annual reports / financial documents with design system
 */

import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ReportListRenderer({ data, locale, mainData }: Props) {
  const reports = mainData || [];
  const groupByYear = data.group_by_year !== false;

  const grouped = groupByYear
    ? reports.reduce((acc: Record<string, any[]>, r: any) => {
        const year = r.year || (r.publishedAt ? new Date(r.publishedAt).getFullYear().toString() : 'Other');
        if (!acc[year]) acc[year] = [];
        acc[year].push(r);
        return acc;
      }, {} as Record<string, any[]>)
    : null;

  const years = grouped ? Object.keys(grouped).sort((a, b) => b.localeCompare(a)) : [];

  const ReportCard = ({ r }: { r: any }) => (
    <a href={r.file_url || '#'} target="_blank" rel="noopener noreferrer"
      className="bg-light-2 rounded-2xl border border-neutral-100 p-5 hover:shadow-md hover:border-warning/30 transition-all group flex flex-col">
      {r.thumbnail && (
        <div className="h-32 mb-3 overflow-hidden rounded-xl bg-white flex items-center justify-center">
          <img src={r.thumbnail} alt={t(r.title, locale)} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform" />
        </div>
      )}
      <h4 className="text-body-b5 font-bold text-neutral-900 group-hover:text-warning transition-colors">{t(r.title, locale)}</h4>
      {r.type && <span className="text-caption-c2 text-secondary mt-1 block">{r.type}</span>}
      <div className="mt-auto pt-3">
        <span className="text-caption-c2 text-warning font-medium flex items-center gap-1">
          <span className="icon icon__download" style={{ '--icon-size': '14px' } as React.CSSProperties} />
          Download
        </span>
      </div>
    </a>
  );

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 md:px-0 max-w-5xl">
        <h2 className="text-headline-h3 font-bold text-black text-center mb-10 leading-tight">{t(data.title, locale)}</h2>

        {reports.length === 0 ? (
          <p className="text-body-b4 text-secondary text-center py-10">{locale === 'id' ? 'Belum ada laporan.' : 'No reports available.'}</p>
        ) : grouped ? (
          <div className="space-y-12">
            {years.map(year => (
              <div key={year}>
                <h3 className="text-body-b3 font-bold text-black mb-4 pb-2 border-b border-neutral-100">{year}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {grouped[year].map((r: any) => <ReportCard key={r.id} r={r} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r: any) => <ReportCard key={r.id} r={r} />)}
          </div>
        )}
      </div>
    </section>
  );
}
