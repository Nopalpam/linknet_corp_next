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
  private normalizeReportTypeValue(value: any): 'Grid' | 'List' | null {
    return value === 'Grid' || value === 'List' ? value : null;
  }

  private getReportTypeFromDescription(description?: string | null): 'Grid' | 'List' | null {
    const match = String(description || '').match(/^Type:\s*(Grid|List)\s*$/i);
    if (!match) return null;
    const value = match[1];
    return value?.toLowerCase() === 'list' ? 'List' : 'Grid';
  }

  private getReportTypeDescription(type?: 'Grid' | 'List', description?: string | null) {
    if (description !== undefined) return description || null;
    return type ? `Type: ${type}` : undefined;
  }

  private getCleanReportTypeDescription(description?: string | null) {
    return this.getReportTypeFromDescription(description) ? null : (description || null);
  }

  private inferReportType(item: any): 'Grid' | 'List' {
    const explicitType = this.normalizeReportTypeValue(item?.type);
    if (explicitType) return explicitType;

    const descriptionType = this.getReportTypeFromDescription(item?.description);
    if (descriptionType) return descriptionType;

    const sectionCount = item?._count?.report_sections ?? item?._count?.reportSections ?? item?.report_sections?.length ?? 0;
    return sectionCount > 0 ? 'List' : 'Grid';
  }

  private async countReportItemsForType(typeId: string) {
    return prisma.reports.count({
      where: {
        deleted_at: null,
        OR: [
          { type_id: typeId },
          { report_sections: { type_id: typeId } },
        ],
      },
    });
  }

  private formatReportType(item: any, reportItemsCount?: number) {
    const reportSectionsCount = item?._count?.report_sections ?? item?._count?.reportSections ?? item?.report_sections?.length ?? 0;
    const reportItems = reportItemsCount ?? item?._count?.reports ?? item?._count?.reportItems ?? 0;

    return {
      ...item,
      type: this.inferReportType(item),
      description: this.getCleanReportTypeDescription(item?.description),
      sortOrder: item?.position ?? item?.sortOrder ?? 0,
      _count: {
        ...(item?._count || {}),
        reportSections: reportSectionsCount,
        reportItems,
        report_sections: reportSectionsCount,
        reports: reportItems,
      },
    };
  }

  private parseReportYear(section: any): number | null {
    const explicitYear = section?.report_year ?? section?.reportYear;
    if (explicitYear) {
      const year = Number(explicitYear);
      return Number.isNaN(year) ? null : year;
    }

    const source = `${section?.name || ''} ${section?.description || ''}`;
    const match = source.match(/\b(20\d{2}|19\d{2})\b/);
    return match ? Number(match[1]) : null;
  }

  private formatReportSection(section: any) {
    const itemCount = section?._count?.reports ?? section?._count?.reportItems ?? section?.reports?.length ?? 0;
    const reportType = section?.report_types
      ? {
          id: section.report_types.id,
          name: section.report_types.name,
          type: this.inferReportType({
            ...section.report_types,
            _count: { report_sections: 1 },
          }),
        }
      : null;

    return {
      ...section,
      reportTypeId: section?.type_id || '',
      title: section?.name || '',
      reportYear: this.parseReportYear(section),
      ctaEnabled: false,
      ctaText: null,
      ctaUrl: null,
      sortOrder: section?.position ?? section?.sortOrder ?? 0,
      reportType,
      _count: {
        ...(section?._count || {}),
        reportItems: itemCount,
        reports: itemCount,
      },
    };
  }

  // ============================================
  // REPORT TYPE METHODS
  // ============================================

  async getReportTypes(params: ReportTypeQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
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

    const [reportTypes, dbTotal] = await Promise.all([
      prisma.reportType.findMany({
        where,
        include: {
          _count: {
            select: {
              report_sections: { where: { deletedAt: null } },
              reports: { where: { deleted_at: null } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        ...(type ? {} : { skip, take: limit }),
      }),
      prisma.reportType.count({ where }),
    ]);
    const reportItemCounts = await Promise.all(
      reportTypes.map((reportType: any) => this.countReportItemsForType(reportType.id))
    );
    const formattedTypes = reportTypes.map((reportType: any, index) => this.formatReportType(reportType, reportItemCounts[index]));
    const filteredTypes = type ? formattedTypes.filter((reportType: any) => reportType.type === type) : formattedTypes;
    const data = type ? filteredTypes.slice(skip, skip + limit) : filteredTypes;
    const total = type ? filteredTypes.length : dbTotal;

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getReportTypesList(typeFilter?: 'Grid' | 'List') {
    const reportTypes = await prisma.reportType.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: {
            report_sections: { where: { deletedAt: null } },
            reports: { where: { deleted_at: null } },
          },
        },
      },
    });
    const itemCounts = await Promise.all(
      reportTypes.map((reportType: any) => this.countReportItemsForType(reportType.id))
    );
    const formattedTypes = reportTypes.map((reportType: any, index) => this.formatReportType(reportType, itemCounts[index]));
    return typeFilter ? formattedTypes.filter((reportType: any) => reportType.type === typeFilter) : formattedTypes;
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
            reports: { where: { deleted_at: null } },
          },
        },
      },
    });

    if (!reportType) {
      throw new AppError('Report type not found', 404);
    }

    const reportItemsCount = await this.countReportItemsForType(reportType.id);
    return this.formatReportType(
      {
        ...reportType,
        report_sections: reportType.report_sections.map((section: any) => this.formatReportSection(section)),
      },
      reportItemsCount
    );
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
        description: this.getReportTypeDescription(data.type, data.description) ?? null,
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
    if (data.description !== undefined || data.type !== undefined) {
      updateData.description = this.getReportTypeDescription(data.type, data.description ?? undefined);
    }
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
        report_types: {
          select: { id: true, name: true, description: true },
        },
        _count: {
          select: { reports: { where: { deleted_at: null } } },
        },
      },
      orderBy: { position: 'asc' },
    });

    return sections.map((section: any) => this.formatReportSection(section));
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
            select: { id: true, name: true, description: true },
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
      data: sections.map((section: any) => this.formatReportSection(section)),
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
        type_id: true,
        position: true,
        description: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        report_types: { select: { id: true, name: true, description: true } },
        _count: {
          select: { reports: { where: { deleted_at: null } } },
        },
      },
    });

    return sections.map((section: any) => this.formatReportSection(section));
  }

  async getReportSectionById(id: string) {
    const section = await prisma.reportSection.findFirst({
      where: { id, deletedAt: null },
      include: {
        report_types: {
          select: { id: true, name: true, description: true },
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

    return this.formatReportSection(section);
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
      include: {
        report_types: { select: { id: true, name: true, description: true } },
        report_sections: { select: { id: true, name: true, type_id: true, description: true } },
      },
      orderBy: { year: 'desc' },
    });

    return items.map((item: any) => this.formatReportItem(item));
  }

  async updateSectionItemsOrder(_sectionId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reports.update({
        where: { id: item.id },
        data: { sort_order: item.position },
      })
    );
    await prisma.$transaction(operations);
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
      data_type,
      audit_status,
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
      where.OR = [
        ...(where.OR || []),
        { type_id },
        { report_sections: { type_id } },
      ];
      // If there was already an OR for search, we need to use AND
      if (search) {
        where.AND = [
          {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { type_id },
              { report_sections: { type_id } },
            ],
          },
        ];
        delete where.OR;
      }
    }
    if (year) {
      where.year = year;
    }
    if (data_type) {
      where.data_type = data_type;
    }
    if (audit_status) {
      where.audit_status = audit_status;
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.reports.findMany({
        where,
        include: {
          report_types: { select: { id: true, name: true, slug: true, description: true } },
          report_sections: {
            select: { id: true, name: true, type_id: true, description: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.reports.count({ where }),
    ]);

    return {
      data: items.map((item: any) => this.formatReportItem(item)),
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
        report_types: { select: { id: true, name: true, slug: true, description: true } },
        report_sections: {
          select: { id: true, name: true, type_id: true, description: true },
        },
      },
    });

    if (!item) {
      throw new AppError('Report item not found', 404);
    }

    return this.formatReportItem(item);
  }

  async createReportItem(data: CreateReportItemDTO) {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('Title is required', 400);
    }
    if (!data.type_id && !data.section_id) {
      throw new AppError('Either Report Type or Section is required', 400);
    }

    // Validate type_id if provided
    if (data.type_id) {
      const reportType = await prisma.reportType.findFirst({
        where: { id: data.type_id, deletedAt: null },
      });
      if (!reportType) {
        throw new AppError('Report type not found', 404);
      }
    }

    // Validate section_id if provided
    if (data.section_id) {
      const section = await prisma.reportSection.findFirst({
        where: { id: data.section_id, deletedAt: null },
      });
      if (!section) {
        throw new AppError('Report section not found', 404);
      }
      // If section is provided but type_id is not, derive type_id from section
      if (!data.type_id) {
        data.type_id = section.type_id;
      }
    }

    const slug = data.slug || slugify(data.title, { lower: true, strict: true });

    const item = await prisma.reports.create({
      data: {
        id: uuidv4(),
        type_id: data.type_id || null,
        section_id: data.section_id || null,
        title: data.title.trim(),
        slug,
        description: data.description?.trim() || null,
        pdf_file: data.pdf_file || null,
        cover_image: data.cover_image || null,
        data_type: data.data_type || null,
        audit_status: data.audit_status || null,
        file_size: data.file_size || null,
        sort_order: data.sort_order ?? 0,
        is_active: data.is_active !== undefined ? data.is_active : true,
        status: (data.status as any) || 'PUBLISHED',
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        report_types: { select: { id: true, name: true, slug: true, description: true } },
        report_sections: { select: { id: true, name: true, type_id: true, description: true } },
      },
    });

    return this.formatReportItem(item);
  }

  async updateReportItem(id: string, data: UpdateReportItemDTO) {
    const existing = await prisma.reports.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Report item not found', 404);
    }

    if (data.type_id) {
      const reportType = await prisma.reportType.findFirst({
        where: { id: data.type_id, deletedAt: null },
      });
      if (!reportType) throw new AppError('Report type not found', 404);
    }

    if (data.section_id) {
      const section = await prisma.reportSection.findFirst({
        where: { id: data.section_id, deletedAt: null },
      });
      if (!section) throw new AppError('Report section not found', 404);
    }

    const updateData: any = { updated_at: new Date() };
    if (data.type_id !== undefined) updateData.type_id = data.type_id || null;
    if (data.section_id !== undefined) updateData.section_id = data.section_id || null;
    if (data.title !== undefined) {
      updateData.title = data.title.trim();
      updateData.slug = data.slug || slugify(data.title, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.pdf_file !== undefined) updateData.pdf_file = data.pdf_file || null;
    if (data.cover_image !== undefined) updateData.cover_image = data.cover_image || null;
    if (data.data_type !== undefined) updateData.data_type = data.data_type || null;
    if (data.audit_status !== undefined) updateData.audit_status = data.audit_status || null;
    if (data.file_size !== undefined) updateData.file_size = data.file_size || null;
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.status !== undefined) updateData.status = data.status;

    const item = await prisma.reports.update({
      where: { id },
      data: updateData,
      include: {
        report_types: { select: { id: true, name: true, slug: true, description: true } },
        report_sections: { select: { id: true, name: true, type_id: true, description: true } },
      },
    });

    return this.formatReportItem(item);
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

  async updateReportItemsOrder(updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.reports.update({
        where: { id: item.id },
        data: { sort_order: item.position },
      })
    );
    await prisma.$transaction(operations);
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
      is_active: true,
    };

    if (type_id) {
      where.OR = [
        { type_id },
        { report_sections: { type_id } },
      ];
    }
    if (section_id) {
      where.section_id = section_id;
    }
    if (year) {
      where.data_type = { contains: year, mode: 'insensitive' };
    }
    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
      // Merge with existing OR if type_id created one
      if (where.OR && type_id) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [items, total] = await Promise.all([
      prisma.reports.findMany({
        where,
        include: {
          report_types: { select: { id: true, name: true, slug: true, description: true } },
          report_sections: {
            select: { id: true, name: true, type_id: true, description: true },
          },
        },
        orderBy: { sort_order: 'asc' },
        skip,
        take: limit,
      }),
      prisma.reports.count({ where }),
    ]);

    return {
      data: items.map((item: any) => this.formatReportItem(item)),
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

  // ============================================
  // RESPONSE FORMATTING
  // ============================================

  private formatReportItem(item: any) {
    const reportType = item.report_types || null;
    const reportSection = item.report_sections || null;

    return {
      id: item.id,
      reportTypeId: item.type_id || reportSection?.type_id || null,
      reportSectionId: item.section_id || null,
      title: item.title,
      slug: item.slug,
      subDescription: item.description || null,
      pdfFile: item.pdf_file || null,
      coverImage: item.cover_image || null,
      dataType: item.data_type || null,
      auditStatus: item.audit_status || null,
      fileSize: item.file_size || null,
      sortOrder: item.sort_order ?? 0,
      isActive: item.is_active !== undefined ? item.is_active : true,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      reportType: reportType
        ? { id: reportType.id, name: reportType.name, type: this.inferReportType(reportType) }
        : null,
      reportSection: reportSection
        ? { id: reportSection.id, title: reportSection.name, reportYear: this.parseReportYear(reportSection) }
        : null,
    };
  }
}

const reportService = new ReportService();
export default reportService;
