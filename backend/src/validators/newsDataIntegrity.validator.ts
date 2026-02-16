/**
 * Enhanced News Service with Data Integrity Validation
 * 
 * Control: MBSS2.0-ApplicationCoding-005
 * Enhancements: Added validation for state transitions, data consistency,
 *               and integrity checks during processing
 */

import {
  validateStateTransition,
  validateRequiredFieldsForState,
  validateIncrementSafety,
  DataIntegrityError
} from '../utils/dataIntegrity.util';

/**
 * Content status transition rules
 */
const CONTENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  'DRAFT': ['PUBLISHED', 'ARCHIVED'],
  'PUBLISHED': ['DRAFT', 'ARCHIVED'],
  'ARCHIVED': ['DRAFT']
};

/**
 * Required fields for each content status
 */
const STATUS_REQUIRED_FIELDS: Record<string, string[]> = {
  'PUBLISHED': [
    'titleEn',
    'contentEn',
    'categoryId',
    'thumbnail',
    'newsDate'
  ],
  'DRAFT': ['titleEn', 'categoryId'],
  'ARCHIVED': ['titleEn', 'categoryId']
};

/**
 * Validate news can be published
 */
export function validateNewsPublishable(newsData: any): void {
  validateRequiredFieldsForState(
    newsData,
    'PUBLISHED',
    STATUS_REQUIRED_FIELDS
  );

  // Business rule: News date cannot be in the future for published news
  const newsDate = new Date(newsData.newsDate);
  const now = new Date();
  
  if (newsDate > now) {
    throw new DataIntegrityError(
      'Cannot publish news with future date',
      {
        newsDate: newsDate.toISOString(),
        currentDate: now.toISOString()
      }
    );
  }
}

/**
 * Validate news status transition
 */
export function validateNewsStatusChange(
  currentStatus: string,
  newStatus: string
): void {
  if (currentStatus === newStatus) {
    return; // No change
  }

  validateStateTransition(
    currentStatus,
    newStatus,
    CONTENT_STATUS_TRANSITIONS,
    'News'
  );
}

/**
 * Validate view count increment safety
 */
export async function validateViewCountIncrement(
  newsId: string,
  prisma: any
): Promise<void> {
  const news = await prisma.news.findUnique({
    where: { id: newsId },
    select: { viewCount: true }
  });

  if (!news) {
    throw new DataIntegrityError('News not found', { newsId });
  }

  // Validate increment won't overflow (max 1 billion views)
  validateIncrementSafety(
    news.viewCount || 0,
    1,
    'viewCount',
    1000000000
  );
}

/**
 * Validate news highlight constraints
 */
export async function validateNewsHighlightConstraints(
  newsId: string,
  prisma: any
): Promise<void> {
  // Business rule: Only published news can be highlighted
  const news = await prisma.news.findUnique({
    where: { id: newsId },
    select: { status: true, deletedAt: true }
  });

  if (!news || news.deletedAt) {
    throw new DataIntegrityError('News not found', { newsId });
  }

  if (news.status !== 'PUBLISHED') {
    throw new DataIntegrityError(
      'Only published news can be highlighted',
      { newsId, currentStatus: news.status }
    );
  }

  // Business rule: Maximum 10 highlighted news
  const highlightCount = await prisma.newsHighlight.count();
  
  if (highlightCount >= 10) {
    throw new DataIntegrityError(
      'Maximum number of highlighted news (10) reached',
      { currentCount: highlightCount, maximum: 10 }
    );
  }
}

/**
 * Validate news deletion constraints
 */
export async function validateNewsDeletion(
  newsId: string,
  prisma: any
): Promise<void> {
  // Check if news is currently highlighted
  const highlight = await prisma.newsHighlight.findFirst({
    where: { newsId }
  });

  if (highlight) {
    throw new DataIntegrityError(
      'Cannot delete highlighted news. Remove from highlights first.',
      { newsId }
    );
  }
}

/**
 * Example: Apply validation in news update
 */
export async function validateNewsUpdate(
  newsId: string,
  updateData: any,
  prisma: any
): Promise<void> {
  const existingNews = await prisma.news.findUnique({
    where: { id: newsId },
    select: {
      status: true,
      titleEn: true,
      contentEn: true,
      categoryId: true,
      thumbnail: true,
      newsDate: true,
      deletedAt: true
    }
  });

  if (!existingNews || existingNews.deletedAt) {
    throw new DataIntegrityError('News not found', { newsId });
  }

  // If status is changing, validate the transition
  if (updateData.status && updateData.status !== existingNews.status) {
    validateNewsStatusChange(existingNews.status, updateData.status);

    // If publishing, validate all requirements
    if (updateData.status === 'PUBLISHED') {
      const mergedData = { ...existingNews, ...updateData };
      validateNewsPublishable(mergedData);
    }
  }

  // Validate category exists if being changed
  if (updateData.categoryId && updateData.categoryId !== existingNews.categoryId) {
    const category = await prisma.newsCategory.findUnique({
      where: { id: updateData.categoryId },
      select: { id: true, deletedAt: true }
    });

    if (!category || category.deletedAt) {
      throw new DataIntegrityError(
        'Category not found or has been deleted',
        { categoryId: updateData.categoryId }
      );
    }
  }
}
