# Utilities

This directory contains utility functions and helper methods.

## Existing Utilities
- `response.handler.ts` - Standardized API response handling

## Example: Logger Utility
`src/utils/logger.ts`

```typescript
export class Logger {
  static info(message: string, ...args: any[]) {
    console.log(`[INFO] ${new Date().toISOString()}:`, message, ...args);
  }

  static error(message: string, error?: Error) {
    console.error(`[ERROR] ${new Date().toISOString()}:`, message, error);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
  }

  static debug(message: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()}:`, message, ...args);
    }
  }
}
```

## Example: Validation Utility
```typescript
export class Validator {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>]/g, '');
  }
}
```
