"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { pagesService, type PageComponent, type SaveComponentData } from "@/services/pages.service";
import { useToast } from "@/context/ToastContext";
import { useDebouncedCallback } from "use-debounce";
import { 
  normalizeComponentType, 
  getComponentConfig, 
  getDefaultProps,
  isValidComponentType 
} from "./componentRegistry";

export interface ComponentSchema {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentSchema[];
}

interface HistoryState {
  past: ComponentSchema[][];
  present: ComponentSchema[];
  future: ComponentSchema[][];
}

interface PageBuilderContextType {
  components: ComponentSchema[];
  selectedComponent: ComponentSchema | null;
  loading: boolean;
  saving: boolean;
  lastSaved: Date | null;
  
  // Component operations
  addComponent: (component: Omit<ComponentSchema, "id">, parentId?: string) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  deleteComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  reorderComponents: (components: ComponentSchema[]) => void;
  
  // Clipboard operations
  copyComponent: (id: string) => void;
  pasteComponent: (parentId?: string) => void;
  copiedComponent: ComponentSchema | null;
  
  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Save operations
  saveComponents: () => Promise<void>;
  toggleAutoSave: () => void;
  autoSaveEnabled: boolean;
}

const PageBuilderContext = createContext<PageBuilderContextType | undefined>(undefined);

export function usePageBuilder() {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error("usePageBuilder must be used within PageBuilderProvider");
  }
  return context;
}

interface PageBuilderProviderProps {
  children: React.ReactNode;
  pageId: string;
}

const MAX_HISTORY = 50;
const SESSION_STORAGE_KEY = 'pagebuilder_unsaved_state';
const REMOUNT_THRESHOLD_MS = 1000; // Consider it a remount if within 1 second

// Global timestamp to detect remounts across instances
let lastUnmountTimestamp = 0;

