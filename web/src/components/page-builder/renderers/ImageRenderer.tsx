/**
 * Image Renderer
 * Responsive image with optional caption and link
 */

import type { Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function ImageRenderer({ data }: Props) {
  if (!data.image_url) return null;
  
  const alignClass = data.alignment === 'left' ? 'mr-auto' : data.alignment === 'right' ? 'ml-auto' : 'mx-auto';
  
  return (
    <section className="py-8 md:py-12 bg-white">
      <figure className={`container mx-auto px-4 md:px-0 max-w-4xl ${alignClass}`}>
        {data.link_url ? (
          <a href={data.link_url} className="block rounded-2xl overflow-hidden">
            <img src={data.image_url} alt={data.alt_text || ''} className="w-full" />
          </a>
        ) : (
          <div className="rounded-2xl overflow-hidden">
            <img src={data.image_url} alt={data.alt_text || ''} className="w-full" />
          </div>
        )}
        {data.caption && (
          <figcaption className="mt-3 text-caption-c1 text-secondary text-center">
            {data.caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
