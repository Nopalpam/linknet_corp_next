import { PrismaClient, MenuPosition, MenuType } from '@prisma/client';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();

interface MenuData {
  parentId?: bigint | null;
  sectionTitle?: string | null;
  sectionOrder?: number;
  title: string;
  translations?: Record<string, any> | null;
  slug?: string | null;
  url?: string | null;
  icon?: string | null;
  image?: string | null;
  description?: string | null;
  badge?: string | null;
  position: MenuPosition;
  type: MenuType;
  order?: number;
  isActive?: boolean;
  openNewTab?: boolean;
  cssClass?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

interface MenuOrderUpdate {
  id: bigint;
  order: number;
  parentId?: bigint | null;
}

interface MenuTreeItem {
  id: bigint;
  parentId: bigint | null;
  sectionTitle: string | null;
  sectionOrder: number;
  title: string;
  translations: Record<string, any> | null;
  slug: string | null;
  url: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  badge: string | null;
  position: MenuPosition;
  type: MenuType;
  order: number;
  isActive: boolean;
  openNewTab: boolean;
  cssClass: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  children: MenuTreeItem[];
}

export class MenuService {
  // Build tree structure from flat menu list
  private buildTree(menus: any[], parentId: bigint | null = null): MenuTreeItem[] {
    return menus
      .filter((menu) => {
        if (parentId === null) return menu.parentId === null;
        return menu.parentId !== null && menu.parentId.toString() === parentId.toString();
      })
      .sort((a, b) => a.order - b.order)
      .map((menu) => ({
        ...menu,
        children: this.buildTree(menus, menu.id),
      }));
  }

  // Check for circular reference
  private async checkCircularReference(
    menuId: bigint,
    parentId: bigint | null
  ): Promise<boolean> {
    if (!parentId) return false;
    if (menuId.toString() === parentId.toString()) return true;

    const parent = await prisma.menu.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });

    if (!parent) return false;
    if (parent.parentId && parent.parentId.toString() === menuId.toString()) return true;

