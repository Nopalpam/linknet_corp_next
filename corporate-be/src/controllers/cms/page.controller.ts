import { Request, Response, NextFunction } from 'express';
import { PageService } from '../../services/page.service';
import { ComponentSchemaSyncService } from '../../services/componentSchemaSync.service';

const pageService = new PageService();

export const getPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await pageService.getAllPages({
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
    });
    res.json({ success: true, data: pages });
  } catch (error) {
    next(error);
  }
};

export const getPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Page ID is required' });
      return;
    }
    const page = await pageService.getPageById(id);
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const getPageHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Page ID is required' });
      return;
    }

    const page =
      typeof req.query.page === 'string' && req.query.page
        ? Math.max(Number.parseInt(req.query.page, 10), 1)
        : 1;
    const perPage =
      typeof req.query.per_page === 'string' && req.query.per_page
        ? Number.parseInt(req.query.per_page, 10)
        : 10;

    const result = await pageService.getPageHistory(
      id,
      Number.isFinite(page) ? page : 1,
      Number.isFinite(perPage) ? perPage : 10,
    );

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const checkSlugAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug, excludeId } = req.query;
    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ success: false, message: 'Slug is required' });
      return;
    }

    const result = await pageService.checkSlugAvailability(
      slug,
      typeof excludeId === 'string' ? excludeId : undefined,
    );

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 'system';
    const page = await pageService.createPage(userId, req.body);
    res.status(201).json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Page ID is required' });
      return;
    }
    const oldPage = await pageService.getPageById(id);
    if (req.logData) {
      req.logData.oldData = oldPage;
    }
    const userId = req.user?.id;
    const page = await pageService.updatePage(id, req.body, userId);
    res.json({ success: true, data: page });
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: 'Page ID is required' });
      return;
    }
    const oldPage = await pageService.getPageById(id);
    if (req.logData) {
      req.logData.oldData = oldPage;
    }
    await pageService.deletePage(id);
    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const saveComponents = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Page ID is required' });
        return;
      }
      const { components } = req.body;
      
      if (!Array.isArray(components)) {
        res.status(400).json({ success: false, message: 'Components must be an array' });
        return;
      }

      const oldPage = await pageService.getPageById(id);
      if (req.logData) {
        req.logData.oldData = oldPage;
      }
      
      const userId = req.user?.id;
      const result = await pageService.savePageComponents(id, components, userId);
      res.json({ success: true, message: 'Components saved successfully', data: result });
  } catch (error) {
      next(error);
  }
}

export const dryRunComponentSchemaSync = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ComponentSchemaSyncService.dryRun();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const syncAllComponentSchemas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const result = await ComponentSchemaSyncService.syncAll(userId);
    res.json({ success: true, message: 'Component schemas synced successfully', data: result });
  } catch (error) {
    next(error);
  }
};
