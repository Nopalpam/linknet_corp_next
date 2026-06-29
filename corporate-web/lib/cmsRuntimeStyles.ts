import type { CSSProperties } from 'react';

const GRADIENT_DIRECTIONS: Record<string, string> = {
  t: 'top',
  tr: 'top right',
  r: 'right',
  br: 'bottom right',
  b: 'bottom',
  bl: 'bottom left',
  l: 'left',
  tl: 'top left',
};

const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  current: 'currentColor',
  currentcolor: 'currentColor',
  transparent: 'transparent',
  white: '#ffffff',
};

function splitClassName(className = ''): string[] {
  return String(className).split(/\s+/).map((token) => token.trim()).filter(Boolean);
}

function isSafeCssColor(value: string): boolean {
  const trimmed = value.trim();
  if (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed)) return true;
  if (/^var\(--[a-zA-Z0-9_-]+\)$/.test(trimmed)) return true;

  const colorFunction = trimmed.match(/^(rgba?|hsla?)\((.+)\)$/i);
  if (colorFunction) {
    return /^[0-9\s.,%/+.-]+$/.test(colorFunction[2]);
  }

  return Object.prototype.hasOwnProperty.call(NAMED_COLORS, trimmed.toLowerCase());
}

function resolveColorToken(token: string, prefix: 'bg' | 'from' | 'via' | 'to'): string | null {
  const marker = `${prefix}-`;
  if (!token.startsWith(marker)) return null;

  const rawValue = token.slice(marker.length);
  const arbitraryMatch = rawValue.match(/^\[(.+)\]$/);
  const value = arbitraryMatch ? arbitraryMatch[1].trim() : rawValue.toLowerCase();

  if (arbitraryMatch) {
    return isSafeCssColor(value) ? value : null;
  }

  return NAMED_COLORS[value] || null;
}

export function getCmsRuntimeClassStyle(className = ''): {
  className: string;
  hasRuntimeStyle: boolean;
  style: CSSProperties & Record<string, string>;
} {
  const tokens = splitClassName(className).filter((token) => !token.includes(':'));
  const style: CSSProperties & Record<string, string> = {};
  const runtimeClasses: string[] = [];
  const directionToken = tokens.find((token) => token.startsWith('bg-gradient-to-'));
  const fromColor = tokens.map((token) => resolveColorToken(token, 'from')).find(Boolean);
  const viaColor = tokens.map((token) => resolveColorToken(token, 'via')).find(Boolean);
  const toColor = tokens.map((token) => resolveColorToken(token, 'to')).find(Boolean);
  const bgColor = tokens.map((token) => resolveColorToken(token, 'bg')).find(Boolean);

  if (directionToken && (fromColor || toColor)) {
    const directionKey = directionToken.replace('bg-gradient-to-', '');
    const direction = GRADIENT_DIRECTIONS[directionKey] || 'bottom';
    const stops = [fromColor, viaColor, toColor].filter(Boolean);
    style['--cms-runtime-gradient'] = `linear-gradient(to ${direction}, ${stops.join(', ')})`;
    runtimeClasses.push('cms-runtime-gradient');
  } else if (bgColor) {
    style['--cms-runtime-bg-color'] = bgColor;
    runtimeClasses.push('cms-runtime-bg');
  }

  return {
    className: runtimeClasses.join(' '),
    hasRuntimeStyle: runtimeClasses.length > 0,
    style,
  };
}
