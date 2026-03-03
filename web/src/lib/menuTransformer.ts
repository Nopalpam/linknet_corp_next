/**
 * Menu Transformer
 * 
 * Transforms the backend Menu API tree structure into the NavItem format
 * expected by the Navbar component. The backend stores menus as a flat 
 * hierarchy with parent/child relationships, while the Navbar expects 
 * a specific structure with "sections" grouping.
 * 
 * Backend tree shape:
 *   { id, title, url, type, sectionTitle, sectionOrder, children: [...] }
 * 
 * Navbar expected shape:
 *   { id, label, url, sections: [{ title, items: [{ label, url }] }] }
 */

import type { MenuItem } from '@/types';
import type { NavItem } from '@/data/navData';

/**
 * Transform the backend menu tree into NavItem[] for the Navbar.
 * 
 * Logic:
 * - Top-level items (no parentId) become NavItems
 * - Children are grouped by `sectionTitle` into sections
 * - Items without sectionTitle go into a section with empty title
 * - Sections are sorted by `sectionOrder`
 */
export function transformMenuTreeToNavItems(menuTree: MenuItem[]): NavItem[] {
  return menuTree.map((menu) => {
    const navItem: NavItem = {
      id: String(menu.id),
      label: menu.title,
      url: menu.url || '#',
    };

    // If the menu has children, group them into sections
    if (menu.children && menu.children.length > 0) {
      const sectionMap = new Map<string, {
        title: string;
        order: number;
        items: { label: string; url: string }[];
      }>();

      for (const child of menu.children) {
        const sectionKey = child.sectionTitle || '';
        
        if (!sectionMap.has(sectionKey)) {
          sectionMap.set(sectionKey, {
            title: child.sectionTitle || '',
            order: child.sectionOrder || 0,
            items: [],
          });
        }

        sectionMap.get(sectionKey)!.items.push({
          label: child.title,
          url: child.url || '#',
        });
      }

      // Sort sections by order, then convert map to array
      const sections = Array.from(sectionMap.values())
        .sort((a, b) => a.order - b.order)
        .map(({ title, items }) => ({ title, items }));

      if (sections.length > 0) {
        navItem.sections = sections;
      }
    }

    return navItem;
  });
}
