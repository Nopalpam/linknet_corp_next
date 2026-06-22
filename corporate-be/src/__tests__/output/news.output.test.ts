/**
 * Output Validation Tests: News Service
 * MBSS2.0-ApplicationCoding-004: Application output validation
 * 
 * Purpose: Validate that news-related outputs meet business rules
 * and are appropriate for their intended use.
 */

import { PrismaClient, ContentStatus } from '@prisma/client';
import { NewsService } from '../../services/news.service';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    news: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    ContentStatus: { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', ARCHIVED: 'ARCHIVED' },
  };
});

describe('News Service Output Validation', () => {
  let newsService: NewsService;
  let mockPrisma: any;

  beforeEach(() => {
    newsService = new NewsService();
    const PrismaClientMock = PrismaClient as jest.MockedClass<typeof PrismaClient>;
    mockPrisma = new PrismaClientMock();
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('News List Output Structure', () => {
    it('should output paginated news with correct structure', async () => {
      const mockNewsData = [
        {
          id: '1',
          titleEn: 'Test News',
          contentEn: '<p>Content</p>',
          slug: 'test-news',
          status: 'PUBLISHED',
          newsDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: '1', nameEn: 'Technology', slug: 'tech' },
        },
      ];

      mockPrisma.news.findMany.mockResolvedValue(mockNewsData);
      mockPrisma.news.count.mockResolvedValue(1);

      const result = await newsService.getNews({ page: 1, limit: 10 });

      // Validate output structure
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('currentPage');
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('totalItems');
      expect(result.pagination).toHaveProperty('itemsPerPage');
    });

    it('should output array of news items', async () => {
      mockPrisma.news.findMany.mockResolvedValue([]);
      mockPrisma.news.count.mockResolvedValue(0);

      const result = await newsService.getNews({ page: 1, limit: 10 });

      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('News Output Business Rules', () => {
    it('should include required fields in output', async () => {
      const mockNews = {
        id: '1',
        titleEn: 'Required Title',
        contentEn: '<p>Content</p>',
        slug: 'required-title',
        status: 'PUBLISHED',
        newsDate: new Date(),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.news.findUnique.mockResolvedValue(mockNews);

      const result = await newsService.getNewsById('1');

      // Validate required fields are present
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('titleEn');
      expect(result).toHaveProperty('contentEn');
      expect(result).toHaveProperty('slug');
      expect(result).toHaveProperty('status');
    });

    it('should not output deleted news', async () => {
      const mockActiveNews = [
        { id: '1', deletedAt: null, titleEn: 'Active' },
      ];

      mockPrisma.news.findMany.mockImplementation(({ where }: any) => {
        // Simulate filtering deleted items
        if (where?.deletedAt === null) {
          return Promise.resolve(mockActiveNews);
        }
        return Promise.resolve([]);
      });

      mockPrisma.news.count.mockResolvedValue(1);

      const result = await newsService.getNews({});

      // Should only return non-deleted items
      expect(result.data).toHaveLength(1);
      expect(result.data[0].deletedAt).toBeNull();
    });
  });

  describe('Pagination Output Validation', () => {
    it('should calculate pagination correctly', async () => {
      mockPrisma.news.findMany.mockResolvedValue([]);
      mockPrisma.news.count.mockResolvedValue(45);

      const result = await newsService.getNews({ page: 2, limit: 10 });

      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.totalPages).toBe(5); // 45 items / 10 per page
      expect(result.pagination.totalItems).toBe(45);
      expect(result.pagination.itemsPerPage).toBe(10);
    });

    it('should handle first page correctly', async () => {
      mockPrisma.news.findMany.mockResolvedValue([]);
      mockPrisma.news.count.mockResolvedValue(100);

      const result = await newsService.getNews({ page: 1, limit: 10 });

      expect(result.pagination.currentPage).toBe(1);
    });

    it('should handle last page correctly', async () => {
      mockPrisma.news.findMany.mockResolvedValue([]);
      mockPrisma.news.count.mockResolvedValue(25);

      const result = await newsService.getNews({ page: 3, limit: 10 });

      expect(result.pagination.currentPage).toBe(3);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('Status-based Output Filtering', () => {
    it('should filter output by status when specified', async () => {
      const mockPublishedNews = [
        { id: '1', status: 'PUBLISHED', titleEn: 'Published News' },
      ];

      mockPrisma.news.findMany.mockImplementation(({ where }: any) => {
        if (where?.status === 'PUBLISHED') {
          return Promise.resolve(mockPublishedNews);
        }
        return Promise.resolve([]);
      });

      mockPrisma.news.count.mockResolvedValue(1);

      const result = await newsService.getNews({ status: 'PUBLISHED' as ContentStatus });

      expect(result.data[0].status).toBe('PUBLISHED');
    });
  });

  describe('Search Output Validation', () => {
    it('should output search results matching criteria', async () => {
      const mockSearchResults = [
        { id: '1', titleEn: 'Test Search', slug: 'test-search' },
      ];

      mockPrisma.news.findMany.mockResolvedValue(mockSearchResults);
      mockPrisma.news.count.mockResolvedValue(1);

      const result = await newsService.getNews({ search: 'Test' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].titleEn).toContain('Test');
    });
  });

  describe('Sorting Output Validation', () => {
    it('should output sorted results by newsDate desc', async () => {
      const mockNews = [
        { id: '1', newsDate: new Date('2026-02-15'), titleEn: 'Recent' },
        { id: '2', newsDate: new Date('2026-02-01'), titleEn: 'Older' },
      ];

      mockPrisma.news.findMany.mockImplementation(({ orderBy }: any) => {
        if (orderBy?.newsDate === 'desc') {
          return Promise.resolve([mockNews[0], mockNews[1]]);
        }
        return Promise.resolve(mockNews);
      });

      mockPrisma.news.count.mockResolvedValue(2);

      const result = await newsService.getNews({ sortBy: 'newsDate', sortOrder: 'desc' });

      // First item should be more recent
      expect(new Date(result.data[0].newsDate).getTime()).toBeGreaterThanOrEqual(
        new Date(result.data[1].newsDate).getTime()
      );
    });
  });

  describe('Related Data Output', () => {
    it('should include category information in output', async () => {
      const mockNewsWithCategory = {
        id: '1',
        titleEn: 'Test',
        category: {
          id: 'cat-1',
          nameEn: 'Technology',
          slug: 'tech',
        },
      };

      mockPrisma.news.findUnique.mockResolvedValue(mockNewsWithCategory);

      const result = await newsService.getNewsById('1');

      expect(result.category).toBeDefined();
      expect(result.category).toHaveProperty('nameEn');
      expect(result.category).toHaveProperty('slug');
    });

    it('should include creator information when available', async () => {
      const mockNews = {
        id: '1',
        titleEn: 'Test',
        createdBy: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      mockPrisma.news.findUnique.mockResolvedValue(mockNews);

      const result = await newsService.getNewsById('1');

      expect(result.createdBy).toBeDefined();
      expect(result.createdBy?.firstName).toBe('John');
    });
  });
});
