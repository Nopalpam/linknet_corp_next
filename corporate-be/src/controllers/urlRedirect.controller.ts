import { Request, Response, NextFunction } from 'express';
import { UrlRedirectService } from '../services/urlRedirect.service';

/**
 * Get all URL redirects with pagination
 * GET /api/cms/url-redirects
 */
export async function getUrlRedirects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const result = await UrlRedirectService.getAllRedirects({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.json({
      success: true,
      data: result.data,
      pagination: {
        currentPage: result.page,
        totalPages: Math.ceil(result.total / result.limit),
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
    });
  } catch (error) {
    console.error('Error getting URL redirects:', error);
    next(error);
  }
}

/**
 * Get single URL redirect by ID
 * GET /api/cms/url-redirects/:id
 */
export async function getUrlRedirectById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'ID is required',
      });
      return;
    }

    const redirect = await UrlRedirectService.getRedirectById(id);

    if (!redirect) {
      res.status(404).json({
        success: false,
        message: 'URL redirect not found',
      });
      return;
    }

    res.json({
      success: true,
      data: redirect,
    });
  } catch (error) {
    console.error('Error getting URL redirect:', error);
    next(error);
  }
}

/**
 * Create new URL redirect
 * POST /api/cms/url-redirects
 */
export async function createUrlRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { fromUrl, toUrl, statusCode, isActive } = req.body;

    // Validation
    if (!fromUrl || !toUrl) {
      res.status(400).json({
        success: false,
        message: 'Source URL and Target URL are required',
      });
      return;
    }

    const redirect = await UrlRedirectService.createRedirect({
      fromUrl,
      toUrl,
      statusCode,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: 'URL redirect created successfully',
      data: redirect,
    });
  } catch (error: any) {
    if (error.message === 'Redirect with this source URL already exists') {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error('Error creating URL redirect:', error);
    next(error);
  }
}

/**
 * Update URL redirect
 * PUT /api/cms/url-redirects/:id
 */
export async function updateUrlRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { fromUrl, toUrl, statusCode, isActive } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'ID is required',
      });
      return;
    }

    const redirect = await UrlRedirectService.updateRedirect(id, {
      fromUrl,
      toUrl,
      statusCode,
      isActive,
    });

    res.json({
      success: true,
      message: 'URL redirect updated successfully',
      data: redirect,
    });
  } catch (error: any) {
    if (error.message === 'Redirect not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    if (error.message === 'Another redirect with this source URL already exists') {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error('Error updating URL redirect:', error);
    next(error);
  }
}

/**
 * Delete URL redirect
 * DELETE /api/cms/url-redirects/:id
 */
export async function deleteUrlRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'ID is required',
      });
      return;
    }

    await UrlRedirectService.deleteRedirect(id);

    res.json({
      success: true,
      message: 'URL redirect deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Redirect not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error('Error deleting URL redirect:', error);
    next(error);
  }
}

/**
 * Bulk delete URL redirects
 * POST /api/cms/url-redirects/bulk-delete
 */
export async function bulkDeleteUrlRedirects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'IDs array is required',
      });
      return;
    }

    const count = await UrlRedirectService.bulkDeleteRedirects(ids);

    res.json({
      success: true,
      message: `${count} URL redirect(s) deleted successfully`,
      data: { count },
    });
  } catch (error) {
    console.error('Error bulk deleting URL redirects:', error);
    next(error);
  }
}

/**
 * Toggle active status
 * PATCH /api/cms/url-redirects/:id/toggle
 */
export async function toggleUrlRedirectStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'ID is required',
      });
      return;
    }

    const redirect = await UrlRedirectService.toggleActive(id);

    res.json({
      success: true,
      message: `URL redirect ${redirect.isActive ? 'activated' : 'deactivated'} successfully`,
      data: redirect,
    });
  } catch (error: any) {
    if (error.message === 'Redirect not found') {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }
    console.error('Error toggling URL redirect status:', error);
    next(error);
  }
}

/**
 * Public API: Handle redirect
 * GET /api/redirect/:path
 */
export async function handleRedirect(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { path } = req.params;
    const fromUrl = `/${path}`;

    const redirect = await UrlRedirectService.getRedirectByFromUrl(fromUrl);

    if (!redirect) {
      res.status(404).json({
        success: false,
        message: 'Redirect not found',
      });
      return;
    }

    // Increment hit counter
    await UrlRedirectService.incrementHits(redirect.id);

    // Perform redirect
    res.redirect(redirect.statusCode, redirect.toUrl);
  } catch (error) {
    console.error('Error handling redirect:', error);
    next(error);
  }
}
