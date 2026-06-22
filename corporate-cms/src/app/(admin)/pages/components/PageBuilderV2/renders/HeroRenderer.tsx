/**
 * Hero Component - Canvas Renderer
 * 
 * Renders the Hero component in the Page Builder canvas.
 * This is a pure display component - no editing logic.
 */

'use client';

import React from 'react';
import { HeroSettings } from '../types';

interface HeroRendererProps {
  settings: HeroSettings;
  isSelected: boolean;
}

export const HeroRenderer: React.FC<HeroRendererProps> = ({ settings, isSelected }) => {
  const {
    title,
    subtitle,
    backgroundImage,
    alignment,
    buttonText,
    buttonLink,
    showButton,
  } = settings;

  // Alignment classes
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div
      className={`relative min-h-[300px] flex flex-col justify-center p-8 rounded-lg overflow-hidden ${
        isSelected ? 'ring-2 ring-brand-500' : ''
      }`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className={`relative z-10 flex flex-col ${alignmentClasses[alignment]} max-w-3xl ${
        alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''
      }`}>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title || 'Hero Title'}
        </h1>
        <p className="text-lg text-white/90 mb-6">
          {subtitle || 'Hero subtitle goes here'}
        </p>
        {showButton && buttonText && (
          <button
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};
