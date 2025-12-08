# Services

This directory contains business logic and service layer.

## Purpose
Services handle the business logic of your application, keeping controllers thin and focused on HTTP handling.

## Example Service
`src/services/user.service.ts`

```typescript
import { User } from '@models/user.model';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    // Database query logic
    return [];
  }

  async getUserById(id: string): Promise<User | null> {
    // Database query logic
    return null;
  }

  async createUser(data: Partial<User>): Promise<User> {
    // Create user logic
    return {} as User;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    // Update user logic
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    // Delete user logic
    return true;
  }
}

export default new UserService();
```

## Usage in Controller
```typescript
import userService from '@services/user.service';

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      return ResponseHandler.success(res, 'Users retrieved', users);
    } catch (error) {
      next(error);
    }
  }
}
```
