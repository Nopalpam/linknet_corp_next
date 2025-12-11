'use client';

import { useState, useEffect } from 'react';
import { Menu, MenuFormData, MenuLinkType, MenuTarget, MenuStatus } from '@/types/menu.types';
import { menuApi } from '@/lib/api/menu.api';
import { toast } from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu | null;
  menus: Menu[];
  onSuccess: () => void;
}

export function MenuFormModal({ isOpen, onClose, menu, menus, onSuccess }: MenuFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MenuFormData>({
    title: { en: '', id: '' },
    slug: '',
    url: '',
    type: MenuLinkType.INTERNAL,
    pageId: '',
    target: MenuTarget.SELF,
    icon: '',
    parentId: null,
    status: MenuStatus.ACTIVE,
  });

  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title,
        slug: menu.slug,
        url: menu.url || '',
        type: menu.type,
        pageId: menu.pageId || '',
        target: menu.target,
        icon: menu.icon || '',
        parentId: menu.parentId,
        status: menu.status,
      });
    } else {
      setFormData({
        title: { en: '', id: '' },
        slug: '',
        url: '',
        type: MenuLinkType.INTERNAL,
        pageId: '',
        target: MenuTarget.SELF,
        icon: '',
        parentId: null,
        status: MenuStatus.ACTIVE,
      });
    }
  }, [menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.en && !formData.title.id) {
      toast.error('Title is required in at least one language');
      return;
    }

    if (formData.type === MenuLinkType.INTERNAL && !formData.pageId) {
      toast.error('Page is required for internal links');
      return;
    }

    if (formData.type === MenuLinkType.EXTERNAL && !formData.url) {
      toast.error('URL is required for external links');
      return;
    }

    try {
      setLoading(true);

      if (menu) {
        await menuApi.updateMenu(menu.id, formData);
        toast.success('Menu updated successfully');
      } else {
        await menuApi.createMenu(formData);
        toast.success('Menu created successfully');
      }

      onSuccess();
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'An error occurred';
      toast.error(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (lang: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: value,
      },
    }));
  };

  const flattenMenus = (menus: Menu[], exclude?: string): Menu[] => {
    const flat: Menu[] = [];
    const flatten = (items: Menu[]) => {
      items.forEach((item) => {
        if (item.id !== exclude) {
          flat.push(item);
          if (item.children && item.children.length > 0) {
            flatten(item.children);
          }
        }
      });
    };
    flatten(menus);
    return flat;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {menu ? 'Edit Menu' : 'Create Menu'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4">
            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MenuLinkType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={MenuLinkType.INTERNAL}>Internal Page</option>
                  <option value={MenuLinkType.EXTERNAL}>External Link</option>
                  <option value={MenuLinkType.DROPDOWN}>Dropdown (No Link)</option>
                </select>
              </div>

              {/* Title (Multi-language) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.title.en || ''}
                    onChange={(e) => handleTitleChange('en', e.target.value)}
                    placeholder="English"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={formData.title.id || ''}
                    onChange={(e) => handleTitleChange('id', e.target.value)}
                    placeholder="Indonesian"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Conditional: Internal Page */}
              {formData.type === MenuLinkType.INTERNAL && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page *
                  </label>
                  <select
                    value={formData.pageId}
                    onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a page</option>
                    {/* TODO: Fetch and display pages */}
                    <option value="page-1">Home</option>
                    <option value="page-2">About Us</option>
                    <option value="page-3">Contact</option>
                  </select>
                </div>
              )}

              {/* Conditional: External URL */}
              {formData.type === MenuLinkType.EXTERNAL && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Target */}
              {formData.type !== MenuLinkType.DROPDOWN && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target
                  </label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value as MenuTarget })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={MenuTarget.SELF}>Same Window</option>
                    <option value={MenuTarget.BLANK}>New Tab</option>
                  </select>
                </div>
              )}

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Optional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🏠 or icon name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Menu
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Root Level)</option>
                  {flattenMenus(menus, menu?.id).map((m) => (
                    <option key={m.id} value={m.id}>
                      {typeof m.title === 'string' ? m.title : m.title.en || m.title.id || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MenuStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={MenuStatus.ACTIVE}>Active</option>
                  <option value={MenuStatus.INACTIVE}>Inactive</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : menu ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
