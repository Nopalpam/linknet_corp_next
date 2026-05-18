import { Request, Response } from 'express';
import dataBankSolutionService from '../services/dataBankSolution.service';

function getUserId(req: Request): string | undefined {
  return (req as any).user?.id || (req as any).user?.userId;
}

function parseBusinessNeedIds(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
}

export class DataBankSolutionController {
  async getTaxonomies(req: Request, res: Response) {
    try {
      const type = typeof req.query.type === 'string' ? req.query.type.toUpperCase() as any : undefined;
      const data = await dataBankSolutionService.getTaxonomies(type);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to fetch taxonomies' });
    }
  }

  async getSolutions(req: Request, res: Response) {
    try {
      const result = await dataBankSolutionService.getSolutions({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        categoryId: req.query.categoryId as string || req.query.category_id as string,
        industryId: req.query.industryId as string || req.query.industry_id as string,
        businessScaleId: req.query.businessScaleId as string || req.query.business_scale_id as string,
        businessNeedIds: parseBusinessNeedIds(req.query.businessNeedIds || req.query.business_need_ids),
        sortBy: req.query.sortBy as string || req.query.sort_by as string,
        sortOrder: req.query.sortOrder as any || req.query.sort_order as any,
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to fetch solutions' });
    }
  }

  async getPublicSolutions(req: Request, res: Response) {
    try {
      const result = await dataBankSolutionService.getPublicSolutions({
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 100,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string || req.query.category_id as string,
        industryId: req.query.industryId as string || req.query.industry_id as string,
        businessScaleId: req.query.businessScaleId as string || req.query.business_scale_id as string,
        businessNeedIds: parseBusinessNeedIds(req.query.businessNeedIds || req.query.business_need_ids),
        sortBy: req.query.sortBy as string || req.query.sort_by as string,
        sortOrder: req.query.sortOrder as any || req.query.sort_order as any,
      });

      const taxonomies = await dataBankSolutionService.getTaxonomies();
      res.json({ success: true, ...result, taxonomies });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to fetch public solutions' });
    }
  }

  async getSolutionById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Solution ID is required' });
        return;
      }
      const data = await dataBankSolutionService.getSolutionById(id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Solution not found' });
    }
  }

  async createSolution(req: Request, res: Response) {
    try {
      const data = await dataBankSolutionService.createSolution(req.body, getUserId(req));
      res.status(201).json({ success: true, message: 'Solution created successfully', data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to create solution' });
    }
  }

  async updateSolution(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Solution ID is required' });
        return;
      }
      const data = await dataBankSolutionService.updateSolution(id, req.body, getUserId(req));
      res.json({ success: true, message: 'Solution updated successfully', data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update solution' });
    }
  }

  async deleteSolution(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Solution ID is required' });
        return;
      }
      const result = await dataBankSolutionService.deleteSolution(id);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to delete solution' });
    }
  }

  async publishSolution(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Solution ID is required' });
        return;
      }
      const data = await dataBankSolutionService.setPublishStatus(id, true, getUserId(req));
      res.json({ success: true, message: 'Solution published successfully', data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to publish solution' });
    }
  }

  async unpublishSolution(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Solution ID is required' });
        return;
      }
      const data = await dataBankSolutionService.setPublishStatus(id, false, getUserId(req));
      res.json({ success: true, message: 'Solution unpublished successfully', data });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to unpublish solution' });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const result = await dataBankSolutionService.updateOrder(req.body.updates || []);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Failed to update order' });
    }
  }
}

export default new DataBankSolutionController();
