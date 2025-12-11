import { PrismaClient, MenuLinkType, MenuStatus, MenuTarget } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import slugify from 'slugify';

const prisma = new PrismaClient();

interface MenuData {
  title: Record<string, string>;
  slug?: string;
  url?: string;
  type: MenuLinkType;
  pageId?: string;
  target?: MenuTarget;
  icon?: string;
  parentId?: string;
  order?: number;
  status?: MenuStatus;
}

interface MenuOrderUpdate {
  id: string;
  order: number;
  parentId?: string | null;
}

interface MenuTreeItem {
  id: string;
  parentId: string | null;
  title: Record<string, string>;
  slug: string;
  url: string | null;
  type: MenuLinkType;
  pageId: string | null;
  target: MenuTarget;
  icon: string | null;
  order: number;
  status: MenuStatus;
  createdAt: Date;
  updatedAt: Date;
  page?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: MenuTreeItem[];
}

export class MenuService {
  // Build tree structure from flat menu list
  private buildTree(menus: any[], parentId: string | null = null): MenuTreeItem[] {
    return menus
      .filter((menu) => menu.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map((menu) => ({
        ...menu,
        children: this.buildTree(menus, menu.id),
      }));
  }

  // Check for circular reference
  private async checkCircularReference(
    menuId: string,
    parentId: string | null
  ): Promise<boolean> {
    if (!parentId) return false;
    if (menuId === parentId) return true;

    const parent = await prisma.menu.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });

    if (!parent) return false;
    if (parent.parentId === menuId) return true;

