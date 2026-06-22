'use client';

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MenuItem } from '@/services/menu.service';
import MenuTreeItem from './MenuTreeItem';

interface MenuTreeProps {
  menus: MenuItem[];
  onEdit: (menu: MenuItem) => void;
  onDelete: (menu: MenuItem) => void;
  onToggleStatus: (menu: MenuItem) => void;
  onOrderChange: (menus: MenuItem[]) => void;
}

export default function MenuTree({
  menus,
  onEdit,
  onDelete,
  onToggleStatus,
  onOrderChange,
}: MenuTreeProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [items, setItems] = useState<MenuItem[]>(menus);

  // Update items when menus prop changes
  React.useEffect(() => {
    setItems(menus);
  }, [menus]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const flattenItems = (items: MenuItem[]): MenuItem[] => {
      return items.reduce((acc: MenuItem[], item) => {
        acc.push(item);
        if (item.children && item.children.length > 0) {
          acc.push(...flattenItems(item.children));
        }
        return acc;
      }, []);
    };

    const findItem = (items: MenuItem[], id: number): MenuItem | undefined => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return undefined;
    };

    const removeItem = (items: MenuItem[], id: number): MenuItem[] => {
      return items.filter(item => {
        if (item.id === id) return false;
        if (item.children) {
          item.children = removeItem(item.children, id);
        }
        return true;
      });
    };

    const insertItem = (items: MenuItem[], item: MenuItem, overId: number, position: 'before' | 'after'): MenuItem[] => {
      return items.reduce((acc: MenuItem[], current) => {
        if (current.id === overId) {
          if (position === 'before') {
            acc.push(item, current);
          } else {
            acc.push(current, item);
          }
        } else {
          if (current.children && current.children.length > 0) {
            current.children = insertItem(current.children, item, overId, position);
          }
          acc.push(current);
        }
        return acc;
      }, []);
    };

    const activeItem = findItem(items, active.id as number);
    const overItem = findItem(items, over.id as number);

    if (!activeItem || !overItem) return;

    // Prevent dropping parent into its own children
    const isDescendant = (parent: MenuItem, childId: number): boolean => {
      if (parent.id === childId) return true;
      if (parent.children) {
        return parent.children.some(child => isDescendant(child, childId));
      }
      return false;
    };

    if (isDescendant(activeItem, overItem.id)) {
      return;
    }

    // Simple reorder within same level
    const allFlat = flattenItems(items);
    const oldIndex = allFlat.findIndex(item => item.id === active.id);
    const newIndex = allFlat.findIndex(item => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      let updatedItems = [...items];
      
      // Remove from old position
      updatedItems = removeItem(updatedItems, activeItem.id);
      
      // Insert at new position
      updatedItems = insertItem(updatedItems, activeItem, overItem.id, newIndex > oldIndex ? 'after' : 'before');
      
      setItems(updatedItems);
      onOrderChange(updatedItems);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const getItemIds = (items: MenuItem[]): number[] => {
    return items.reduce((acc: number[], item) => {
      acc.push(item.id);
      if (item.children && item.children.length > 0) {
        acc.push(...getItemIds(item.children));
      }
      return acc;
    }, []);
  };

  const findActiveItem = (items: MenuItem[], id: number): MenuItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findActiveItem(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={getItemIds(items)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {items.map((menu) => (
            <MenuTreeItem
              key={menu.id}
              menu={menu}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              depth={0}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeId ? (
          <div className="bg-background border rounded-lg p-3 shadow-lg opacity-50">
            {findActiveItem(items, activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
