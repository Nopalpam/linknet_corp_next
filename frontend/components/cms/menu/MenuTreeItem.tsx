'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Menu, MenuLinkType, MenuStatus } from '@/types/menu.types';
import { 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiLink, 
  FiExternalLink, 
  FiChevronDown,
  FiMenu 
} from 'react-icons/fi';
import { useState } from 'react';

interface MenuTreeItemProps {
  menu: Menu;
  level: number;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  selected: boolean;
  onToggleSelection: (id: string) => void;
}

export function MenuTreeItem({
  menu,
  level,
  onEdit,
  onDelete,
  onToggleStatus,
  selected,
  onToggleSelection,
}: MenuTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: menu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeIcon = () => {
    switch (menu.type) {
      case MenuLinkType.INTERNAL:
        return <FiLink className="text-blue-500" />;
      case MenuLinkType.EXTERNAL:
        return <FiExternalLink className="text-green-500" />;
      case MenuLinkType.DROPDOWN:
        return <FiChevronDown className="text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    if (menu.status === MenuStatus.ACTIVE) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  const getTitle = () => {
    if (typeof menu.title === 'string') return menu.title;
    return menu.title.en || menu.title.id || Object.values(menu.title)[0] || 'Untitled';
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={{ ...style, marginLeft: `${level * 40}px` }}
        className={`
          flex items-center gap-3 p-4 rounded-lg border
          ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
          hover:shadow-md transition-shadow
        `}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <FiMenu size={20} />
        </div>

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelection(menu.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />

        {/* Expand/Collapse for children */}
        {menu.children && menu.children.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiChevronDown
              className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
              size={18}
            />
          </button>
        )}

        {/* Type Icon */}
        <div className="flex-shrink-0">
          {getTypeIcon()}
        </div>

        {/* Icon */}
        {menu.icon && (
          <div className="flex-shrink-0 text-gray-400">
            <span>{menu.icon}</span>
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {getTitle()}
            </span>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span className="truncate">{menu.slug}</span>
            {menu.url && (
              <>
                <span>•</span>
                <span className="truncate">{menu.url}</span>
              </>
            )}
            {menu.page && (
              <>
                <span>•</span>
                <span className="truncate">Page: {menu.page.title}</span>
              </>
            )}
          </div>
        </div>

        {/* Order */}
        <div className="flex-shrink-0 text-sm text-gray-500">
          #{menu.order}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggleStatus(menu.id)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            title={menu.status === MenuStatus.ACTIVE ? 'Deactivate' : 'Activate'}
          >
            {menu.status === MenuStatus.ACTIVE ? (
              <FiEye size={18} />
            ) : (
              <FiEyeOff size={18} />
            )}
          </button>

          <button
            onClick={() => onEdit(menu)}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
            title="Edit"
          >
            <FiEdit2 size={18} />
          </button>

          <button
            onClick={() => onDelete(menu.id)}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && menu.children && menu.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {menu.children.map((child) => (
            <MenuTreeItem
              key={child.id}
              menu={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              selected={selected}
              onToggleSelection={onToggleSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
