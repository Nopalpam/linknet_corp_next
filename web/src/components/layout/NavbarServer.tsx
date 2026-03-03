/**
 * NavbarServer - Server Component Wrapper
 * 
 * Fetches menu data from the backend API (Menu Management) and passes it
 * to the client-side Navbar component. Falls back to static navData if
 * the API is unavailable.
 */

import { getMenus } from '@/lib/api';
import { transformMenuTreeToNavItems } from '@/lib/menuTransformer';
import { navItems as staticNavItems } from '@/data/navData';
import Navbar from './Navbar';

export default async function NavbarServer() {
  let navItems = staticNavItems; // fallback

  try {
    const menuTree = await getMenus();
    
    if (menuTree && menuTree.length > 0) {
      const transformed = transformMenuTreeToNavItems(menuTree);
      if (transformed.length > 0) {
        navItems = transformed;
      }
    }
  } catch {
    // API unavailable — use static fallback
  }

  return <Navbar items={navItems} />;
}
