'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Button, Form, Card, Container, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaDesktop, FaExternalLinkAlt } from 'react-icons/fa';
import Link from 'next/link';
import BuilderModal from '@/components/PageBuilder/BuilderModal';
import { useRequireAuth } from '@/hooks/useAuth';

export default function EditPage({ params }: { params: { id: string } }) {
    const { isLoading: authLoading } = useRequireAuth();
    const router = useRouter();
    const { id } = params;
    
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showBuilder, setShowBuilder] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        status: 'DRAFT',
        template: 'DEFAULT',
        metaTitle: '', 
        metaDescription: ''
    });

    useEffect(() => {
        if (!authLoading && id) {
            fetchPage(id);
        }
    }, [authLoading, id]);

    const fetchPage = async (pageId: string) => {
        try {
            const res: any = await apiClient.get(`/cms/pages/${pageId}`);
            // apiClient.get() already returns response.data, so res is { success, data }
            const pageData = res.data;
            setPage(pageData);
            setFormData({
                title: pageData.title,
                slug: pageData.slug,
                status: pageData.status,
                template: pageData.template,
                metaTitle: pageData.metaTitle || '',
                metaDescription: pageData.metaDescription || ''
            });
        } catch (error) {
            console.error('Error fetching page:', error);
            alert('Failed to load page details');
            router.push('/cms/pages');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMetadata = async () => {
        setSaving(true);
        try {
            await apiClient.put(`/cms/pages/${id}`, formData);
            alert('Page metadata saved!');
            fetchPage(id);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveComponents = async (components: any[]) => {
        try {
            // Get existing components
            const existingComponents = page.components || [];
            const existingIds = existingComponents.map((c: any) => c.id);
            const newComponentIds = components.filter((c: any) => c.id).map((c: any) => c.id);
            
            // Delete removed components
            for (const existingComp of existingComponents) {
                if (!newComponentIds.includes(existingComp.id)) {
                    await apiClient.delete(`/cms/pages/components/${existingComp.id}`);
                }
            }
            
            // Create or update components
            for (let i = 0; i < components.length; i++) {
                const comp = components[i];
                const payload = {
                    componentType: comp.type,  // Backend expects 'componentType'
                    componentData: comp.data,  // Backend expects 'componentData'
                    isVisible: comp.isVisible !== false,
                    order: i
                };
                
                if (comp.id && existingIds.includes(comp.id)) {
                    // Update existing component
                    await apiClient.put(`/cms/pages/components/${comp.id}`, payload);
                } else {
                    // Create new component
                    await apiClient.post(`/cms/pages/${id}/components`, payload);
                }
            }
            
            alert('Page layout saved successfully!');
            await fetchPage(id);
        } catch (error: any) {
            console.error('Error saving components:', error);
            
            // Better error message handling
            const errorData = error.response?.data;
            if (errorData?.code && Array.isArray(errorData.code)) {
                // Validation errors from schema
                const validationErrors = errorData.code
                    .map((err: any) => `${err.field}: ${err.message}`)
                    .join('\n');
                alert(`Validation Error:\n\n${validationErrors}\n\nPlease check your component fields and try again.`);
            } else if (errorData?.message) {
                alert(`Error: ${errorData.message}`);
            } else {
                alert('Failed to save layout. Please try again.');
            }
        }
    };

    if (authLoading || loading) return <div className="min-vh-100 d-flex justify-content-center align-items-center"><Spinner animation="border" /></div>;
    if (!page) return <div className="min-vh-100 d-flex justify-content-center align-items-center"><p>Page not found</p></div>;

    return (
        <Container fluid className="p-4 min-vh-100">
             <div className="d-flex justify-content-between align-items-center mb-4">
                 <div className="d-flex align-items-center gap-3">
                     <Link href="/cms/pages">
                        <Button variant="light" className="border shadow-sm"><FaArrowLeft /></Button>
                     </Link>
                     <h2 className="mb-0 fw-bold">{page.title}</h2>
                     <Badge bg={page.status === 'PUBLISHED' ? 'success' : 'warning'} className="fs-6">{page.status}</Badge>
                 </div>
                 <div className="d-flex gap-2">
                     <Button variant="primary" onClick={() => setShowBuilder(true)} size="lg" className="shadow-sm">
                         <FaDesktop className="me-2" /> Open Page Builder
                     </Button>
                 </div>
             </div>

             <Row>
                 <Col md={8}>
                     <Card className="mb-4 shadow-sm border-0">
                         <Card.Header className="bg-white py-3 border-bottom">
                             <h5 className="mb-0 fw-bold text-primary">Page Settings</h5>
                         </Card.Header>
                         <Card.Body className="p-4">
                             <Form>
                                 <Row>
                                     <Col md={6}>
                                         <Form.Group className="mb-3">
                                             <Form.Label className="fw-semibold">Page Title</Form.Label>
                                             <Form.Control 
                                                 value={formData.title} 
                                                 onChange={(e) => setFormData({...formData, title: e.target.value})}
                                             />
                                         </Form.Group>
                                     </Col>
                                     <Col md={6}>
                                         <Form.Group className="mb-3">
                                             <Form.Label className="fw-semibold">Slug (URL)</Form.Label>
                                             <Form.Control 
                                                 value={formData.slug} 
                                                 onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                             />
                                         </Form.Group>
                                     </Col>
                                 </Row>
                                 <Row>
                                     <Col md={6}>
                                         <Form.Group className="mb-3">
                                             <Form.Label className="fw-semibold">Status</Form.Label>
                                             <Form.Select 
                                                 value={formData.status} 
                                                 onChange={(e) => setFormData({...formData, status: e.target.value})}
                                             >
                                                 <option value="DRAFT">Draft</option>
                                                 <option value="PUBLISHED">Published</option>
                                             </Form.Select>
                                         </Form.Group>
                                     </Col>
                                      <Col md={6}>
                                         <Form.Group className="mb-3">
                                             <Form.Label className="fw-semibold">Template</Form.Label>
                                             <Form.Select 
                                                 value={formData.template} 
                                                 onChange={(e) => setFormData({...formData, template: e.target.value})}
                                             >
                                                 <option value="DEFAULT">Default</option>
                                                 <option value="FULL_WIDTH">Full Width</option>
                                                 <option value="LANDING">Landing Page (No Header/Footer)</option>
                                             </Form.Select>
                                         </Form.Group>
                                     </Col>
                                 </Row>
                                 
                                 <h6 className="mt-4 mb-3 text-muted border-bottom pb-2">SEO Configuration</h6>
                                 <Form.Group className="mb-3">
                                     <Form.Label>Meta Title</Form.Label>
                                     <Form.Control 
                                         value={formData.metaTitle} 
                                         onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                                     />
                                 </Form.Group>
                                 <Form.Group className="mb-3">
                                     <Form.Label>Meta Description</Form.Label>
                                     <Form.Control 
                                         as="textarea"
                                         rows={3}
                                         value={formData.metaDescription} 
                                         onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                                     />
                                 </Form.Group>

                                 <div className="d-flex justify-content-end mt-4">
                                     <Button variant="success" size="lg" onClick={handleUpdateMetadata} disabled={saving} className="px-5">
                                         {saving ? 'Saving...' : 'Save Changes'}
                                     </Button>
                                 </div>
                             </Form>
                         </Card.Body>
                     </Card>
                 </Col>
                 <Col md={4}>
                     <Card className="shadow-sm border-0 mb-3">
                         <Card.Body>
                             <h5 className="fw-bold mb-3">Components</h5>
                             <div className="display-4 text-center text-primary fw-bold mb-3">
                                {page.components?.length || 0}
                             </div>
                             <p className="text-center text-muted mb-4 small">Elements on this page</p>
                             <div className="d-grid">
                                 <Button variant="outline-primary" onClick={() => setShowBuilder(true)}>
                                     Open Builder
                                 </Button>
                             </div>
                         </Card.Body>
                     </Card>
                     
                     <Card className="shadow-sm border-0">
                         <Card.Body>
                             <h5 className="fw-bold mb-3">Info</h5>
                             <p className="small mb-1"><strong>ID:</strong> {page.id}</p>
                             <p className="small mb-1"><strong>Created By:</strong> {page.createdBy?.firstName}</p>
                             <p className="small mb-1"><strong>Last Updated:</strong> {new Date(page.updatedAt).toLocaleDateString()}</p>
                         </Card.Body>
                     </Card>
                 </Col>
             </Row>

             {/* Builder Modal */}
             {showBuilder && (
                 <BuilderModal 
                     show={showBuilder} 
                     onClose={() => setShowBuilder(false)} 
                     initialComponents={page.components}
                     onSave={handleSaveComponents}
                 />
             )}
        </Container>
    );
}
