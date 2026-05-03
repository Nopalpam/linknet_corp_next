import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { LabelDataBankService } from '../services/labelDataBank.service';
import { AppError } from '../types/error.types';

const actorFrom = (req: AuthRequest) => req.user?.email || req.user?.id;

export class LabelDataBankController {
  static async getGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await LabelDataBankService.getGroups({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        search: req.query.search as string,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parentName = req.body.parent_name || req.body.parentName;
      const data = await LabelDataBankService.createGroup(parentName, actorFrom(req));
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const parentName = req.body.parent_name || req.body.parentName;
      const data = await LabelDataBankService.updateGroup(req.params.id as string, parentName, actorFrom(req));
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await LabelDataBankService.deleteGroup(req.params.id as string);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getTree(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await LabelDataBankService.getTree(req.params.parent as string);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async createLabel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const labelName = req.body.label_name || req.body.labelName;
      const data = await LabelDataBankService.createLabel(
        req.params.parent as string,
        {
          parentId: req.body.parentId,
          labelId: req.body.label_id || req.body.labelId,
          labelName,
          values: req.body.values,
          status: req.body.status,
        },
        actorFrom(req)
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateLabel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const labelName = req.body.label_name || req.body.labelName;
      const data = await LabelDataBankService.updateLabel(
        req.params.parent as string,
        req.params.id as string,
        {
          labelId: req.body.label_id !== undefined ? req.body.label_id : req.body.labelId,
          labelName,
          values: req.body.values,
          status: req.body.status,
        },
        actorFrom(req)
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLabel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await LabelDataBankService.deleteLabel(req.params.parent as string, req.params.id as string);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async moveLabel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (typeof req.body.position !== 'number') {
        throw new AppError('position is required', 400);
      }
      const data = await LabelDataBankService.moveLabel(
        req.params.parent as string,
        req.params.id as string,
        { parentId: req.body.parentId, position: req.body.position },
        actorFrom(req)
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicLabels(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const language = (req.query.lang as string) || 'id';
      const data = await LabelDataBankService.getPublicLabels(language);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
