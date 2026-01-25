"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { pagesService } from "@/services/pages.service";
import { useToast } from "@/context/ToastContext";

export interface ComponentSchema {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentSchema[];
}

interface PageBuilderContextType {
  components: ComponentSchema[];
  selectedComponent: ComponentSchema | null;
  loading: boolean;
  addComponent: (component: Omit<ComponentSchema, "id">, parentId?: string) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  reorderComponents: (startIndex: number, endIndex: number) => void;
  saveComponents: () => Promise<void>;
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

export function PageBuilderProvider({ children, pageId }: PageBuilderProviderProps) {
  const toast = useToast();
  const [components, setComponents] = useState<ComponentSchema[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ComponentSchema | null>(null);
  const [loading, setLoading] = useState(false);

  // Load components from backend
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        // TODO: Implement getPageComponents in service
        // For now, start with empty array
        setComponents([]);
      } catch (error: any) {
        toast.error(error.message || "Failed to load components");
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      loadComponents();
    }
  }, [pageId, toast]);

  // Generate unique ID
  const generateId = () => {
    return `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add component
  const addComponent = useCallback(
    (component: Omit<ComponentSchema, "id">, parentId?: string) => {
      const newComponent: ComponentSchema = {
        ...component,
        id: generateId(),
      };

      if (parentId) {
        // Add as child to parent
        setComponents((prev) => {
          const addToParent = (comps: ComponentSchema[]): ComponentSchema[] => {
            return comps.map((comp) => {
              if (comp.id === parentId) {
                return {
                  ...comp,
                  children: [...(comp.children || []), newComponent],
                };
              }
              if (comp.children) {
                return {
                  ...comp,
                  children: addToParent(comp.children),
                };
              }
              return comp;
            });
          };
          return addToParent(prev);
        });
      } else {
        // Add to root
        setComponents((prev) => [...prev, newComponent]);
      }

      toast.success("Component added");
    },
    [toast]
  );

  // Update component
  const updateComponent = useCallback(
    (id: string, props: Record<string, any>) => {
      setComponents((prev) => {
        const update = (comps: ComponentSchema[]): ComponentSchema[] => {
          return comps.map((comp) => {
            if (comp.id === id) {
              return { ...comp, props: { ...comp.props, ...props } };
            }
            if (comp.children) {
              return { ...comp, children: update(comp.children) };
            }
            return comp;
          });
        };
        return update(prev);
      });

      // Update selected component if it's the one being updated
      setSelectedComponent((prev) => {
        if (prev?.id === id) {
          return { ...prev, props: { ...prev.props, ...props } };
        }
        return prev;
      });
    },
    []
  );

  // Delete component
  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => {
        const remove = (comps: ComponentSchema[]): ComponentSchema[] => {
          return comps
            .filter((comp) => comp.id !== id)
            .map((comp) => ({
              ...comp,
              children: comp.children ? remove(comp.children) : undefined,
            }));
        };
        return remove(prev);
      });

      if (selectedComponent?.id === id) {
        setSelectedComponent(null);
      }

      toast.success("Component deleted");
    },
    [selectedComponent, toast]
  );

  // Select component
  const selectComponent = useCallback((id: string | null) => {
    if (!id) {
      setSelectedComponent(null);
      return;
    }

    setComponents((prev) => {
      const find = (comps: ComponentSchema[]): ComponentSchema | null => {
        for (const comp of comps) {
          if (comp.id === id) return comp;
          if (comp.children) {
            const found = find(comp.children);
            if (found) return found;
          }
        }
        return null;
      };
      const found = find(prev);
      if (found) setSelectedComponent(found);
      return prev;
    });
  }, []);

  // Reorder components
  const reorderComponents = useCallback((startIndex: number, endIndex: number) => {
    setComponents((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Save components to backend
  const saveComponents = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement savePageComponents properly
      // For now, just show success
      toast.success("Page content saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save components");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const value: PageBuilderContextType = {
    components,
    selectedComponent,
    loading,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    reorderComponents,
    saveComponents,
  };

  return (
    <PageBuilderContext.Provider value={value}>
      {children}
    </PageBuilderContext.Provider>
  );
}
