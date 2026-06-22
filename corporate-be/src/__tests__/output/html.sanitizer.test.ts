/**
 * Output Validation Tests: HTML Sanitizer
 * MBSS2.0-ApplicationCoding-004: Application output validation
 * 
 * Purpose: Validate that HTML outputs are properly sanitized and safe
 * for display, preventing XSS while preserving legitimate content.
 */

import {
  sanitizeHtmlContent,
  validateHtmlLength,
  isHtmlEmpty,
  sanitizeUserContent,
  getTextFromHtml as extractTextFromHtml,
  truncateHtml,
} from '../../utils/htmlSanitizer';

describe('HTML Sanitizer Output Validation', () => {
  describe('XSS Prevention in Outputs', () => {
    it('should remove script tags from output', () => {
      const malicious = '<p>Safe content</p><script>alert("XSS")</script>';
      const output = sanitizeHtmlContent(malicious);
      
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
      expect(output).toContain('Safe content');
    });

    it('should remove event handlers from output', () => {
      const malicious = '<div onclick="alert(\'XSS\')">Click me</div>';
      const output = sanitizeHtmlContent(malicious);
      
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('alert');
    });

    it('should remove javascript: protocol from links', () => {
      const malicious = '<a href="javascript:alert(\'XSS\')">Click</a>';
      const output = sanitizeHtmlContent(malicious);
      
      expect(output).not.toContain('javascript:');
    });

    it('should remove data: protocol from images', () => {
      const malicious = '<img src="data:text/html,<script>alert(\'XSS\')</script>">';
      const output = sanitizeHtmlContent(malicious);
      
      expect(output).not.toContain('data:text/html');
      expect(output).not.toContain('<script>');
    });

    it('should handle nested malicious content', () => {
      const malicious = '<div><p><script>alert("XSS")</script></p></div>';
      const output = sanitizeHtmlContent(malicious);
      
      expect(output).not.toContain('<script>');
      expect(output).toContain('<div>');
      expect(output).toContain('<p>');
    });
  });

  describe('Safe Content Preservation', () => {
    it('should preserve safe HTML formatting', () => {
      const safe = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      const output = sanitizeHtmlContent(safe);
      
      expect(output).toContain('<strong>Bold</strong>');
      expect(output).toContain('<em>italic</em>');
    });

    it('should preserve safe links', () => {
      const safe = '<a href="https://example.com">Visit Site</a>';
      const output = sanitizeHtmlContent(safe);
      
      expect(output).toContain('href="https://example.com"');
      expect(output).toContain('Visit Site');
    });

    it('should preserve images with safe URLs', () => {
      const safe = '<img src="https://example.com/image.jpg" alt="Test">';
      const output = sanitizeHtmlContent(safe);
      
      expect(output).toContain('src="https://example.com/image.jpg"');
      expect(output).toContain('alt="Test"');
    });

    it('should preserve lists and structure', () => {
      const safe = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const output = sanitizeHtmlContent(safe);
      
      expect(output).toContain('<ul>');
      expect(output).toContain('<li>');
      expect(output).toContain('Item 1');
    });
  });

  describe('Output Length Validation', () => {
    it('should validate HTML length correctly', () => {
      const content = '<p>Short content</p>';
      
      expect(validateHtmlLength(content, 100)).toBe(true);
      expect(validateHtmlLength(content, 5)).toBe(false);
    });

    it('should count text length, not HTML tags', () => {
      const content = '<p><strong>Text</strong></p>';
      
      // "Text" is 4 characters
      expect(validateHtmlLength(content, 5)).toBe(true);
      expect(validateHtmlLength(content, 3)).toBe(false);
    });
  });

  describe('Empty Content Detection', () => {
    it('should detect truly empty HTML', () => {
      expect(isHtmlEmpty('')).toBe(true);
      expect(isHtmlEmpty('<p></p>')).toBe(true);
      expect(isHtmlEmpty('<div><p></p></div>')).toBe(true);
    });

    it('should detect content with only whitespace', () => {
      expect(isHtmlEmpty('<p>   </p>')).toBe(true);
      expect(isHtmlEmpty('<p>\n\t</p>')).toBe(true);
    });

    it('should not consider non-empty content as empty', () => {
      expect(isHtmlEmpty('<p>Content</p>')).toBe(false);
      expect(isHtmlEmpty('<img src="test.jpg">')).toBe(false);
    });
  });

  describe('Text Extraction from HTML', () => {
    it('should extract plain text from HTML', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const text = extractTextFromHtml(html);
      
      expect(text).toBe('Hello World');
      expect(text).not.toContain('<');
      expect(text).not.toContain('>');
    });

    it('should handle nested HTML correctly', () => {
      const html = '<div><p>Paragraph 1</p><p>Paragraph 2</p></div>';
      const text = extractTextFromHtml(html);
      
      expect(text).toContain('Paragraph 1');
      expect(text).toContain('Paragraph 2');
    });
  });

  describe('HTML Truncation', () => {
    it('should truncate HTML while preserving structure', () => {
      const html = '<p>This is a very long paragraph that needs truncation</p>';
      const truncated = truncateHtml(html, 20);
      
      expect(truncated.length).toBeLessThan(html.length);
      expect(truncated).toContain('<p>');
      expect(truncated).toContain('</p>');
    });
  });

  describe('User Content Sanitization', () => {
    it('should apply stricter rules for user content', () => {
      const userContent = '<p>User text</p><script>malicious()</script>';
      const output = sanitizeUserContent(userContent);
      
      expect(output).not.toContain('<script>');
      expect(output).toContain('User text');
    });
  });

  describe('Output Consistency', () => {
    it('should produce consistent output for same input', () => {
      const input = '<p>Test content <strong>bold</strong></p>';
      
      const output1 = sanitizeHtmlContent(input);
      const output2 = sanitizeHtmlContent(input);
      
      expect(output1).toBe(output2);
    });

    it('should handle edge cases gracefully', () => {
      expect(sanitizeHtmlContent('')).toBe('');
      expect(sanitizeHtmlContent('plain text')).toBe('plain text');
      expect(() => sanitizeHtmlContent('<>')).not.toThrow();
    });
  });
});
