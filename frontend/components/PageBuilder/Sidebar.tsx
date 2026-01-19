'use client';

import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { COMPONENT_REGISTRY, COMPONENT_CATEGORIES } from './registry';
import { FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa';

export default function Sidebar() {
    const { addComponent } = useBuilder();
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['layout', 'content']));

    // Group components by category
    const componentsByCategory: Record<string, string[]> = {};
    Object.values(COMPONENT_REGISTRY).forEach(comp => {
        if (!componentsByCategory[comp.category]) {
            componentsByCategory[comp.category] = [];
        }
        componentsByCategory[comp.category].push(comp.type);
    });

    const toggleCategory = (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    return (
        <div className="h-100 overflow-auto" style={{ 
            width: '320px', 
            backgroundColor: '#fafbfc',
            borderRight: '1px solid #e1e4e8'
        }}>
            {/* Header */}
            <div className="px-4 py-4 border-bottom" style={{ backgroundColor: 'white' }}>
                <h6 className="mb-1 fw-bold" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#24292f' }}>
                    Components
                </h6>
                <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                    Drag to add to page
                </p>
            </div>

            {/* Component Categories */}
            <div className="p-3">
                {COMPONENT_CATEGORIES.map(category => {
                    const isExpanded = expandedCategories.has(category.id);
                    const components = componentsByCategory[category.id] || [];
                    
                    return (
                        <div key={category.id} className="mb-3">
                            {/* Category Header */}
                            <button 
                                className="w-100 d-flex align-items-center justify-content-between p-2 border-0 bg-transparent text-start"
                                onClick={() => toggleCategory(category.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="fw-semibold" style={{ fontSize: '13px', color: '#57606a' }}>
                                    {category.label}
                                </span>
                                {isExpanded ? 
                                    <FaChevronDown size={12} className="text-muted" /> : 
                                    <FaChevronRight size={12} className="text-muted" />
                                }
                            </button>

                            {/* Component Cards */}
                            {isExpanded && (
                                <div className="mt-2 d-flex flex-column gap-2">
                                    {components.map(type => {
                                        const schema = COMPONENT_REGISTRY[type];
                                        const Icon = schema.icon;
                                        
                                        return (
                                            <button
                                                key={type}
                                                className="component-card d-flex align-items-center gap-3 p-3 border rounded-2 bg-white text-start position-relative"
                                                onClick={() => addComponent(type)}
                                                style={{
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    borderColor: '#d0d7de',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = '#0969da';
                                                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(9, 105, 218, 0.15)';
                                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = '#d0d7de';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                {/* Icon Container */}
                                                <div 
                                                    className="d-flex align-items-center justify-content-center flex-shrink-0 rounded"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: '#f6f8fa',
                                                        color: '#0969da'
                                                    }}
                                                >
                                                    <Icon size={18} />
                                                </div>

                                                {/* Label */}
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold mb-0" style={{ fontSize: '13px', color: '#24292f' }}>
                                                        {schema.label}
                                                    </div>
                                                    <div className="text-muted" style={{ fontSize: '11px' }}>
                                                        Click to add
                                                    </div>
                                                </div>

                                                {/* Plus Icon */}
                                                <div 
                                                    className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle"
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        backgroundColor: '#0969da',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <FaPlus size={10} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
