import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function InfoContactsRenderer({ data, locale }: Props) {
  const contacts = data.contacts || [];

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{t(data.title, locale)}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((c: any, i: number) => (
            <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
                {c.icon === 'phone' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                )}
                {c.icon === 'email' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                )}
                {c.icon === 'location' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                {!['phone', 'email', 'location'].includes(c.icon) && <span className="text-lg">{c.icon || '📞'}</span>}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{t(c.label, locale)}</h3>
                <p className="text-gray-600 text-sm mt-0.5">{t(c.value, locale)}</p>
                {c.link && (
                  <a href={c.link} className="text-brand-600 hover:underline text-sm mt-1 inline-block">{t(c.link_text, locale) || 'Details'}</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
