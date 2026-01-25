"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { pagesService } from "@/services/pages.service";
import { useToast } from "@/context/ToastContext";
import { useDebouncedCallback } from "use-debounce";

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

export function PageBuilderProvider({ children, pageId }: PageBuilderProviderProps) {
  const toast = useToast();
  
  // History state
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });
  
  const [selectedComponent, setSelectedComponent] = useState<ComponentSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [copiedComponent, setCopiedComponent] = useState<ComponentSchema | null>(null);
  
  const hasUnsavedChanges = useRef(false);

  // Load components from backend
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        const response = await pagesService.getPageById(pageId);
        
        // Transform backend data to component schema
        let loadedComponents: ComponentSchema[] = [];
        
        if (response.data.components) {
          // Check if components is a string (JSON) or already parsed
          const componentsData = typeof response.data.components === 'string' 
            ? JSON.parse(response.data.components) 
            : response.data.components;
            
          loadedComponents = Array.isArray(componentsData) 
            ? componentsData.map((comp: any) => ({
                id: comp.id,
                type: comp.type,
                props: comp.props || comp.data || {},
                children: comp.children || undefined,
              }))
            : [];
        }
        
        setHistory({
          past: [],
          present: loadedComponents,
          future: [],
        });
        
        setLastSaved(new Date());
      } catch (error: any) {
        console.error("Failed to load components:", error);
        // Start with empty state if load fails
        setHistory({
          past: [],
          present: [],
          future: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadComponents();
    }
  }, [pageId]);

  // Generate unique ID
  const generateId = () => {
    return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add to history
  const addToHistory = useCallback((newComponents: ComponentSchema[]) => {
    setHistory((prev) => {
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY);
      return {
        past: newPast,
        present: newComponents,
        future: [], // Clear future when new action is performed
      };
    });
    hasUnsavedChanges.current = true;
  }, []);

  // Clone component with new IDs
  const cloneComponentWithNewIds = (component: ComponentSchema): ComponentSchema => {
    return {
      ...component,
      id: generateId(),
      children: component.children?.map(cloneComponentWithNewIds),
    };
  };

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
  const updateInTree = (
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
  };

  // Remove component from tree
  const removeFromTree = (components: ComponentSchema[], id: string): ComponentSchema[] => {
    return components
      .filter((comp) => comp.id !== id)
      .map((comp) => ({
        ...comp,
        children: comp.children ? removeFromTree(comp.children, id) : undefined,
      }));
  };

  // Add component
  const addComponent = useCallback(
    (component: Omit<ComponentSchema, "id">, parentId?: string) => {
      const newComponent: ComponentSchema = {
        ...component,
        id: generateId(),
      };

      let newComponents: ComponentSchema[];

      if (parentId) {
        // Add as child to parent
        newComponents = updateInTree(history.present, parentId, (parent) => ({
          ...parent,
          children: [...(parent.children || []), newComponent],
        }));
      } else {
        // Add to root
        newComponents = [...history.present, newComponent];
      }

      addToHistory(newComponents);
      toast.success("Component added");
    },
    [history.present, addToHistory, toast]
  );

  // Update component
  const updateComponent = useCallback(
    (id: string, props: Record<string, any>) => {
      const newComponents = updateInTree(history.present, id, (comp) => ({
        ...comp,
        props: { ...comp.props, ...props },
      }));

      addToHistory(newComponents);

      // Update selected component
      if (selectedComponent?.id === id) {
        setSelectedComponent((prev) =>
          prev ? { ...prev, props: { ...prev.props, ...props } } : null
        );
      }
    },
    [history.present, addToHistory, selectedComponent]
  );

  // Delete component
  const deleteComponent = useCallback(
    (id: string) => {
      const newComponents = removeFromTree(history.present, id);
      addToHistory(newComponents);

      if (selectedComponent?.id === id) {
        setSelectedComponent(null);
      }

      toast.success("Component deleted");
    },
    [history.present, addToHistory, selectedComponent, toast]
  );

  // Duplicate component
  const duplicateComponent = useCallback(
    (id: string) => {
      const component = findComponent(history.present, id);
      if (!component) return;

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

      const newComponents = addAfterComponent(history.present);
      addToHistory(newComponents);
      toast.success("Component duplicated");
    },
    [history.present, addToHistory, findComponent, toast]
  );

  // Copy component
  const copyComponent = useCallback(
    (id: string) => {
      const component = findComponent(history.present, id);
      if (component) {
        setCopiedComponent(component);
        toast.success("Component copied to clipboard");
      }
    },
    [history.present, findComponent, toast]
  );

  // Paste component
  const pasteComponent = useCallback(
    (parentId?: string) => {
      if (!copiedComponent) {
        toast.error("No component in clipboard");
        return;
      }

      const cloned = cloneComponentWithNewIds(copiedComponent);
      
      let newComponents: ComponentSchema[];

      if (parentId) {
        newComponents = updateInTree(history.present, parentId, (parent) => ({
          ...parent,
          children: [...(parent.children || []), cloned],
        }));
      } else {
        newComponents = [...history.present, cloned];
      }

      addToHistory(newComponents);
      toast.success("Component pasted");
    },
    [copiedComponent, history.present, addToHistory, toast]
  );

  // Select component
  const selectComponent = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelectedComponent(null);
        return;
      }

      const found = findComponent(history.present, id);
      if (found) {
        setSelectedComponent(found);
      }
    },
    [history.present, findComponent]
  );

  // Reorder components (for drag & drop)
  const reorderComponents = useCallback(
    (newComponents: ComponentSchema[]) => {
      addToHistory(newComponents);
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

  // Save components to backend
  const saveComponents = useCallback(async () => {
    try {
      setSaving(true);
      
      // Transform to backend format - save as JSON string
      const componentsJSON = JSON.stringify(history.present);
      
      await pagesService.updatePage(pageId, {
        title: '', // Will be ignored by backend
        slug: '', // Will be ignored by backend
        components: componentsJSON,
      });
      
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
      toast.success("Page content saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save components");
      throw error;
    } finally {
      setSaving(false);
    }
  }, [history.present, pageId, toast]);

  // Auto-save with debounce
  const debouncedAutoSave = useDebouncedCallback(
    async () => {
      if (!autoSaveEnabled || !hasUnsavedChanges.current) return;
      
      try {
        setSaving(true);
        const componentsJSON = JSON.stringify(history.present);
        
        await pagesService.updatePage(pageId, {
          title: '', // Will be ignored by backend
          slug: '', // Will be ignored by backend
          components: componentsJSON,
        });
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setSaving(false);
      }
    },
    5000 // Auto-save after 5 seconds of inactivity
  );

  // Trigger auto-save when components change
  useEffect(() => {
    if (history.present.length > 0 && hasUnsavedChanges.current) {
      debouncedAutoSave();
    }
  }, [history.present, debouncedAutoSave]);

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

  const value: PageBuilderContextType = {
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
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}
