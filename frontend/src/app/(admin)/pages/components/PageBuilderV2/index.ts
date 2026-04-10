/**
 * PAGE BUILDER V2 - Public Exports
 * 
 * Clean public API for the Page Builder module.
 * Import from this file for external usage.
 */

// Main Modal Component
export { PageBuilderModal, default } from './Modal';

// Context and Hooks
export { PageBuilderProvider, usePageBuilder } from './context';

// Registry
export {
  COMPONENT_REGISTRY,
  STATIC_COMPONENT_TYPES,
  isRegisteredType,
  getRegistryEntry,
  getDefaultSettings,
  getRegisteredComponents,
  getComponentsByCategory,
  validateComponent,
  normalizeComponentType,
} from './registry';

// Types
export type {
  PageComponent,
  ComponentType,
  ComponentSettings,
  HeroSettings,
  PricingSettings,
  PricingPlan,
  PageState,
  ComponentRegistryEntry,
  PageBuilderAction,
  DragItem,
  MultilingualValue,
} from './types';

export {
  DEFAULT_HERO_SETTINGS,
  DEFAULT_PRICING_SETTINGS,
  DRAG_TYPE,
  isMultilingual,
  getLocalizedValue,
} from './types';

// Individual Components (for custom canvas implementations)
export { Canvas } from './Canvas';
export { Sidebar } from './Sidebar';
export { ComponentEditor } from './ComponentEditor';

// Renderers (for preview outside Page Builder)
export { HeroRenderer } from './renders/HeroRenderer';
export { PricingRenderer } from './renders/PricingRenderer';

// Editors (for custom editor panels)
export { HeroEditor } from './editors/HeroEditor';
export { PricingEditor } from './editors/PricingEditor';
export { CkeditorEditor } from './editors/CkeditorEditor';
