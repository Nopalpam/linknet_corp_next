import { z } from 'zod';
import { sanitizeHtmlContent, validateHtmlLength, isHtmlEmpty } from '../utils/htmlSanitizer';

/**
 * Validation schema for rich text content
 */
export const richTextSchema = z.string()
  .transform((val) => sanitizeHtmlContent(val))
  .refine((val) => !isHtmlEmpty(val), {
    message: 'Content cannot be empty',
  });

/**
 * Validation schema for rich text with max length
 */
export const richTextWithLengthSchema = (maxLength: number) =>
  z.string()
    .transform((val) => sanitizeHtmlContent(val))
    .refine((val) => !isHtmlEmpty(val), {
      message: 'Content cannot be empty',
    })
    .refine((val) => validateHtmlLength(val, maxLength), {
      message: `Content exceeds maximum length of ${maxLength} characters`,
    });

/**
 * Validation schema for optional rich text
 */
export const richTextOptionalSchema = z.string()
  .optional()
  .transform((val) => val ? sanitizeHtmlContent(val) : undefined);

/**
 * Example usage in a news/blog post schema
 */
export const newsPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  content: richTextWithLengthSchema(50000), // Max 50k characters
  excerpt: richTextOptionalSchema,
  featuredImageId: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.date().optional(),
});

export type NewsPostInput = z.infer<typeof newsPostSchema>;
