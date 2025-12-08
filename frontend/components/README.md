# Components

This directory contains React components for the frontend.

## Component Structure

### Example: Button Component
`components/ui/Button.tsx`

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Example: Card Component
```tsx
import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
```

## Folder Organization
```
components/
├── ui/           # Basic UI components (Button, Input, Card, etc.)
├── layout/       # Layout components (Header, Footer, Sidebar)
├── forms/        # Form-specific components
└── shared/       # Shared/common components
```
