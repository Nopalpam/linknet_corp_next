/**
 * Hero Component - Settings Editor
 * 
 * Provides the editing UI for Hero component settings.
 * Changes are propagated via onChange callback - no internal state duplication.
 */

'use client';

import React from 'react';
import { HeroSettings } from '../types';
import { CtaListModule } from './CtaListModule';
import { SortableListEditor } from './SortableListEditor';
import MediaPickerButton from '@/components/media/MediaPickerButton';

interface HeroEditorProps {
  settings: HeroSettings;
  onChange: (settings: HeroSettings) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ settings, onChange }) => {
  // Helper to update a single field
  const updateField = <K extends keyof HeroSettings>(
    field: K,
    value: HeroSettings[K]
  ) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Enter hero title"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Subtitle
        </label>
        <textarea
          value={settings.subtitle}
          onChange={(e) => updateField('subtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="Enter hero subtitle"
        />
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Background Image URL
        </label>
        <input
          type="url"
          value={settings.backgroundImage}
          onChange={(e) => updateField('backgroundImage', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          placeholder="https://example.com/image.jpg"
        />
        <div className="mt-2">
          <MediaPickerButton
            kind="image"
            title="Choose Hero Background"
            onSelect={(url) => updateField('backgroundImage', url)}
          />
        </div>
        {settings.backgroundImage && (
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.backgroundImage}
              alt="Background preview"
              className="w-full h-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text Alignment
        </label>
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => updateField('alignment', align)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                settings.alignment === align
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Show Button Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.showButton ?? true}
            onChange={(e) => updateField('showButton', e.target.checked)}
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Call-to-Action Button
          </span>
        </label>
      </div>

      {/* Button Settings (conditional) */}
      {settings.showButton && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={settings.buttonText || ''}
              onChange={(e) => updateField('buttonText', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Get Started"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Button Link
            </label>
            <input
              type="text"
              value={settings.buttonLink || ''}
              onChange={(e) => updateField('buttonLink', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="/contact or https://..."
            />
          </div>
        </div>
      )}

      <SortableListEditor
        label="CTA List"
        items={Array.isArray(settings.ctaList) ? settings.ctaList : []}
        onChange={(nextItems) => updateField('ctaList', nextItems)}
        createItem={() => ({
          label: '',
          href: '',
          target: '_self',
          variant: 'primary',
          size: 'lg',
          link_type: 'url',
        })}
        addLabel="Add CTA"
        emptyLabel="No CTA list items yet"
        getItemLabel={(item, index) => item.label?.en || item.label || item.text?.en || item.text || `CTA ${index + 1}`}
        renderItem={(item, _index, updateItem) => (
          <CtaListModule value={item} onChange={updateItem} />
        )}
      />
    </div>
  );
};
