export enum MenuLinkType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  DROPDOWN = 'DROPDOWN',
}

export enum MenuTarget {
  SELF = 'SELF',
  BLANK = 'BLANK',
}

export enum MenuStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Menu {
  id: string;
  parentId: string | null;
  title: Record<string, string>; // Multi-language: { en: "Home", id: "Beranda" }
  slug: string;
  url: string | null;
  type: MenuLinkType;
  pageId: string | null;
  target: MenuTarget;
  icon: string | null;
  order: number;
  status: MenuStatus;
  createdAt: string;
  updatedAt: string;
  page?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  children: Menu[];
}

export interface MenuFormData {
  title: Record<string, string>;
  slug?: string;
  url?: string;
  type: MenuLinkType;
  pageId?: string;
  target?: MenuTarget;
  icon?: string;
  parentId?: string | null;
  order?: number;
  status?: MenuStatus;
}

export interface MenuOrderUpdate {
  id: string;
  order: number;
  parentId?: string | null;
}