    // Check recursively
    return this.checkCircularReference(menuId, parent.parentId);
  }

  // Get nesting level
  private async getNestingLevel(parentId: bigint | null): Promise<number> {
    if (!parentId) return 0;

    const parent = await prisma.menu.findUnique({
      where: { id: parentId },
      select: { parentId: true },
    });

    if (!parent) return 0;

    return 1 + (await this.getNestingLevel(parent.parentId));
  }

  // Get all menus as tree structure (for CMS)
  async getMenuTree(position?: MenuPosition): Promise<MenuTreeItem[]> {
    const where: any = {};
    
    if (position) {
      where.position = { in: [position, MenuPosition.BOTH] };
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return this.buildTree(menus);
  }

  // Get active menus for public (frontend)
  async getActiveMenuTree(position?: MenuPosition): Promise<MenuTreeItem[]> {
    const where: any = { isActive: true };
    
    if (position) {
      where.position = { in: [position, MenuPosition.BOTH] };
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    // Filter: if parent is inactive, children should not appear
    const activeMenuIds = new Set(menus.map((m) => m.id.toString()));
    const validMenus = menus.filter((menu) => {
      if (!menu.parentId) return true;
      return activeMenuIds.has(menu.parentId.toString());
    });

    return this.buildTree(validMenus);
  }

  // Get flat list of all menus (for CMS table view)
  async getAllMenus(position?: MenuPosition): Promise<any[]> {
    const where: any = {};
    
    if (position) {
      where.position = { in: [position, MenuPosition.BOTH] };
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: [
        { position: 'asc' },
        { order: 'asc' }
      ],
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    return menus;
  }

  // Get single menu by ID
  async getMenuById(id: bigint) {
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
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
  async createMenu(data: MenuData, userEmail?: string) {
    // Validate type-specific fields
    if (data.type === MenuType.LINK && !data.url) {
      throw new AppError('URL is required for link type menus', 400);
    }

    if (data.type === MenuType.DROPDOWN || data.type === MenuType.MEGA) {
      // Dropdown/Mega menus typically use '#' or no URL
      if (!data.url) {
        data.url = '#';
      }
    }

    // Check nesting level (max 3 levels)
    if (data.parentId) {
      const level = await this.getNestingLevel(data.parentId);
      if (level >= 3) {
        throw new AppError('Maximum nesting level is 3', 400);
      }
    }

    // Get max order for siblings
    const maxOrder = await prisma.menu.aggregate({
      where: { 
        parentId: data.parentId || null,
        position: data.position 
      },
      _max: { order: true },
    });

    const order = data.order !== undefined ? data.order : (maxOrder._max.order || 0) + 1;

    const menu = await prisma.menu.create({
      data: {
        parentId: data.parentId,
        sectionTitle: data.sectionTitle,
        sectionOrder: data.sectionOrder || 0,
        title: data.title,
        translations: data.translations as any,
        slug: data.slug,
        url: data.url,
        icon: data.icon,
        image: data.image,
        description: data.description,
        badge: data.badge,
        position: data.position,
        type: data.type,
        order,
        isActive: data.isActive !== undefined ? data.isActive : true,
        openNewTab: data.openNewTab || false,
        cssClass: data.cssClass,
        createdBy: userEmail || data.createdBy,
        updatedBy: userEmail || data.updatedBy,
      },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return menu;
  }

  // Update menu
  async updateMenu(id: bigint, data: Partial<MenuData>, userEmail?: string) {
    const existingMenu = await this.getMenuById(id);

    // Check circular reference if parentId is being updated
    if (data.parentId !== undefined) {
      const newParentId = data.parentId;
      
      if (newParentId && (!existingMenu.parentId || newParentId.toString() !== existingMenu.parentId.toString())) {
        const hasCircular = await this.checkCircularReference(id, newParentId);
        if (hasCircular) {
          throw new AppError('Circular reference detected', 400);
        }

        // Check nesting level
        const level = await this.getNestingLevel(newParentId);
        if (level >= 3) {
          throw new AppError('Maximum nesting level is 3', 400);
        }
      }
    }

    // Validate type-specific fields
    const newType = data.type || existingMenu.type;
    if (newType === MenuType.LINK) {
      const newUrl = data.url !== undefined ? data.url : existingMenu.url;
      if (!newUrl) {
        throw new AppError('URL is required for link type menus', 400);
      }
    }

    const updateData: any = {
      updatedBy: userEmail || data.updatedBy,
    };

    // Only update fields that are provided
    if (data.parentId !== undefined) updateData.parentId = data.parentId;
    if (data.sectionTitle !== undefined) updateData.sectionTitle = data.sectionTitle;
    if (data.sectionOrder !== undefined) updateData.sectionOrder = data.sectionOrder;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.translations !== undefined) updateData.translations = data.translations as any;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.badge !== undefined) updateData.badge = data.badge;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.openNewTab !== undefined) updateData.openNewTab = data.openNewTab;
    if (data.cssClass !== undefined) updateData.cssClass = data.cssClass;

    const menu = await prisma.menu.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return menu;
  }

  // Delete menu and all children (cascade)
  async deleteMenu(id: bigint) {
    const menu = await this.getMenuById(id);

    // Delete menu (cascade will handle children)
    await prisma.menu.delete({
      where: { id },
    });

    // Reorder siblings
    await this.reorderSiblings(menu.parentId, menu.position);

    return { message: 'Menu deleted successfully' };
  }

  // Bulk delete menus
  async deleteMultipleMenus(ids: bigint[]) {
    // Get all menus to find parent IDs for reordering
    const menus = await prisma.menu.findMany({
      where: { id: { in: ids } },
      select: { id: true, parentId: true, position: true },
    });

    const parentPositionPairs = Array.from(new Set(
      menus.map((m) => `${m.parentId?.toString() || 'null'}_${m.position}`)
    ));

    // Delete menus
    await prisma.menu.deleteMany({
      where: { id: { in: ids } },
    });

    // Reorder siblings for each parent-position pair
    for (const pair of parentPositionPairs) {
      const [parentIdStr, position] = pair.split('_');
      const parentId = parentIdStr === 'null' ? null : (parentIdStr ? BigInt(parentIdStr) : null);
      await this.reorderSiblings(parentId, position as MenuPosition);
    }

    return { message: `${ids.length} menu(s) deleted successfully` };
  }

  // Toggle menu status
  async toggleMenuStatus(id: bigint) {
    const menu = await this.getMenuById(id);
    const newStatus = !menu.isActive;

    // If setting to inactive, store original children states and deactivate all
    if (!newStatus) {
      await this.deactivateChildren(id);
    } else {
      // If activating, reactivate children (they will check their own previous state)
      await this.reactivateChildren(id);
    }

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data: { isActive: newStatus },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            children: true,
          },
        },
      },
    });

    return updatedMenu;
  }

  // Deactivate children when parent is deactivated
  private async deactivateChildren(parentId: bigint) {
    const children = await prisma.menu.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      await prisma.menu.update({
        where: { id: child.id },
        data: { isActive: false },
      });

      // Recursively deactivate grandchildren
      await this.deactivateChildren(child.id);
    }
  }

  // Reactivate children when parent is activated (restore to active)
  private async reactivateChildren(parentId: bigint) {
    const children = await prisma.menu.findMany({
      where: { parentId },
      select: { id: true },
    });

    for (const child of children) {
      // Activate the child
      await prisma.menu.update({
        where: { id: child.id },
        data: { isActive: true },
      });

      // Recursively reactivate grandchildren
      await this.reactivateChildren(child.id);
    }
  }

  // Batch update order (for drag & drop)
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
        if (level >= 3) {
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
  private async reorderSiblings(parentId: bigint | null, position: MenuPosition) {
    const siblings = await prisma.menu.findMany({
      where: { 
        parentId: parentId || null,
        position: position
      },
      orderBy: { order: 'asc' },
    });

    if (siblings.length === 0) return;

    await prisma.$transaction(
      siblings.map((sibling, index) =>
        prisma.menu.update({
          where: { id: sibling.id },
          data: { order: index + 1 },
        })
      )
    );
  }

  // Get menus by position (header/footer)
  async getMenusByPosition(position: MenuPosition, activeOnly: boolean = false): Promise<MenuTreeItem[]> {
    const where: any = {
      position: { in: [position, MenuPosition.BOTH] }
    };

    if (activeOnly) {
      where.isActive = true;
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: [
        { order: 'asc' }
      ],
    });

    // Filter: if parent is inactive and we want active only
    if (activeOnly) {
      const activeMenuIds = new Set(menus.map((m) => m.id.toString()));
      const validMenus = menus.filter((menu) => {
        if (!menu.parentId) return true;
        return activeMenuIds.has(menu.parentId.toString());
      });
      return this.buildTree(validMenus);
    }

    return this.buildTree(menus);
  }
}

export default new MenuService();
