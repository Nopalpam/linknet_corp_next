import { Request, Response, NextFunction } from 'express';
import newsController from '../../controllers/news.controller';
import newsService from '../../services/news.service';

jest.mock('../../services/news.service', () => ({
  __esModule: true,
  default: {
    getNewsBySlug: jest.fn(),
  },
}));

describe('News detail controller', () => {
  const mockedNewsService = newsService as jest.Mocked<typeof newsService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the article without writing view tracking data', async () => {
    const article = { id: 'news-1', slug: 'production-article' };
    mockedNewsService.getNewsBySlug.mockResolvedValue(article);

    const req = {
      params: { slug: article.slug },
      query: {},
      ip: '127.0.0.1',
      socket: {},
      headers: { 'user-agent': 'jest' },
      requestId: 'request-123',
    } as unknown as Request;
    const json = jest.fn();
    const res = { json } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await newsController.getNewsBySlug(req, res, next);

    // The mocked method is inspected as a Jest spy; it is never invoked unbound.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedNewsService.getNewsBySlug).toHaveBeenCalledWith(article.slug);
    expect(json).toHaveBeenCalledWith({ success: true, data: article });
    expect(next).not.toHaveBeenCalled();
  });

  it('does not track metadata requests with track=false', async () => {
    const article = { id: 'news-2', slug: 'metadata-article' };
    mockedNewsService.getNewsBySlug.mockResolvedValue(article);

    const req = {
      params: { slug: article.slug },
      query: { track: 'false' },
      socket: {},
      headers: {},
      requestId: 'request-456',
    } as unknown as Request;
    const json = jest.fn();
    const res = { json } as unknown as Response;
    const next = jest.fn() as NextFunction;

    await newsController.getNewsBySlug(req, res, next);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockedNewsService.getNewsBySlug).toHaveBeenCalledWith(article.slug);
    expect(json).toHaveBeenCalledWith({ success: true, data: article });
    expect(next).not.toHaveBeenCalled();
  });
});
