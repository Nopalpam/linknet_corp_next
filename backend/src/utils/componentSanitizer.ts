import { sanitizeHtmlContent, sanitizePlainText, sanitizeUrl } from './htmlSanitizer';

const HTML_FIELD_NAMES = [
  'content',
  'contentEn',
  'contentId',
  'html',
  'description',
  'descriptionEn',
  'descriptionId',
  'excerpt',
  'excerptEn',
  'excerptId',
  'text',
  'body',
  'quote',
];

const URL_FIELD_NAMES = [
  'url',
  'href',
  'link',
  'src',
  'imageUrl',
  'videoUrl',
  'mediaUrl',
  'thumbnail',
  'poster',
];

const isHtmlField = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return HTML_FIELD_NAMES.some((field) => lowerKey.includes(field.toLowerCase()));
};

const isUrlField = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return URL_FIELD_NAMES.some((field) => lowerKey === field.toLowerCase() || lowerKey.endsWith(field.toLowerCase()));
};

/**
 * Recursively sanitize HTML content in component data
 * This function traverses the component data object and sanitizes
 * all string fields that contain HTML content
 */
export function sanitizeComponentData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeComponentData(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized: any = {};
    
    for (const key of Object.keys(data)) {
      const value = data[key];
      
      if (typeof value === 'string' && isUrlField(key)) {
        sanitized[key] = sanitizeUrl(value);
      } else if (typeof value === 'string' && isHtmlField(key) && value.trim().length > 0) {
        // Sanitize HTML content
        sanitized[key] = sanitizeHtmlContent(value);
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizePlainText(value);
      } else if (typeof value === 'object' || Array.isArray(value)) {
        // Recursively sanitize nested objects/arrays
        sanitized[key] = sanitizeComponentData(value);
      } else {
        // Keep non-HTML fields as is
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Primitive types (strings, numbers, booleans) that are not HTML
  return data;
}

/**
 * Sanitize specific component types with custom logic
 */
export function sanitizeComponentByType(componentType: string, data: any): any {
  // First apply general sanitization
  const sanitized = sanitizeComponentData(data);
  
  // Apply type-specific sanitization if needed
  switch (componentType) {
    case 'text_block':
    case 'rich_text':
      if (sanitized.content) {
        sanitized.content = sanitizeHtmlContent(sanitized.content);
      }
      break;
      
    case 'custom_html':
      // Custom HTML components should still be sanitized
      if (sanitized.html) {
        sanitized.html = sanitizeHtmlContent(sanitized.html);
      }
      if (sanitized.content) {
        sanitized.content = sanitizeHtmlContent(sanitized.content);
      }
      break;
      
    case 'tabbed_content':
      if (sanitized.items && Array.isArray(sanitized.items)) {
        sanitized.items = sanitized.items.map((item: any) => ({
          ...item,
          content: item.content ? sanitizeHtmlContent(item.content) : item.content,
        }));
      }
      if (sanitized.tabs && Array.isArray(sanitized.tabs)) {
        sanitized.tabs = sanitized.tabs.map((tab: any) => ({
          ...tab,
          content: tab.content ? sanitizeHtmlContent(tab.content) : tab.content,
          description: tab.description ? sanitizeHtmlContent(tab.description) : tab.description,
        }));
      }
      break;
      
    case 'business_tab':
      if (sanitized.tabs && Array.isArray(sanitized.tabs)) {
        sanitized.tabs = sanitized.tabs.map((tab: any) => ({
          ...tab,
          content: tab.content ? sanitizeHtmlContent(tab.content) : tab.content,
          description: tab.description ? sanitizeHtmlContent(tab.description) : tab.description,
        }));
      }
      break;
  }
  
  return sanitized;
}

/**
 * Validate that sanitization didn't remove essential content
 */
export function validateSanitizedContent(original: string, sanitized: string): boolean {
  // If original had content but sanitized is empty, something went wrong
  const originalText = original.replace(/<[^>]*>/g, '').trim();
  const sanitizedText = sanitized.replace(/<[^>]*>/g, '').trim();
  
  // Allow sanitization that removes dangerous content
  // but flag if all text content was removed
  if (originalText.length > 0 && sanitizedText.length === 0) {
    return false;
  }
  
  return true;
}
