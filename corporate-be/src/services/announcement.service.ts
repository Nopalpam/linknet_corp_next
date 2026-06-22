import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateAnnouncementTypeDTO,
  UpdateAnnouncementTypeDTO,
  AnnouncementTypeQueryParams,
  CreateAnnouncementSectionDTO,
  UpdateAnnouncementSectionDTO,
  AnnouncementSectionQueryParams,
  CreateAnnouncementItemDTO,
  UpdateAnnouncementItemDTO,
  AnnouncementItemQueryParams,
  AnnouncementFilterParams,
  OrderUpdateItem,
} from '../types/announcement.types';

const prisma = new PrismaClient();

/**
 * Announcement Service
 * Handles business logic for AnnouncementType → AnnouncementSection → announcements CRUD operations
 */
export class AnnouncementService {
  private normalizeAnnouncementTypeValue(value: any): 'Grid' | 'List' {
    return value === 'Grid' || value === 'List' ? value : 'List';
  }

  private async countAnnouncementItemsForType(typeId: string) {
    return prisma.announcements.count({
      where: {
        deleted_at: null,
        OR: [
          { type_id: typeId },
          { announcement_sections: { type_id: typeId } },
        ],
      },
    });
  }

  private formatAnnouncementType(item: any, announcementItemsCount?: number) {
    const sectionCount = item?._count?.announcement_sections ?? item?._count?.announcementSections ?? item?.announcement_sections?.length ?? 0;
    const itemCount = announcementItemsCount ?? item?._count?.announcements ?? item?._count?.announcementItems ?? 0;

    return {
      ...item,
      type: this.normalizeAnnouncementTypeValue(item?.type),
      sortOrder: item?.position ?? item?.sortOrder ?? 0,
      _count: {
        ...(item?._count || {}),
        announcementSections: sectionCount,
        announcementItems: itemCount,
        announcement_sections: sectionCount,
        announcements: itemCount,
      },
    };
  }

  private formatAnnouncementSection(section: any) {
    const itemCount = section?._count?.announcements ?? section?._count?.announcementItems ?? section?.announcements?.length ?? 0;
    const announcementType = section?.announcement_types
      ? {
          id: section.announcement_types.id,
          name: section.announcement_types.name,
          type: this.normalizeAnnouncementTypeValue(section.announcement_types.type),
        }
      : null;

    return {
      ...section,
      announcementTypeId: section?.type_id || '',
      title: section?.name || '',
      announcementYear: section?.announcement_year || null,
      ctaEnabled: Boolean(section?.cta_enabled),
      ctaText: section?.cta_text || '',
      ctaUrl: section?.cta_url || '',
      sortOrder: section?.position ?? section?.sortOrder ?? 0,
      announcementType,
      announcement_types: announcementType,
      _count: {
        ...(section?._count || {}),
        announcementItems: itemCount,
        announcements: itemCount,
      },
    };
  }

  // ============================================
  // ANNOUNCEMENT TYPE METHODS
  // ============================================

