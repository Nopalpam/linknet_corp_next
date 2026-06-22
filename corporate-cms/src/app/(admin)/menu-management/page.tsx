'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { menuService, MenuItem, MenuPosition } from '@/services/menu.service';
import MenuTree from './components/MenuTree';
import MenuFormModal from './components/MenuFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

export default function MenuManagementPage() {
  const { toast } = useToast();
  
  // State management
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [headerMenus, setHeaderMenus] = useState<MenuItem[]>([]);
  const [footerMenus, setFooterMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState<MenuPosition | 'ALL'>('ALL');
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [menuToDelete, setMenuToDelete] = useState<MenuItem | null>(null);

  // Fetch menus
  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const position = filterPosition === 'ALL' ? undefined : filterPosition;
      const response = await menuService.getAllMenus(position);
      const allMenus = response.data;
      
      setMenus(allMenus);
      
      // Separate by position
      const headers = allMenus.filter(m => m.position === 'HEADER' || m.position === 'BOTH');
      const footers = allMenus.filter(m => m.position === 'FOOTER' || m.position === 'BOTH');
      
      setHeaderMenus(headers);
      setFooterMenus(footers);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch menus',
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPosition]); // toast excluded to prevent infinite loop

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Apply search filter to both header and footer menus
  const [filteredHeaderMenus, setFilteredHeaderMenus] = useState<MenuItem[]>([]);
  const [filteredFooterMenus, setFilteredFooterMenus] = useState<MenuItem[]>([]);

  // Search filter
  useEffect(() => {
    const filterMenus = (items: MenuItem[]): MenuItem[] => {
      if (!searchQuery.trim()) {
        return items;
      }

      return items.reduce((acc: MenuItem[], item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const filteredChildren = item.children ? filterMenus(item.children) : [];
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children,
          });
        }
        
        return acc;
      }, []);
    };

    setFilteredHeaderMenus(filterMenus(headerMenus));
    setFilteredFooterMenus(filterMenus(footerMenus));
  }, [searchQuery, headerMenus, footerMenus]);

  // Handlers
  const handleCreate = () => {
    setSelectedMenu(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (menu: MenuItem) => {
    setMenuToDelete(menu);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!menuToDelete) return;

    try {
      await menuService.deleteMenu(menuToDelete.id);
      toast({
        title: 'Success',
        description: 'Menu deleted successfully',
      });
      fetchMenus();
      setIsDeleteModalOpen(false);
      setMenuToDelete(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete menu',
      });
    }
  };

  const handleToggleStatus = async (menu: MenuItem) => {
    try {
      await menuService.toggleMenuStatus(menu.id);
      toast({
        title: 'Success',
        description: `Menu ${menu.isActive ? 'deactivated' : 'activated'} successfully`,
      });
      fetchMenus();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to toggle menu status',
      });
    }
  };

  const handleFormSuccess = () => {
    fetchMenus();
    setIsFormModalOpen(false);
    setSelectedMenu(null);
  };

  const handleOrderChange = async (updatedMenus: MenuItem[], position: 'HEADER' | 'FOOTER') => {
    try {
      // Extract order updates from the tree
      const updates = extractOrderUpdates(updatedMenus);
      await menuService.updateMenuOrder(updates);
      
      toast({
        title: 'Success',
        description: 'Menu order updated successfully',
      });
      
      // Update local state immediately for smooth UX
      if (position === 'HEADER') {
        setHeaderMenus(updatedMenus);
        setFilteredHeaderMenus(updatedMenus);
      } else {
        setFooterMenus(updatedMenus);
        setFilteredFooterMenus(updatedMenus);
      }
      
      // Update main menus array
      const otherMenus = position === 'HEADER' ? footerMenus : headerMenus;
      setMenus([...updatedMenus, ...otherMenus]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update menu order',
      });
      // Revert to original order on error
      fetchMenus();
    }
  };

  // Helper function to extract order updates from tree
  const extractOrderUpdates = (items: MenuItem[], parentId: number | null = null): any[] => {
    let updates: any[] = [];
    items.forEach((item, index) => {
      updates.push({
        id: item.id,
        order: index,
        parentId: parentId,
      });
      if (item.children && item.children.length > 0) {
        updates = [...updates, ...extractOrderUpdates(item.children, item.id)];
      }
    });
    return updates;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage website navigation menus with drag & drop ordering
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search menus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPosition === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterPosition('ALL')}
              >
                All
              </Button>
              <Button
                variant={filterPosition === 'HEADER' ? 'default' : 'outline'}
                onClick={() => setFilterPosition('HEADER')}
              >
                Header
              </Button>
              <Button
                variant={filterPosition === 'FOOTER' ? 'default' : 'outline'}
                onClick={() => setFilterPosition('FOOTER')}
              >
                Footer
              </Button>
              <Button
                variant={filterPosition === 'BOTH' ? 'default' : 'outline'}
                onClick={() => setFilterPosition('BOTH')}
              >
                Both
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Trees - Separated by Position */}
      {filterPosition === 'ALL' || filterPosition === 'HEADER' ? (
        <Card>
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">Header Menu</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredHeaderMenus.length} items)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredHeaderMenus.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No header menus found matching your search' : 'No header menus found. Create your first menu!'}
              </div>
            ) : (
              <MenuTree
                menus={filteredHeaderMenus}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                onOrderChange={(menus) => handleOrderChange(menus, 'HEADER')}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {filterPosition === 'ALL' || filterPosition === 'FOOTER' ? (
        <Card>
          <CardHeader className="bg-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <span className="text-secondary-foreground">Footer Menu</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredFooterMenus.length} items)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFooterMenus.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No footer menus found matching your search' : 'No footer menus found. Create your first menu!'}
              </div>
            ) : (
              <MenuTree
                menus={filteredFooterMenus}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onToggleStatus={handleToggleStatus}
                onOrderChange={(menus) => handleOrderChange(menus, 'FOOTER')}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Modals */}
      <MenuFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedMenu(null);
        }}
        onSuccess={handleFormSuccess}
        menu={selectedMenu}
        allMenus={menus}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMenuToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu"
        description={
          menuToDelete
            ? `Are you sure you want to delete "${menuToDelete.title}"? ${
                menuToDelete._count?.children 
                  ? `This menu has ${menuToDelete._count.children} sub-menu(s) that will also be deleted.`
                  : ''
              }`
            : ''
        }
      />
    </div>
  );
}
