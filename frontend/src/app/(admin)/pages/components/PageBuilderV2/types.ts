/**
 * PAGE BUILDER V2 - Type Definitions
 * 
 * Single source of truth for all PageBuilder types.
 * All components and state must conform to these interfaces.
 */

// =============================================================================
// CORE COMPONENT TYPES
// =============================================================================

/**
 * Canonical component structure stored in state and database.
 * This is THE source of truth - canvas renders from this, persistence uses this.
 */
export interface PageComponent {
  /** Unique identifier (UUID from database or temp-id for new) */
  id: string;
  /** Component type - must exist in registry */
  type: ComponentType;
  /** Display order (0-based) */
  order: number;
  /** Component-specific settings */
  settings: ComponentSettings;
  /** Visibility flag */
  isVisible: boolean;
}

/**
 * Supported component types - EXPLICIT, no guessing.
 * Add new component types here when extending.
 */
export type ComponentType = 'hero' | 'pricing';

/**
 * Union type of all possible component settings.
 * Each component type has its own settings interface.
 */
export type ComponentSettings = HeroSettings | PricingSettings;

// =============================================================================
// HERO COMPONENT
// =============================================================================

export interface HeroSettings {
  title: string;
  subtitle: string;
  backgroundImage: string;
  alignment: 'left' | 'center' | 'right';
  buttonText?: string;
  buttonLink?: string;
  showButton?: boolean;
}

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  title: 'Welcome to Our Website',
  subtitle: 'Build amazing experiences with our platform',
  backgroundImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=600&fit=crop',
  alignment: 'center',
  buttonText: 'Get Started',
  buttonLink: '#',
  showButton: true,
};

// =============================================================================
// PRICING COMPONENT
// =============================================================================

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isFeatured: boolean;
}

export interface PricingSettings {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  title: 'Choose Your Plan',
  subtitle: 'Select the perfect plan for your needs',
  plans: [
    {
      id: 'plan-1',
      name: 'Basic',
      price: '$29/mo',
      features: ['5 Projects', '10GB Storage', 'Email Support'],
      isFeatured: false,
    },
    {
      id: 'plan-2',
      name: 'Pro',
      price: '$99/mo',
      features: ['Unlimited Projects', '100GB Storage', 'Priority Support', 'Analytics'],
      isFeatured: true,
    },
    {
      id: 'plan-3',
      name: 'Enterprise',
      price: '$299/mo',
      features: ['Everything in Pro', 'Unlimited Storage', 'Dedicated Manager', 'Custom Integrations'],
      isFeatured: false,
    },
  ],
};

// =============================================================================
// PAGE STATE
// =============================================================================

/**
 * Complete page state shape - single source of truth.
 */
export interface PageState {
  pageId: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  components: PageComponent[];
  /** True when state differs from last saved state */
  isDirty: boolean;
  /** True when save is in progress */
  isSaving: boolean;
  /** True when initial load is in progress */
  isLoading: boolean;
  /** Error message if any operation failed */
  error: string | null;
}

// =============================================================================
// REGISTRY TYPES
// =============================================================================

/**
 * Component registry entry - defines everything about a component type.
 */
export interface ComponentRegistryEntry<T extends ComponentSettings = ComponentSettings> {
  /** The component type identifier */
  type: ComponentType;
  /** Human-readable display name */
  displayName: string;
  /** Category for sidebar organization */
  category: 'Sections' | 'Content' | 'Layout';
  /** Icon identifier */
  icon: 'hero' | 'pricing' | 'section' | 'text';
  /** Default settings when component is created */
  defaultSettings: T;
  /** React component for rendering in canvas */
  render: React.ComponentType<{ settings: T; isSelected: boolean }>;
  /** React component for editing settings */
  editor: React.ComponentType<{ settings: T; onChange: (settings: T) => void }>;
  /** Validation function - returns error message or null */
  validate: (settings: T) => string | null;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export type PageBuilderAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; components: PageComponent[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADD_COMPONENT'; componentType: ComponentType; index?: number }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'UPDATE_COMPONENT'; componentId: string; settings: ComponentSettings }
  | { type: 'MOVE_COMPONENT'; componentId: string; newIndex: number }
  | { type: 'TOGGLE_VISIBILITY'; componentId: string }
  | { type: 'SELECT_COMPONENT'; componentId: string | null }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// =============================================================================
// DRAG & DROP TYPES
// =============================================================================

export interface DragItem {
  type: 'NEW_COMPONENT' | 'EXISTING_COMPONENT';
  componentType?: ComponentType;
  componentId?: string;
}

export const DRAG_TYPE = 'PAGE_BUILDER_COMPONENT';
