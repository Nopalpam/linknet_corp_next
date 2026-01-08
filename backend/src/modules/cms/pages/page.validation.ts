import { z } from 'zod';
import { PageStatus, PageTemplate } from '@prisma/client';

// Slug validation: lowercase, alphanumeric with dashes only
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  slug: z
    .string()
    .regex(slugRegex, 'Slug must be lowercase, alphanumeric with dashes only')
    .min(1, 'Slug is required')
    .max(255, 'Slug is too long')
    .optional(),
  template: z.nativeEnum(PageTemplate).default(PageTemplate.DEFAULT),
  metaTitle: z.string().max(255, 'Meta title is too long').optional(),
  metaDescription: z.string().max(500, 'Meta description is too long').optional(),
  metaKeywords: z.string().max(500, 'Meta keywords is too long').optional(),
  ogImage: z.string().url('Invalid OG image URL').optional(),
  status: z.nativeEnum(PageStatus).default(PageStatus.DRAFT),
});

export const updatePageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  slug: z
    .string()
    .regex(slugRegex, 'Slug must be lowercase, alphanumeric with dashes only')
    .min(1, 'Slug is required')
    .max(255, 'Slug is too long')
    .optional(),
  template: z.nativeEnum(PageTemplate).optional(),
  metaTitle: z.string().max(255, 'Meta title is too long').optional(),
  metaDescription: z.string().max(500, 'Meta description is too long').optional(),
  metaKeywords: z.string().max(500, 'Meta keywords is too long').optional(),
  ogImage: z.string().url('Invalid OG image URL').optional().nullable(),
  status: z.nativeEnum(PageStatus).optional(),
});

export const pageQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.nativeEnum(PageStatus).optional(),
  template: z.nativeEnum(PageTemplate).optional(),
  createdById: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'publishedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageQueryInput = z.infer<typeof pageQuerySchema>;
