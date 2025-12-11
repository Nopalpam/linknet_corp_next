'use client';

import { useState, useEffect } from 'react';

interface JsonEditorProps {
  value: Record<string, unknown> | unknown[];
  onChange: (value: Record<string, unknown> | unknown[]) => void;
  onError: (error: string) => void;
}

export default function JsonEditor({ value, onChange, onError }: JsonEditorProps) {
  const [jsonString, setJsonString] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      setJsonString(JSON.stringify(value, null, 2));
      setIsValid(true);
    } catch (error) {
      console.error('Error stringifying JSON:', error);
      setJsonString('{}');
      setIsValid(false);
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonString(newValue);

    try {
      const parsed = JSON.parse(newValue);
      setIsValid(true);
      onError('');
      onChange(parsed);
    } catch (error) {
      setIsValid(false);
      onError('Invalid JSON format');
    }
  };

  return (
    <div className="mt-2">
      <div className="relative">
        <textarea
          value={jsonString}
          onChange={(e) => handleChange(e.target.value)}
          className={`
            mt-1 block w-full rounded-md shadow-sm sm:text-sm px-4 py-2 font-mono text-sm border
            ${isValid ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' : 'border-red-300 focus:border-red-500 focus:ring-red-500'}
          `}
          rows={8}
          placeholder='{"key": "value"}'
        />
        {!isValid && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
              Invalid JSON
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Enter valid JSON format. Use double quotes for strings.
      </p>
    </div>
  );
}
