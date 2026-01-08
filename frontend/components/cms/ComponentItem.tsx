'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ListGroup,
  Button,
  Badge,
  Collapse,
  ButtonGroup,
} from 'react-bootstrap';
import {
  FaGripVertical,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaSave,
} from 'react-icons/fa';
import { PageComponent, ComponentType } from '@/types/component';
import { updateComponent } from '@/lib/api/components';
import { toast } from 'react-hot-toast';
import ComponentFormGenerator from './ComponentFormGenerator';

interface ComponentItemProps {
  component: PageComponent;
  componentTypes: ComponentType[];
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onUpdate: () => void;
}

export default function ComponentItem({
  component,
  componentTypes,
  onDelete,
  onToggleVisibility,
  onUpdate,
}: ComponentItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(component.data);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const componentType = componentTypes.find((t) => t.type === component.type);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateComponent(component.id, {
        componentData: formData,
      });
      toast.success('Component updated');
      onUpdate();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update component');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ListGroup.Item
      ref={setNodeRef}
      style={style}
      className={`mb-2 ${!component.isVisible ? 'opacity-50' : ''}`}
    >
      <div className="d-flex align-items-center justify-content-between">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="pe-2"
          style={{ cursor: 'grab', touchAction: 'none' }}
        >
          <FaGripVertical className="text-muted" />
        </div>

        {/* Component Info */}
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2">
            <Badge bg="secondary">{component.order}</Badge>
            <strong>{componentType?.name || component.type}</strong>
            {!component.isVisible && (
              <Badge bg="warning" text="dark">
                Hidden
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <ButtonGroup size="sm">
          <Button
            variant="outline-secondary"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => onToggleVisibility(component.id)}
            title={component.isVisible ? 'Hide' : 'Show'}
          >
            {component.isVisible ? <FaEye /> : <FaEyeSlash />}
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => onDelete(component.id)}
            title="Delete"
          >
            <FaTrash />
          </Button>
        </ButtonGroup>
      </div>

      {/* Collapsible Edit Form */}
      <Collapse in={isOpen}>
        <div className="mt-3 pt-3 border-top">
          {componentType && (
            <>
              <ComponentFormGenerator
                schema={componentType.schema}
                data={formData}
                onChange={setFormData}
              />
              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <FaSave className="me-1" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Collapse>
    </ListGroup.Item>
  );
}
