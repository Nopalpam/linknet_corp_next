# Custom Hooks

This directory contains custom React hooks.

## Example: useApi Hook
`hooks/useApi.ts`

```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(url: string, deps: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState({ data: null, loading: true, error: null });
        const response = await apiClient.get<T>(url);
        if (isMounted) {
          setState({ data: response, loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setState({ 
            data: null, 
            loading: false, 
            error: error as Error 
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
```

## Example: useLocalStorage Hook
```typescript
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
```
