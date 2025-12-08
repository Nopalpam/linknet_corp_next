# Models

This directory contains data models and database schemas.

## Example Structure

```typescript
export interface UserModel {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export class User implements UserModel {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserModel) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```