  async getAnnouncementTypes(params: AnnouncementTypeQueryParams) {
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
    if (type) {
      where.type = type;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [announcementTypes, total] = await Promise.all([
      prisma.announcementType.findMany({
        where,
        include: {
          _count: {
            select: {
              announcement_sections: { where: { deletedAt: null } },
              announcements: { where: { deleted_at: null } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.announcementType.count({ where }),
    ]);
    const itemCounts = await Promise.all(
      announcementTypes.map((announcementType: any) => this.countAnnouncementItemsForType(announcementType.id))
    );

    return {
      data: announcementTypes.map((announcementType: any, index) => this.formatAnnouncementType(announcementType, itemCounts[index])),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getAnnouncementTypesList() {
    const types = await prisma.announcementType.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: {
            announcement_sections: { where: { deletedAt: null } },
            announcements: { where: { deleted_at: null } },
          },
        },
      },
    });
    const itemCounts = await Promise.all(
      types.map((type: any) => this.countAnnouncementItemsForType(type.id))
    );
    return types.map((type: any, index) => this.formatAnnouncementType(type, itemCounts[index]));
  }

  async getAnnouncementTypeById(id: string) {
    const announcementType = await prisma.announcementType.findFirst({
      where: { id, deletedAt: null },
      include: {
        announcement_sections: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: { announcements: { where: { deleted_at: null } } },
            },
          },
        },
        _count: {
          select: {
            announcement_sections: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!announcementType) {
      throw new AppError('Announcement type not found', 404);
    }

    const announcementItemsCount = await this.countAnnouncementItemsForType(announcementType.id);
    return this.formatAnnouncementType(
      {
        ...announcementType,
        announcement_sections: announcementType.announcement_sections.map((section: any) => this.formatAnnouncementSection(section)),
      },
      announcementItemsCount
    );
  }

  async createAnnouncementType(data: CreateAnnouncementTypeDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new AppError('Name is required', 400);
    }

    let position = data.position ?? 0;
    if (position === 0) {
      const maxOrder = await prisma.announcementType.aggregate({
        _max: { position: true },
        where: { deletedAt: null },
      });
      position = (maxOrder._max?.position || 0) + 1;
    }

    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    const announcementType = await prisma.announcementType.create({
      data: {
        id: uuidv4(),
        name: data.name.trim(),
        slug,
        type: data.type || 'List',
        description: data.description,
        icon: data.icon,
        color: data.color,
        position,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return announcementType;
  }

  async updateAnnouncementType(id: string, data: UpdateAnnouncementTypeDTO) {
    const existing = await prisma.announcementType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Announcement type not found', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
      updateData.slug = data.slug || slugify(data.name, { lower: true, strict: true });
    }
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const announcementType = await prisma.announcementType.update({
      where: { id },
      data: updateData,
    });

    return announcementType;
  }

  async toggleAnnouncementTypeStatus(id: string) {
    const existing = await prisma.announcementType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Announcement type not found', 404);
    }

    const announcementType = await prisma.announcementType.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return announcementType;
  }

  async deleteAnnouncementType(id: string) {
    const existing = await prisma.announcementType.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Announcement type not found', 404);
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.announcements.updateMany({
        where: {
          announcement_sections: { type_id: id },
          deleted_at: null,
        },
        data: { deleted_at: now },
      }),
      prisma.announcementSection.updateMany({
        where: { type_id: id, deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.announcementType.update({
        where: { id },
        data: { deletedAt: now },
      }),
    ]);

    return { message: 'Announcement type deleted successfully' };
  }

  async deleteMultipleAnnouncementTypes(ids: string[]) {
    const now = new Date();

    await prisma.$transaction([
      prisma.announcements.updateMany({
        where: {
          announcement_sections: { type_id: { in: ids } },
          deleted_at: null,
        },
        data: { deleted_at: now },
      }),
      prisma.announcementSection.updateMany({
        where: { type_id: { in: ids }, deletedAt: null },
        data: { deletedAt: now },
      }),
      prisma.announcementType.updateMany({
        where: { id: { in: ids }, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    return { message: `${ids.length} announcement types deleted successfully` };
  }

  async getAnnouncementTypeSections(typeId: string) {
    const announcementType = await prisma.announcementType.findFirst({
      where: { id: typeId, deletedAt: null },
    });

    if (!announcementType) {
      throw new AppError('Announcement type not found', 404);
    }

    const sections = await prisma.announcementSection.findMany({
      where: { type_id: typeId, deletedAt: null },
      include: {
        announcement_types: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { announcements: { where: { deleted_at: null } } },
        },
      },
      orderBy: { position: 'asc' },
    });

    return sections.map((section: any) => this.formatAnnouncementSection(section));
  }

  async updateSectionsOrder(_typeId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.announcementSection.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await prisma.$transaction(operations);
    return { message: 'Sections order updated' };
  }

  // ============================================
  // ANNOUNCEMENT SECTION METHODS
  // ============================================

  async getAnnouncementSections(params: AnnouncementSectionQueryParams) {
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
      prisma.announcementSection.findMany({
        where,
        include: {
          announcement_types: {
            select: { id: true, name: true, type: true },
          },
          _count: {
            select: { announcements: { where: { deleted_at: null } } },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.announcementSection.count({ where }),
    ]);

    return {
      data: sections.map((section: any) => this.formatAnnouncementSection(section)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getAnnouncementSectionsList(typeId?: string) {
    const where: any = {
      deletedAt: null,
      isActive: true,
      announcement_types: { is: { deletedAt: null, isActive: true } },
    };
    if (typeId) {
      where.type_id = typeId;
    }

    const sections = await prisma.announcementSection.findMany({
      where,
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        type_id: true,
        description: true,
        announcement_year: true,
        cta_enabled: true,
        cta_text: true,
        cta_url: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        announcement_types: { select: { id: true, name: true, type: true } },
        _count: {
          select: { announcements: { where: { deleted_at: null } } },
        },
      },
    });

    return sections.map((section: any) => this.formatAnnouncementSection(section));
  }

  async getAnnouncementSectionById(id: string) {
    const section = await prisma.announcementSection.findFirst({
      where: { id, deletedAt: null },
      include: {
        announcement_types: {
          select: { id: true, name: true },
        },
        announcements: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
        _count: {
          select: { announcements: { where: { deleted_at: null } } },
        },
      },
    });

    if (!section) {
      throw new AppError('Announcement section not found', 404);
    }

    return this.formatAnnouncementSection(section);
  }

  async createAnnouncementSection(data: CreateAnnouncementSectionDTO) {
    if (!data.name || data.name.trim() === '') {
      throw new AppError('Name is required', 400);
    }
    if (!data.type_id) {
      throw new AppError('Announcement type ID is required', 400);
    }

    const announcementType = await prisma.announcementType.findFirst({
      where: { id: data.type_id, deletedAt: null },
    });

    if (!announcementType) {
      throw new AppError('Announcement type not found', 404);
    }

    let position = data.position ?? 0;
    if (position === 0) {
      const maxOrder = await prisma.announcementSection.aggregate({
        _max: { position: true },
        where: { type_id: data.type_id, deletedAt: null },
      });
      position = (maxOrder._max?.position || 0) + 1;
    }

    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    const section = await prisma.announcementSection.create({
      data: {
        id: uuidv4(),
        type_id: data.type_id,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        announcement_year: data.announcement_year || null,
        cta_enabled: data.cta_enabled || false,
        cta_text: data.cta_text || null,
        cta_url: data.cta_url || null,
        position,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return section;
  }

  async updateAnnouncementSection(id: string, data: UpdateAnnouncementSectionDTO) {
    const existing = await prisma.announcementSection.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Announcement section not found', 404);
    }

    if (data.type_id) {
      const announcementType = await prisma.announcementType.findFirst({
        where: { id: data.type_id, deletedAt: null },
      });
      if (!announcementType) {
        throw new AppError('Announcement type not found', 404);
      }
    }

    const updateData: any = {};
    if (data.type_id !== undefined) updateData.type_id = data.type_id;
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
      updateData.slug = data.slug || slugify(data.name, { lower: true, strict: true });
    }
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.announcement_year !== undefined) updateData.announcement_year = data.announcement_year;
    if (data.cta_enabled !== undefined) updateData.cta_enabled = data.cta_enabled;
    if (data.cta_text !== undefined) updateData.cta_text = data.cta_text;
    if (data.cta_url !== undefined) updateData.cta_url = data.cta_url;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const section = await prisma.announcementSection.update({
      where: { id },
      data: updateData,
    });

    return section;
  }

  async toggleAnnouncementSectionStatus(id: string) {
    const existing = await prisma.announcementSection.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new AppError('Announcement section not found', 404);
    }

    const section = await prisma.announcementSection.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return section;
  }

  async deleteAnnouncementSection(id: string) {
    const existing = await prisma.announcementSection.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { announcements: { where: { deleted_at: null } } },
        },
      },
    });

    if (!existing) {
      throw new AppError('Announcement section not found', 404);
    }

    if (existing._count.announcements > 0) {
      throw new AppError(
        `Cannot delete section. It still has ${existing._count.announcements} announcement(s). Remove or move items first.`,
        400
      );
    }

    await prisma.announcementSection.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Announcement section deleted successfully' };
  }

  async deleteMultipleAnnouncementSections(ids: string[]) {
    const sectionsWithItems = await prisma.announcementSection.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: {
        _count: {
          select: { announcements: { where: { deleted_at: null } } },
        },
      },
    });

    const hasItems = sectionsWithItems.filter((s: any) => s._count.announcements > 0);
    if (hasItems.length > 0) {
      const names = hasItems.map((s: any) => `"${s.name}" (${s._count.announcements} announcements)`);
      throw new AppError(
        `Cannot delete sections with announcements: ${names.join(', ')}. Remove announcements first.`,
        400
      );
    }

    await prisma.announcementSection.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return { message: `${ids.length} announcement sections deleted successfully` };
  }

  async getAnnouncementSectionItems(sectionId: string) {
    const section = await prisma.announcementSection.findFirst({
      where: { id: sectionId, deletedAt: null },
    });

    if (!section) {
      throw new AppError('Announcement section not found', 404);
    }

    const items = await prisma.announcements.findMany({
      where: { section_id: sectionId, deleted_at: null },
      include: {
        announcement_types: { select: { id: true, name: true, slug: true, type: true } },
        announcement_sections: { select: { id: true, name: true, type_id: true, announcement_year: true } },
      },
      orderBy: { sort_order: 'asc' },
    });

    return items.map((item: any) => this.formatAnnouncementItem(item));
  }

  async updateSectionItemsOrder(_sectionId: string, updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.announcements.update({
        where: { id: item.id },
        data: { sort_order: item.position },
      })
    );
    await prisma.$transaction(operations);
    return { message: 'Section items order updated' };
  }

  // ============================================
  // ANNOUNCEMENT ITEM METHODS
  // ============================================

  async getAnnouncementItems(params: AnnouncementItemQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      type_id,
      section_id,
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
        { announcement_sections: { type_id } },
      ];
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
              { announcement_sections: { type_id } },
            ],
          },
        ];
        delete where.OR;
      }
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
      prisma.announcements.findMany({
        where,
        include: {
          announcement_types: { select: { id: true, name: true, slug: true, type: true } },
          announcement_sections: {
            select: { id: true, name: true, type_id: true, announcement_year: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.announcements.count({ where }),
    ]);

    return {
      data: items.map((item: any) => this.formatAnnouncementItem(item)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getAnnouncementItemById(id: string) {
    const item = await prisma.announcements.findFirst({
      where: { id, deleted_at: null },
      include: {
        announcement_types: { select: { id: true, name: true, slug: true, type: true } },
        announcement_sections: {
          select: { id: true, name: true, type_id: true, announcement_year: true },
        },
      },
    });

    if (!item) {
      throw new AppError('Announcement item not found', 404);
    }

    return this.formatAnnouncementItem(item);
  }

  async createAnnouncementItem(data: CreateAnnouncementItemDTO) {
    if (!data.title || data.title.trim() === '') {
      throw new AppError('Title is required', 400);
    }
    if (!data.type_id && !data.section_id) {
      throw new AppError('Either Announcement Type or Section is required', 400);
    }

    if (data.type_id) {
      const announcementType = await prisma.announcementType.findFirst({
        where: { id: data.type_id, deletedAt: null },
      });
      if (!announcementType) {
        throw new AppError('Announcement type not found', 404);
      }
    }

    if (data.section_id) {
      const section = await prisma.announcementSection.findFirst({
        where: { id: data.section_id, deletedAt: null },
      });
      if (!section) {
        throw new AppError('Announcement section not found', 404);
      }
      if (!data.type_id) {
        data.type_id = section.type_id;
      }
    }

    const slug = data.slug || slugify(data.title, { lower: true, strict: true });

    const item = await prisma.announcements.create({
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
        announcement_types: { select: { id: true, name: true, slug: true, type: true } },
        announcement_sections: { select: { id: true, name: true, type_id: true, announcement_year: true } },
      },
    });

    return this.formatAnnouncementItem(item);
  }

  async updateAnnouncementItem(id: string, data: UpdateAnnouncementItemDTO) {
    const existing = await prisma.announcements.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Announcement item not found', 404);
    }

    if (data.type_id) {
      const announcementType = await prisma.announcementType.findFirst({
        where: { id: data.type_id, deletedAt: null },
      });
      if (!announcementType) throw new AppError('Announcement type not found', 404);
    }

    if (data.section_id) {
      const section = await prisma.announcementSection.findFirst({
        where: { id: data.section_id, deletedAt: null },
      });
      if (!section) throw new AppError('Announcement section not found', 404);
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

    const item = await prisma.announcements.update({
      where: { id },
      data: updateData,
      include: {
        announcement_types: { select: { id: true, name: true, slug: true, type: true } },
        announcement_sections: { select: { id: true, name: true, type_id: true, announcement_year: true } },
      },
    });

    return this.formatAnnouncementItem(item);
  }

  async toggleAnnouncementItemStatus(id: string) {
    const existing = await prisma.announcements.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Announcement item not found', 404);
    }

    const newStatus = existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    const item = await prisma.announcements.update({
      where: { id },
      data: { status: newStatus as any, updated_at: new Date() },
    });

    return item;
  }

  async deleteAnnouncementItem(id: string) {
    const existing = await prisma.announcements.findFirst({
      where: { id, deleted_at: null },
    });

    if (!existing) {
      throw new AppError('Announcement item not found', 404);
    }

    await prisma.announcements.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return { message: 'Announcement item deleted successfully' };
  }

  async deleteMultipleAnnouncementItems(ids: string[]) {
    await prisma.announcements.updateMany({
      where: { id: { in: ids }, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    return { message: `${ids.length} announcement items deleted successfully` };
  }

  async updateAnnouncementItemsOrder(updates: OrderUpdateItem[]) {
    const operations = updates.map((item) =>
      prisma.announcements.update({
        where: { id: item.id },
        data: { sort_order: item.position },
      })
    );
    await prisma.$transaction(operations);
    return { message: 'Announcement items order updated' };
  }

  async getAnnouncementItemStats() {
    const [total, published, draft] = await Promise.all([
      prisma.announcements.count({ where: { deleted_at: null } }),
      prisma.announcements.count({ where: { deleted_at: null, status: 'PUBLISHED' } }),
      prisma.announcements.count({ where: { deleted_at: null, status: 'DRAFT' } }),
    ]);

    return { total, published, draft };
  }

  // ============================================
  // PUBLIC FRONTEND METHODS
  // ============================================

  async filterAnnouncements(params: AnnouncementFilterParams) {
    const {
      search,
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
        { announcement_sections: { type_id } },
      ];
    }
    if (section_id) {
      where.section_id = section_id;
    }
    if (search) {
      const searchConditions = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
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
      prisma.announcements.findMany({
        where,
        include: {
          announcement_types: { select: { id: true, name: true, slug: true, type: true } },
          announcement_sections: {
            select: { id: true, name: true, type_id: true, announcement_year: true },
          },
        },
        orderBy: { sort_order: 'asc' },
        skip,
        take: limit,
      }),
      prisma.announcements.count({ where }),
    ]);

    return {
      data: items.map((item: any) => this.formatAnnouncementItem(item)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getPublicSectionItems(sectionId: string) {
    const section = await prisma.announcementSection.findFirst({
      where: { id: sectionId, deletedAt: null, isActive: true },
      include: {
        announcements: {
          where: { deleted_at: null, status: 'PUBLISHED' },
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    if (!section) {
      throw new AppError('Announcement section not found', 404);
    }

    return section;
  }

  // ============================================
  // RESPONSE FORMATTING
  // ============================================

  private formatAnnouncementItem(item: any) {
    const announcementType = item.announcement_types || null;
    const announcementSection = item.announcement_sections || null;

    return {
      id: item.id,
      announcementTypeId: item.type_id || announcementSection?.type_id || null,
      announcementSectionId: item.section_id || null,
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
      announcementType: announcementType
        ? { id: announcementType.id, name: announcementType.name, type: announcementType.type || announcementType.slug }
        : null,
      announcementSection: announcementSection
        ? { id: announcementSection.id, title: announcementSection.name, announcementYear: announcementSection.announcement_year || null }
        : null,
    };
  }
}

const announcementService = new AnnouncementService();
export default announcementService;