    // Check recursively
    return this.checkCircularReference(menuId, parent.parentId);
  }

  // Get nesting level
  private async getNestingLevel(parentId: string | null): Promise<number> {
    if (!parentId) return 0;

    const parent = await prisma.menu.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });

    if (!parent) return 0;

    return 1 + (await this.getNestingLevel(parent.parentId));
  }

  // Get all menus as tree structure
  async getMenuTree(): Promise<MenuTreeItem[]> {
    const menus = await prisma.menu.findMany({
      orderBy: { order: 'asc' },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return this.buildTree(menus);
  }

  // Get active menus for public (frontend)
  async getActiveMenuTree(): Promise<MenuTreeItem[]> {
    const menus = await prisma.menu.findMany({
      where: { status: MenuStatus.ACTIVE },
      orderBy: { order: 'asc' },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Filter: if parent is inactive, children should not appear
    const activeMenuIds = new Set(menus.map((m) => m.id));
    const validMenus = menus.filter((menu) => {
      if (!menu.parentId) return true;
      return activeMenuIds.has(menu.parentId);
    });

    return this.buildTree(validMenus);
  }

  // Get single menu by ID
  async getMenuById(id: string) {
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        children: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!menu) {
      throw new AppError('Menu not found', 404);
    }

    return menu;
  }

  // Create new menu
  async createMenu(data: MenuData) {
    // Validate type-specific fields
    if (data.type === MenuLinkType.INTERNAL && !data.pageId) {
      throw new AppError('Page ID is required for internal links', 400);
    }

    if (data.type === MenuLinkType.EXTERNAL && !data.url) {
      throw new AppError('URL is required for external links', 400);
    }

    if (data.type === MenuLinkType.DROPDOWN) {
      data.url = undefined;
      data.pageId = undefined;
    }

    // Check nesting level
    if (data.parentId) {
      const level = await this.getNestingLevel(data.parentId);
      if (level >= 2) {
        throw new AppError('Maximum nesting level is 3', 400);
      }
    }

    // Auto-generate slug if not provided
    const title = typeof data.title === 'string' 
      ? data.title 
      : data.title.en || data.title.id || Object.values(data.title)[0];
    
    const slug = data.slug || slugify(title, { lower: true, strict: true });

    // Check slug uniqueness
    const existingMenu = await prisma.menu.findUnique({
      where: { slug },
    });

    if (existingMenu) {
      throw new AppError('Menu with this slug already exists', 400);
    }

    // Get max order for siblings
    const maxOrder = await prisma.menu.aggregate({
      where: { parentId: data.parentId || null },
      _max: { order: true },
    });

    const order = data.order !== undefined ? data.order : (maxOrder._max.order || 0) + 1;

    const menu = await prisma.menu.create({
      data: {
        title: data.title,
        slug,
        url: data.url,
        type: data.type,
        pageId: data.pageId,
        target: data.target || MenuTarget.SELF,
        icon: data.icon,
        parentId: data.parentId,
        order,
        status: data.status || MenuStatus.ACTIVE,
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return menu;
  }

  // Update menu
  async updateMenu(id: string, data: Partial<MenuData>) {
    const existingMenu = await this.getMenuById(id);

    // Check circular reference if parentId is being updated
    if (data.parentId !== undefined && data.parentId !== existingMenu.parentId) {
      const hasCircular = await this.checkCircularReference(id, data.parentId);
      if (hasCircular) {
        throw new AppError('Circular reference detected', 400);
      }

      // Check nesting level
      if (data.parentId) {
        const level = await this.getNestingLevel(data.parentId);
        if (level >= 2) {
          throw new AppError('Maximum nesting level is 3', 400);
        }
      }
    }

    // Validate type-specific fields
    const newType = data.type || existingMenu.type;
    if (newType === MenuLinkType.INTERNAL && !data.pageId && !existingMenu.pageId) {
      throw new AppError('Page ID is required for internal links', 400);
    }

    if (newType === MenuLinkType.EXTERNAL && !data.url && !existingMenu.url) {
      throw new AppError('URL is required for external links', 400);
    }

    if (newType === MenuLinkType.DROPDOWN) {
      data.url = undefined;
      data.pageId = undefined;
    }

    // Update slug if title changed
    let slug = data.slug;
    if (data.title && !data.slug) {
      const title = typeof data.title === 'string' 
        ? data.title 
        : data.title.en || data.title.id || Object.values(data.title)[0];
      
      slug = slugify(title, { lower: true, strict: true });

      // Check slug uniqueness
      if (slug !== existingMenu.slug) {
        const existingSlug = await prisma.menu.findUnique({
          where: { slug },
        });

        if (existingSlug) {
          throw new AppError('Menu with this slug already exists', 400);
        }
      }
    }

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        url: data.url,
        type: data.type,
        pageId: data.pageId,
        target: data.target,
        icon: data.icon,
        parentId: data.parentId,
        order: data.order,
        status: data.status,
      },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return menu;
  }

  // Delete menu and all children (cascade)
  async deleteMenu(id: string) {
    const menu = await this.getMenuById(id);

    // Delete menu (cascade will handle children)
    await prisma.menu.delete({
      where: { id },
    });

    // Reorder siblings
    await this.reorderSiblings(menu.parentId);

    return { message: 'Menu deleted successfully' };
  }

  // Bulk delete menus
  async deleteMultipleMenus(ids: string[]) {
    // Get all menus to find parent IDs for reordering
    const menus = await prisma.menu.findMany({
      where: { id: { in: ids } },
      select: { id: true, parentId: true },
    });

    const parentIds = [...new Set(menus.map((m) => m.parentId))];

    // Delete menus
    await prisma.menu.deleteMany({
      where: { id: { in: ids } },
    });

    // Reorder siblings for each parent
    for (const parentId of parentIds) {
      await this.reorderSiblings(parentId);
    }

    return { message: `${ids.length} menus deleted successfully` };
  }

  // Toggle menu status
  async toggleMenuStatus(id: string) {
    const menu = await this.getMenuById(id);
    const newStatus = menu.status === MenuStatus.ACTIVE ? MenuStatus.INACTIVE : MenuStatus.ACTIVE;

    // If setting to inactive, also set children to inactive
    if (newStatus === MenuStatus.INACTIVE) {
      await this.setChildrenStatus(id, MenuStatus.INACTIVE);
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: { status: newStatus },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return updatedMenu;
  }

  // Recursively set children status
  private async setChildrenStatus(parentId: string, status: MenuStatus) {
    const children = await prisma.menu.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      await prisma.menu.update({
        where: { id: child.id },
        data: { status },
      });

      // Recursively update grandchildren
      await this.setChildrenStatus(child.id, status);
    }
  }

  // Batch update order
  async updateMenuOrder(updates: MenuOrderUpdate[]) {
    // Validate no circular references
    for (const update of updates) {
      if (update.parentId) {
        const hasCircular = await this.checkCircularReference(update.id, update.parentId);
        if (hasCircular) {
          throw new AppError(`Circular reference detected for menu ${update.id}`, 400);
        }

        // Check nesting level
        const level = await this.getNestingLevel(update.parentId);
        if (level >= 2) {
          throw new AppError(`Maximum nesting level exceeded for menu ${update.id}`, 400);
        }
      }
    }

    // Update all menus in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.menu.update({
          where: { id: update.id },
          data: {
            order: update.order,
            parentId: update.parentId === null ? null : update.parentId,
          },
        })
      )
    );

    return { message: 'Menu order updated successfully' };
  }

  // Reorder siblings after deletion
  private async reorderSiblings(parentId: string | null) {
    const siblings = await prisma.menu.findMany({
      where: { parentId: parentId || null },
      orderBy: { order: 'asc' },
    });

    await prisma.$transaction(
      siblings.map((sibling, index) =>
        prisma.menu.update({
          where: { id: sibling.id },
          data: { order: index + 1 },
        })
      )
    );
  }
}

export default new MenuService();
