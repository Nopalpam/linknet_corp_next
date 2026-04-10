'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { menuService, MenuItem, MenuPosition, MenuType, CreateMenuData } from '@/services/menu.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  menu: MenuItem | null;
  allMenus: MenuItem[];
}

export default function MenuFormModal({
  isOpen,
  onClose,
  onSuccess,
  menu,
  allMenus,
}: MenuFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateMenuData>({
    title: '',
    position: 'HEADER',
    type: 'LINK',
    url: '',
    slug: '',
    parentId: null,
    sectionTitle: null,
    sectionOrder: 0,
    icon: '',
    image: '',
    badge: '',
    description: '',
    cssClass: '',
    order: 0,
    isActive: true,
    openNewTab: false,
    translations: null,
  });

  // Translation state
  const [titleId, setTitleId] = useState('');

  // Reset form when menu changes
  useEffect(() => {
    if (menu) {
      setFormData({
        title: menu.title,
        position: menu.position,
        type: menu.type,
        url: menu.url || '',
        slug: menu.slug || '',
        parentId: menu.parentId,
        sectionTitle: menu.sectionTitle,
        sectionOrder: menu.sectionOrder,
        icon: menu.icon || '',
        image: menu.image || '',
        badge: menu.badge || '',
        description: menu.description || '',
        cssClass: menu.cssClass || '',
        order: menu.order,
        isActive: menu.isActive,
        openNewTab: menu.openNewTab,
        translations: menu.translations,
      });
      const trans = menu.translations as Record<string, string> | null;
      setTitleId(trans?.id || '');
    } else {
      // Reset to default for new menu
      setFormData({
        title: '',
        position: 'HEADER',
        type: 'LINK',
        url: '',
        slug: '',
        parentId: null,
        sectionTitle: null,
        sectionOrder: 0,
        icon: '',
        image: '',
        badge: '',
        description: '',
        cssClass: '',
        order: 0,
        isActive: true,
        openNewTab: false,
        translations: null,
      });
      setTitleId('');
    }
  }, [menu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build translations object: title = English, titleId = Indonesian
      let translations: Record<string, string> | null = null;
      if (formData.title.trim() || titleId.trim()) {
        translations = {};
        if (formData.title.trim()) translations.en = formData.title.trim();
        if (titleId.trim()) translations.id = titleId.trim();
      }

      const submitData = {
        ...formData,
        translations,
        // Convert empty strings to null
        url: formData.url || null,
        slug: formData.slug || null,
        icon: formData.icon || null,
        image: formData.image || null,
        badge: formData.badge || null,
        description: formData.description || null,
        cssClass: formData.cssClass || null,
        sectionTitle: formData.sectionTitle || null,
      };

      if (menu) {
        await menuService.updateMenu(menu.id, submitData);
        toast({
          title: 'Success',
          description: 'Menu updated successfully',
        });
      } else {
        await menuService.createMenu(submitData);
        toast({
          title: 'Success',
          description: 'Menu created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || `Failed to ${menu ? 'update' : 'create'} menu`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Build parent menu options (exclude current menu and its children)
  const getParentOptions = () => {
    if (!menu) return allMenus;

    const excludeIds = new Set<number>();
    const collectIds = (item: MenuItem) => {
      excludeIds.add(item.id);
      item.children?.forEach(collectIds);
    };
    collectIds(menu);

    const filterMenus = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => !excludeIds.has(item.id))
        .map(item => ({
          ...item,
          children: item.children ? filterMenus(item.children) : [],
        }));
    };

    return filterMenus(allMenus);
  };

  const renderParentOptions = (items: MenuItem[], depth = 0): React.ReactNode => {
    const result: React.ReactNode[] = [];
    
    items.forEach(item => {
      result.push(
        <SelectItem key={item.id} value={item.id.toString()}>
          {'—'.repeat(depth)} {item.title}
        </SelectItem>
      );
      
      if (item.children && item.children.length > 0) {
        const childNodes = renderParentOptions(item.children, depth + 1);
        if (Array.isArray(childNodes)) {
          result.push(...childNodes);
        }
      }
    });
    
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {menu ? 'Edit Menu' : 'Create New Menu'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Menu title (English)"
                  />
                </div>

                <div>
                  <Label htmlFor="titleId">
                    Title (ID)
                  </Label>
                  <Input
                    id="titleId"
                    value={titleId}
                    onChange={(e) => setTitleId(e.target.value)}
                    placeholder="Judul menu (Indonesia)"
                  />
                </div>

                <div>
                  <Label htmlFor="position">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value: MenuPosition) => setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HEADER">Header</SelectItem>
                      <SelectItem value="FOOTER">Footer</SelectItem>
                      <SelectItem value="BOTH">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: MenuType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LINK">Link</SelectItem>
                      <SelectItem value="DROPDOWN">Dropdown</SelectItem>
                      <SelectItem value="MEGA">Mega Menu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="/about-us"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="about-us"
                  />
                </div>

                <div>
                  <Label htmlFor="parentId">Parent Menu</Label>
                  <Select
                    value={formData.parentId?.toString() || 'none'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parentId: value === 'none' ? null : parseInt(value) })
                    }
                  >
                    <SelectTrigger id="parentId">
                      <SelectValue placeholder="Select parent menu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {renderParentOptions(getParentOptions())}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>

                <div className="col-span-2 space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                    <Label htmlFor="isActive" className="cursor-pointer font-medium">
                      Active Status
                    </Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                    <Label htmlFor="openNewTab" className="cursor-pointer font-medium">
                      Open in New Tab
                    </Label>
                    <Switch
                      id="openNewTab"
                      checked={formData.openNewTab}
                      onCheckedChange={(checked) => setFormData({ ...formData, openNewTab: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sectionTitle">Section Title</Label>
                  <Input
                    id="sectionTitle"
                    value={formData.sectionTitle || ''}
                    onChange={(e) => setFormData({ ...formData, sectionTitle: e.target.value || null })}
                    placeholder="e.g., Products"
                  />
                </div>

                <div>
                  <Label htmlFor="sectionOrder">Section Order</Label>
                  <Input
                    id="sectionOrder"
                    type="number"
                    value={formData.sectionOrder}
                    onChange={(e) => setFormData({ ...formData, sectionOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="icon-name or URL"
                  />
                </div>

                <div>
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="New, Hot, etc."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="cssClass">CSS Class</Label>
                  <Input
                    id="cssClass"
                    value={formData.cssClass}
                    onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
                    placeholder="custom-class another-class"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {menu ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
