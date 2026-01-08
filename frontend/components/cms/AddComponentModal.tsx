'use client';

import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { ComponentType } from '@/types/component';
import { createComponent } from '@/lib/api/components';
import { toast } from 'react-hot-toast';
import ComponentFormGenerator from './ComponentFormGenerator';

interface AddComponentModalProps {
  show: boolean;
  onHide: () => void;
  pageId: string;
  componentTypes: ComponentType[];
  onSuccess: () => void;
}

export default function AddComponentModal({
  show,
  onHide,
  pageId,
  componentTypes,
  onSuccess,
}: AddComponentModalProps) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const selectedComponentType = componentTypes.find((t) => t.type === selectedType);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFormData({}); // Reset form data when type changes
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      setError('Please select a component type');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await createComponent(pageId, {
        componentType: selectedType,
        componentData: formData,
      });

      toast.success('Component added successfully');
      onSuccess();
      handleClose();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to add component';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType('');
    setFormData({});
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPlus className="me-2" />
          Add Component
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Component Type Selection */}
          <Form.Group className="mb-3">
            <Form.Label>
              Component Type <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              required
            >
              <option value="">Select a component type...</option>
              {componentTypes.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.name}
                </option>
              ))}
            </Form.Select>
            {selectedComponentType && (
              <Form.Text className="text-muted">
                {selectedComponentType.description}
              </Form.Text>
            )}
          </Form.Group>

          {/* Dynamic Form Based on Selected Type */}
          {selectedComponentType && (
            <div className="border-top pt-3">
              <h6 className="mb-3">Component Settings</h6>
              <ComponentFormGenerator
                schema={selectedComponentType.schema}
                data={formData}
                onChange={setFormData}
              />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || !selectedType}
          >
            {isSubmitting ? 'Adding...' : 'Add Component'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
