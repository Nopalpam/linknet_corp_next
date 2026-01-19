'use client';

import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { COMPONENT_REGISTRY } from './registry';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTrash, FaGripVertical, FaEye, FaEyeSlash, FaCopy } from 'react-icons/fa';

// Sortable Item Component
const SortableItem = ({ id, component, isActive, onClick, onDelete }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const [isHovered, setIsHovered] = useState(false);
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    
    const Schema = COMPONENT_REGISTRY[component.type];
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="position-relative mb-3"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Component Container */}
            <div 
                className="border rounded-3 bg-white position-relative overflow-hidden"
                style={{
                    borderColor: isActive ? '#0969da' : (isHovered ? '#d0d7de' : '#e1e4e8'),
                    borderWidth: isActive ? '2px' : '1px',
                    boxShadow: isActive ? '0 0 0 3px rgba(9, 105, 218, 0.1)' : (isHovered ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'),
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                }}
            >
                {/* Top Bar - Component Label & Actions */}
                {(isHovered || isActive) && (
                    <div 
                        className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                        style={{ 
                            backgroundColor: isActive ? '#f6f8fa' : '#fafbfc',
                            borderBottomColor: '#e1e4e8'
                        }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            {/* Drag Handle */}
                            <div 
                                {...attributes} 
                                {...listeners}
                                className="d-flex align-items-center justify-content-center"
                                style={{ 
                                    cursor: 'grab',
                                    padding: '4px',
                                    color: '#57606a',
                                    borderRadius: '4px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e1e4e8';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <FaGripVertical size={14} />
                            </div>
                            
                            <span className="fw-semibold" style={{ fontSize: '12px', color: '#24292f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {Schema?.label}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="d-flex align-items-center gap-1">
                            <button
                                className="btn btn-sm p-1 border-0 bg-transparent"
                                style={{ 
                                    color: '#57606a',
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '4px'
                                }}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    onDelete(); 
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#ffebe9';
                                    e.currentTarget.style.color = '#cf222e';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#57606a';
                                }}
                                title="Delete component"
                            >
                                <FaTrash size={13} />
                            </button>
                        </div>
                    </div>
                )}
                 
                {/* Component Preview */}
                <div className="p-3" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {component.type === 'hero-section' && (
                        <div 
                            className="rounded-2 d-flex align-items-center justify-content-center flex-column text-white position-relative overflow-hidden"
                            style={{ 
                                backgroundImage: `url(${component.data.backgroundImage})`, 
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: '200px',
                                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.3)' }} />
                            <div className="position-relative text-center px-4">
                                <h2 className="mb-2 fw-bold">{component.data.title || 'Hero Title'}</h2>
                                <p className="mb-3">{component.data.subtitle || 'Hero subtitle'}</p>
                                <button className="btn btn-primary btn-sm">
                                    {component.data.ctaText || 'Call to Action'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {component.type === 'text-block' && (
                        <div 
                            className="p-3 rounded-2"
                            style={{ 
                                backgroundColor: '#f6f8fa',
                                border: '1px solid #e1e4e8',
                                minHeight: '80px'
                            }}
                        >
                            <div 
                                dangerouslySetInnerHTML={{ __html: component.data.content || '<p class="text-muted">Text content...</p>' }}
                                style={{ fontSize: '14px', lineHeight: '1.6' }}
                            />
                        </div>
                    )}
                    
                    {component.type === 'call-to-action' && (
                        <div 
                            className="text-center p-4 rounded-2"
                            style={{ 
                                backgroundColor: component.data.backgroundColor || '#f6f8fa',
                                border: '1px solid #e1e4e8'
                            }}
                        >
                            <h4 className="fw-bold mb-3">{component.data.title || 'Call to Action'}</h4>
                            {component.data.description && (
                                <p className="mb-3">{component.data.description}</p>
                            )}
                            <button className="btn btn-primary">
                                {component.data.buttonText || 'Get Started'}
                            </button>
                        </div>
                    )}
                    
                    {component.type === 'features-grid' && (
                        <div className="p-3">
                            <h5 className="fw-bold mb-3 text-center">{component.data.title || 'Features'}</h5>
                            <div className="row g-3">
                                {[1, 2, 3].slice(0, component.data.columns || 3).map(i => (
                                    <div key={i} className={`col-${12 / (component.data.columns || 3)}`}>
                                        <div 
                                            className="p-3 rounded-2 text-center"
                                            style={{ 
                                                backgroundColor: '#f6f8fa',
                                                border: '1px solid #e1e4e8'
                                            }}
                                        >
                                            <div className="mb-2 text-primary">
                                                <FaGripVertical size={24} />
                                            </div>
                                            <h6 className="fw-semibold mb-1">Feature {i}</h6>
                                            <small className="text-muted">Description</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {!['hero-section', 'text-block', 'call-to-action', 'features-grid'].includes(component.type) && (
                        <div 
                            className="p-4 text-center rounded-2"
                            style={{ 
                                backgroundColor: '#f6f8fa',
                                border: '2px dashed #d0d7de',
                                color: '#57606a'
                            }}
                        >
                            <Schema.icon size={32} className="mb-2 text-muted" />
                            <div className="fw-semibold">{Schema?.label || component.type}</div>
                            <small className="text-muted">Component Preview</small>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Indicator */}
            {isActive && (
                <div 
                    className="position-absolute top-0 start-0 px-2 py-1 rounded-1"
                    style={{
                        backgroundColor: '#0969da',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        transform: 'translate(-8px, -8px)',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 8px rgba(9, 105, 218, 0.3)'
                    }}
                >
                    Selected
                </div>
            )}
        </div>
    );
};

export default function Canvas() {
    const { components, setComponents, activeComponentId, setActiveComponentId, removeComponent } = useBuilder();
    const [activeId, setActiveId] = useState<string | null>(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setComponents((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        
        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    return (
        <div 
            className="flex-grow-1 overflow-auto" 
            style={{ 
                backgroundColor: '#f6f8fa',
                backgroundImage: 'radial-gradient(circle, #e1e4e8 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
            onClick={() => setActiveComponentId(null)}
        >
            <div className="p-4">
                <div 
                    className="bg-white mx-auto shadow-sm"
                    style={{ 
                        maxWidth: '1000px',
                        minHeight: 'calc(100vh - 120px)',
                        borderRadius: '8px',
                        border: '1px solid #e1e4e8'
                    }} 
                    onClick={(e) => e.stopPropagation()}
                >
                    <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                    >
                        <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            <div className="p-4">
                                {components.length === 0 && (
                                    <div 
                                        className="text-center py-5 rounded-3"
                                        style={{ 
                                            border: '2px dashed #d0d7de',
                                            backgroundColor: '#fafbfc'
                                        }}
                                    >
                                        <div className="mb-3" style={{ fontSize: '48px', color: '#d0d7de' }}>
                                            📄
                                        </div>
                                        <h5 className="fw-bold mb-2" style={{ color: '#24292f' }}>
                                            Empty Page
                                        </h5>
                                        <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                                            Start building by adding components from the left sidebar
                                        </p>
                                    </div>
                                )}
                                
                                {components.map((component) => (
                                    <SortableItem 
                                        key={component.id} 
                                        id={component.id} 
                                        component={component} 
                                        isActive={activeComponentId === component.id}
                                        onClick={() => setActiveComponentId(component.id)}
                                        onDelete={() => removeComponent(component.id)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                        
                        <DragOverlay>
                            {activeId ? (
                                <div 
                                    className="p-3 bg-white border rounded-3 shadow-lg"
                                    style={{ 
                                        opacity: 0.9,
                                        cursor: 'grabbing',
                                        borderColor: '#0969da',
                                        borderWidth: '2px'
                                    }}
                                >
                                    <div className="text-muted small">Moving component...</div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}
