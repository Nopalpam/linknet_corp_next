'use client';

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Menu, MenuOrderUpdate } from '@/types/menu.types';
import { menuApi } from '@/lib/api/menu.api';
import { toast } from 'react-hot-toast';
import { MenuTreeItem } from '@/components/cms/menu/MenuTreeItem';
import { MenuFormModal } from '@/components/cms/menu/MenuFormModal';
import { MenuPreview } from '@/components/cms/menu/MenuPreview';
import { FiPlus, FiRefreshCw } from 'react-icons/fi';

export default function MenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const data = await menuApi.getMenus();
      setMenus(data);
    } catch (error) {
      toast.error('Failed to load menus');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const flattenMenus = (menus: Menu[]): Menu[] => {
    const flat: Menu[] = [];
    const flatten = (items: Menu[]) => {
      items.forEach((item) => {
        flat.push(item);
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(menus);
    return flat;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    try {
      const flatMenus = flattenMenus(menus);
      const oldIndex = flatMenus.findIndex((m) => m.id === active.id);
      const newIndex = flatMenus.findIndex((m) => m.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const movedMenu = flatMenus[oldIndex];
      const targetMenu = flatMenus[newIndex];

      // Update order
      // Simplified: just update order positions
      const updates: MenuOrderUpdate[] = flatMenus.map((menu, index) => ({
        id: menu.id,
        order: index + 1,
        parentId: menu.parentId,
      }));

      await menuApi.updateMenuOrder(updates);
      await fetchMenus();
      toast.success('Menu order updated');
    } catch (error) {
      toast.error('Failed to update menu order');
      console.error(error);
    }
  };

  const handleCreate = () => {
    setEditingMenu(null);
    setIsModalOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu? All sub-menus will also be deleted.')) {
      return;
    }

    try {
      await menuApi.deleteMenu(id);
      await fetchMenus();
      toast.success('Menu deleted successfully');
    } catch (error) {
      toast.error('Failed to delete menu');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMenus.length === 0) {
      toast.error('No menus selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedMenus.length} menu(s)?`)) {
      return;
    }

    try {
      await menuApi.deleteMultipleMenus(selectedMenus);
      setSelectedMenus([]);
      await fetchMenus();
      toast.success(`${selectedMenus.length} menu(s) deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete menus');
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await menuApi.toggleMenuStatus(id);
      await fetchMenus();
      toast.success('Menu status updated');
    } catch (error) {
      toast.error('Failed to update menu status');
      console.error(error);
    }
  };

  const handleFormSuccess = async () => {
    setIsModalOpen(false);
    setEditingMenu(null);
    await fetchMenus();
  };

  const toggleSelection = (id: string) => {
    setSelectedMenus((prev) =>
      prev.includes(id) ? prev.filter((menuId) => menuId !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-600 mt-2">Manage your website menus with drag-and-drop ordering</p>
        </div>
        <div className="flex gap-3">
          {selectedMenus.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              Delete Selected ({selectedMenus.length})
            </button>
          )}
          <button
            onClick={fetchMenus}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <FiRefreshCw />
            Refresh
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus />
            Add Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Menu Structure</h2>
          {menus.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No menus yet</p>
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <FiPlus />
                Create First Menu
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={flattenMenus(menus).map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {menus.map((menu) => (
                    <MenuTreeItem
                      key={menu.id}
                      menu={menu}
                      level={0}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                      selected={selectedMenus.includes(menu.id)}
                      onToggleSelection={toggleSelection}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Menu Preview */}
        <div className="lg:col-span-1">
          <MenuPreview />
        </div>
      </div>

      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMenu(null);
        }}
        menu={editingMenu}
        menus={menus}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
