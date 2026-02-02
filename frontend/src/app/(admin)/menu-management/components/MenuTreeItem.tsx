'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  ChevronRight,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Link as LinkIcon,
  Menu as MenuIcon,
  Layers,
} from 'lucide-react';
import { MenuItem } from '@/services/menu.service';
import { cn } from '@/lib/utils';

interface MenuTreeItemProps {
  menu: MenuItem;
  onEdit: (menu: MenuItem) => void;
  onDelete: (menu: MenuItem) => void;
  onToggleStatus: (menu: MenuItem) => void;
  depth: number;
}

export default function MenuTreeItem({
  menu,
  onEdit,
  onDelete,
  onToggleStatus,
  depth,
}: MenuTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = menu.children && menu.children.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeIcon = () => {
    switch (menu.type) {
      case 'LINK':
        return <LinkIcon className="h-4 w-4" />;
      case 'DROPDOWN':
        return <MenuIcon className="h-4 w-4" />;
      case 'MEGA':
        return <Layers className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  const getPositionBadgeColor = () => {
    switch (menu.position) {
      case 'HEADER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'FOOTER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'BOTH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return '';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={cn('group', depth > 0 && 'ml-8')}>
      <div
        className={cn(
          'flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
          !menu.isActive && 'opacity-60'
        )}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Expand/Collapse */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        ) : (
          <div className="w-6" />
        )}

        {/* Type Icon */}
        <div className="text-muted-foreground">
          {getTypeIcon()}
        </div>

        {/* Menu Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate">{menu.title}</span>
            
            {menu.badge && (
              <Badge variant="secondary" className="text-xs">
                {menu.badge}
              </Badge>
            )}
            
            <Badge className={cn('text-xs', getPositionBadgeColor())}>
              {menu.position}
            </Badge>

            {menu.openNewTab && (
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          
          {menu.url && (
            <div className="text-sm text-muted-foreground truncate">
              {menu.url}
            </div>
          )}
          
          {menu.description && (
            <div className="text-xs text-muted-foreground truncate mt-1">
              {menu.description}
            </div>
          )}
        </div>

        {/* Order Badge */}
        <Badge variant="outline" className="text-xs">
          #{menu.order}
        </Badge>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleStatus(menu)}
            title={menu.isActive ? 'Deactivate' : 'Activate'}
          >
            {menu.isActive ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(menu)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(menu)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {menu.children!.map((child) => (
            <MenuTreeItem
              key={child.id}
              menu={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
