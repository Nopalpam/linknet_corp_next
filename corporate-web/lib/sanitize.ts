/**
 * sanitize.ts — Centralised HTML sanitisation utility.
 *
 * Uses sanitize-html so SSR does not need jsdom or a browser DOM shim.
 *
 * All CMS-sourced rich-text must pass through sanitizeHTML() before being
 * passed to dangerouslySetInnerHTML.
 */

import sanitize from 'sanitize-html';

/**
 * Strip potentially dangerous nodes/attributes from an HTML string.
 *
 * Allowed tags: a subset of safe rich-text elements produced by CKEditor.
 * Allowed attributes: href/src/alt/class/id/target/rel/style/width/height.
 *
 * Returns an empty string when `html` is null/undefined/empty.
 */
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
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: attribs.target || '_blank',
          rel: attribs.rel || 'noopener noreferrer',
        },
      }),
    },
  });
}
