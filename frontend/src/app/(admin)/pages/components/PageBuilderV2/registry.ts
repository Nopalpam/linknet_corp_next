/**
 * PAGE BUILDER V2 - Component Registry
 * 
 * EXPLICIT component registration - no dynamic guessing.
 * Every component that can be used MUST be registered here.
 * 
 * If a component type is not in this registry:
 * - It cannot be rendered
 * - It cannot be edited
 * - It cannot be saved
 */

import {
  ComponentType,
  ComponentRegistryEntry,
  ComponentSettings,
  HeroSettings,
  PricingSettings,
  DEFAULT_HERO_SETTINGS,
  DEFAULT_PRICING_SETTINGS,
} from './types';

// Lazy imports for code splitting
import { HeroRenderer } from './renders/HeroRenderer';
import { HeroEditor } from './editors/HeroEditor';
import { PricingRenderer } from './renders/PricingRenderer';
import { PricingEditor } from './editors/PricingEditor';

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================

const heroEntry: ComponentRegistryEntry<HeroSettings> = {
  type: 'hero',
  displayName: 'Hero Section',
  category: 'Sections',
  icon: 'hero',
  defaultSettings: DEFAULT_HERO_SETTINGS,
  render: HeroRenderer,
  editor: HeroEditor,
  validate: (settings) => {
    if (!settings.title?.trim()) return 'Title is required';
    return null;
  },
};

const pricingEntry: ComponentRegistryEntry<PricingSettings> = {
  type: 'pricing',
  displayName: 'Pricing Section',
  category: 'Sections',
  icon: 'pricing',
  defaultSettings: DEFAULT_PRICING_SETTINGS,
  render: PricingRenderer,
  editor: PricingEditor,
  validate: (settings) => {
    if (!settings.title?.trim()) return 'Title is required';
    if (!settings.plans || settings.plans.length === 0) return 'At least one plan is required';
    return null;
  },
};

/**
 * The canonical component registry.
 * Add new component types here.
 */
export const COMPONENT_REGISTRY: Record<ComponentType, ComponentRegistryEntry<any>> = {
  hero: heroEntry,
  pricing: pricingEntry,
};

// =============================================================================
// REGISTRY HELPERS
// =============================================================================

/**
 * Check if a component type is registered.
 * Use this before any render/edit/save operation.
 */
export function isRegisteredType(type: string): type is ComponentType {
  return type in COMPONENT_REGISTRY;
}

/**
 * Get registry entry for a component type.
 * Returns null if type is not registered - handle this explicitly.
 */
export function getRegistryEntry(type: string): ComponentRegistryEntry | null {
  if (!isRegisteredType(type)) {
    console.error(`[Registry] Unknown component type: ${type}`);
    return null;
  }
  return COMPONENT_REGISTRY[type];
}

/**
 * Get default settings for a component type.
 * Returns null if type is not registered.
 */
export function getDefaultSettings(type: ComponentType): ComponentSettings | null {
  const entry = getRegistryEntry(type);
  return entry ? entry.defaultSettings : null;
}

/**
 * Get all registered component types for sidebar display.
 */
export function getRegisteredComponents(): ComponentRegistryEntry[] {
  return Object.values(COMPONENT_REGISTRY);
}

/**
 * Get components grouped by category.
 */
export function getComponentsByCategory(): Record<string, ComponentRegistryEntry[]> {
  const components = getRegisteredComponents();
  return components.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, ComponentRegistryEntry[]>);
}

/**
 * Validate a component's settings.
 * Returns error message or null if valid.
 */
export function validateComponent(type: string, settings: ComponentSettings): string | null {
  const entry = getRegistryEntry(type);
  if (!entry) {
    return `Unknown component type: ${type}`;
  }
  return entry.validate(settings);
}

/**
 * Normalize legacy component types to current registry types.
 * Used when loading from database.
 */
export function normalizeComponentType(type: string): ComponentType | null {
  // Direct match
  if (isRegisteredType(type)) {
    return type;
  }
  
  // Legacy aliases mapping
  const aliases: Record<string, ComponentType> = {
    'hero-section': 'hero',
    'hero_section': 'hero',
    'pricing-section': 'pricing',
    'pricing_section': 'pricing',
  };
  
  const normalized = aliases[type];
  if (normalized) {
    console.log(`[Registry] Normalized legacy type "${type}" to "${normalized}"`);
    return normalized;
  }
  
  console.error(`[Registry] Cannot normalize unknown type: ${type}`);
  return null;
}
