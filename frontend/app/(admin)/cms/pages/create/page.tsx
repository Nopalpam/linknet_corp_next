'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { Button, Form, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import slugify from 'slugify';
import { useRequireAuth } from '@/hooks/useAuth';

export default function CreatePage() {
    const { isLoading: authLoading } = useRequireAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        template: 'DEFAULT'
    });

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: slugify(title, { lower: true, strict: true })
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res: any = await apiClient.post('/cms/pages', formData);
            // apiClient.post() already returns response.data, so res is { success, message, data }
            console.log('Create page response:', res);
            if (res.success && res.data?.id) {
                router.push(`/cms/pages/${res.data.id}`);
            } else {
                setError('Invalid response from server');
            }
        } catch (err: any) {
            console.error('Error creating page:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create page');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="p-5 text-center"><Spinner animation="border" /></div>;
    }

    return (
        <Container className="p-4" style={{ maxWidth: '800px' }}>
            <div className="mb-4">
                 <Link href="/cms/pages">
                    <Button variant="outline-secondary" size="sm" className="mb-2"><FaArrowLeft /> Back to List</Button>
                 </Link>
                 <h2>Create New Page</h2>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Page Title</Form.Label>
                            <Form.Control 
                                required
                                value={formData.title} 
                                onChange={handleTitleChange}
                                placeholder="e.g. About Us"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Slug</Form.Label>
                            <Form.Control 
                                required
                                value={formData.slug} 
                                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                placeholder="e.g. about-us"
                            />
                            <Form.Text className="text-muted">
                                Verify this is unique. It will determine the URL.
                            </Form.Text>
                        </Form.Group>

                         <Form.Group className="mb-4">
                            <Form.Label>Template</Form.Label>
                            <Form.Select 
                                value={formData.template} 
                                onChange={(e) => setFormData({...formData, template: e.target.value})}
                            >
                                <option value="DEFAULT">Default Template</option>
                                <option value="FULL_WIDTH">Full Width</option>
                                <option value="LANDING">Landing Page</option>
                            </Form.Select>
                        </Form.Group>

                        <div className="d-grid">
                            <Button variant="primary" type="submit" size="lg" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Page & Open Editor'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}
