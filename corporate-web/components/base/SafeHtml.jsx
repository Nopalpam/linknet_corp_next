import { sanitizeHTML } from '@/lib/sanitize';

export default function SafeHtml({
  as: Tag = 'div',
  html,
  className,
  ...props
}) {
  return (
    <Tag
      {...props}
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(html) }}
    />
  );
}