export function PageBuilderProvider({ children, pageId }: PageBuilderProviderProps) {
  const toast = useToast();
  
  // History state
  const [history, setHistory] = useState<HistoryState>(() => {
    // 🔧 FIX 1: Try to restore from sessionStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_${pageId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const timestamp = parsed.timestamp || 0;
          
          // Only restore if it's recent (within 5 seconds) and has components
          if (Date.now() - timestamp < 5000 && parsed.components?.length > 0) {
            console.log('🔄 Restoring state from session storage:', parsed.components.length, 'components');
            return {
              past: [],
              present: parsed.components,
              future: [],
            };
          } else {
            console.log('⏭️ Session storage too old or empty, starting fresh');
            sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_${pageId}`);
          }
        }
      } catch (error) {
        console.error('❌ Failed to restore from session storage:', error);
      }
    }
    
    return {
      past: [],
      present: [],
      future: [],
    };
  });
  
  const [selectedComponent, setSelectedComponent] = useState<ComponentSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false); // ⛔ DISABLED FOR DEBUGGING
  const [copiedComponent, setCopiedComponent] = useState<ComponentSchema | null>(null);
  
  const hasUnsavedChanges = useRef(false);
  const hasLoadedInitially = useRef(false); // Track if initial load is done
  const isRestoredFromSession = useRef(history.present.length > 0); // Track if we restored from session

  // Load components from backend
  // Backend returns PageComponent[] from page_components table (legacy schema)
  // We transform them to ComponentSchema[] for the page builder
  useEffect(() => {
    const loadComponents = async () => {
      // 🔧 FIX 2: Detect remount
      const timeSinceLastUnmount = Date.now() - lastUnmountTimestamp;
      const isQuickRemount = timeSinceLastUnmount < REMOUNT_THRESHOLD_MS;
      
      if (isQuickRemount) {
        console.log('⚡ Quick remount detected - skipping reload');
        return;
      }
      
      // 🔧 FIX 3: If we restored from session, skip initial load
      if (isRestoredFromSession.current) {
        console.log('♻️ Skipping load - state restored from session');
        hasLoadedInitially.current = true;
        return;
      }
      
      // CRITICAL: Prevent reload if already loaded (fixes remounting issue)
      if (hasLoadedInitially.current) {
        console.log('⏭️ Skipping reload - already loaded');
        return;
      }

      try {
        setLoading(true);
        console.log('📥 Initial load for pageId:', pageId);
        const response = await pagesService.getPageById(pageId);
        
        console.log('📥 Loading page data:', response.data);
        
        // Transform backend PageComponent[] to frontend ComponentSchema[]
        let loadedComponents: ComponentSchema[] = [];
        
        if (response.data.components && Array.isArray(response.data.components)) {
          // Components come from page_components table as PageComponent[]
          // Each has: id, type (component_type), data (component_data), order (sort_order)
          loadedComponents = response.data.components.map((comp: PageComponent) => {
            // Parse data if it's a string (shouldn't be, but safety check)
            let componentData = typeof comp.data === 'string' ? JSON.parse(comp.data) : (comp.data || {});
            
            // 🔧 NORMALISASI TYPE: hero → hero-section, pricing → pricing-section
            const normalizedType = normalizeComponentType(comp.type);
            
            console.log('📦 Loading component:', {
              id: comp.id,
              originalType: comp.type,
              normalizedType: normalizedType,
              isValid: isValidComponentType(normalizedType),
              data: componentData
            });

            // 🔧 MERGE dengan default props dari registry
            const config = getComponentConfig(normalizedType);
            if (config) {
              // Merge: default props + data dari database
              componentData = {
                ...config.defaultProps,
                ...componentData,
              };
            } else {
              console.warn(`⚠️ Unknown component type: ${comp.type} (normalized: ${normalizedType})`);
            }

            return {
              id: comp.id,
              type: normalizedType, // Gunakan normalized type
              props: componentData,
              children: componentData.children || undefined,
            };
          });

          console.log('✅ Loaded components:', loadedComponents);
        }
        
        setHistory({
          past: [],
          present: loadedComponents,
          future: [],
        });
        
        setLastSaved(new Date());
        hasLoadedInitially.current = true; // Mark as loaded
        
        // Clear session storage after successful load
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_${pageId}`);
        console.log('✅ Initial load complete, flag set');
      } catch (error: any) {
        console.error("❌ Failed to load components:", error);
        // Start with empty state if load fails
        setHistory({
          past: [],
          present: [],
          future: [],
        });
        hasLoadedInitially.current = true; // Still mark as loaded to prevent retry loops
      } finally {
        setLoading(false);
      }
    };

    if (pageId && !hasLoadedInitially.current) {
      loadComponents();
    }
    
    // 🔧 FIX 4: Save to session storage before unmount
    return () => {
      console.log('🧹 Provider unmounting');
      lastUnmountTimestamp = Date.now();
      
      // Save current state to session storage if there are unsaved changes
      setHistory((currentHistory) => {
        if (currentHistory.present.length > 0) {
          try {
            const stateToSave = {
              components: currentHistory.present,
              timestamp: Date.now(),
            };
            sessionStorage.setItem(
              `${SESSION_STORAGE_KEY}_${pageId}`,
              JSON.stringify(stateToSave)
            );
            console.log('💾 Saved state to session storage:', currentHistory.present.length, 'components');
          } catch (error) {
            console.error('❌ Failed to save to session storage:', error);
          }
        }
        return currentHistory; // No state change
      });
      
      // Don't reset the flag immediately - let it stay to prevent reload
      // hasLoadedInitially.current = false;
    };
  }, [pageId]);

  // Generate unique ID
  const generateId = () => {
    return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add to history - FIXED: Direct state update to avoid stale closure
  const addToHistory = useCallback((updater: (prev: ComponentSchema[]) => ComponentSchema[]) => {
    setHistory((prev) => {
      const newComponents = updater(prev.present);
      
      console.log('📝 History update:', {
        oldCount: prev.present.length,
        newCount: newComponents.length,
        added: newComponents.length - prev.present.length
      });
      
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY);
      const newState = {
        past: newPast,
        present: newComponents,
        future: [],
      };
      
      console.log('✅ New state:', {
        presentLength: newState.present.length,
        presentRef: newState.present !== prev.present,
        components: newState.present.map(c => ({ id: c.id, type: c.type }))
      });
      
      return newState;
    });
    hasUnsavedChanges.current = true;
  }, []);

  // Clone component with new IDs
  const cloneComponentWithNewIds = useCallback((component: ComponentSchema): ComponentSchema => {
    return {
      ...component,
      id: generateId(),
      children: component.children?.map((child) => cloneComponentWithNewIds(child)),
    };
  }, []);

  // Find component by ID
  const findComponent = useCallback((components: ComponentSchema[], id: string): ComponentSchema | null => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Update component in tree
  const updateInTree = useCallback((
    components: ComponentSchema[],
    id: string,
    updater: (comp: ComponentSchema) => ComponentSchema
  ): ComponentSchema[] => {
    return components.map((comp) => {
      if (comp.id === id) {
        return updater(comp);
      }
      if (comp.children) {
        return {
          ...comp,
          children: updateInTree(comp.children, id, updater),
        };
      }
      return comp;
    });
  }, []);

  // Remove component from tree
  const removeFromTree = useCallback((components: ComponentSchema[], id: string): ComponentSchema[] => {
    return components
      .filter((comp) => comp.id !== id)
      .map((comp) => ({
        ...comp,
        children: comp.children ? removeFromTree(comp.children, id) : undefined,
      }));
  }, []);

  // Add component - FIXED: Use functional update to avoid stale closure
  const addComponent = useCallback(
    (component: Omit<ComponentSchema, "id">, parentId?: string) => {
      console.log('🚀 addComponent called', { component, parentId });
      
      // Normalize type and get default props
      const normalizedType = normalizeComponentType(component.type);
      const defaultProps = getDefaultProps(normalizedType);
      
      const newComponent: ComponentSchema = {
        ...component,
        id: generateId(),
        type: normalizedType,
        props: {
          ...defaultProps,
          ...component.props,
        },
      };

      console.log('➕ New component prepared:', newComponent);

      // FIXED: Update state directly with functional update
      addToHistory((prevComponents) => {
        let result: ComponentSchema[];
        
        if (parentId) {
          console.log('👨‍👧 Adding to parent:', parentId);
          result = updateInTree(prevComponents, parentId, (parent) => ({
            ...parent,
            children: [...(parent.children || []), newComponent],
          }));
        } else {
          console.log('🌳 Adding to root');
          result = [...prevComponents, newComponent];
        }
        
        console.log('📦 Result array:', {
          length: result.length,
          isNew: result !== prevComponents,
          components: result.map(c => ({ id: c.id, type: c.type }))
        });
        
        return result;
      });

      toast.success("Component added");
      console.log('✅ addComponent completed');
    },
    [addToHistory, updateInTree, toast]
  );

  // Update component - FIXED: Use functional update
  const updateComponent = useCallback(
    (id: string, props: Record<string, any>) => {
      addToHistory((prevComponents) => 
        updateInTree(prevComponents, id, (comp) => ({
          ...comp,
          props: { ...comp.props, ...props },
        }))
      );

      // Update selected component
      if (selectedComponent?.id === id) {
        setSelectedComponent((prev) =>
          prev ? { ...prev, props: { ...prev.props, ...props } } : null
        );
      }
    },
    [addToHistory, updateInTree, selectedComponent]
  );

  // Delete component - FIXED: Use functional update
  const deleteComponent = useCallback(
    (id: string) => {
      addToHistory((prevComponents) => removeFromTree(prevComponents, id));

      if (selectedComponent?.id === id) {
        setSelectedComponent(null);
      }

      toast.success("Component deleted");
    },
    [addToHistory, removeFromTree, selectedComponent, toast]
  );

  // Duplicate component - FIXED: Use functional update
  const duplicateComponent = useCallback(
    (id: string) => {
      addToHistory((prevComponents) => {
        const component = findComponent(prevComponents, id);
        if (!component) return prevComponents;

        const cloned = cloneComponentWithNewIds(component);
        
        // Find parent and add after current component
        const addAfterComponent = (components: ComponentSchema[]): ComponentSchema[] => {
          const result: ComponentSchema[] = [];
          for (const comp of components) {
            result.push(comp);
            if (comp.id === id) {
              result.push(cloned);
            }
            if (comp.children) {
              result[result.length - 1] = {
                ...result[result.length - 1],
                children: addAfterComponent(comp.children),
              };
            }
          }
          return result;
        };

        return addAfterComponent(prevComponents);
      });
      
      toast.success("Component duplicated");
    },
    [addToHistory, findComponent, cloneComponentWithNewIds, toast]
  );

  // Copy component - FIXED: Use functional approach to read current state
  const copyComponent = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const component = findComponent(prev.present, id);
        if (component) {
          setCopiedComponent(component);
          toast.success("Component copied to clipboard");
        }
        return prev; // No state change
      });
    },
    [findComponent, toast]
  );

  // Paste component - FIXED: Use functional update
  const pasteComponent = useCallback(
    (parentId?: string) => {
      if (!copiedComponent) {
        toast.error("No component to paste");
        return;
      }

      const cloned = cloneComponentWithNewIds(copiedComponent);
      
      addToHistory((prevComponents) => {
        if (parentId) {
          return updateInTree(prevComponents, parentId, (parent) => ({
            ...parent,
            children: [...(parent.children || []), cloned],
          }));
        } else {
          return [...prevComponents, cloned];
        }
      });
      
      toast.success("Component pasted");
    },
    [copiedComponent, addToHistory, cloneComponentWithNewIds, updateInTree, toast]
  );

  // Select component - FIXED: Use functional approach
  const selectComponent = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedComponent(null);
        return;
      }

      // Read directly from history state to find component
      setHistory((prev) => {
        const found = findComponent(prev.present, id);
        if (found) {
          setSelectedComponent(found);
        }
        return prev; // No state change, just accessing current value
      });
    },
    [findComponent]
  );

  // Reorder components (for drag & drop) - FIXED: Accept updater function
  const reorderComponents = useCallback(
    (newComponents: ComponentSchema[]) => {
      addToHistory(() => newComponents);
    },
    [addToHistory]
  );

  // Undo
  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };
    });
    
    hasUnsavedChanges.current = true;
    setSelectedComponent(null);
  }, []);

  // Redo
  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };
    });
    
    hasUnsavedChanges.current = true;
    setSelectedComponent(null);
  }, []);

  /**
   * Flatten ComponentSchema[] tree into SaveComponentData[] for backend.
   * The legacy page_components table stores a flat list with sort_order.
   * Children/nested structures are stored inside component_data (JSON).
   */
  const flattenForSave = useCallback((components: ComponentSchema[]): SaveComponentData[] => {
    const result = components.map((comp) => {
      const componentData = {
        ...comp.props,
        // If component has children, store them in the data JSON
        ...(comp.children && comp.children.length > 0
          ? { children: comp.children.map(child => ({
              id: child.id,
              type: child.type,
              props: child.props,
              children: child.children,
            })) }
          : {}),
      };

      return {
        type: comp.type,
        data: componentData,
        isVisible: true,
      };
    });

    console.log('📋 Flattened components for save:', result);
    return result;
  }, []);

  // Save components to backend using the page_components replace-all strategy
  const saveComponents = useCallback(async () => {
    try {
      setSaving(true);
      
      // Transform frontend ComponentSchema[] → backend SaveComponentData[]
      const componentsToSave = flattenForSave(history.present);
      
      console.log('🚀 Saving components to backend:', {
        componentCount: componentsToSave.length,
        components: componentsToSave
      });
      
      const result = await pagesService.savePageComponents(pageId, componentsToSave);
      
      console.log('✅ Save successful:', result);
      
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
      
      // 🔧 FIX 5: Clear session storage after successful save
      try {
        sessionStorage.removeItem(`${SESSION_STORAGE_KEY}_${pageId}`);
        console.log('🗑️ Cleared session storage after save');
      } catch (e) {
        console.warn('Failed to clear session storage:', e);
      }
      
      toast.success("Page content saved successfully");
    } catch (error: any) {
      console.error('❌ Save failed:', error);
      toast.error(error.message || "Failed to save components");
      throw error;
    } finally {
      setSaving(false);
    }
  }, [history.present, pageId, toast, flattenForSave]);

  // Auto-save DISABLED - Only manual save for now
  const debouncedAutoSave = useDebouncedCallback(
    async () => {
      console.log('⛔ Auto-save is DISABLED. Use manual save button.');
      return;
      
      // Commented out for debugging
      // if (!autoSaveEnabled || !hasUnsavedChanges.current) {
      //   console.log('⏭️ Skipping auto-save:', { autoSaveEnabled, hasUnsavedChanges: hasUnsavedChanges.current });
      //   return;
      // }
      // 
      // try {
      //   setSaving(true);
      //   const componentsToSave = flattenForSave(history.present);
      //   
      //   console.log('🔄 Auto-saving components:', {
      //     componentCount: componentsToSave.length,
      //     components: componentsToSave
      //   });
      //   
      //   await pagesService.savePageComponents(pageId, componentsToSave);
      //   setLastSaved(new Date());
      //   hasUnsavedChanges.current = false;
      //   console.log('✅ Auto-save successful');
      // } catch (error) {
      //   console.error("❌ Auto-save failed:", error);
      // } finally {
      //   setSaving(false);
      // }
    },
    3000
  );

  // Auto-save trigger DISABLED
  useEffect(() => {
    // Auto-save disabled - only manual save works
    console.log('ℹ️ Auto-save is disabled. Component count:', history.present.length);
    return undefined;
  }, [history.present]);
  
  // No cleanup needed when auto-save is disabled
  useEffect(() => {
    return () => {
      debouncedAutoSave.cancel();
    };
  }, [debouncedAutoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Ctrl+Y / Cmd+Shift+Z - Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redo();
      }
      
      // Ctrl+S / Cmd+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveComponents();
      }
      
      // Ctrl+C / Cmd+C - Copy (when component selected)
      if ((e.ctrlKey || e.metaKey) && e.key === "c" && selectedComponent) {
        e.preventDefault();
        copyComponent(selectedComponent.id);
      }
      
      // Ctrl+V / Cmd+V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && copiedComponent) {
        e.preventDefault();
        pasteComponent();
      }
      
      // Ctrl+D / Cmd+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedComponent) {
        e.preventDefault();
        duplicateComponent(selectedComponent.id);
      }
      
      // Delete / Backspace - Delete selected component
      if ((e.key === "Delete" || e.key === "Backspace") && selectedComponent) {
        e.preventDefault();
        deleteComponent(selectedComponent.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, saveComponents, copyComponent, pasteComponent, duplicateComponent, deleteComponent, selectedComponent, copiedComponent]);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled((prev) => !prev);
    toast.success(autoSaveEnabled ? "Auto-save disabled" : "Auto-save enabled");
  }, [autoSaveEnabled, toast]);

  // CRITICAL: Memo context value to ensure reference changes trigger re-renders
  const value: PageBuilderContextType = useMemo(() => ({
    components: history.present,
    selectedComponent,
    loading,
    saving,
    lastSaved,
    addComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    selectComponent,
    reorderComponents,
    copyComponent,
    pasteComponent,
    copiedComponent,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    saveComponents,
    toggleAutoSave,
    autoSaveEnabled,
  }), [
    history.present,
    history.past.length,
    history.future.length,
    selectedComponent,
    loading,
    saving,
    lastSaved,
    addComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,
    selectComponent,
    reorderComponents,
    copyComponent,
    pasteComponent,
    copiedComponent,
    undo,
    redo,
    saveComponents,
    toggleAutoSave,
    autoSaveEnabled,
  ]);

  // DEBUG: Log when components state changes
  useEffect(() => {
    console.log('🔄 Context components updated:', {
      count: history.present.length,
      components: history.present.map(c => ({ id: c.id, type: c.type })),
      hasLoadedInitially: hasLoadedInitially.current,
      isRestoredFromSession: isRestoredFromSession.current
    });
    
    // 🔧 FIX 6: Backup to session storage whenever components change
    if (history.present.length > 0 && hasLoadedInitially.current) {
      try {
        const stateToSave = {
          components: history.present,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(
          `${SESSION_STORAGE_KEY}_${pageId}`,
          JSON.stringify(stateToSave)
        );
        console.log('💾 Auto-backup to session storage:', history.present.length, 'components');
      } catch (error) {
        console.warn('⚠️ Failed to backup to session storage:', error);
      }
    }
  }, [history.present, pageId]);

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}
