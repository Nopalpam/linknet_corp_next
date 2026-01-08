'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Card,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Badge,
  Dropdown,
} from 'react-bootstrap';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  FaPlus,
  FaGripVertical,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import {
  getPageComponents,
  getComponentTypes,
  createComponent,
  deleteComponent,
  reorderComponents,
  toggleComponentVisibility,
} from '@/lib/api/components';
import { PageComponent, ComponentType } from '@/types/component';
import ComponentItem from './ComponentItem';
import AddComponentModal from './AddComponentModal';

interface ComponentBuilderProps {
  pageId: string;
}

export default function ComponentBuilder({ pageId }: ComponentBuilderProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);

  // Fetch components
  const {
    data: componentsData,
    error: componentsError,
    isLoading: componentsLoading,
    mutate: mutateComponents,
  } = useSWR(`/cms/pages/${pageId}/components`, () =>
    getPageComponents(pageId, true)
  );

  // Fetch component types
  const { data: typesData } = useSWR('/cms/pages/component-types', () =>
    getComponentTypes()
  );

  const components = componentsData?.data || [];
  const componentTypes = typesData?.data || [];

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = components.findIndex((c: PageComponent) => c.id === active.id);
    const newIndex = components.findIndex((c: PageComponent) => c.id === over.id);

    const reordered = arrayMove(components, oldIndex, newIndex);
    
    // Optimistic update
    mutateComponents(
      { success: true, data: reordered },
      false
    );

    try {
      // Update orders
      await reorderComponents(pageId, {
        components: reordered.map((c, index) => ({ id: c.id, order: index })),
      });
      
      toast.success('Components reordered');
      mutateComponents();
    } catch (error: any) {
      toast.error('Failed to reorder components');
      mutateComponents(); // Revert on error
    }
  };

  // Handle delete
  const handleDelete = async (componentId: string) => {
    if (!confirm('Are you sure you want to delete this component?')) {
      return;
    }

    try {
      await deleteComponent(componentId);
      toast.success('Component deleted');
      mutateComponents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete component');
    }
  };

  // Handle visibility toggle
  const handleToggleVisibility = async (componentId: string) => {
    try {
      await toggleComponentVisibility(componentId);
      toast.success('Visibility toggled');
      mutateComponents();
    } catch (error: any) {
      toast.error('Failed to toggle visibility');
    }
  };

  // Handle add component
  const handleAddComponent = (type: ComponentType) => {
    setSelectedType(type);
    setShowAddModal(true);
  };

  // Handle component created
  const handleComponentCreated = () => {
    mutateComponents();
    setShowAddModal(false);
    setSelectedType(null);
  };

  if (componentsLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Loading components...</p>
        </Card.Body>
      </Card>
    );
  }

  if (componentsError) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger">Failed to load components</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <strong>Page Components</strong>
          <Dropdown>
            <Dropdown.Toggle variant="primary" size="sm">
              <FaPlus className="me-1" /> Add Component
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {componentTypes.map((type: ComponentType) => (
                <Dropdown.Item
                  key={type.type}
                  onClick={() => handleAddComponent(type)}
                >
                  <strong>{type.name}</strong>
                  <br />
                  <small className="text-muted">{type.description}</small>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Card.Header>
        <Card.Body>
          {components.length === 0 ? (
            <Alert variant="info">
              No components yet. Click "Add Component" to get started.
            </Alert>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={components.map((c: PageComponent) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <ListGroup>
                  {components.map((component: PageComponent) => (
                    <ComponentItem
                      key={component.id}
                      component={component}
                      componentTypes={componentTypes}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      onUpdate={mutateComponents}
                    />
                  ))}
                </ListGroup>
              </SortableContext>
            </DndContext>
          )}
        </Card.Body>
      </Card>

      {/* Add Component Modal */}
      {showAddModal && selectedType && (
        <AddComponentModal
          show={showAddModal}
          onHide={() => {
            setShowAddModal(false);
            setSelectedType(null);
          }}
          pageId={pageId}
          componentType={selectedType}
          onSuccess={handleComponentCreated}
        />
      )}
    </>
  );
}
