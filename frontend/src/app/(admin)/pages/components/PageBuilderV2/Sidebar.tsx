/**
 * PAGE BUILDER V2 - Sidebar Component
 * 
 * Displays available components that can be dragged onto the canvas.
 * Components are grouped by category from the registry.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getComponentsByCategory } from './registry';
import { usePageBuilder } from './context';
import { useDraggable } from '@dnd-kit/core';

// =============================================================================
// ICON MAP (FontAwesome-style icon names → inline SVG)
// =============================================================================

function ComponentIcon({ icon }: { icon: string }) {
  // Minimal SVG icons for each FontAwesome name used in registry
  const icons: Record<string, React.ReactNode> = {
    FaAlignLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h14M4 18h8" />,
    FaEdit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    FaImage: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    FaStar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    FaSlidersH: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />,
    FaTh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    FaChartBar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    FaNewspaper: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />,
    FaUsers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    FaBullhorn: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />,
    FaTrophy: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
  };

  const pathData = icons[icon];
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {pathData || <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />}
    </svg>
  );
}

// =============================================================================
// COMPONENT CARD
// =============================================================================

interface ComponentCardProps {
  type: string;
  name: string;
  description: string;
  icon: string;
}

function ComponentCard({ type, name, description, icon }: ComponentCardProps) {
  const { addComponent } = usePageBuilder();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      isNewComponent: true,
      componentType: type,
      label: name,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => addComponent(type)}
      className={`flex flex-col items-center gap-1.5 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-brand-500 hover:shadow-md transition-all group ${
        isDragging ? 'opacity-50 shadow-lg ring-2 ring-brand-500' : ''
      }`}
      title={description}
    >
      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        <ComponentIcon icon={icon} />
      </div>
      <p className="text-xs font-medium text-gray-900 dark:text-white text-center leading-tight line-clamp-2">
        {name}
      </p>
    </div>
  );
}

// =============================================================================
// CATEGORY LABELS & ORDERING
// =============================================================================

const CATEGORY_CONFIG: Record<string, { label: string; order: number }> = {
  basic: { label: 'Basic Components', order: 1 },
  main: { label: 'Data-Driven (DB)', order: 2 },
};

// =============================================================================
// SIDEBAR
// =============================================================================

export function Sidebar() {
  const allComponentsByCategory = getComponentsByCategory();
  const [searchQuery, setSearchQuery] = useState('');

  // ── Component visibility filter ─────────────────────────────────────────
  // Fetches the set of INACTIVE component keys from the backend.
  // Components NOT in the DB default to ACTIVE (backward compatible).
  const [inactiveKeys, setInactiveKeys] = useState<Set<string>>(new Set());
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    fetch(`${API_URL}/api/v1/cms/component-visibility/inactive-keys`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json?.data) setInactiveKeys(new Set(json.data as string[]));
      })
      .catch(() => {
        // Network/auth error — show all components (fail open)
      });
  }, []);

  // Filter registry to only ACTIVE (not in inactiveKeys)
  const componentsByCategory = Object.fromEntries(
    Object.entries(allComponentsByCategory).map(([cat, comps]) => [
      cat,
      comps.filter((c) => !inactiveKeys.has(c.type)),
    ])
  );

  // Sort categories by configured order
  const sortedCategories = Object.entries(componentsByCategory)
    .sort(([a], [b]) => (CATEGORY_CONFIG[a]?.order ?? 99) - (CATEGORY_CONFIG[b]?.order ?? 99));

  // Filter components based on search
  const filteredCategories = sortedCategories
    .map(([category, components]) => {
      if (!searchQuery.trim()) return [category, components] as const;
      const filtered = components.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return [category, filtered] as const;
    })
    .filter(([, components]) => components.length > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Components
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Drag or click to add
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {filteredCategories.map(([category, components]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {CATEGORY_CONFIG[category]?.label || category}
              <span className="ml-1 text-gray-400">({components.length})</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {components.map((comp) => (
                <ComponentCard
                  key={comp.type}
                  type={comp.type}
                  name={comp.name}
                  description={comp.description}
                  icon={comp.icon}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No components match &quot;{searchQuery}&quot;
          </p>
        )}

        {/* Help text */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-0.5">
            <li>• Drag to reorder, click to edit</li>
            <li>• Eye icon to show/hide</li>
            <li>• <strong>Main</strong> = live data from DB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
