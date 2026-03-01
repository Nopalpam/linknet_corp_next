/**
 * CKEditor / Rich HTML Content Renderer
 * Prose-styled HTML content with design system typography
 */

import type { Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CKEditorRenderer({ data }: Props) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div
        className="container mx-auto px-4 md:px-0 max-w-4xl prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-p:text-secondary prose-a:text-warning hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
      />
    </section>
  );
}
