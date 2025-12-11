'use client';

import { Setting, SettingValue } from '@/lib/api/settings.api';
import { useState } from 'react';
import ImageUploader from './ImageUploader';
import JsonEditor from './JsonEditor';

interface SettingInputProps {
  setting: Setting;
  value: SettingValue;
  onChange: (value: SettingValue) => void;
}

export default function SettingInput({ setting, value, onChange }: SettingInputProps) {
  const [jsonError, setJsonError] = useState<string>('');

  const renderInput = () => {
    switch (setting.type) {
      case 'STRING':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            placeholder={setting.description}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
            placeholder={setting.description}
          />
        );

      case 'BOOLEAN':
        return (
          <div className="flex items-center mt-2">
            <button
              type="button"
              onClick={() => onChange(!value)}
              className={`
                ${value ? 'bg-blue-600' : 'bg-gray-200'}
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              <span
                className={`
                  ${value ? 'translate-x-5' : 'translate-x-0'}
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                `}
              />
            </button>
            <span className="ml-3 text-sm text-gray-900">
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );

      case 'JSON':
        return (
          <JsonEditor
            value={value as Record<string, unknown> | unknown[]}
            onChange={(newValue: Record<string, unknown> | unknown[]) => {
              setJsonError('');
              onChange(newValue);
            }}
            onError={(error: string) => setJsonError(error)}
          />
        );

      case 'IMAGE':
        return (
          <ImageUploader
            value={value as string}
            onChange={onChange}
            label={setting.label}
          />
        );

      case 'SELECT':
        return (
          <select
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
          >
            {setting.options?.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2 border"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {setting.label}
          {setting.isSystem && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              System
            </span>
          )}
        </label>
        {setting.isPublic && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            Public
          </span>
        )}
      </div>

      {setting.description && (
        <p className="text-sm text-gray-500">{setting.description}</p>
      )}

      {renderInput()}

      {jsonError && (
        <p className="text-sm text-red-600 mt-1">{jsonError}</p>
      )}

      <p className="text-xs text-gray-400 mt-1">
        Key: <code className="bg-gray-100 px-1 py-0.5 rounded">{setting.key}</code>
      </p>
    </div>
  );
}
