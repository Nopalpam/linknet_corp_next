import type { ElementType, HTMLAttributes } from 'react';
import { sanitizeHTML } from '@/lib/sanitize';

type SafeHtmlProps = {
  as?: ElementType;
  html?: string | null;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children'>;

export default function SafeHtml({
  as,
  html,
  className,
  ...props
}: SafeHtmlProps) {
  const Tag = as || 'div';

  return (
    <Tag
      {...props}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
    />
  );
}
