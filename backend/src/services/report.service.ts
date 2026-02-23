import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import {
  CreateReportTypeDTO,
  UpdateReportTypeDTO,
  ReportTypeQueryParams,
  CreateReportSectionDTO,
  UpdateReportSectionDTO,
  ReportSectionQueryParams,
  CreateReportItemDTO,
  UpdateReportItemDTO,
  ReportItemQueryParams,
  ReportFilterParams,
  OrderUpdateItem,
} from '../types/report.types';

const prisma = new PrismaClient();

/**
 * Helper: serialize BigInt fields to string for JSON responses
 */
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Report Service
 * Handles business logic for ReportType, ReportSection, ReportItem CRUD operations
 * Compatible with MySQL legacy structure
 */
export class ReportService {
  // ============================================
  // REPORT TYPE METHODS
  // ============================================

  /**
   * Get report types with pagination and filters (CMS DataTable)
   */
  async getReportTypes(params: ReportTypeQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      isActive,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [reportTypes, total] = await Promise.all([
      prisma.reportType.findMany({
        where,
        include: {
          _count: {
            select: {
              reportSections: { where: { deletedAt: null } },
              reportItems: { where: { deletedAt: null } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reportType.count({ where }),
    ]);

    return {
      data: serializeBigInt(reportTypes),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get active report types for dropdown
   */
  async getReportTypesList(typeFilter?: 'Grid' | 'List') {
    const where: any = { deletedAt: null, isActive: true };
    if (typeFilter) {
      where.type = typeFilter;
    }

    const reportTypes = await prisma.reportType.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, type: true },
    });

    return serializeBigInt(reportTypes);
  }

  /**
   * Get single report type by ID with related data
   */
  async getReportTypeById(id: string) {
    const reportType = await prisma.reportType.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        reportSections: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: {
              select: { reportItems: { where: { deletedAt: null } } },
            },
          },
        },
        reportItems: {
          where: { deletedAt: null, reportSectionId: null },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            reportSections: { where: { deletedAt: null } },
            reportItems: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    return serializeBigInt(reportType);
  }

  /**
   * Create new report type
   */
  async createReportType(data: CreateReportTypeDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new AppError('Name is required', 400);
    }

    const validTypes = ['Grid', 'List'];
    if (data.type && !validTypes.includes(data.type)) {
      throw new AppError('Type must be Grid or List', 400);
    }

    // Auto sort_order if not provided
    let sortOrder = data.sortOrder ?? 0;
    if (sortOrder === 0) {
      const maxOrder = await prisma.reportType.aggregate({
        _max: { sortOrder: true },
        where: { deletedAt: null },
      });
      sortOrder = (maxOrder._max?.sortOrder || 0) + 1;
    }

    const reportType = await prisma.reportType.create({
      data: {
        name: data.name.trim(),
        type: data.type || 'Grid',
        sortOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return serializeBigInt(reportType);
  }

  /**
   * Update report type
   */
  async updateReportType(id: string, data: UpdateReportTypeDTO) {
    const existing = await prisma.reportType.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report type not found', 404);
    }

    const validTypes = ['Grid', 'List'];
    if (data.type && !validTypes.includes(data.type)) {
      throw new AppError('Type must be Grid or List', 400);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const reportType = await prisma.reportType.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return serializeBigInt(reportType);
  }

  /**
   * Toggle report type status
   */
  async toggleReportTypeStatus(id: string) {
    const existing = await prisma.reportType.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report type not found', 404);
    }

    const reportType = await prisma.reportType.update({
      where: { id: BigInt(id) },
      data: { isActive: !existing.isActive },
    });

    return serializeBigInt(reportType);
  }

  /**
   * Soft delete report type
   */
  async deleteReportType(id: string) {
    const existing = await prisma.reportType.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report type not found', 404);
    }

    // Soft delete type, its sections, and items
    const now = new Date();

    await prisma.$transaction([
      prisma.reportItem.updateMany({
        where: { reportTypeId: BigInt(id), deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.reportItem.updateMany({
        where: {
          reportSection: { reportTypeId: BigInt(id) },
          deletedAt: null,
        },
        data: { deletedAt: now },
      }),
      prisma.reportSection.updateMany({
        where: { reportTypeId: BigInt(id), deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.reportType.update({
        where: { id: BigInt(id) },
        data: { deletedAt: now },
      }),
    ]);

    return { message: 'Report type deleted successfully' };
  }

  /**
   * Bulk soft delete report types
   */
  async deleteMultipleReportTypes(ids: string[]) {
    const now = new Date();
    const bigIntIds = ids.map((id) => BigInt(id));

    await prisma.$transaction([
      // Soft delete items under sections of these types
      prisma.reportItem.updateMany({
        where: {
          reportSection: { reportTypeId: { in: bigIntIds } },
          deletedAt: null,
        },
        data: { deletedAt: now },
      }),
      // Soft delete direct items
      prisma.reportItem.updateMany({
        where: { reportTypeId: { in: bigIntIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
      // Soft delete sections
      prisma.reportSection.updateMany({
        where: { reportTypeId: { in: bigIntIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
      // Soft delete types
      prisma.reportType.updateMany({
        where: { id: { in: bigIntIds }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    return { message: `${ids.length} report types deleted successfully` };
  }

  /**
   * Get sections for a report type (List type only)
   */
  async getReportTypeSections(reportTypeId: string) {
    const reportType = await prisma.reportType.findFirst({
      where: { id: BigInt(reportTypeId), deletedAt: null },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    const sections = await prisma.reportSection.findMany({
      where: { reportTypeId: BigInt(reportTypeId), deletedAt: null },
      include: {
        _count: {
          select: { reportItems: { where: { deletedAt: null } } },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return serializeBigInt(sections);
  }

  /**
   * Reorder sections within a report type
   */
  async updateSectionsOrder(_reportTypeId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reportSection.update({
        where: { id: BigInt(item.id) },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(operations);
    return { message: 'Sections order updated' };
  }

  /**
   * Get grid items for a report type (Grid type only)
   */
  async getReportTypeGridItems(reportTypeId: string) {
    const reportType = await prisma.reportType.findFirst({
      where: { id: BigInt(reportTypeId), deletedAt: null },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    const items = await prisma.reportItem.findMany({
      where: {
        reportTypeId: BigInt(reportTypeId),
        reportSectionId: null,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return serializeBigInt(items);
  }

  /**
   * Reorder grid items within a report type
   */
  async updateGridItemsOrder(_reportTypeId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reportItem.update({
        where: { id: BigInt(item.id) },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(operations);
    return { message: 'Grid items order updated' };
  }

  // ============================================
  // REPORT SECTION METHODS
  // ============================================

  /**
   * Get report sections with pagination and filters (CMS DataTable)
   */
  async getReportSections(params: ReportSectionQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      reportTypeId,
      isActive,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (reportTypeId) {
      where.reportTypeId = BigInt(reportTypeId);
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [sections, total] = await Promise.all([
      prisma.reportSection.findMany({
        where,
        include: {
          reportType: {
            select: { id: true, name: true, type: true },
          },
          _count: {
            select: { reportItems: { where: { deletedAt: null } } },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reportSection.count({ where }),
    ]);

    return {
      data: serializeBigInt(sections),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get active sections for dropdown (filtered by report_type_id)
   */
  async getReportSectionsList(reportTypeId?: string) {
    const where: any = { deletedAt: null, isActive: true };
    if (reportTypeId) {
      where.reportTypeId = BigInt(reportTypeId);
    }

    const sections = await prisma.reportSection.findMany({
      where,
      orderBy: [{ reportYear: 'desc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        title: true,
        reportYear: true,
        reportType: { select: { id: true, name: true } },
      },
    });

    return serializeBigInt(sections);
  }

  /**
   * Get single report section by ID
   */
  async getReportSectionById(id: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        reportType: {
          select: { id: true, name: true, type: true },
        },
        reportItems: {
          where: { deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { reportItems: { where: { deletedAt: null } } },
        },
      },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    return serializeBigInt(section);
  }

  /**
   * Create new report section (only for List type)
   */
  async createReportSection(data: CreateReportSectionDTO) {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('Title is required', 400);
    }

    if (!data.reportTypeId) {
      throw new AppError('Report type ID is required', 400);
    }

    // Validate report type exists and is List type
    const reportType = await prisma.reportType.findFirst({
      where: { id: BigInt(data.reportTypeId.toString()), deletedAt: null },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    if (reportType.type !== 'List') {
      throw new AppError('Sections can only be created for List type report types', 400);
    }

    // Auto sort_order
    let sortOrder = data.sortOrder ?? 0;
    if (sortOrder === 0) {
      const maxOrder = await prisma.reportSection.aggregate({
        _max: { sortOrder: true },
        where: { reportTypeId: BigInt(data.reportTypeId.toString()), deletedAt: null },
      });
      sortOrder = (maxOrder._max?.sortOrder || 0) + 1;
    }

    const section = await prisma.reportSection.create({
      data: {
        reportTypeId: BigInt(data.reportTypeId.toString()),
        title: data.title.trim(),
        description: data.description?.trim() || null,
        reportYear: data.reportYear || null,
        ctaEnabled: data.ctaEnabled !== undefined ? data.ctaEnabled : true,
        ctaText: data.ctaText?.trim() || null,
        ctaUrl: data.ctaUrl?.trim() || null,
        sortOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return serializeBigInt(section);
  }

  /**
   * Update report section
   */
  async updateReportSection(id: string, data: UpdateReportSectionDTO) {
    const existing = await prisma.reportSection.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report section not found', 404);
    }

    // If changing report type, validate it's List type
    if (data.reportTypeId) {
      const reportType = await prisma.reportType.findFirst({
        where: { id: BigInt(data.reportTypeId.toString()), deletedAt: null },
      });

      if (!reportType) {
        throw new AppError('Report type not found', 404);
      }

      if (reportType.type !== 'List') {
        throw new AppError('Sections can only belong to List type report types', 400);
      }
    }

    const updateData: any = {};
    if (data.reportTypeId !== undefined) updateData.reportTypeId = BigInt(data.reportTypeId.toString());
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.reportYear !== undefined) updateData.reportYear = data.reportYear;
    if (data.ctaEnabled !== undefined) updateData.ctaEnabled = data.ctaEnabled;
    if (data.ctaText !== undefined) updateData.ctaText = data.ctaText?.trim() || null;
    if (data.ctaUrl !== undefined) updateData.ctaUrl = data.ctaUrl?.trim() || null;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const section = await prisma.reportSection.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return serializeBigInt(section);
  }

  /**
   * Toggle report section status
   */
  async toggleReportSectionStatus(id: string) {
    const existing = await prisma.reportSection.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report section not found', 404);
    }

    const section = await prisma.reportSection.update({
      where: { id: BigInt(id) },
      data: { isActive: !existing.isActive },
    });

    return serializeBigInt(section);
  }

  /**
   * Soft delete report section (fails if has active items)
   */
  async deleteReportSection(id: string) {
    const existing = await prisma.reportSection.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        _count: {
          select: { reportItems: { where: { deletedAt: null } } },
        },
      },
    });

    if (!existing) {
      throw new AppError('Report section not found', 404);
    }

    if (existing._count.reportItems > 0) {
      throw new AppError(
        `Cannot delete section. It still has ${existing._count.reportItems} item(s). Remove or move items first.`,
        400
      );
    }

    await prisma.reportSection.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    return { message: 'Report section deleted successfully' };
  }

  /**
   * Bulk soft delete report sections
   */
  async deleteMultipleReportSections(ids: string[]) {
    const bigIntIds = ids.map((id) => BigInt(id));

    // Check if any section has items
    const sectionsWithItems = await prisma.reportSection.findMany({
      where: { id: { in: bigIntIds }, deletedAt: null },
      include: {
        _count: {
          select: { reportItems: { where: { deletedAt: null } } },
        },
      },
    });

    const hasItems = sectionsWithItems.filter((s) => s._count.reportItems > 0);
    if (hasItems.length > 0) {
      const names = hasItems.map((s) => `"${s.title}" (${s._count.reportItems} items)`);
      throw new AppError(
        `Cannot delete sections with items: ${names.join(', ')}. Remove items first.`,
        400
      );
    }

    await prisma.reportSection.updateMany({
      where: { id: { in: bigIntIds }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return { message: `${ids.length} report sections deleted successfully` };
  }

  /**
   * Get items for a section
   */
  async getReportSectionItems(sectionId: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id: BigInt(sectionId), deletedAt: null },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    const items = await prisma.reportItem.findMany({
      where: { reportSectionId: BigInt(sectionId), deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });

    return serializeBigInt(items);
  }

  /**
   * Reorder items within a section
   */
  async updateSectionItemsOrder(_sectionId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reportItem.update({
        where: { id: BigInt(item.id) },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(operations);
    return { message: 'Section items order updated' };
  }

  // ============================================
  // REPORT ITEM METHODS
  // ============================================

  /**
   * Get report items with pagination and filters (CMS DataTable)
   */
  async getReportItems(params: ReportItemQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      reportTypeId,
      reportSectionId,
      dataType,
      auditStatus,
      isActive,
      sortBy = 'sortOrder',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { subDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (reportTypeId) {
      where.reportTypeId = BigInt(reportTypeId);
    }

    if (reportSectionId) {
      where.reportSectionId = BigInt(reportSectionId);
    }

    if (dataType) {
      where.dataType = dataType;
    }

    if (auditStatus) {
      where.auditStatus = auditStatus;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [items, total] = await Promise.all([
      prisma.reportItem.findMany({
        where,
        include: {
          reportType: {
            select: { id: true, name: true, type: true },
          },
          reportSection: {
            select: { id: true, title: true, reportYear: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reportItem.count({ where }),
    ]);

    return {
      data: serializeBigInt(items),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get single report item by ID
   */
  async getReportItemById(id: string) {
    const item = await prisma.reportItem.findFirst({
      where: { id: BigInt(id), deletedAt: null },
      include: {
        reportType: {
          select: { id: true, name: true, type: true },
        },
        reportSection: {
          select: { id: true, title: true, reportYear: true },
        },
      },
    });

    if (!item) {
      throw new AppError('Report item not found', 404);
    }

    return serializeBigInt(item);
  }

  /**
   * Create new report item
   * Grid → must have reportTypeId, no reportSectionId
   * List → must have reportSectionId, inherits reportTypeId from section
   */
  async createReportItem(data: CreateReportItemDTO) {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('Title is required', 400);
    }

    // Validate data_type
    if (data.dataType && !['Consolidated', 'Interim'].includes(data.dataType)) {
      throw new AppError('data_type must be Consolidated or Interim', 400);
    }

    // Validate audit_status
    if (data.auditStatus && !['Audited', 'Unaudited', 'Limited Review'].includes(data.auditStatus)) {
      throw new AppError('audit_status must be Audited, Unaudited, or Limited Review', 400);
    }

    let reportTypeId: bigint | null = null;
    let reportSectionId: bigint | null = null;

    if (data.reportSectionId) {
      // List mode — attach to section
      const section = await prisma.reportSection.findFirst({
        where: { id: BigInt(data.reportSectionId.toString()), deletedAt: null },
        include: { reportType: true },
      });

      if (!section) {
        throw new AppError('Report section not found', 404);
      }

      reportSectionId = section.id;
      // Don't set reportTypeId for list items (attach through section)
    } else if (data.reportTypeId) {
      // Grid mode — attach to type directly
      const reportType = await prisma.reportType.findFirst({
        where: { id: BigInt(data.reportTypeId.toString()), deletedAt: null },
      });

      if (!reportType) {
        throw new AppError('Report type not found', 404);
      }

      reportTypeId = reportType.id;
    } else {
      throw new AppError('Either reportTypeId (Grid) or reportSectionId (List) is required', 400);
    }

    // Auto sort_order
    let sortOrder = data.sortOrder ?? 0;
    if (sortOrder === 0) {
      const maxWhere: any = { deletedAt: null };
      if (reportSectionId) maxWhere.reportSectionId = reportSectionId;
      else if (reportTypeId) {
        maxWhere.reportTypeId = reportTypeId;
        maxWhere.reportSectionId = null;
      }

      const maxOrder = await prisma.reportItem.aggregate({
        _max: { sortOrder: true },
        where: maxWhere,
      });
      sortOrder = (maxOrder._max?.sortOrder || 0) + 1;
    }

    const item = await prisma.reportItem.create({
      data: {
        reportTypeId,
        reportSectionId,
        title: data.title.trim(),
        subDescription: data.subDescription?.trim() || null,
        pdfFile: data.pdfFile?.trim() || null,
        coverImage: data.coverImage?.trim() || null,
        dataType: data.dataType || null,
        auditStatus: data.auditStatus || null,
        fileSize: data.fileSize?.trim() || null,
        sortOrder,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return serializeBigInt(item);
  }

  /**
   * Update report item
   */
  async updateReportItem(id: string, data: UpdateReportItemDTO) {
    const existing = await prisma.reportItem.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    // Validate data_type
    if (data.dataType && !['Consolidated', 'Interim'].includes(data.dataType)) {
      throw new AppError('data_type must be Consolidated or Interim', 400);
    }

    // Validate audit_status
    if (data.auditStatus && !['Audited', 'Unaudited', 'Limited Review'].includes(data.auditStatus)) {
      throw new AppError('audit_status must be Audited, Unaudited, or Limited Review', 400);
    }

    const updateData: any = {};

    // Handle parent change
    if (data.reportSectionId !== undefined) {
      if (data.reportSectionId) {
        const section = await prisma.reportSection.findFirst({
          where: { id: BigInt(data.reportSectionId.toString()), deletedAt: null },
        });
        if (!section) throw new AppError('Report section not found', 404);
        updateData.reportSectionId = section.id;
        updateData.reportTypeId = null; // Clear type when moving to section
      } else {
        updateData.reportSectionId = null;
      }
    }

    if (data.reportTypeId !== undefined) {
      if (data.reportTypeId) {
        const reportType = await prisma.reportType.findFirst({
          where: { id: BigInt(data.reportTypeId.toString()), deletedAt: null },
        });
        if (!reportType) throw new AppError('Report type not found', 404);
        updateData.reportTypeId = reportType.id;
        updateData.reportSectionId = null; // Clear section when moving to type
      } else {
        updateData.reportTypeId = null;
      }
    }

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.subDescription !== undefined) updateData.subDescription = data.subDescription?.trim() || null;
    if (data.pdfFile !== undefined) updateData.pdfFile = data.pdfFile?.trim() || null;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage?.trim() || null;
    if (data.dataType !== undefined) updateData.dataType = data.dataType || null;
    if (data.auditStatus !== undefined) updateData.auditStatus = data.auditStatus || null;
    if (data.fileSize !== undefined) updateData.fileSize = data.fileSize?.trim() || null;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const item = await prisma.reportItem.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    return serializeBigInt(item);
  }

  /**
   * Toggle report item status
   */
  async toggleReportItemStatus(id: string) {
    const existing = await prisma.reportItem.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    const item = await prisma.reportItem.update({
      where: { id: BigInt(id) },
      data: { isActive: !existing.isActive },
    });

    return serializeBigInt(item);
  }

  /**
   * Soft delete report item (remove cover image if exists)
   */
  async deleteReportItem(id: string) {
    const existing = await prisma.reportItem.findFirst({
      where: { id: BigInt(id), deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    // If cover image exists on local storage, try to delete
    if (existing.coverImage) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        const filePath = path.resolve(uploadDir, existing.coverImage);
        await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
      } catch (e) {
        // Non-critical, continue
      }
    }

    await prisma.reportItem.update({
      where: { id: BigInt(id) },
      data: { deletedAt: new Date() },
    });

    return { message: 'Report item deleted successfully' };
  }

  /**
   * Bulk soft delete report items
   */
  async deleteMultipleReportItems(ids: string[]) {
    const bigIntIds = ids.map((id) => BigInt(id));

    // Get items for cover image cleanup
    const items = await prisma.reportItem.findMany({
      where: { id: { in: bigIntIds }, deletedAt: null },
      select: { coverImage: true },
    });

    // Try to clean up cover images
    for (const item of items) {
      if (item.coverImage) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const uploadDir = process.env.UPLOAD_DIR || './uploads';
          const filePath = path.resolve(uploadDir, item.coverImage);
          await fs.unlink(filePath).catch(() => {});
        } catch (e) {
          // Non-critical
        }
      }
    }

    await prisma.reportItem.updateMany({
      where: { id: { in: bigIntIds }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return { message: `${ids.length} report items deleted successfully` };
  }

  /**
   * Reorder report items
   */
  async updateReportItemsOrder(updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reportItem.update({
        where: { id: BigInt(item.id) },
        data: { sortOrder: item.sortOrder },
      })
    );

    await prisma.$transaction(operations);
    return { message: 'Report items order updated' };
  }

  /**
   * Get report item stats
   */
  async getReportItemStats() {
    const [total, active, inactive] = await Promise.all([
      prisma.reportItem.count({ where: { deletedAt: null } }),
      prisma.reportItem.count({ where: { deletedAt: null, isActive: true } }),
      prisma.reportItem.count({ where: { deletedAt: null, isActive: false } }),
    ]);

    return { total, active, inactive };
  }

  // ============================================
  // PUBLIC FRONTEND METHODS
  // ============================================

  /**
   * Filter reports for public frontend
   */
  async filterReports(params: ReportFilterParams) {
    const {
      search,
      dataType,
      auditStatus,
      year,
      reportTypeId,
      displayType,
      page = 1,
      limit = 9,
    } = params;

    // Determine display type
    let actualDisplayType = displayType;
    if (reportTypeId) {
      const rt = await prisma.reportType.findFirst({
        where: { id: BigInt(reportTypeId), deletedAt: null },
      });
      if (rt) actualDisplayType = rt.type as 'Grid' | 'List';
    }

    if (actualDisplayType === 'List') {
      // List mode: return sections with items
      const sectionLimit = limit || 5;
      const skip = (page - 1) * sectionLimit;

      const sectionWhere: any = {
        deletedAt: null,
        isActive: true,
        reportType: { deletedAt: null, isActive: true },
      };

      if (reportTypeId) {
        sectionWhere.reportTypeId = BigInt(reportTypeId);
      }

      if (year) {
        sectionWhere.reportYear = year;
      }

      // Item filter within sections
      const itemWhere: any = { deletedAt: null, isActive: true };
      if (search) {
        itemWhere.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { subDescription: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (dataType) itemWhere.dataType = dataType;
      if (auditStatus) itemWhere.auditStatus = auditStatus;

      // If item filters are applied, only return sections that have matching items
      if (search || dataType || auditStatus) {
        sectionWhere.reportItems = { some: itemWhere };
      }

      const [sections, totalSections] = await Promise.all([
        prisma.reportSection.findMany({
          where: sectionWhere,
          include: {
            reportType: { select: { id: true, name: true, type: true } },
            reportItems: {
              where: itemWhere,
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [{ reportYear: 'desc' }, { sortOrder: 'asc' }],
          skip,
          take: sectionLimit,
        }),
        prisma.reportSection.count({ where: sectionWhere }),
      ]);

      return {
        displayType: 'List',
        data: serializeBigInt(sections),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalSections / sectionLimit),
          totalItems: totalSections,
          itemsPerPage: sectionLimit,
        },
      };
    } else {
      // Grid mode: return items directly
      const gridLimit = limit || 9;
      const skip = (page - 1) * gridLimit;

      const itemWhere: any = {
        deletedAt: null,
        isActive: true,
        reportSectionId: null, // Grid items don't have sections
      };

      if (reportTypeId) {
        itemWhere.reportTypeId = BigInt(reportTypeId);
      } else {
        // Only items from active Grid types
        itemWhere.reportType = { deletedAt: null, isActive: true, type: 'Grid' };
      }

      if (search) {
        itemWhere.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { subDescription: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (dataType) itemWhere.dataType = dataType;
      if (auditStatus) itemWhere.auditStatus = auditStatus;

      const [items, totalItems] = await Promise.all([
        prisma.reportItem.findMany({
          where: itemWhere,
          include: {
            reportType: { select: { id: true, name: true, type: true } },
          },
          orderBy: { sortOrder: 'asc' },
          skip,
          take: gridLimit,
        }),
        prisma.reportItem.count({ where: itemWhere }),
      ]);

      return {
        displayType: 'Grid',
        data: serializeBigInt(items),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalItems / gridLimit),
          totalItems: totalItems,
          itemsPerPage: gridLimit,
        },
      };
    }
  }

  /**
   * Get available years for filter dropdown (from report_sections)
   */
  async getReportYears() {
    const sections = await prisma.reportSection.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        reportYear: { not: null },
      },
      select: { reportYear: true },
      distinct: ['reportYear'],
      orderBy: { reportYear: 'desc' },
    });

    return sections.map((s) => s.reportYear).filter(Boolean);
  }

  /**
   * Get items for a section (public modal "View More")
   */
  async getPublicSectionItems(sectionId: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id: BigInt(sectionId), deletedAt: null, isActive: true },
      include: {
        reportItems: {
          where: { deletedAt: null, isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    return serializeBigInt(section);
  }
}

const reportService = new ReportService();
export default reportService;
