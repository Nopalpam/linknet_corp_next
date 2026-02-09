/**
 * COMPONENT REGISTRY
 * 
 * Sumber kebenaran untuk semua component types.
 * Menangani mapping, default settings, dan normalisasi type names.
 */

export interface ComponentConfig {
  /** Type internal yang digunakan sistem */
  type: string;
  /** Alias types dari database/legacy */
  aliases: string[];
  /** Nama tampilan */
  displayName: string;
  /** Kategori component */
  category: string;
  /** Default props saat component dibuat */
  defaultProps: Record<string, any>;
  /** Icon untuk UI */
  icon: string;
}

/**
 * Registry lengkap semua component yang didukung
 */
export const COMPONENT_REGISTRY: Record<string, ComponentConfig> = {
  // ==================== HERO ====================
  "hero-section": {
    type: "hero-section",
    aliases: ["hero", "hero_section"],
    displayName: "Hero Section",
    category: "Sections",
    icon: "hero",
    defaultProps: {
      title: "Welcome to Our Website",
      subtitle: "Build amazing experiences with our platform",
      backgroundImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=600&fit=crop",
      alignment: "center",
      buttonText: "Get Started",
      buttonLink: "#",
      showButton: true,
    },
  },

  // ==================== PRICING ====================
  "pricing-section": {
    type: "pricing-section",
    aliases: ["pricing", "pricing_section"],
    displayName: "Pricing Section",
    category: "Sections",
    icon: "pricing",
    defaultProps: {
      title: "Choose Your Plan",
      plans: [
        {
          name: "Basic",
          price: "$29",
          features: ["Feature 1", "Feature 2", "Feature 3"],
          isFeatured: false,
        },
        {
          name: "Pro",
          price: "$99",
          features: ["All Basic features", "Feature 4", "Feature 5", "Priority support"],
          isFeatured: true,
        },
        {
          name: "Enterprise",
          price: "$299",
          features: ["All Pro features", "Feature 6", "Feature 7", "Dedicated account manager"],
          isFeatured: false,
        },
      ],
    },
  },

  // ==================== SECTION ====================
  "section": {
    type: "section",
    aliases: [],
    displayName: "Section",
    category: "Layout",
    icon: "section",
    defaultProps: {
      backgroundColor: "#ffffff",
      padding: "40px",
    },
  },

  // ==================== HEADING ====================
  "heading": {
    type: "heading",
    aliases: [],
    displayName: "Heading",
    category: "Content",
    icon: "heading",
    defaultProps: {
      text: "Heading Text",
      level: "h2",
      color: "#000000",
      fontSize: "32px",
      textAlign: "left",
    },
  },

  // ==================== TEXT ====================
  "text": {
    type: "text",
    aliases: [],
    displayName: "Text",
    category: "Content",
    icon: "text",
    defaultProps: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      fontSize: "16px",
      color: "#333333",
      textAlign: "left",
    },
  },

  // ==================== IMAGE ====================
  "image": {
    type: "image",
    aliases: [],
    displayName: "Image",
    category: "Media",
    icon: "image",
    defaultProps: {
      src: "https://placehold.co/600x400",
      alt: "Image",
      width: "100%",
    },
  },

  // ==================== BUTTON ====================
  "button": {
    type: "button",
    aliases: [],
    displayName: "Button",
    category: "Interactive",
    icon: "button",
    defaultProps: {
      text: "Click Me",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "12px 24px",
      borderRadius: "6px",
      href: "#",
    },
  },

  // ==================== DIVIDER ====================
  "divider": {
    type: "divider",
    aliases: [],
    displayName: "Divider",
    category: "Layout",
    icon: "divider",
    defaultProps: {
      height: "1px",
      backgroundColor: "#e5e7eb",
      margin: "20px 0",
    },
  },

  // ==================== NEWS HIGHLIGHT ====================
  "news_highlight": {
    type: "news_highlight",
    aliases: ["news-highlight", "newsHighlight"],
    displayName: "News Highlight",
    category: "Dynamic",
    icon: "news",
    defaultProps: {
      showIntro: true,
      introLabel: "Latest News",
      introTitle: "Stay Updated",
      bgSection: "bg-gray-50",
      featuredCount: 1,
      gridCount: 3,
      orderBy: "newsDate",
      sortDirection: "desc",
    },
  },

  // ==================== NEWS LIST ====================
  "news_list": {
    type: "news_list",
    aliases: ["news-list", "newsList"],
    displayName: "News List",
    category: "Dynamic",
    icon: "list",
    defaultProps: {
      categoryId: "",
      itemsPerPage: 6,
      orderBy: "newsDate",
      sortDirection: "desc",
      showDate: true,
      showCategory: true,
      showExcerpt: true,
      gridColumns: 3,
    },
  },
};

/**
 * Normalisasi type name dari database/legacy ke type internal
 * Contoh: "hero" → "hero-section", "pricing" → "pricing-section"
 */
export function normalizeComponentType(type: string): string {
  // Cari di registry
  for (const [registryType, config] of Object.entries(COMPONENT_REGISTRY)) {
    // Cek apakah type sudah benar
    if (registryType === type) {
      return registryType;
    }
    // Cek apakah type ada di aliases
    if (config.aliases.includes(type)) {
      return registryType;
    }
  }
  
  // Jika tidak ditemukan, return as-is (akan ditangani sebagai unknown)
  return type;
}

/**
 * Get component config by type (support aliases)
 */
export function getComponentConfig(type: string): ComponentConfig | null {
  const normalizedType = normalizeComponentType(type);
  return COMPONENT_REGISTRY[normalizedType] || null;
}

/**
 * Cek apakah type valid
 */
export function isValidComponentType(type: string): boolean {
  return getComponentConfig(type) !== null;
}

/**
 * Get default props untuk component type
 */
export function getDefaultProps(type: string): Record<string, any> {
  const config = getComponentConfig(type);
  return config ? { ...config.defaultProps } : {};
}

/**
 * Get display name untuk component type
 */
export function getDisplayName(type: string): string {
  const config = getComponentConfig(type);
  return config?.displayName || type;
}

/**
 * Get all available component types (untuk library)
 */
export function getAllComponents(): ComponentConfig[] {
  return Object.values(COMPONENT_REGISTRY);
}

/**
 * Get components grouped by category
 */
export function getComponentsByCategory(): Record<string, ComponentConfig[]> {
  const grouped: Record<string, ComponentConfig[]> = {};
  
  for (const config of Object.values(COMPONENT_REGISTRY)) {
    if (!grouped[config.category]) {
      grouped[config.category] = [];
    }
    grouped[config.category].push(config);
  }
  
  return grouped;
}
