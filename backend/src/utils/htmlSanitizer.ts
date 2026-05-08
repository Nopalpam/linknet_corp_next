import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes while preserving safe formatting
 */
export function sanitizeHtmlContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      // Text formatting
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'del',
      'ins',
      'sub',
      'sup',
      'small',
      'mark',
      
      // Headings
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      
      // Lists
      'ul',
      'ol',
      'li',
      
      // Links and media
      'a',
      'img',
      'video',
      'audio',
      'source',
      
      // Tables
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'th',
      'td',
      'caption',
      'col',
      'colgroup',
      
      // Block elements
      'div',
      'span',
      'blockquote',
      'pre',
      'code',
      'hr',
      
      // Semantic elements
      'article',
      'section',
      'aside',
      'header',
      'footer',
      'nav',
      'figure',
      'figcaption',
    ],
    
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      video: ['src', 'width', 'height', 'controls', 'autoplay', 'loop', 'muted', 'poster'],
      audio: ['src', 'controls', 'autoplay', 'loop', 'muted'],
      source: ['src', 'type'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      table: ['border', 'cellpadding', 'cellspacing'],
      '*': ['class', 'id', 'style'], // Allow class, id, and limited style on all tags
    },
    
    allowedStyles: {
      '*': {
        // Allow safe CSS properties
        color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/],
        'text-align': [/^left$/, /^right$/, /^center$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        'font-weight': [/^\d+$/, /^bold$/, /^normal$/],
        'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/],
        'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
        width: [/^\d+(?:px|em|rem|%)$/],
        height: [/^\d+(?:px|em|rem|%)$/],
        margin: [/^\d+(?:px|em|rem|%)$/],
        padding: [/^\d+(?:px|em|rem|%)$/],
      },
    },
    
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      video: ['http', 'https'],
      audio: ['http', 'https'],
      source: ['http', 'https'],
    },
    
    // Enforce attributes
    transformTags: {
      a: (tagName, attribs) => {
        // Add rel="noopener noreferrer" for external links
        const href = attribs.href || '';
        if (href.startsWith('http') && !href.includes(process.env.FRONTEND_URL || '')) {
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              rel: 'noopener noreferrer',
              target: attribs.target || '_blank',
            },
          };
        }
        return { tagName, attribs };
      },
      img: (_tagName, attribs) => {
        // Add loading="lazy" for images if not present
        return {
          tagName: 'img',
          attribs: {
            ...attribs,
            loading: attribs.loading || 'lazy',
          },
        };
      },
    },
  });
}

/**
 * Validate HTML content length
 * Counts text content only (strips HTML tags)
 */
export function validateHtmlLength(html: string, maxLength: number): boolean {
  const text = sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return text.length <= maxLength;
}

/**
 * Get text content from HTML (strips all tags)
 */
export function getTextFromHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Sanitize a string for plain-text fields.
 */
export function sanitizePlainText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Validate and normalize URLs used in CMS component metadata.
 */
export function sanitizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
    return allowedProtocols.has(parsed.protocol) ? trimmed : '';
  } catch {
    return '';
  }
}

/**
 * Truncate HTML content to specified length
 * Preserves HTML structure while limiting text length
 */
export function truncateHtml(html: string, maxLength: number, ellipsis = '...'): string {
  const text = getTextFromHtml(html);
  
  if (text.length <= maxLength) {
    return html;
  }
  
  // Simple truncation (for more advanced, consider using a library like truncate-html)
  const truncated = text.substring(0, maxLength) + ellipsis;
  return sanitizeHtmlContent(`<p>${truncated}</p>`);
}

/**
 * Check if HTML content is empty or only contains whitespace
 */
export function isHtmlEmpty(html: string): boolean {
  const sanitized = sanitizeHtmlContent(html);
  const text = getTextFromHtml(sanitized).trim();
  if (text.length > 0) return false;

  return !/<(img|video|audio|source)\b[^>]*(src|poster)=["'][^"']+["']/i.test(sanitized);
}

/**
 * Strict sanitization for user-generated content
 * More restrictive than the default sanitization
 */
export function sanitizeUserContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
    },
  });
}
