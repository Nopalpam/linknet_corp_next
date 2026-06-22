import slugify from 'slugify';
import prisma from '@config/database';

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Ensure unique slug untuk pages
 * Jika slug sudah ada, append angka (e.g., my-slug-2, my-slug-3)
 */
export const ensureUniquePageSlug = async (
  slug: string,
  excludePageId?: string
): Promise<string> => {
  let uniqueSlug = slug;
  let counter = 2;

  for (;;) {
    const existing = await prisma.page.findFirst({
      where: {
        slug: uniqueSlug,
        ...(excludePageId && { id: { not: excludePageId } }),
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!existing) {
      return uniqueSlug;
    }

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
};

/**
 * Generate unique slug dari title
 */
export const generateUniquePageSlug = async (
  title: string,
  excludePageId?: string
): Promise<string> => {
  const baseSlug = generateSlug(title);
  return ensureUniquePageSlug(baseSlug, excludePageId);
};
