'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Simple Enhanced Page Builder Context - NO ERRORS VERSION
 * 
 * Features:
 * ✅ Undo/Redo (up to 50 states)
 * ✅ Auto-save (5 second debounce)
 * ✅ Keyboard shortcuts (Ctrl+Z/Y/S/C/V/D, Delete)
 * ✅ Copy/Paste/Duplicate
 */

export interface ComponentSchema {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentSchema[];
}

interface PageBuilderState {
  components: ComponentSchema[];
  selectedComponentId: string | null;
  clipboard: ComponentSchema | null;
  autoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  saving: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

interface PageBuilderActions {
  addComponent: (component: Omit<ComponentSchema, 'id'>, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  moveComponent: (sourceId: string, targetId: string, position?: 'before' | 'after' | 'inside') => void;
  undo: () => void;
  redo: () => void;
  copyComponent: (id: string) => void;
  pasteComponent: (parentId?: string) => void;
  duplicateComponent: (id: string) => void;
  saveComponents: () => Promise<void>;
  toggleAutoSave: () => void;
  initialize: (components: ComponentSchema[]) => void;
}

const PageBuilderContext = createContext<(PageBuilderState & PageBuilderActions) | undefined>(undefined);

// Helper: Generate unique ID
function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Clone component with new IDs
function cloneComponent(component: ComponentSchema): ComponentSchema {
  return {
    ...component,
    id: generateId(),
    children: component.children?.map(cloneComponent),
  };
}

// Helper: Find component by ID
function findComponent(components: ComponentSchema[], id: string): ComponentSchema | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponent(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper: Update component immutably
function updateComponentInTree(
  components: ComponentSchema[],
  id: string,
  updates: Partial<ComponentSchema>
): ComponentSchema[] {
  return components.map(comp => {
    if (comp.id === id) {
      return { ...comp, ...updates };
    }
    if (comp.children) {
      return {
        ...comp,
        children: updateComponentInTree(comp.children, id, updates),
      };
    }
    return comp;
  });
}

// Helper: Delete component immutably
function deleteComponentFromTree(components: ComponentSchema[], id: string): ComponentSchema[] {
  return components
    .filter(comp => comp.id !== id)
    .map(comp => ({
      ...comp,
      children: comp.children ? deleteComponentFromTree(comp.children, id) : undefined,
    }));
}

// Helper: Add component immutably
function addComponentToTree(
  components: ComponentSchema[],
  newComponent: ComponentSchema,
  parentId?: string
): ComponentSchema[] {
  if (!parentId) {
    return [...components, newComponent];
  }
  
  return components.map(comp => {
    if (comp.id === parentId) {
      return {
        ...comp,
        children: [...(comp.children || []), newComponent],
      };
    }
    if (comp.children) {
      return {
        ...comp,
        children: addComponentToTree(comp.children, newComponent, parentId),
      };
    }
    return comp;
  });
}

export function SimpleEnhancedPageBuilderProvider({
  children,
  pageId,
  onSave,
}: {
  children: React.ReactNode;
  pageId: string;
  onSave: (components: ComponentSchema[]) => Promise<void>;
}) {
  const [history, setHistory] = useState<{
    past: ComponentSchema[][];
    present: ComponentSchema[];
    future: ComponentSchema[][];
  }>({
    past: [],
    present: [],
    future: [],
  });
  
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<ComponentSchema | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  
  const components = history.present;
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;
  
  // Update state with history
  const updateState = useCallback((newComponents: ComponentSchema[]) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present].slice(-50), // Keep max 50 states
      present: newComponents,
      future: [], // Clear future when new change is made
    }));
    setHasUnsavedChanges(true);
  }, []);
  
  // Initialize
  const initialize = useCallback((initialComponents: ComponentSchema[]) => {
    setHistory({
      past: [],
      present: initialComponents,
      future: [],
    });
    setHasUnsavedChanges(false);
  }, []);
  
  // Add component
  const addComponent = useCallback((component: Omit<ComponentSchema, 'id'>, parentId?: string) => {
    const newComponent: ComponentSchema = {
      ...component,
      id: generateId(),
    };
    const newComponents = addComponentToTree(components, newComponent, parentId);
    updateState(newComponents);
  }, [components, updateState]);
  
  // Update component
  const updateComponent = useCallback((id: string, updates: Partial<ComponentSchema>) => {
    const newComponents = updateComponentInTree(components, id, updates);
    updateState(newComponents);
  }, [components, updateState]);
  
  // Delete component
  const deleteComponent = useCallback((id: string) => {
    const newComponents = deleteComponentFromTree(components, id);
    updateState(newComponents);
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [components, selectedComponentId, updateState]);
  
  // Select component
  const selectComponent = useCallback((id: string | null) => {
    setSelectedComponentId(id);
  }, []);
  
  // Move component (placeholder for drag & drop)
  const moveComponent = useCallback((sourceId: string, targetId: string, position: 'before' | 'after' | 'inside' = 'after') => {
    console.log('Move component:', { sourceId, targetId, position });
    // TODO: Implement with @dnd-kit
  }, []);
  
  // Undo
  const undo = useCallback(() => {
    if (!canUndo) return;
    
    setHistory(prev => ({
      past: prev.past.slice(0, -1),
      present: prev.past[prev.past.length - 1],
      future: [prev.present, ...prev.future],
    }));
    setHasUnsavedChanges(true);
  }, [canUndo]);
  
  // Redo
  const redo = useCallback(() => {
    if (!canRedo) return;
    
    setHistory(prev => ({
      past: [...prev.past, prev.present],
      present: prev.future[0],
      future: prev.future.slice(1),
    }));
    setHasUnsavedChanges(true);
  }, [canRedo]);
  
  // Copy component
  const copyComponent = useCallback((id: string) => {
    const component = findComponent(components, id);
    if (component) {
      setClipboard(component);
    }
  }, [components]);
  
  // Paste component
  const pasteComponent = useCallback((parentId?: string) => {
    if (!clipboard) return;
    
    const clonedComponent = cloneComponent(clipboard);
    const newComponents = addComponentToTree(components, clonedComponent, parentId);
    updateState(newComponents);
  }, [clipboard, components, updateState]);
  
  // Duplicate component
  const duplicateComponent = useCallback((id: string) => {
    const component = findComponent(components, id);
    if (!component) return;
    
    const clonedComponent = cloneComponent(component);
    const newComponents = [...components, clonedComponent]; // Add to root
    updateState(newComponents);
  }, [components, updateState]);
  
  // Save function
  const saveComponents = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    setSaving(true);
    try {
      await onSave(components);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  }, [components, hasUnsavedChanges, onSave]);
  
  // Toggle auto-save
  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);
  
  // Auto-save with debounce
  const debouncedSave = useDebouncedCallback(saveComponents, 5000);
  
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges) {
      debouncedSave();
    }
  }, [autoSaveEnabled, hasUnsavedChanges, debouncedSave]);
  
  // Keyboard shortcuts using refs to avoid dependency issues
  const actionsRef = useRef({
    undo,
    redo,
    saveComponents,
    copyComponent,
    pasteComponent,
    duplicateComponent,
    deleteComponent,
  });
  
  useEffect(() => {
    actionsRef.current = {
      undo,
      redo,
      saveComponents,
      copyComponent,
      pasteComponent,
      duplicateComponent,
      deleteComponent,
    };
  }, [undo, redo, saveComponents, copyComponent, pasteComponent, duplicateComponent, deleteComponent]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        actionsRef.current.undo();
      } else if (ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        actionsRef.current.redo();
      } else if (ctrlKey && e.key === 's') {
        e.preventDefault();
        actionsRef.current.saveComponents();
      } else if (ctrlKey && e.key === 'c' && selectedComponentId) {
        e.preventDefault();
        actionsRef.current.copyComponent(selectedComponentId);
      } else if (ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault();
        actionsRef.current.pasteComponent();
      } else if (ctrlKey && e.key === 'd' && selectedComponentId) {
        e.preventDefault();
        actionsRef.current.duplicateComponent(selectedComponentId);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        e.preventDefault();
        actionsRef.current.deleteComponent(selectedComponentId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, clipboard]);
  
  const value = {
    // State
    components,
    selectedComponentId,
    clipboard,
    autoSaveEnabled,
    hasUnsavedChanges,
    lastSaved,
    saving,
    canUndo,
    canRedo,
    
    // Actions
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    undo,
    redo,
    copyComponent,
    pasteComponent,
    duplicateComponent,
    saveComponents,
    toggleAutoSave,
    initialize,
  };
  
  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}

export function useSimpleEnhancedPageBuilder() {
  const context = useContext(PageBuilderContext);
  if (!context) {
    throw new Error('useSimpleEnhancedPageBuilder must be used within SimpleEnhancedPageBuilderProvider');
  }
  return context;
}

// Re-export untuk memastikan export terdeteksi
export { SimpleEnhancedPageBuilderProvider as default };
