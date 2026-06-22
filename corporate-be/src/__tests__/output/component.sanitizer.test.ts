/**
 * Component Sanitizer Output Validation Tests
 * MBSS2.0-ApplicationCoding-004: Application output validation
 * 
 * Purpose: Validate that CMS component outputs are properly sanitized
 * and safe for rendering on the frontend.
 */

import { sanitizeComponentData } from '../../utils/componentSanitizer';

describe('Component Sanitizer Output Validation', () => {
  describe('Hero Section Component Output', () => {
    it('should sanitize hero section data correctly', () => {
      const input = {
        type: 'hero-section',
        data: {
          title: '<script>alert("XSS")</script>Hero Title',
          subtitle: 'Safe subtitle',
          cta: {
            text: 'Click <strong>here</strong>',
            link: 'javascript:alert("XSS")',
          },
        },
      };

      const output = sanitizeComponentData(input);

      // Validate output safety
      expect(output.data.title).not.toContain('<script>');
      expect(output.data.cta.link).not.toContain('javascript:');
      expect(output.data.cta.text).toContain('<strong>here</strong>');
    });
  });

  describe('Text Block Component Output', () => {
    it('should preserve safe HTML in text blocks', () => {
      const input = {
        type: 'text-block',
        data: {
          content: '<p>Paragraph with <strong>bold</strong> and <em>italic</em></p>',
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.content).toContain('<p>');
      expect(output.data.content).toContain('<strong>bold</strong>');
      expect(output.data.content).toContain('<em>italic</em>');
    });

    it('should remove dangerous HTML from text blocks', () => {
      const input = {
        type: 'text-block',
        data: {
          content: '<p onclick="malicious()">Text</p><script>alert("XSS")</script>',
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.content).not.toContain('onclick');
      expect(output.data.content).not.toContain('<script>');
      expect(output.data.content).toContain('Text');
    });
  });

  describe('Image Gallery Component Output', () => {
    it('should validate and sanitize image URLs', () => {
      const input = {
        type: 'image-gallery',
        data: {
          images: [
            { url: 'https://example.com/safe.jpg', alt: 'Safe image' },
            { url: 'javascript:alert("XSS")', alt: 'Malicious' },
          ],
        },
      };

      const output = sanitizeComponentData(input);

      // Safe URLs should be preserved
      expect(output.data.images[0].url).toContain('https://');
      // Dangerous URLs should be removed or neutralized
      expect(output.data.images[1].url).not.toContain('javascript:');
    });
  });

  describe('Custom HTML Component Output', () => {
    it('should apply strict sanitization to custom HTML', () => {
      const input = {
        type: 'custom-html',
        data: {
          html: '<div><p>Safe</p><script>alert("XSS")</script></div>',
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.html).toContain('Safe');
      expect(output.data.html).not.toContain('<script>');
    });
  });

  describe('Contact Form Component Output', () => {
    it('should sanitize form field labels and placeholders', () => {
      const input = {
        type: 'contact-form',
        data: {
          fields: [
            { label: '<script>Malicious</script>Name', placeholder: 'Enter name' },
            { label: 'Email', placeholder: 'Enter <strong>email</strong>' },
          ],
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.fields[0].label).not.toContain('<script>');
      expect(output.data.fields[1].placeholder).not.toContain('<strong>');
    });
  });

  describe('Testimonials Component Output', () => {
    it('should sanitize testimonial content and author info', () => {
      const input = {
        type: 'testimonials',
        data: {
          items: [
            {
              quote: '<p>Great service!</p><script>malicious()</script>',
              author: 'John <strong>Doe</strong>',
              position: 'CEO',
            },
          ],
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.items[0].quote).not.toContain('<script>');
      expect(output.data.items[0].quote).toContain('Great service!');
      expect(output.data.items[0].author).not.toContain('<strong>');
    });
  });

  describe('Video Embed Component Output', () => {
    it('should validate video embed URLs', () => {
      const input = {
        type: 'video-embed',
        data: {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      };

      const output = sanitizeComponentData(input);

      // Should allow known video platforms
      expect(output.data.url).toMatch(/^https:\/\/(?:www\.)?(?:youtube\.com|vimeo\.com)\//);
    });

    it('should block non-video URLs in video component', () => {
      const input = {
        type: 'video-embed',
        data: {
          url: 'javascript:alert("XSS")',
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.url).not.toContain('javascript:');
    });
  });

  describe('Accordion Component Output', () => {
    it('should sanitize accordion titles and content', () => {
      const input = {
        type: 'accordion',
        data: {
          items: [
            {
              title: 'Question <script>alert("XSS")</script>',
              content: '<p>Answer with <strong>formatting</strong></p>',
            },
          ],
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.items[0].title).not.toContain('<script>');
      expect(output.data.items[0].content).toContain('<strong>formatting</strong>');
    });
  });

  describe('Call-to-Action Component Output', () => {
    it('should validate CTA button links', () => {
      const input = {
        type: 'call-to-action',
        data: {
          buttons: [
            { text: 'Click Me', url: 'https://example.com' },
            { text: 'Malicious', url: 'javascript:alert("XSS")' },
          ],
        },
      };

      const output = sanitizeComponentData(input);

      expect(output.data.buttons[0].url).toContain('https://');
      expect(output.data.buttons[1].url).not.toContain('javascript:');
    });
  });

  describe('Output Consistency Validation', () => {
    it('should maintain component structure after sanitization', () => {
      const input = {
        type: 'text-block',
        data: {
          content: '<p>Content</p>',
          position: 1,
          visible: true,
        },
      };

      const output = sanitizeComponentData(input);

      // Structure should be preserved
      expect(output).toHaveProperty('type');
      expect(output).toHaveProperty('data');
      expect(output.data).toHaveProperty('position');
      expect(output.data).toHaveProperty('visible');
    });
  });
});
