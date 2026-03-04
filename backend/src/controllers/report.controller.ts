import { Request, Response, NextFunction } from 'express';
import reportService from '../services/report.service';
import { AppError } from '../types/error.types';
import {
  ReportTypeQueryParams,
  ReportSectionQueryParams,
  ReportItemQueryParams,
  ReportFilterParams,
} from '../types/report.types';

/**
 * Report Controller
 * Handles HTTP requests for ReportType, ReportSection, reports CRUD operations
 * Matches current Prisma schema with String IDs
 */
export class ReportController {
  // ============================================
  // REPORT TYPE ENDPOINTS
  // ============================================

  async getReportTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportTypeQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: (req.query.sortBy as string) || 'position',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await reportService.getReportTypes(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportTypesList(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getReportTypesList();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReportType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, description, icon, color, position, isActive } = req.body;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      const reportType = await reportService.createReportType({
        name,
        slug,
        description,
        icon,
        color,
        position: position ? parseInt(position) : undefined,
        isActive,
      });

      res.status(201).json({
        success: true,
        message: 'Report type created successfully',
        data: reportType,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report type ID is required', 400);

      const reportType = await reportService.getReportTypeById(id);

      res.json({
        success: true,
        data: reportType,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReportType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report type ID is required', 400);

      const { name, slug, description, icon, color, position, isActive } = req.body;

      const reportType = await reportService.updateReportType(id, {
        name,
        slug,
        description,
        icon,
        color,
        position: position !== undefined ? parseInt(position) : undefined,
        isActive,
      });

      res.json({
        success: true,
        message: 'Report type updated successfully',
        data: reportType,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleReportTypeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Report type ID is required', 400);

      const reportType = await reportService.toggleReportTypeStatus(id.toString());

      res.json({
        success: true,
        message: `Report type ${reportType.isActive ? 'activated' : 'deactivated'} successfully`,
        data: reportType,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReportType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report type ID is required', 400);

      const result = await reportService.deleteReportType(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMultipleReportTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await reportService.deleteMultipleReportTypes(ids.map(String));

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportTypeSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report type ID is required', 400);

      const data = await reportService.getReportTypeSections(id);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSectionsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { updates } = req.body;

      if (!id) throw new AppError('Report type ID is required', 400);
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await reportService.updateSectionsOrder(id, updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // REPORT SECTION ENDPOINTS
  // ============================================

  async getReportSections(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportSectionQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type_id: req.query.type_id as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: (req.query.sortBy as string) || 'position',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await reportService.getReportSections(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportSectionsList(req: Request, res: Response, next: NextFunction) {
    try {
      const typeId = req.query.type_id as string | undefined;
      const data = await reportService.getReportSectionsList(typeId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReportSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { type_id, name, slug, description, position, isActive } = req.body;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      if (!type_id) {
        throw new AppError('Report type ID is required', 400);
      }

      const section = await reportService.createReportSection({
        type_id,
        name,
        slug,
        description,
        position: position ? parseInt(position) : undefined,
        isActive,
      });

      res.status(201).json({
        success: true,
        message: 'Report section created successfully',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportSectionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report section ID is required', 400);

      const section = await reportService.getReportSectionById(id);

      res.json({
        success: true,
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReportSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report section ID is required', 400);

      const { type_id, name, slug, description, position, isActive } = req.body;

      const section = await reportService.updateReportSection(id, {
        type_id,
        name,
        slug,
        description,
        position: position !== undefined ? parseInt(position) : undefined,
        isActive,
      });

      res.json({
        success: true,
        message: 'Report section updated successfully',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleReportSectionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Report section ID is required', 400);

      const section = await reportService.toggleReportSectionStatus(id.toString());

      res.json({
        success: true,
        message: `Report section ${section.isActive ? 'activated' : 'deactivated'} successfully`,
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReportSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report section ID is required', 400);

      const result = await reportService.deleteReportSection(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMultipleReportSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await reportService.deleteMultipleReportSections(ids.map(String));

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportSectionItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report section ID is required', 400);

      const data = await reportService.getReportSectionItems(id);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSectionItemsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { updates } = req.body;

      if (!id) throw new AppError('Report section ID is required', 400);
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await reportService.updateSectionItemsOrder(id, updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // REPORT ITEM ENDPOINTS
  // ============================================

  async getReportItems(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportItemQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type_id: req.query.type_id as string,
        section_id: req.query.section_id as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        status: req.query.status as string,
        sortBy: (req.query.sortBy as string) || 'created_at',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await reportService.getReportItems(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createReportItem(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        section_id,
        title,
        slug,
        description,
        period,
        year,
        quarter,
        file_url,
        file_size,
        file_type,
        thumbnail,
        status,
      } = req.body;

      if (!title || title.trim() === '') {
        throw new AppError('Title is required', 400);
      }

      const item = await reportService.createReportItem({
        section_id,
        title,
        slug,
        description,
        period,
        year: year ? parseInt(year) : undefined,
        quarter: quarter ? parseInt(quarter) : undefined,
        file_url,
        file_size: file_size ? parseInt(file_size) : undefined,
        file_type,
        thumbnail,
        status,
      });

      res.status(201).json({
        success: true,
        message: 'Report item created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report item ID is required', 400);

      const item = await reportService.getReportItemById(id);

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReportItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report item ID is required', 400);

      const {
        section_id,
        title,
        slug,
        description,
        period,
        year,
        quarter,
        file_url,
        file_size,
        file_type,
        thumbnail,
        status,
      } = req.body;

      const item = await reportService.updateReportItem(id, {
        section_id,
        title,
        slug,
        description,
        period,
        year: year !== undefined ? (year ? parseInt(year) : undefined) : undefined,
        quarter: quarter !== undefined ? (quarter ? parseInt(quarter) : undefined) : undefined,
        file_url,
        file_size: file_size !== undefined ? (file_size ? parseInt(file_size) : undefined) : undefined,
        file_type,
        thumbnail,
        status,
      });

      res.json({
        success: true,
        message: 'Report item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleReportItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Report item ID is required', 400);

      const item = await reportService.toggleReportItemStatus(id.toString());

      res.json({
        success: true,
        message: `Report item status toggled successfully`,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReportItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report item ID is required', 400);

      const result = await reportService.deleteReportItem(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMultipleReportItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await reportService.deleteMultipleReportItems(ids.map(String));

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReportItemsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await reportService.updateReportItemsOrder(updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportItemStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await reportService.getReportItemStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // PUBLIC FRONTEND ENDPOINTS
  // ============================================

  async filterReports(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportFilterParams = {
        search: req.query.search as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        type_id: req.query.type_id as string,
        section_id: req.query.section_id as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await reportService.filterReports(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportYears(_req: Request, res: Response, next: NextFunction) {
    try {
      const years = await reportService.getReportYears();

      res.json({
        success: true,
        data: years,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicSectionItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Section ID is required', 400);

      const data = await reportService.getPublicSectionItems(id);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

const reportController = new ReportController();
export default reportController;
