'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { COMPONENT_REGISTRY } from './registry';

export interface BuilderComponent {
    id: string; // Unique instance ID
    type: string; // Component type (e.g., 'hero_section')
    data: any;    // Component props/data
    isVisible: boolean;
}

interface BuilderContextType {
    components: BuilderComponent[];
    setComponents: (components: BuilderComponent[]) => void;
    activeComponentId: string | null;
    setActiveComponentId: (id: string | null) => void;
    addComponent: (type: string) => void;
    removeComponent: (id: string) => void;
    updateComponentData: (id: string, fullData: any) => void; // Replaces data
    updateComponentField: (id: string, field: string, value: any) => void; // Updates specific field
    moveComponent: (newIndex: number, oldIndex: number) => void;
    saveComponents: () => Promise<void>;
    isSaving: boolean;
    initialize: (initialComponents: any[]) => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export const BuilderProvider: React.FC<{ children: React.ReactNode; onSave: (components: any[]) => Promise<void> }> = ({ children, onSave }) => {
    const [components, setComponents] = useState<BuilderComponent[]>([]);
    const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialize = (initialComponents: any[]) => {
        // Map DB components (which might just define type/order) to BuilderComponents
        if (!initialComponents) {
            setComponents([]);
            return;
        }
        
        const formatted = initialComponents.map(c => ({
            id: uuidv4(), // Generate new temp ID for dnd-kit (DB id is separate)
            type: c.type,
            data: c.data,
            isVisible: c.isVisible ?? true
        }));
        setComponents(formatted);
    };

    const addComponent = (type: string) => {
        const schema = COMPONENT_REGISTRY[type];
        if (!schema) return;

        const newComponent: BuilderComponent = {
            id: uuidv4(),
            type,
            data: { ...schema.defaultData },
            isVisible: true
        };

        setComponents(prev => [...prev, newComponent]);
        setActiveComponentId(newComponent.id);
    };

    const removeComponent = (id: string) => {
        setComponents(prev => prev.filter(c => c.id !== id));
        if (activeComponentId === id) setActiveComponentId(null);
    };

    const updateComponentData = (id: string, fullData: any) => {
        setComponents(prev => prev.map(c => c.id === id ? { ...c, data: fullData } : c));
    };

    const updateComponentField = (id: string, field: string, value: any) => {
         setComponents(prev => prev.map(c => 
            c.id === id ? { ...c, data: { ...c.data, [field]: value } } : c
         ));
    };

    const moveComponent = (newIndex: number, oldIndex: number) => {
        // Will be handled by dnd-kit handlers in UI, but exposes state update
    };

    const saveComponents = async () => {
        setIsSaving(true);
        try {
            await onSave(components);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <BuilderContext.Provider value={{
            components,
            setComponents,
            activeComponentId,
            setActiveComponentId,
            addComponent,
            removeComponent,
            updateComponentData,
            updateComponentField,
            moveComponent,
            saveComponents,
            isSaving,
            initialize
        }}>
            {children}
        </BuilderContext.Provider>
    );
};

export const useBuilder = () => {
    const context = useContext(BuilderContext);
    if (!context) throw new Error('useBuilder must be used within a BuilderProvider');
    return context;
};
