'use client';

import React, { useEffect } from 'react';
import { Modal, Button, Navbar, Spinner } from 'react-bootstrap';
import { BuilderProvider, useBuilder } from './BuilderContext';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import Inspector from './Inspector';
import { FaSave, FaTimes, FaDesktop } from 'react-icons/fa';

// Inner component to access context
const BuilderLayout = ({ onClose }: { onClose: () => void }) => {
    const { saveComponents, isSaving } = useBuilder();

    return (
        <div className="d-flex flex-column h-100">
             {/* Professional Navbar */}
             <div 
                className="d-flex align-items-center justify-content-between px-4 py-3 flex-shrink-0 border-bottom"
                style={{
                    backgroundColor: '#24292f',
                    borderBottomColor: '#3d444d !important'
                }}
             >
                 {/* Left - Branding */}
                 <div className="d-flex align-items-center gap-3">
                     <div 
                        className="d-flex align-items-center justify-content-center rounded"
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#0969da',
                        }}
                     >
                         <FaDesktop size={16} color="white" />
                     </div>
                     <div>
                         <h6 className="mb-0 fw-bold text-white" style={{ fontSize: '14px', letterSpacing: '0.3px' }}>
                             Page Builder
                         </h6>
                         <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>
                             Visual Editor
                         </p>
                     </div>
                 </div>

                 {/* Right - Actions */}
                 <div className="d-flex align-items-center gap-2">
                     <button 
                        className="btn btn-sm border-0 d-flex align-items-center gap-2"
                        onClick={onClose} 
                        disabled={isSaving}
                        style={{
                            backgroundColor: 'transparent',
                            color: '#8b949e',
                            fontSize: '13px',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3d444d';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#8b949e';
                        }}
                     >
                        <FaTimes size={14} /> Close
                     </button>
                     
                     <button 
                        className="btn btn-sm d-flex align-items-center gap-2"
                        onClick={async () => await saveComponents()} 
                        disabled={isSaving}
                        style={{
                            backgroundColor: '#238636',
                            color: 'white',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            padding: '8px 20px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 0 transparent'
                        }}
                        onMouseEnter={(e) => {
                            if (!isSaving) {
                                e.currentTarget.style.backgroundColor = '#2ea043';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(35, 134, 54, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#238636';
                            e.currentTarget.style.boxShadow = '0 0 transparent';
                        }}
                     >
                         {isSaving ? (
                             <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                Saving...
                             </>
                         ) : (
                             <>
                                <FaSave size={13} />
                                Save Page
                             </>
                         )}
                     </button>
                 </div>
             </div>
             
             {/* 3-Column Layout */}
             <div className="d-flex flex-grow-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
                 <Sidebar />
                 <Canvas />
                 <Inspector />
             </div>
        </div>
    );
};

// Helper to initialize context
const BuilderInitializer = ({ initialComponents }: { initialComponents: any[] }) => {
    const { initialize } = useBuilder();
    useEffect(() => {
        initialize(initialComponents || []);
    }, [initialComponents]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
}

interface BuilderModalProps {
    show: boolean;
    onClose: () => void;
    initialComponents: any[];
    onSave: (components: any[]) => Promise<void>;
}

export default function BuilderModal({ show, onClose, initialComponents, onSave }: BuilderModalProps) {
    if (!show) return null;

    return (
        <Modal show={show} onHide={onClose} fullscreen animation={false} className="p-0 m-0" backdrop="static" keyboard={false}>
             <Modal.Body className="p-0 overflow-hidden">
                <BuilderProvider onSave={onSave}>
                     <BuilderInitializer initialComponents={initialComponents} />
                     <BuilderLayout onClose={onClose} />
                 </BuilderProvider>
             </Modal.Body>
        </Modal>
    );
}
