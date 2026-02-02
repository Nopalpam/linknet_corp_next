import { useToast as useToastOriginal } from './useToast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const { success, error, info, ...rest } = useToastOriginal();

  const toast = (options: ToastOptions) => {
    const message = options.description || options.title || '';
    
    if (options.variant === 'destructive') {
      error(message);
    } else {
      success(message);
    }
  };

  return {
    toast,
    ...rest,
  };
}
