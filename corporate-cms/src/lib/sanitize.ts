import sanitize from 'sanitize-html';

export function sanitizeHTML(html: string | null | undefined): string {
  if (!html) return '';

  return sanitize(html, {
    allowedTags: [
      'a', 'b', 'strong', 'i', 'em', 'u', 's',
      'br', 'hr', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'div', 'section', 'article',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
      'img', 'figure', 'figcaption',
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'style', 'data-*'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
  });
}
