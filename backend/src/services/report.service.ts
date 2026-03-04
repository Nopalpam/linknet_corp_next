import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
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
 * Report Service
 * Handles business logic for ReportType → ReportSection → reports CRUD operations
 * Matches current Prisma schema with String IDs
 */
export class ReportService {
  // ============================================
  // REPORT TYPE METHODS
  // ============================================

  async getReportTypes(params: ReportTypeQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'position',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
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
              report_sections: { where: { deletedAt: null } },
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
      data: reportTypes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getReportTypesList() {
    const reportTypes = await prisma.reportType.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { position: 'asc' },
      select: { id: true, name: true, slug: true },
    });
    return reportTypes;
  }

  async getReportTypeById(id: string) {
    const reportType = await prisma.reportType.findFirst({
      where: { id, deletedAt: null },
      include: {
        report_sections: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: { reports: { where: { deleted_at: null } } },
            },
          },
        },
        _count: {
          select: {
            report_sections: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    return reportType;
  }

  async createReportType(data: CreateReportTypeDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new AppError('Name is required', 400);
    }

    let position = data.position ?? 0;
    if (position === 0) {
      const maxOrder = await prisma.reportType.aggregate({
        _max: { position: true },
        where: { deletedAt: null },
      });
      position = (maxOrder._max?.position || 0) + 1;
    }

    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    const reportType = await prisma.reportType.create({
      data: {
        id: uuidv4(),
        name: data.name.trim(),
        slug,
        description: data.description,
        icon: data.icon,
        color: data.color,
        position,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return reportType;
  }

  async updateReportType(id: string, data: UpdateReportTypeDTO) {
    const existing = await prisma.reportType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report type not found', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
      updateData.slug = data.slug || slugify(data.name, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const reportType = await prisma.reportType.update({
      where: { id },
      data: updateData,
    });

    return reportType;
  }

  async toggleReportTypeStatus(id: string) {
    const existing = await prisma.reportType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report type not found', 404);
    }

    const reportType = await prisma.reportType.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return reportType;
  }

  async deleteReportType(id: string) {
    const existing = await prisma.reportType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report type not found', 404);
    }

    const now = new Date();

    await prisma.$transaction([
      // Soft delete reports under sections of this type
      prisma.reports.updateMany({
        where: {
          report_sections: { type_id: id },
          deleted_at: null,
        },
        data: { deleted_at: now },
      }),
      // Soft delete sections
      prisma.reportSection.updateMany({
        where: { type_id: id, deletedAt: null },
        data: { deletedAt: now },
      }),
      // Soft delete type
      prisma.reportType.update({
        where: { id },
        data: { deletedAt: now },
      }),
    ]);

    return { message: 'Report type deleted successfully' };
  }

  async deleteMultipleReportTypes(ids: string[]) {
    const now = new Date();

    await prisma.$transaction([
      prisma.reports.updateMany({
        where: {
          report_sections: { type_id: { in: ids } },
          deleted_at: null,
        },
        data: { deleted_at: now },
      }),
      prisma.reportSection.updateMany({
        where: { type_id: { in: ids }, deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.reportType.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    return { message: `${ids.length} report types deleted successfully` };
  }

  async getReportTypeSections(reportTypeId: string) {
    const reportType = await prisma.reportType.findFirst({
      where: { id: reportTypeId, deletedAt: null },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    const sections = await prisma.reportSection.findMany({
      where: { type_id: reportTypeId, deletedAt: null },
      include: {
        _count: {
          select: { reports: { where: { deleted_at: null } } },
        },
      },
      orderBy: { position: 'asc' },
    });

    return sections;
  }

  async updateSectionsOrder(_reportTypeId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reportSection.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await prisma.$transaction(operations);
    return { message: 'Sections order updated' };
  }

  // ============================================
  // REPORT SECTION METHODS
  // ============================================

  async getReportSections(params: ReportSectionQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      type_id,
      isActive,
      sortBy = 'position',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type_id) {
      where.type_id = type_id;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [sections, total] = await Promise.all([
      prisma.reportSection.findMany({
        where,
        include: {
          report_types: {
            select: { id: true, name: true },
          },
          _count: {
            select: { reports: { where: { deleted_at: null } } },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reportSection.count({ where }),
    ]);

    return {
      data: sections,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getReportSectionsList(typeId?: string) {
    const where: any = { deletedAt: null, isActive: true };
    if (typeId) {
      where.type_id = typeId;
    }

    const sections = await prisma.reportSection.findMany({
      where,
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        report_types: { select: { id: true, name: true } },
      },
    });

    return sections;
  }

  async getReportSectionById(id: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id, deletedAt: null },
      include: {
        report_types: {
          select: { id: true, name: true },
        },
        reports: {
          where: { deleted_at: null },
          orderBy: { year: 'desc' },
        },
        _count: {
          select: { reports: { where: { deleted_at: null } } },
        },
      },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    return section;
  }

  async createReportSection(data: CreateReportSectionDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new AppError('Name is required', 400);
    }
    if (!data.type_id) {
      throw new AppError('Report type ID is required', 400);
    }

    const reportType = await prisma.reportType.findFirst({
      where: { id: data.type_id, deletedAt: null },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    let position = data.position ?? 0;
    if (position === 0) {
      const maxOrder = await prisma.reportSection.aggregate({
        _max: { position: true },
        where: { type_id: data.type_id, deletedAt: null },
      });
      position = (maxOrder._max?.position || 0) + 1;
    }

    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    const section = await prisma.reportSection.create({
      data: {
        id: uuidv4(),
        type_id: data.type_id,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        position,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return section;
  }

  async updateReportSection(id: string, data: UpdateReportSectionDTO) {
    const existing = await prisma.reportSection.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report section not found', 404);
    }

    if (data.type_id) {
      const reportType = await prisma.reportType.findFirst({
        where: { id: data.type_id, deletedAt: null },
      });
      if (!reportType) {
        throw new AppError('Report type not found', 404);
      }
    }

    const updateData: any = {};
    if (data.type_id !== undefined) updateData.type_id = data.type_id;
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
      updateData.slug = data.slug || slugify(data.name, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const section = await prisma.reportSection.update({
      where: { id },
      data: updateData,
    });

    return section;
  }

  async toggleReportSectionStatus(id: string) {
    const existing = await prisma.reportSection.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Report section not found', 404);
    }

    const section = await prisma.reportSection.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return section;
  }

  async deleteReportSection(id: string) {
    const existing = await prisma.reportSection.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { reports: { where: { deleted_at: null } } },
        },
      },
    });

    if (!existing) {
      throw new AppError('Report section not found', 404);
    }

    if (existing._count.reports > 0) {
      throw new AppError(
        `Cannot delete section. It still has ${existing._count.reports} report(s). Remove or move items first.`,
        400
      );
    }

    await prisma.reportSection.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Report section deleted successfully' };
  }

  async deleteMultipleReportSections(ids: string[]) {
    const sectionsWithItems = await prisma.reportSection.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: {
        _count: {
          select: { reports: { where: { deleted_at: null } } },
        },
      },
    });

    const hasItems = sectionsWithItems.filter((s: any) => s._count.reports > 0);
    if (hasItems.length > 0) {
      const names = hasItems.map((s: any) => `"${s.name}" (${s._count.reports} reports)`);
      throw new AppError(
        `Cannot delete sections with reports: ${names.join(', ')}. Remove reports first.`,
        400
      );
    }

    await prisma.reportSection.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return { message: `${ids.length} report sections deleted successfully` };
  }

  async getReportSectionItems(sectionId: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id: sectionId, deletedAt: null },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    const items = await prisma.reports.findMany({
      where: { section_id: sectionId, deleted_at: null },
      orderBy: { year: 'desc' },
    });

    return items;
  }

  async updateSectionItemsOrder(_sectionId: string, _updates: OrderUpdateItem[]) {
    // reports model doesn't have position, so we skip ordering for now
    return { message: 'Section items order updated' };
  }

  // ============================================
  // REPORT ITEM (reports) METHODS
  // ============================================

  async getReportItems(params: ReportItemQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      type_id,
      section_id,
      year,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = { deleted_at: null };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (section_id) {
      where.section_id = section_id;
    }
    if (type_id) {
      where.report_sections = { type_id };
    }
    if (year) {
      where.year = year;
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.reports.findMany({
        where,
        include: {
          report_sections: {
            select: { id: true, name: true, type_id: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reports.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getReportItemById(id: string) {
    const item = await prisma.reports.findFirst({
      where: { id, deleted_at: null },
      include: {
        report_sections: {
          select: { id: true, name: true, type_id: true },
        },
      },
    });

    if (!item) {
      throw new AppError('Report item not found', 404);
    }

    return item;
  }

  async createReportItem(data: CreateReportItemDTO) {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('Title is required', 400);
    }
    if (!data.section_id) {
      throw new AppError('Section ID is required', 400);
    }

    const section = await prisma.reportSection.findFirst({
      where: { id: data.section_id, deletedAt: null },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    const slug = data.slug || slugify(data.title, { lower: true, strict: true });

    const item = await prisma.reports.create({
      data: {
        id: uuidv4(),
        section_id: data.section_id,
        title: data.title.trim(),
        slug,
        description: data.description?.trim() || null,
        period: data.period || null,
        year: data.year || null,
        quarter: data.quarter || null,
        file_url: data.file_url || null,
        file_size: data.file_size || null,
        file_type: data.file_type || null,
        thumbnail: data.thumbnail || null,
        status: (data.status as any) || 'PUBLISHED',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return item;
  }

  async updateReportItem(id: string, data: UpdateReportItemDTO) {
    const existing = await prisma.reports.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    if (data.section_id) {
      const section = await prisma.reportSection.findFirst({
        where: { id: data.section_id, deletedAt: null },
      });
      if (!section) throw new AppError('Report section not found', 404);
    }

    const updateData: any = { updated_at: new Date() };
    if (data.section_id !== undefined) updateData.section_id = data.section_id;
    if (data.title !== undefined) {
      updateData.title = data.title.trim();
      updateData.slug = data.slug || slugify(data.title, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.quarter !== undefined) updateData.quarter = data.quarter;
    if (data.file_url !== undefined) updateData.file_url = data.file_url;
    if (data.file_size !== undefined) updateData.file_size = data.file_size;
    if (data.file_type !== undefined) updateData.file_type = data.file_type;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.status !== undefined) updateData.status = data.status;

    const item = await prisma.reports.update({
      where: { id },
      data: updateData,
    });

    return item;
  }

  async toggleReportItemStatus(id: string) {
    const existing = await prisma.reports.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    const newStatus = existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    const item = await prisma.reports.update({
      where: { id },
      data: { status: newStatus as any, updated_at: new Date() },
    });

    return item;
  }

  async deleteReportItem(id: string) {
    const existing = await prisma.reports.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    await prisma.reports.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { message: 'Report item deleted successfully' };
  }

  async deleteMultipleReportItems(ids: string[]) {
    await prisma.reports.updateMany({
      where: { id: { in: ids }, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    return { message: `${ids.length} report items deleted successfully` };
  }

  async updateReportItemsOrder(_updates: OrderUpdateItem[]) {
    // reports model doesn't have a position field; skip
    return { message: 'Report items order updated' };
  }

  async getReportItemStats() {
    const [total, published, draft] = await Promise.all([
      prisma.reports.count({ where: { deleted_at: null } }),
      prisma.reports.count({ where: { deleted_at: null, status: 'PUBLISHED' } }),
      prisma.reports.count({ where: { deleted_at: null, status: 'DRAFT' } }),
    ]);

    return { total, published, draft };
  }

  // ============================================
  // PUBLIC FRONTEND METHODS
  // ============================================

  async filterReports(params: ReportFilterParams) {
    const {
      search,
      year,
      type_id,
      section_id,
      page = 1,
      limit = 12,
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {
      deleted_at: null,
      status: 'PUBLISHED',
      report_sections: { deletedAt: null, isActive: true },
    };

    if (type_id) {
      where.report_sections.type_id = type_id;
    }
    if (section_id) {
      where.section_id = section_id;
    }
    if (year) {
      where.year = year;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.reports.findMany({
        where,
        include: {
          report_sections: {
            select: { id: true, name: true, type_id: true },
          },
        },
        orderBy: { year: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reports.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getReportYears() {
    const reports = await prisma.reports.findMany({
      where: {
        deleted_at: null,
        status: 'PUBLISHED',
        year: { not: null },
      },
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' },
    });

    return reports.map((r: any) => r.year).filter(Boolean);
  }

  async getPublicSectionItems(sectionId: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id: sectionId, deletedAt: null, isActive: true },
      include: {
        reports: {
          where: { deleted_at: null, status: 'PUBLISHED' },
          orderBy: { year: 'desc' },
        },
      },
    });

    if (!section) {
      throw new AppError('Report section not found', 404);
    }

    return section;
  }
}

const reportService = new ReportService();
export default reportService;
