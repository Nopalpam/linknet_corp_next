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
 * Handles HTTP requests for ReportType, ReportSection, ReportItem CRUD operations
 */
export class ReportController {
  // ============================================
  // REPORT TYPE ENDPOINTS
  // ============================================

  /**
   * GET /cms/report-types — list with DataTable pagination
   */
  async getReportTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportTypeQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type: req.query.type as 'Grid' | 'List' | undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: (req.query.sortBy as string) || 'sortOrder',
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

  /**
   * GET /cms/report-types/list — dropdown list (active only)
   */
  async getReportTypesList(req: Request, res: Response, next: NextFunction) {
    try {
      const typeFilter = req.query.type as 'Grid' | 'List' | undefined;
      const data = await reportService.getReportTypesList(typeFilter);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cms/report-types — create
   */
  async createReportType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type, sortOrder, isActive } = req.body;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      const reportType = await reportService.createReportType({
        name,
        type,
        sortOrder,
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

  /**
   * GET /cms/report-types/:id — detail
   */
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

  /**
   * PUT /cms/report-types/:id — update
   */
  async updateReportType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report type ID is required', 400);

      const { name, type, sortOrder, isActive } = req.body;

      const reportType = await reportService.updateReportType(id, {
        name,
        type,
        sortOrder,
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

  /**
   * POST /cms/report-types/toggle-status — toggle is_active
   */
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

  /**
   * DELETE /cms/report-types/:id — soft delete
   */
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

  /**
   * POST /cms/report-types/destroy-multiple — bulk soft delete
   */
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

  /**
   * GET /cms/report-types/:id/sections — get sections (List type)
   */
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

  /**
   * POST /cms/report-types/:id/sections/update-order — reorder sections
   */
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

  /**
   * GET /cms/report-types/:id/grid-items — get grid items
   */
  async getReportTypeGridItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report type ID is required', 400);

      const data = await reportService.getReportTypeGridItems(id);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cms/report-types/:id/grid-items/update-order — reorder grid items
   */
  async updateGridItemsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { updates } = req.body;

      if (!id) throw new AppError('Report type ID is required', 400);
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await reportService.updateGridItemsOrder(id, updates);

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

  /**
   * GET /cms/report-sections — list with DataTable pagination
   */
  async getReportSections(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportSectionQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        reportTypeId: req.query.reportTypeId as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: (req.query.sortBy as string) || 'sortOrder',
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

  /**
   * GET /cms/report-sections/list — dropdown list
   */
  async getReportSectionsList(req: Request, res: Response, next: NextFunction) {
    try {
      const reportTypeId = req.query.reportTypeId as string | undefined;
      const data = await reportService.getReportSectionsList(reportTypeId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cms/report-sections — create
   */
  async createReportSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportTypeId, title, description, reportYear, ctaEnabled, ctaText, ctaUrl, sortOrder, isActive } = req.body;

      if (!title || title.trim() === '') {
        throw new AppError('Title is required', 400);
      }

      if (!reportTypeId) {
        throw new AppError('Report type ID is required', 400);
      }

      const section = await reportService.createReportSection({
        reportTypeId,
        title,
        description,
        reportYear: reportYear ? parseInt(reportYear) : undefined,
        ctaEnabled,
        ctaText,
        ctaUrl,
        sortOrder,
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

  /**
   * GET /cms/report-sections/:id — detail
   */
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

  /**
   * PUT /cms/report-sections/:id — update
   */
  async updateReportSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report section ID is required', 400);

      const { reportTypeId, title, description, reportYear, ctaEnabled, ctaText, ctaUrl, sortOrder, isActive } = req.body;

      const section = await reportService.updateReportSection(id, {
        reportTypeId,
        title,
        description,
        reportYear: reportYear !== undefined ? (reportYear ? parseInt(reportYear) : null as any) : undefined,
        ctaEnabled,
        ctaText,
        ctaUrl,
        sortOrder,
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

  /**
   * POST /cms/report-sections/toggle-status — toggle is_active
   */
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

  /**
   * DELETE /cms/report-sections/:id — soft delete
   */
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

  /**
   * POST /cms/report-sections/destroy-multiple — bulk soft delete
   */
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

  /**
   * GET /cms/report-sections/:id/items — get items for section
   */
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

  /**
   * POST /cms/report-sections/:id/items/update-order — reorder items
   */
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

  /**
   * GET /cms/report-items — list with DataTable pagination
   */
  async getReportItems(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportItemQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        reportTypeId: req.query.reportTypeId as string,
        reportSectionId: req.query.reportSectionId as string,
        dataType: req.query.dataType as string,
        auditStatus: req.query.auditStatus as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: (req.query.sortBy as string) || 'sortOrder',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
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

  /**
   * POST /cms/report-items — create
   */
  async createReportItem(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        reportTypeId,
        reportSectionId,
        title,
        subDescription,
        pdfFile,
        coverImage,
        dataType,
        auditStatus,
        fileSize,
        sortOrder,
        isActive,
      } = req.body;

      if (!title || title.trim() === '') {
        throw new AppError('Title is required', 400);
      }

      const item = await reportService.createReportItem({
        reportTypeId,
        reportSectionId,
        title,
        subDescription,
        pdfFile,
        coverImage,
        dataType,
        auditStatus,
        fileSize,
        sortOrder,
        isActive,
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

  /**
   * GET /cms/report-items/:id — detail
   */
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

  /**
   * PUT /cms/report-items/:id — update
   */
  async updateReportItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Report item ID is required', 400);

      const {
        reportTypeId,
        reportSectionId,
        title,
        subDescription,
        pdfFile,
        coverImage,
        dataType,
        auditStatus,
        fileSize,
        sortOrder,
        isActive,
      } = req.body;

      const item = await reportService.updateReportItem(id, {
        reportTypeId,
        reportSectionId,
        title,
        subDescription,
        pdfFile,
        coverImage,
        dataType,
        auditStatus,
        fileSize,
        sortOrder,
        isActive,
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

  /**
   * POST /cms/report-items/toggle-status — toggle is_active
   */
  async toggleReportItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Report item ID is required', 400);

      const item = await reportService.toggleReportItemStatus(id.toString());

      res.json({
        success: true,
        message: `Report item ${item.isActive ? 'activated' : 'deactivated'} successfully`,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cms/report-items/:id — soft delete
   */
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

  /**
   * POST /cms/report-items/destroy-multiple — bulk soft delete
   */
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

  /**
   * POST /cms/report-items/update-order — reorder items
   */
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

  /**
   * GET /cms/report-items/stats — item stats
   */
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

  /**
   * GET /reports/filter — AJAX filter
   */
  async filterReports(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportFilterParams = {
        search: req.query.search as string,
        dataType: req.query.data_type as string,
        auditStatus: req.query.audit_status as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        reportTypeId: req.query.report_type_id as string,
        displayType: req.query.display_type as 'Grid' | 'List' | undefined,
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

  /**
   * GET /reports/years — years dropdown
   */
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

  /**
   * GET /reports/section/:id/items — section items for modal
   */
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
