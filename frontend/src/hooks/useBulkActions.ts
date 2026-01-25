import { useState, useCallback } from 'react';

/**
 * Custom hook for managing bulk selection in tables
 * Handles select all, select individual, and clearing selections
 * 
 * @returns Bulk actions state and methods
 * 
 * @example
 * const { selectedIds, toggleSelect, toggleSelectAll, clearSelection, isSelected } = useBulkActions();
 */
export function useBulkActions<T = string>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  /**
   * Toggle selection for a single item
   */
  const toggleSelect = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  /**
   * Toggle select all items
   * @param allIds - Array of all item IDs on current page
   */
  const toggleSelectAll = useCallback((allIds: T[]) => {
    setSelectedIds((prev) => {
      // If all are selected, deselect all
      if (allIds.every((id) => prev.has(id))) {
        return new Set();
      }
      // Otherwise, select all
      return new Set(allIds);
    });
  }, []);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Check if an item is selected
   */
  const isSelected = useCallback(
    (id: T) => selectedIds.has(id),
    [selectedIds]
  );

  /**
   * Check if all items are selected
   */
  const isAllSelected = useCallback(
    (allIds: T[]) => allIds.length > 0 && allIds.every((id) => selectedIds.has(id)),
    [selectedIds]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };
}
