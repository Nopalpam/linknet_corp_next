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

  // Map frontend sortBy field names to valid Prisma field names
  private mapReportTypeSortBy(sortBy: string): string {
    const mapping: Record<string, string> = {
      sortOrder: 'position',
      sort_order: 'position',
      order: 'position',
    };
    const validFields = ['position', 'name', 'slug', 'createdAt', 'updatedAt', 'isActive'];
    const mapped = mapping[sortBy] || sortBy;
    return validFields.includes(mapped) ? mapped : 'position';
  }

  private mapReportSectionSortBy(sortBy: string): string {
    const mapping: Record<string, string> = {
      sortOrder: 'position',
      sort_order: 'position',
      order: 'position',
      title: 'name',
    };
    const validFields = ['position', 'name', 'slug', 'createdAt', 'updatedAt', 'isActive', 'type_id'];
    const mapped = mapping[sortBy] || sortBy;
    return validFields.includes(mapped) ? mapped : 'position';
  }

  private mapReportItemSortBy(sortBy: string): string {
    const mapping: Record<string, string> = {
      sortOrder: 'sort_order',
      sort_order: 'sort_order',
      order: 'sort_order',
    };
    const validFields = ['created_at', 'updated_at', 'title', 'slug', 'year', 'quarter', 'status', 'published_at', 'downloads', 'sort_order', 'data_type', 'audit_status'];
    const mapped = mapping[sortBy] || sortBy;
    return validFields.includes(mapped) ? mapped : 'created_at';
  }

  async getReportTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ReportTypeQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type: req.query.type as 'Grid' | 'List',
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: this.mapReportTypeSortBy((req.query.sortBy as string) || 'position'),
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

  async getReportTypesList(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.getReportTypesList(req.query.type as 'Grid' | 'List' | undefined);

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
      const { name, type, slug, description, icon, color, position, sortOrder, isActive } = req.body;
      const typePosition = position ?? sortOrder;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      const reportType = await reportService.createReportType({
        name,
        type,
        slug,
        description,
        icon,
        color,
        position: typePosition !== undefined ? parseInt(typePosition) : undefined,
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

      const { name, type, slug, description, icon, color, position, sortOrder, isActive } = req.body;

      const reportType = await reportService.updateReportType(id, {
        name,
        type,
        slug,
        description,
        icon,
        color,
        position: (position ?? sortOrder) !== undefined ? parseInt(position ?? sortOrder) : undefined,
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
        type_id: (req.query.type_id || req.query.reportTypeId) as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: this.mapReportSectionSortBy((req.query.sortBy as string) || 'position'),
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
      const typeId = (req.query.type_id || req.query.reportTypeId) as string | undefined;
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
      const { type_id, reportTypeId, name, title, slug, description, position, sortOrder, isActive } = req.body;
      const sectionName = name || title;
      const sectionTypeId = type_id || reportTypeId;
      const sectionPosition = position ?? sortOrder;

      if (!sectionName || sectionName.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      if (!sectionTypeId) {
        throw new AppError('Report type ID is required', 400);
      }

      const section = await reportService.createReportSection({
        type_id: sectionTypeId,
        name: sectionName,
        slug,
        description,
        position: sectionPosition ? parseInt(sectionPosition) : undefined,
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

      const { type_id, reportTypeId, name, title, slug, description, position, sortOrder, isActive } = req.body;

      const section = await reportService.updateReportSection(id, {
        type_id: type_id || reportTypeId,
        name: name || title,
        slug,
        description,
        position: (position ?? sortOrder) !== undefined ? parseInt(position ?? sortOrder) : undefined,
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
        type_id: (req.query.type_id || req.query.reportTypeId) as string,
        section_id: (req.query.section_id || req.query.reportSectionId) as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        data_type: (req.query.data_type || req.query.dataType) as string,
        audit_status: (req.query.audit_status || req.query.auditStatus) as string,
        status: req.query.status as string,
        sortBy: this.mapReportItemSortBy((req.query.sortBy as string) || 'created_at'),
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
        type_id,
        reportTypeId,
        section_id,
        reportSectionId,
        title,
        slug,
        description,
        subDescription,
        pdfFile,
        pdf_file,
        coverImage,
        cover_image,
        dataType,
        data_type,
        auditStatus,
        audit_status,
        fileSize,
        file_size,
        sortOrder,
        sort_order,
        isActive,
        is_active,
        status,
      } = req.body;

      const itemTitle = title;
      if (!itemTitle || itemTitle.trim() === '') {
        throw new AppError('Title is required', 400);
      }

      const item = await reportService.createReportItem({
        type_id: type_id || reportTypeId || undefined,
        section_id: section_id || reportSectionId || undefined,
        title: itemTitle,
        slug,
        description: description || subDescription,
        pdf_file: pdf_file || pdfFile,
        cover_image: cover_image || coverImage,
        data_type: data_type || dataType,
        audit_status: audit_status || auditStatus,
        file_size: file_size || fileSize,
        sort_order: sort_order !== undefined ? sort_order : (sortOrder !== undefined ? parseInt(sortOrder) : undefined),
        is_active: is_active !== undefined ? is_active : isActive,
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
        type_id,
        reportTypeId,
        section_id,
        reportSectionId,
        title,
        slug,
        description,
        subDescription,
        pdfFile,
        pdf_file,
        coverImage,
        cover_image,
        dataType,
        data_type,
        auditStatus,
        audit_status,
        fileSize,
        file_size,
        sortOrder,
        sort_order,
        isActive,
        is_active,
        status,
      } = req.body;

      const item = await reportService.updateReportItem(id, {
        type_id: type_id || reportTypeId || undefined,
        section_id: section_id || reportSectionId || undefined,
        title,
        slug,
        description: description !== undefined ? description : subDescription,
        pdf_file: pdf_file !== undefined ? pdf_file : pdfFile,
        cover_image: cover_image !== undefined ? cover_image : coverImage,
        data_type: data_type !== undefined ? data_type : dataType,
        audit_status: audit_status !== undefined ? audit_status : auditStatus,
        file_size: file_size !== undefined ? file_size : fileSize,
        sort_order: sort_order !== undefined ? sort_order : (sortOrder !== undefined ? parseInt(sortOrder) : undefined),
        is_active: is_active !== undefined ? is_active : isActive,
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
