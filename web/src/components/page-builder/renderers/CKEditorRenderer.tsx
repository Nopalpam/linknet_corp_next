import type { Locale } from '@/lib/i18n';

interface Props { data: Record<string, any>; locale: Locale; mainData?: any }

export function CKEditorRenderer({ data }: Props) {
  return (
    <div className="py-12 px-4">
      <div
        className="max-w-4xl mx-auto prose prose-lg dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: data.content || '' }}
      />
    </div>
  );
}
