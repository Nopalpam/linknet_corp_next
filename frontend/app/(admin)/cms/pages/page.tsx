'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Button, Table, Badge, Spinner, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useRequireAuth } from '@/hooks/useAuth';

export default function PagesList() {
    const { isLoading: authLoading } = useRequireAuth();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading) {
            fetchPages();
        }
    }, [authLoading]);

    const fetchPages = async () => {
        try {
            const res: any = await apiClient.get('/cms/pages');
            // apiClient.get() already returns response.data, so res is { success, data, pagination }
            setPages(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error fetching pages:', err);
            setError('Failed to load pages');
            setPages([]);
        } finally {
            setLoading(false);
        }
    };

    const deletePage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this page?')) return;
        try {
            await apiClient.delete(`/cms/pages/${id}`);
            fetchPages();
        } catch (err) {
            alert('Failed to delete page');
        }
    };

    if (authLoading || loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

    return (
        <Container fluid className="p-4">
            <Row className="mb-4">
                <Col className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">Page Management</h2>
                    <Link href="/cms/pages/create">
                        <Button variant="primary" className="d-flex align-items-center gap-2">
                            <FaPlus /> Create New Page
                        </Button>
                    </Link>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="py-3 ps-4">Title</th>
                                <th className="py-3">Slug</th>
                                <th className="py-3">Template</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">Author</th>
                                <th className="py-3 pe-4 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-muted">No pages found. Create one to get started.</td>
                                </tr>
                            ) : (
                                pages.map((page) => (
                                    <tr key={page.id}>
                                        <td className="ps-4 fw-medium">{page.title}</td>
                                        <td className="text-muted">/{page.slug}</td>
                                        <td><Badge bg="info" text="dark">{page.template}</Badge></td>
                                        <td>
                                            <Badge bg={page.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                                                {page.status}
                                            </Badge>
                                        </td>
                                        <td className="text-muted small">
                                            {page.createdBy?.firstName} {page.createdBy?.lastName}
                                        </td>
                                        <td className="pe-4 text-end">
                                            <Link href={`/cms/pages/${page.id}`}>
                                                <Button size="sm" variant="outline-primary" className="me-2">
                                                    <FaEdit /> Edit / Builder
                                                </Button>
                                            </Link>
                                            <Button size="sm" variant="outline-danger" onClick={() => deletePage(page.id)}>
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}
