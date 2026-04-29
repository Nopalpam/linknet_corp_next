/**
 * PAGE BUILDER V2 - Context & State Management
 * 
 * SINGLE SOURCE OF TRUTH for all Page Builder state.
 * 
 * Principles:
 * 1. One canonical state - components array is THE truth
 * 2. Immutable updates via reducer
 * 3. Canvas renders directly from state
 * 4. Persistence reads/writes from/to this state
 * 5. No shadow state, no duplicates
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';
import {
  PageState,
  PageComponent,
  PageBuilderAction,
  ComponentSettings,
} from './types';
import {
  getDefaultSettings,
  normalizeComponentType,
  isRegisteredType,
} from './registry';
import { pagesService } from '@/services/pages.service';

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: PageState = {
  pageId: '',
  slug: '',
  status: 'DRAFT',
  components: [],
  isDirty: false,
  isSaving: false,
  isLoading: true,
  error: null,
};

const DEFAULT_SECTION_INTRO = {
  label: { en: '', id: '' },
  title: { en: '', id: '' },
  description: { en: '', id: '' },
  as: 'h2',
  align: 'left',
  fluid: false,
  labelClassName: '',
  titleClassName: '',
  descriptionClassName: '',
  className: '',
};

const DEFAULT_SECTION_CONFIG = {
  sectionId: '',
  className: '',
  bgImage: '',
  bgImageMobile: '',
  bgPositionClasses: '',
  bgSizeClass: '',
};

function deepMergeDefaults(defaults: Record<string, any>, value: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...defaults };

  for (const [key, nextValue] of Object.entries(value || {})) {
    const defaultValue = defaults?.[key];
    if (
      defaultValue &&
      nextValue &&
      typeof defaultValue === 'object' &&
      typeof nextValue === 'object' &&
      !Array.isArray(defaultValue) &&
      !Array.isArray(nextValue)
    ) {
      merged[key] = deepMergeDefaults(defaultValue, nextValue);
    } else {
      merged[key] = nextValue;
    }
  }

  return merged;
}

function normalizeSectionIntro(settings: Record<string, any>) {
  return {
    ...DEFAULT_SECTION_INTRO,
    ...(settings.intro || {}),
    ...(settings.sectionIntro || {}),
  };
}

function normalizeSectionConfig(settings: Record<string, any>) {
  return {
    ...DEFAULT_SECTION_CONFIG,
    ...(settings.config || {}),
    sectionId: settings.config?.sectionId ?? settings.custom_id ?? '',
    className: settings.config?.className ?? settings.custom_class ?? '',
    bgImage: settings.config?.bgImage ?? settings.bgImage ?? settings.bg_image ?? '',
    bgImageMobile: settings.config?.bgImageMobile ?? settings.bgImageMobile ?? settings.bg_image_mobile ?? settings.background_image_mobile ?? '',
    bgPositionClasses: settings.config?.bgPositionClasses ?? settings.bgPositionClasses ?? settings.bg_position_classes ?? '',
    bgSizeClass: settings.config?.bgSizeClass ?? settings.bgSizeClass ?? settings.bg_size_class ?? '',
  };
}

function normalizeComponentSettings(settings: Record<string, any>, defaults: Record<string, any> | null) {
  const rest = { ...(settings || {}) };
  const hasSectionIntro = Boolean(settings?.sectionIntro || settings?.intro);
  const hasSectionConfig = Boolean(
    settings?.config ||
    settings?.custom_id ||
    settings?.custom_class ||
    settings?.bgImage ||
    settings?.bg_image ||
    settings?.bgImageMobile ||
    settings?.bg_image_mobile ||
    settings?.bgPositionClasses ||
    settings?.bg_position_classes ||
    settings?.bgSizeClass ||
    settings?.bg_size_class
  );

  delete rest.intro;
  delete rest.sectionIntro;
  delete rest.custom_id;
  delete rest.custom_class;
  delete rest.bg_type;
  delete rest.bg_color;
  delete rest.bg_image;
  delete rest.bg_image_mobile;
  delete rest.bg_position;
  delete rest.bg_position_classes;
  delete rest.bg_size_class;

  const migrated: Record<string, any> = {
    ...rest,
  };

  if (hasSectionIntro || !defaults) {
    migrated.sectionIntro = normalizeSectionIntro(settings || {});
  }
  if (hasSectionConfig || !defaults) {
    migrated.config = normalizeSectionConfig(settings || {});
  }

  return defaults ? deepMergeDefaults(defaults, migrated) : migrated;
}

// =============================================================================
// REDUCER
// =============================================================================

function pageBuilderReducer(
  state: PageState,
  action: PageBuilderAction
): PageState {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        components: action.components,
        isLoading: false,
        isDirty: false,
        error: null,
      };

    case 'LOAD_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };

    case 'ADD_COMPONENT': {
      const defaultSettings = action.defaultData || getDefaultSettings(action.componentType);
      if (!defaultSettings) {
        console.error(`[Reducer] Cannot add type without defaults: ${action.componentType}`);
        return {
          ...state,
          error: `No default settings for: ${action.componentType}`,
        };
      }

      const newComponent: PageComponent = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: action.componentType,
        order: action.index ?? state.components.length,
        settings: { ...defaultSettings },
        isVisible: true,
      };

      // Insert at specified index or append
      let newComponents: PageComponent[];
      if (action.index !== undefined && action.index < state.components.length) {
        newComponents = [
          ...state.components.slice(0, action.index),
          newComponent,
          ...state.components.slice(action.index),
        ];
      } else {
        newComponents = [...state.components, newComponent];
      }

      // Recompute order
      newComponents = newComponents.map((c, i) => ({ ...c, order: i }));

      return {
        ...state,
        components: newComponents,
        isDirty: true,
        error: null,
      };
    }

    case 'REMOVE_COMPONENT': {
      const newComponents = state.components
        .filter((c) => c.id !== action.componentId)
        .map((c, i) => ({ ...c, order: i }));

      return {
        ...state,
        components: newComponents,
        isDirty: true,
      };
    }

    case 'UPDATE_COMPONENT': {
      const newComponents = state.components.map((c) =>
        c.id === action.componentId
          ? { ...c, settings: action.settings }
          : c
      );

      return {
        ...state,
        components: newComponents,
        isDirty: true,
      };
    }

    case 'MOVE_COMPONENT': {
      const componentIndex = state.components.findIndex(
        (c) => c.id === action.componentId
      );
      if (componentIndex === -1) return state;

      const newComponents = [...state.components];
      const [moved] = newComponents.splice(componentIndex, 1);
      newComponents.splice(action.newIndex, 0, moved);

      // Recompute order
      const reordered = newComponents.map((c, i) => ({ ...c, order: i }));

      return {
        ...state,
        components: reordered,
        isDirty: true,
      };
    }

    case 'TOGGLE_VISIBILITY': {
      const newComponents = state.components.map((c) =>
        c.id === action.componentId
          ? { ...c, isVisible: !c.isVisible }
          : c
      );

      return {
        ...state,
        components: newComponents,
        isDirty: true,
      };
    }

    case 'SELECT_COMPONENT':
      // Selection is handled separately, not in this reducer
      return state;

    case 'SAVE_START':
      return {
        ...state,
        isSaving: true,
        error: null,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaving: false,
        isDirty: false,
        error: null,
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        isSaving: false,
        error: action.error,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface PageBuilderContextValue {
  // State
  state: PageState;
  selectedComponentId: string | null;
  
  // Actions
  addComponent: (type: string, index?: number) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, settings: ComponentSettings) => void;
  moveComponent: (id: string, newIndex: number) => void;
  toggleVisibility: (id: string) => void;
  selectComponent: (id: string | null) => void;
  saveComponents: () => Promise<void>;
  clearError: () => void;
  
  // Computed
  getComponent: (id: string) => PageComponent | undefined;
  selectedComponent: PageComponent | null;
}

const PageBuilderContext = createContext<PageBuilderContextValue | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface PageBuilderProviderProps {
  pageId: string;
  children: React.ReactNode;
}

export function PageBuilderProvider({
  pageId,
  children,
}: PageBuilderProviderProps) {
  const [state, dispatch] = useReducer(pageBuilderReducer, {
    ...initialState,
    pageId,
  });

  // Separate selection state (not part of persistence)
  const [selectedComponentId, setSelectedComponentId] = React.useState<string | null>(null);

  // Load page components on mount
  useEffect(() => {
    async function loadPage() {
      dispatch({ type: 'LOAD_START' });

      try {
        const response = await pagesService.getPageById(pageId);
        const page = response.data;

        // Transform database components to PageComponent format
        const components: PageComponent[] = (page.components || [])
          .map((dbComp, index) => {
            // Normalize type from database
            const normalizedType = normalizeComponentType(dbComp.type) || dbComp.type;

            // Parse settings from database (could be string or object)
            let settings: Record<string, any>;
            try {
              settings = typeof dbComp.data === 'string' 
                ? JSON.parse(dbComp.data) 
                : (dbComp.data || {});
            } catch {
              console.error(`[Load] Failed to parse settings for component ${dbComp.id}`);
              const defaultSettings = getDefaultSettings(normalizedType);
              if (!defaultSettings) {
                return null;
              }
              settings = defaultSettings;
            }

            const defaultSettings = getDefaultSettings(normalizedType);
            const normalizedSettings = normalizeComponentSettings(settings, defaultSettings);

            return {
              id: dbComp.id,
              type: normalizedType,
              order: dbComp.order ?? index,
              settings: normalizedSettings,
              isVisible: dbComp.isVisible ?? true,
            };
          })
          .filter((c): c is PageComponent => c !== null)
          .sort((a, b) => a.order - b.order);

        dispatch({ type: 'LOAD_SUCCESS', components });
      } catch (error) {
        console.error('[Load] Failed to load page:', error);
        dispatch({
          type: 'LOAD_ERROR',
          error: error instanceof Error ? error.message : 'Failed to load page',
        });
      }
    }

    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  // Actions
  const addComponent = useCallback((type: string, index?: number) => {
    dispatch({ type: 'ADD_COMPONENT', componentType: type, index });
  }, []);

  const removeComponent = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_COMPONENT', componentId: id });
    // Clear selection if removed component was selected
    setSelectedComponentId((prev) => (prev === id ? null : prev));
  }, []);

  const updateComponent = useCallback((id: string, settings: ComponentSettings) => {
    dispatch({ type: 'UPDATE_COMPONENT', componentId: id, settings });
  }, []);

  const moveComponent = useCallback((id: string, newIndex: number) => {
    dispatch({ type: 'MOVE_COMPONENT', componentId: id, newIndex });
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', componentId: id });
  }, []);

  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Save to database
  const saveComponents = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });

    try {
      // Transform state components to API format
      const componentsToSave = state.components.map((comp) => ({
        type: comp.type,
        data: comp.settings,
        isVisible: comp.isVisible,
      }));

      await pagesService.savePageComponents(pageId, componentsToSave);
      dispatch({ type: 'SAVE_SUCCESS' });
    } catch (error) {
      console.error('[Save] Failed to save components:', error);
      dispatch({
        type: 'SAVE_ERROR',
        error: error instanceof Error ? error.message : 'Failed to save',
      });
      throw error; // Re-throw so caller can handle
    }
  }, [pageId, state.components]);

  // Computed values
  const getComponent = useCallback(
    (id: string) => state.components.find((c) => c.id === id),
    [state.components]
  );

  const selectedComponent = selectedComponentId
    ? state.components.find((c) => c.id === selectedComponentId) || null
    : null;

  const value: PageBuilderContextValue = {
    state,
    selectedComponentId,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    toggleVisibility,
    selectComponent,
    saveComponents,
    clearError,
    getComponent,
    selectedComponent,
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function usePageBuilder(): PageBuilderContextValue {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error('usePageBuilder must be used within PageBuilderProvider');
  }
  return context;
}
