import { Request, Response, NextFunction } from 'express';
import announcementService from '../services/announcement.service';
import { AppError } from '../types/error.types';
import {
  AnnouncementTypeQueryParams,
  AnnouncementSectionQueryParams,
  AnnouncementItemQueryParams,
  AnnouncementFilterParams,
} from '../types/announcement.types';

/**
 * Announcement Controller
 * Handles HTTP requests for AnnouncementType, AnnouncementSection, announcements CRUD operations
 */
export class AnnouncementController {
  // ============================================
  // FIELD MAPPING HELPERS
  // ============================================

  private mapAnnouncementTypeSortBy(sortBy: string): string {
    const mapping: Record<string, string> = {
      sortOrder: 'position',
      sort_order: 'position',
      order: 'position',
    };
    const validFields = ['position', 'name', 'slug', 'createdAt', 'updatedAt', 'isActive'];
    const mapped = mapping[sortBy] || sortBy;
    return validFields.includes(mapped) ? mapped : 'position';
  }

  private mapAnnouncementSectionSortBy(sortBy: string): string {
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

  private mapAnnouncementItemSortBy(sortBy: string): string {
    const mapping: Record<string, string> = {
      sortOrder: 'created_at',
      sort_order: 'created_at',
      order: 'created_at',
    };
    const validFields = ['created_at', 'updated_at', 'title', 'slug', 'status', 'sort_order'];
    const mapped = mapping[sortBy] || sortBy;
    return validFields.includes(mapped) ? mapped : 'created_at';
  }

  // ============================================
  // ANNOUNCEMENT TYPE ENDPOINTS
  // ============================================

  async getAnnouncementTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const params: AnnouncementTypeQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type: req.query.type as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: this.mapAnnouncementTypeSortBy((req.query.sortBy as string) || 'position'),
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await announcementService.getAnnouncementTypes(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementTypesList(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await announcementService.getAnnouncementTypesList();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncementType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, type, description, icon, color, position, sortOrder, isActive } = req.body;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      const announcementType = await announcementService.createAnnouncementType({
        name,
        slug,
        type,
        description,
        icon,
        color,
        position: (position ?? sortOrder) ? parseInt(position ?? sortOrder) : undefined,
        isActive,
      });

      res.status(201).json({
        success: true,
        message: 'Announcement type created successfully',
        data: announcementType,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement type ID is required', 400);

      const announcementType = await announcementService.getAnnouncementTypeById(id);

      res.json({
        success: true,
        data: announcementType,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncementType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement type ID is required', 400);

      const { name, slug, type, description, icon, color, position, sortOrder, isActive } = req.body;

      const announcementType = await announcementService.updateAnnouncementType(id, {
        name,
        slug,
        type,
        description,
        icon,
        color,
        position: (position ?? sortOrder) !== undefined ? parseInt(position ?? sortOrder) : undefined,
        isActive,
      });

      res.json({
        success: true,
        message: 'Announcement type updated successfully',
        data: announcementType,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleAnnouncementTypeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Announcement type ID is required', 400);

      const announcementType = await announcementService.toggleAnnouncementTypeStatus(id.toString());

      res.json({
        success: true,
        message: `Announcement type ${announcementType.isActive ? 'activated' : 'deactivated'} successfully`,
        data: announcementType,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncementType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement type ID is required', 400);

      const result = await announcementService.deleteAnnouncementType(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMultipleAnnouncementTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await announcementService.deleteMultipleAnnouncementTypes(ids.map(String));

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementTypeSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement type ID is required', 400);

      const data = await announcementService.getAnnouncementTypeSections(id);

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

      if (!id) throw new AppError('Announcement type ID is required', 400);
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await announcementService.updateSectionsOrder(id, updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ANNOUNCEMENT SECTION ENDPOINTS
  // ============================================

  async getAnnouncementSections(req: Request, res: Response, next: NextFunction) {
    try {
      const params: AnnouncementSectionQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type_id: (req.query.type_id || req.query.announcementTypeId) as string,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        sortBy: this.mapAnnouncementSectionSortBy((req.query.sortBy as string) || 'position'),
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await announcementService.getAnnouncementSections(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementSectionsList(req: Request, res: Response, next: NextFunction) {
    try {
      const typeId = (req.query.type_id || req.query.announcementTypeId) as string | undefined;
      const data = await announcementService.getAnnouncementSectionsList(typeId);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncementSection(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        type_id, announcementTypeId,
        name, title,
        slug, description,
        announcement_year,
        cta_enabled, cta_text, cta_url,
        position, sortOrder,
        isActive,
      } = req.body;

      const sectionName = name || title;
      const sectionTypeId = type_id || announcementTypeId;
      const sectionPosition = position ?? sortOrder;

      if (!sectionName || sectionName.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      if (!sectionTypeId) {
        throw new AppError('Announcement type ID is required', 400);
      }

      const section = await announcementService.createAnnouncementSection({
        type_id: sectionTypeId,
        name: sectionName,
        slug,
        description,
        announcement_year: announcement_year || null,
        cta_enabled: cta_enabled || false,
        cta_text: cta_text || null,
        cta_url: cta_url || null,
        position: sectionPosition ? parseInt(sectionPosition) : undefined,
        isActive,
      });

      res.status(201).json({
        success: true,
        message: 'Announcement section created successfully',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementSectionById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement section ID is required', 400);

      const section = await announcementService.getAnnouncementSectionById(id);

      res.json({
        success: true,
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncementSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement section ID is required', 400);

      const {
        type_id, announcementTypeId,
        name, title,
        slug, description,
        announcement_year,
        cta_enabled, cta_text, cta_url,
        position, sortOrder,
        isActive,
      } = req.body;

      const section = await announcementService.updateAnnouncementSection(id, {
        type_id: type_id || announcementTypeId,
        name: name || title,
        slug,
        description,
        announcement_year,
        cta_enabled,
        cta_text,
        cta_url,
        position: (position ?? sortOrder) !== undefined ? parseInt(position ?? sortOrder) : undefined,
        isActive,
      });

      res.json({
        success: true,
        message: 'Announcement section updated successfully',
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleAnnouncementSectionStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Announcement section ID is required', 400);

      const section = await announcementService.toggleAnnouncementSectionStatus(id.toString());

      res.json({
        success: true,
        message: `Announcement section ${section.isActive ? 'activated' : 'deactivated'} successfully`,
        data: section,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncementSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement section ID is required', 400);

      const result = await announcementService.deleteAnnouncementSection(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMultipleAnnouncementSections(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await announcementService.deleteMultipleAnnouncementSections(ids.map(String));

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementSectionItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement section ID is required', 400);

      const data = await announcementService.getAnnouncementSectionItems(id);

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

      if (!id) throw new AppError('Announcement section ID is required', 400);
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await announcementService.updateSectionItemsOrder(id, updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // ANNOUNCEMENT ITEM ENDPOINTS
  // ============================================

  async getAnnouncementItems(req: Request, res: Response, next: NextFunction) {
    try {
      const params: AnnouncementItemQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type_id: (req.query.type_id || req.query.announcementTypeId) as string,
        section_id: (req.query.section_id || req.query.announcementSectionId) as string,
        status: req.query.status as string,
        sortBy: this.mapAnnouncementItemSortBy((req.query.sortBy as string) || 'created_at'),
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      };

      const result = await announcementService.getAnnouncementItems(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createAnnouncementItem(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        type_id,
        announcementTypeId,
        section_id,
        announcementSectionId,
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

      const item = await announcementService.createAnnouncementItem({
        type_id: type_id || announcementTypeId || undefined,
        section_id: section_id || announcementSectionId || undefined,
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
        message: 'Announcement item created successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement item ID is required', 400);

      const item = await announcementService.getAnnouncementItemById(id);

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncementItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement item ID is required', 400);

      const {
        type_id,
        announcementTypeId,
        section_id,
        announcementSectionId,
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

      const item = await announcementService.updateAnnouncementItem(id, {
        type_id: type_id || announcementTypeId || undefined,
        section_id: section_id || announcementSectionId || undefined,
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
        message: 'Announcement item updated successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleAnnouncementItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;
      if (!id) throw new AppError('Announcement item ID is required', 400);

      const item = await announcementService.toggleAnnouncementItemStatus(id.toString());

      res.json({
        success: true,
        message: 'Announcement item status toggled successfully',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAnnouncementItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Announcement item ID is required', 400);

      const result = await announcementService.deleteAnnouncementItem(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMultipleAnnouncementItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await announcementService.deleteMultipleAnnouncementItems(ids.map(String));

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnnouncementItemsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;
      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await announcementService.updateAnnouncementItemsOrder(updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnnouncementItemStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await announcementService.getAnnouncementItemStats();

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

  async filterAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const params: AnnouncementFilterParams = {
        search: req.query.search as string,
        type_id: req.query.type_id as string,
        section_id: req.query.section_id as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await announcementService.filterAnnouncements(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicSectionItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Section ID is required', 400);

      const data = await announcementService.getPublicSectionItems(id);

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

const announcementController = new AnnouncementController();
export default announcementController;
