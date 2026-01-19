'use client';

import React from 'react';
import { Form } from 'react-bootstrap';
import { useBuilder } from './BuilderContext';
import { COMPONENT_REGISTRY } from './registry';
import { FaCog, FaPalette, FaFont, FaImage, FaLink } from 'react-icons/fa';

export default function Inspector() {
    const { activeComponentId, components, updateComponentField, removeComponent } = useBuilder();

    if (!activeComponentId) {
        return (
            <div 
                className="h-100 d-flex flex-column align-items-center justify-content-center text-center px-4"
                style={{ 
                    width: '380px',
                    backgroundColor: '#fafbfc',
                    borderLeft: '1px solid #e1e4e8'
                }}
            >
                <div 
                    className="mb-3 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#f6f8fa',
                        color: '#d0d7de'
                    }}
                >
                    <FaCog size={32} />
                </div>
                <h6 className="fw-semibold mb-2" style={{ color: '#24292f' }}>
                    No Component Selected
                </h6>
                <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
                    Click on a component in the canvas to edit its properties
                </p>
            </div>
        );
    }

    const component = components.find(c => c.id === activeComponentId);
    if (!component) return <div style={{ width: '380px' }}></div>;

    const schema = COMPONENT_REGISTRY[component.type];

    if (!schema) {
        return (
            <div className="p-4" style={{ width: '380px', backgroundColor: '#fafbfc' }}>
                <div className="alert alert-warning">
                    Unknown component type: {component.type}
                </div>
            </div>
        );
    }

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'color': return FaPalette;
            case 'text': case 'textarea': return FaFont;
            case 'image': return FaImage;
            default: return FaCog;
        }
    };

    return (
        <div 
            className="h-100 overflow-auto"
            style={{ 
                width: '380px',
                backgroundColor: '#fafbfc',
                borderLeft: '1px solid #e1e4e8'
            }}
        >
            {/* Header */}
            <div className="px-4 py-4 border-bottom bg-white sticky-top">
                <div className="d-flex align-items-center gap-2 mb-2">
                    <schema.icon size={18} style={{ color: '#0969da' }} />
                    <h6 className="mb-0 fw-bold" style={{ fontSize: '14px', color: '#24292f' }}>
                        {schema.label}
                    </h6>
                </div>
                <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>
                    Edit component properties
                </p>
            </div>

            {/* Form Fields */}
            <div className="p-4">
                <Form onSubmit={(e) => e.preventDefault()}>
                    {schema.fields.map((field, index) => {
                        const FieldIcon = getFieldIcon(field.type);
                        
                        return (
                            <div 
                                key={field.name}
                                className="mb-4"
                            >
                                {/* Field Label */}
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <FieldIcon size={12} style={{ color: '#57606a' }} />
                                    <Form.Label className="mb-0 fw-semibold" style={{ fontSize: '13px', color: '#24292f' }}>
                                        {field.label}
                                    </Form.Label>
                                </div>

                                {/* Field Input */}
                                {field.type === 'text' && (
                                    <Form.Control 
                                        type="text" 
                                        value={component.data[field.name] || ''} 
                                        onChange={(e) => updateComponentField(component.id, field.name, e.target.value)}
                                        placeholder={
                                            field.name.toLowerCase().includes('link') || field.name.toLowerCase().includes('url') 
                                                ? 'e.g., /contact or https://example.com' 
                                                : ''
                                        }
                                        className="border"
                                        style={{
                                            borderColor: '#d0d7de',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            padding: '8px 12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#0969da';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(9, 105, 218, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#d0d7de';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                )}
                                
                                {field.type === 'textarea' && (
                                    <Form.Control 
                                        as="textarea" 
                                        rows={5}
                                        value={component.data[field.name] || ''} 
                                        onChange={(e) => updateComponentField(component.id, field.name, e.target.value)}
                                        className="border"
                                        style={{
                                            borderColor: '#d0d7de',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            padding: '8px 12px',
                                            fontFamily: 'monospace',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#0969da';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(9, 105, 218, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#d0d7de';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                )}
                                
                                {field.type === 'number' && (
                                    <Form.Control 
                                        type="number"
                                        value={component.data[field.name] || ''} 
                                        onChange={(e) => updateComponentField(component.id, field.name, parseInt(e.target.value) || 0)}
                                        className="border"
                                        style={{
                                            borderColor: '#d0d7de',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            padding: '8px 12px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#0969da';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(9, 105, 218, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#d0d7de';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                )}
                                
                                {field.type === 'image' && (
                                    <div>
                                        <Form.Control 
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            value={component.data[field.name] || ''} 
                                            onChange={(e) => updateComponentField(component.id, field.name, e.target.value)}
                                            className="border mb-2"
                                            style={{
                                                borderColor: '#d0d7de',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                padding: '8px 12px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#0969da';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(9, 105, 218, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#d0d7de';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {component.data[field.name] && (
                                            <div 
                                                className="rounded-2 overflow-hidden border"
                                                style={{ 
                                                    borderColor: '#e1e4e8',
                                                    height: '120px',
                                                    backgroundImage: `url(${component.data[field.name]})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center'
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                                
                                {field.type === 'color' && (
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Control 
                                            type="color"
                                            value={component.data[field.name] || '#ffffff'} 
                                            onChange={(e) => updateComponentField(component.id, field.name, e.target.value)}
                                            style={{
                                                width: '60px',
                                                height: '40px',
                                                borderRadius: '6px',
                                                borderColor: '#d0d7de',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <Form.Control 
                                            type="text"
                                            value={component.data[field.name] || '#ffffff'} 
                                            onChange={(e) => updateComponentField(component.id, field.name, e.target.value)}
                                            className="border flex-grow-1"
                                            style={{
                                                borderColor: '#d0d7de',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                padding: '8px 12px',
                                                fontFamily: 'monospace'
                                            }}
                                        />
                                    </div>
                                )}
                                
                                {/* Field Description */}
                                {field.type === 'image' && (
                                    <small className="text-muted d-block mt-1" style={{ fontSize: '11px' }}>
                                        Enter image URL or upload to media library
                                    </small>
                                )}
                            </div>
                        );
                    })}
                </Form>
            </div>

            {/* Danger Zone */}
            <div className="px-4 pb-4">
                <div 
                    className="border rounded-2 p-3"
                    style={{ 
                        borderColor: '#d0d7de',
                        backgroundColor: '#fff'
                    }}
                >
                    <h6 className="fw-semibold mb-2" style={{ fontSize: '12px', color: '#cf222e' }}>
                        Danger Zone
                    </h6>
                    <p className="text-muted mb-3" style={{ fontSize: '11px' }}>
                        This action cannot be undone
                    </p>
                    <button
                        className="btn btn-sm w-100 border"
                        style={{
                            borderColor: '#cf222e',
                            color: '#cf222e',
                            backgroundColor: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '8px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this component?')) {
                                removeComponent(component.id);
                            }
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#cf222e';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = '#cf222e';
                        }}
                    >
                        Delete Component
                    </button>
                </div>
            </div>
        </div>
    );
}
