import { t, type Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function HeroSectionRenderer({ data, locale }: Props) {
  const theme = data.theme || 'dark';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div
      className="relative min-h-[500px] flex items-center justify-center"
      style={{
        backgroundImage: data.background_image ? `url(${data.background_image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay */}
      {data.gradient_visible !== false && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
      )}
      <div className={`relative z-10 max-w-4xl mx-auto px-6 text-center ${textColor}`}>
        {t(data.pill_text, locale) && (
          <span className="inline-block px-4 py-1 mb-4 text-sm font-medium bg-white/20 backdrop-blur rounded-full">
            {t(data.pill_text, locale)}
          </span>
        )}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          {t(data.title, locale)}
        </h1>
        <p className="mt-4 text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          {t(data.description, locale)}
        </p>
        {t(data.button_text, locale) && (
          <a
            href={data.button_link || '#'}
            className="inline-block mt-8 px-8 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            {t(data.button_text, locale)}
          </a>
        )}
      </div>
    </div>
  );
}
