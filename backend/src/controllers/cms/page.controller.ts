import { Request, Response, NextFunction } from 'express';
import { PageService } from '../../services/page.service';

const pageService = new PageService();

export const getPages = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const pages = await pageService.getAllPages();
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

export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || 'system';
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
    const page = await pageService.updatePage(id, req.body);
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
      
      const result = await pageService.savePageComponents(id, components);
      res.json({ success: true, message: 'Components saved successfully', data: result });
  } catch (error) {
      next(error);
  }
}
