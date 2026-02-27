import type { Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ImageRenderer({ data }: Props) {
  if (!data.image_url) return null;
  
  const alignClass = data.alignment === 'left' ? 'mr-auto' : data.alignment === 'right' ? 'ml-auto' : 'mx-auto';
  
  return (
    <div className="py-8 px-4">
      <figure className={`max-w-4xl ${alignClass}`}>
        {data.link_url ? (
          <a href={data.link_url}>
            <img src={data.image_url} alt={data.alt_text || ''} className="w-full rounded-lg" />
          </a>
        ) : (
          <img src={data.image_url} alt={data.alt_text || ''} className="w-full rounded-lg" />
        )}
        {data.caption && (
          <figcaption className="mt-2 text-sm text-gray-500 text-center">{data.caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
