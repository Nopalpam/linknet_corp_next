'use client';

import React, { useCallback, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';

function moveArrayItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function SortableListEditor<T>({
  label,
  items,
  onChange,
  createItem,
  getItemLabel,
  renderItem,
  addLabel = 'Add Item',
  emptyLabel = 'No items yet',
  collapsible = false,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  getItemLabel?: (item: T, index: number) => React.ReactNode;
  renderItem: (item: T, index: number, updateItem: (item: T) => void) => React.ReactNode;
  addLabel?: string;
  emptyLabel?: string;
  collapsible?: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const dragDepth = useRef(0);

  const remapExpandedIndex = (from: number, to: number) => {
    setExpandedIndex((current) => {
      if (current === null || from === to) return current;
      if (current === from) return to;
      if (from < to && current > from && current <= to) return current - 1;
      if (to < from && current >= to && current < from) return current + 1;
      return current;
    });
  };

  const updateItem = (index: number, item: T) => {
    onChange(items.map((entry, entryIndex) => (entryIndex === index ? item : entry)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, entryIndex) => entryIndex !== index));
    setExpandedIndex((current) => {
      if (current === null) return null;
      if (current === index) return null;
      return current > index ? current - 1 : current;
    });
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    onChange(moveArrayItem(items, index, targetIndex));
    remapExpandedIndex(index, targetIndex);
  };

  const addItem = () => {
    onChange([...items, createItem()]);
    if (collapsible) setExpandedIndex(items.length);
  };

  const handleDragStart = useCallback((event: React.DragEvent, index: number) => {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragDepth.current = 0;
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent, index: number) => {
    event.preventDefault();
    dragDepth.current += 1;
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      setDragOverIndex(null);
      dragDepth.current = 0;
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent, targetIndex: number) => {
    event.preventDefault();
    const sourceIndex = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    dragDepth.current = 0;

    if (sourceIndex === null) return;
    onChange(moveArrayItem(items, sourceIndex, targetIndex));
    remapExpandedIndex(sourceIndex, targetIndex);
  }, [dragIndex, items, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {emptyLabel}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            onDragEnd={handleDragEnd}
            onDragEnter={(event) => handleDragEnter(event, index)}
            onDragLeave={handleDragLeave}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => handleDrop(event, index)}
            className={`rounded-lg border bg-white p-3 transition-colors dark:bg-gray-900 ${
              dragOverIndex === index && dragIndex !== index
                ? 'border-brand-400 bg-brand-50/40 dark:bg-brand-900/20'
                : 'border-gray-200 dark:border-gray-700'
            } ${dragIndex === index ? 'opacity-60' : ''}`}
          >
            <div className={`flex items-center gap-2 ${!collapsible || expandedIndex === index ? 'mb-3' : ''}`}>
              <button
                type="button"
                className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing dark:hover:bg-gray-800"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              {collapsible ? (
                <button
                  type="button"
                  onClick={() => setExpandedIndex((current) => current === index ? null : index)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-expanded={expandedIndex === index}
                >
                  {expandedIndex === index ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{getItemLabel ? getItemLabel(item, index) : `Item ${index + 1}`}</span>
                </button>
              ) : (
                <div className="min-w-0 flex-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {getItemLabel ? getItemLabel(item, index) : `Item ${index + 1}`}
                </div>
              )}
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-35 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-35 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded p-1 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {(!collapsible || expandedIndex === index) && renderItem(item, index, (nextItem) => updateItem(index, nextItem))}
          </div>
        ))}
      </div>
    </div>
  );
}
