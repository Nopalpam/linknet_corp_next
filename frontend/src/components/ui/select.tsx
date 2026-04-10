import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value: controlledValue, onValueChange, defaultValue, children }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState('');
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, isOpen, setIsOpen, triggerRef, selectedLabel, setSelectedLabel }}>
      <div className="relative" ref={triggerRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectTrigger must be used within Select');
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        onClick={() => context.setIsOpen(!context.isOpen)}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 opacity-50 shrink-0 transition-transform', context.isOpen && 'rotate-180')} />
      </button>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectValueProps {
  placeholder?: string;
}

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error('SelectValue must be used within Select');
  }

  return (
    <span className={cn(!context.value && !context.selectedLabel && 'text-muted-foreground')}>
      {context.selectedLabel || context.value || placeholder || 'Select...'}
    </span>
  );
};

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectContent must be used within Select');
    }

    if (!context.isOpen) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
          'max-h-60 overflow-y-auto',
          className
        )}
        style={{
          top: '100%',
          left: 0,
          right: 0,
        }}
        {...props}
      >
        <div className="p-1">
          {children}
        </div>
      </div>
    );
  }
);
SelectContent.displayName = 'SelectContent';

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onSelect?: () => void;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    if (!context) {
      throw new Error('SelectItem must be used within Select');
    }

    const isSelected = context.value === value;

    // Extract text from children for label display
    const getChildText = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return String(node);
      if (Array.isArray(node)) return node.map(getChildText).join('');
      if (React.isValidElement(node) && node.props.children) {
        return getChildText(node.props.children);
      }
      return '';
    };

    // Update selected label when this item matches the current value
    React.useEffect(() => {
      if (isSelected) {
        const text = getChildText(children);
        if (text) context.setSelectedLabel(text.trim());
      }
    }, [isSelected]);

    const handleClick = () => {
      context.onValueChange(value);
      const text = getChildText(children);
      if (text) context.setSelectedLabel(text.trim());
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
          isSelected && 'bg-accent text-accent-foreground',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4" />
          </span>
        )}
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
