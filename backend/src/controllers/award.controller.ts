import { Request, Response, NextFunction } from 'express';
import awardService from '../services/award.service';
import { AppError } from '../types/error.types';

type AwardStatus = 'ACTIVE' | 'INACTIVE';

export class AwardController {
  // Get all awards (CMS)
  async getAwards(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      
      const awards = await awardService.getAllAwards(
        status as AwardStatus | undefined
      );

      res.json({
        success: true,
        data: awards,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get active awards (Public)
  async getActiveAwards(_req: Request, res: Response, next: NextFunction) {
    try {
      const awards = await awardService.getActiveAwards();

      res.json({
        success: true,
        data: awards,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get awards grouped by year (Public)
  async getAwardsByYear(_req: Request, res: Response, next: NextFunction) {
    try {
      const awards = await awardService.getAwardsByYear();

      res.json({
        success: true,
        data: awards,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single award by ID
  async getAwardById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new AppError('Award ID is required', 400);
      }

      const award = await awardService.getAwardById(id);

      res.json({
        success: true,
        data: award,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create new award
  async createAward(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, year, issuer, description, image, order, status } = req.body;

      // Validation
      if (!title || title.trim() === '') {
        throw new AppError('Title is required', 400);
      }
      if (!year || typeof year !== 'number') {
        throw new AppError('Valid year is required', 400);
      }
      if (!issuer || issuer.trim() === '') {
        throw new AppError('Issuer is required', 400);
      }

      const award = await awardService.createAward({
        title: title.trim(),
        year,
        issuer: issuer.trim(),
        description: description?.trim(),
        image,
        order,
        status,
      });

      res.status(201).json({
        success: true,
        message: 'Award created successfully',
        data: award,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update award
  async updateAward(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, year, issuer, description, image, order, status } = req.body;

      if (!id) {
        throw new AppError('Award ID is required', 400);
      }

      // Validation
      if (title !== undefined && title.trim() === '') {
        throw new AppError('Title cannot be empty', 400);
      }
      if (year !== undefined && typeof year !== 'number') {
        throw new AppError('Year must be a number', 400);
      }
      if (issuer !== undefined && issuer.trim() === '') {
        throw new AppError('Issuer cannot be empty', 400);
      }

      const award = await awardService.updateAward(id, {
        ...(title !== undefined && { title: title.trim() }),
        ...(year !== undefined && { year }),
        ...(issuer !== undefined && { issuer: issuer.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(image !== undefined && { image }),
        ...(order !== undefined && { order }),
        ...(status !== undefined && { status }),
      });

      res.json({
        success: true,
        message: 'Award updated successfully',
        data: award,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete award
  async deleteAward(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Award ID is required', 400);
      }

      const result = await awardService.deleteAward(id);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update awards order
  async updateAwardsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates array is required', 400);
      }

      // Validate each update
      for (const update of updates) {
        if (!update.id || typeof update.order !== 'number') {
          throw new AppError('Each update must have id and order', 400);
        }
      }

      const result = await awardService.updateAwardsOrder(updates);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AwardController();
