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
  ComponentType,
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
      const defaultSettings = getDefaultSettings(action.componentType);
      if (!defaultSettings) {
        console.error(`[Reducer] Cannot add unregistered type: ${action.componentType}`);
        return {
          ...state,
          error: `Unknown component type: ${action.componentType}`,
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
  addComponent: (type: ComponentType, index?: number) => void;
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
            const normalizedType = normalizeComponentType(dbComp.type);
            
            if (!normalizedType) {
              console.warn(`[Load] Skipping unknown component type: ${dbComp.type}`);
              return null;
            }

            // Parse settings from database (could be string or object)
            let settings: ComponentSettings;
            try {
              settings = typeof dbComp.data === 'string' 
                ? JSON.parse(dbComp.data) 
                : dbComp.data;
            } catch {
              console.error(`[Load] Failed to parse settings for component ${dbComp.id}`);
              const defaultSettings = getDefaultSettings(normalizedType);
              if (!defaultSettings) {
                console.warn(`[Load] No default settings for type: ${normalizedType}`);
                return null;
              }
              settings = defaultSettings;
            }

            return {
              id: dbComp.id,
              type: normalizedType,
              order: dbComp.order ?? index,
              settings,
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
  const addComponent = useCallback((type: ComponentType, index?: number) => {
    if (!isRegisteredType(type)) {
      console.error(`[Action] Cannot add unregistered type: ${type}`);
      return;
    }
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
