import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function AboutWithMarqueeRenderer({ data, locale }: Props) {
  const intro = data.intro || {};
  const photos = data.photos || [];

  return (
    <div className="py-16">
      {/* Intro */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t(intro.title, locale)}</h2>
        <p className="mt-4 text-lg text-gray-600">{t(intro.description, locale)}</p>
        {t(intro.cta_text, locale) && (
          <a href={intro.cta_link || '#'} className="inline-block mt-6 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
            {t(intro.cta_text, locale)}
          </a>
        )}
      </div>
      {/* Photo marquee */}
      {photos.length > 0 && (
        <div className="overflow-hidden">
          <div
            className="flex gap-4 animate-marquee"
            style={{
              animationDuration: `${data.marquee_speed || 30}s`,
              animationDirection: data.marquee_direction === 'right' ? 'reverse' : 'normal',
            }}
          >
            {[...photos, ...photos].map((photo: any, i: number) => (
              <img key={i} src={photo.url} alt={photo.alt || ''} className="h-48 w-auto rounded-lg flex-shrink-0 object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
