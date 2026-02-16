# DATA VALIDATION QUICK REFERENCE
## MBSS2.0-ApplicationCoding-005 Implementation Guide

---

## Overview

This guide provides quick reference for using data integrity validation utilities in the LinkNet Corp application.

---

## Core Utilities

### Import
```typescript
import {
  validateNumericBounds,
  validateIncrementSafety,
  validateStateTransition,
  validateDateRange,
  validateCollectionSize,
  validateNoDuplicates,
  validateRequiredFieldsForState,
  validateReferencesExist,
  validateNoDependents,
  validateHierarchyIntegrity,
  DataIntegrityError
} from '../utils/dataIntegrity.util';
```

---

## Common Use Cases

### 1. Validating Numeric Values
```typescript
// Validate page number (1-10000)
validateNumericBounds(page, 'page', 1, 10000);

// Validate limit (1-100)
validateNumericBounds(limit, 'limit', 1, 100);

// Validate order number (0-10000)
validateNumericBounds(order, 'order', 0, 10000);
```

### 2. Protecting Against Overflow
```typescript
// Before incrementing view count
const news = await prisma.news.findUnique({
  where: { id: newsId },
  select: { viewCount: true }
});

validateIncrementSafety(
  news.viewCount || 0,
  1,
  'viewCount',
  1000000000 // Max 1 billion
);

await prisma.news.update({
  where: { id: newsId },
  data: { viewCount: { increment: 1 } }
});
```

### 3. Validating State Transitions
```typescript
const STATUS_TRANSITIONS = {
  'DRAFT': ['PUBLISHED', 'ARCHIVED'],
  'PUBLISHED': ['DRAFT', 'ARCHIVED'],
  'ARCHIVED': ['DRAFT']
};

// Before updating status
validateStateTransition(
  currentStatus,
  newStatus,
  STATUS_TRANSITIONS,
  'News'
);
```

### 4. Validating Required Fields by State
```typescript
const REQUIRED_FIELDS = {
  'PUBLISHED': ['titleEn', 'contentEn', 'thumbnail', 'categoryId'],
  'DRAFT': ['titleEn', 'categoryId']
};

// Before publishing
validateRequiredFieldsForState(
  newsData,
  'PUBLISHED',
  REQUIRED_FIELDS
);
```

### 5. Validating Date Ranges
```typescript
// Validate event dates
validateDateRange(
  eventData.startDate,
  eventData.endDate,
  { start: 'startDate', end: 'endDate' }
);
```

### 6. Validating Collections
```typescript
// Validate bulk operation size
validateCollectionSize(
  userIds,
  'userIds',
  1,    // Min: at least 1
  100   // Max: no more than 100
);

// Validate no duplicate IDs
validateNoDuplicates(userIds, 'userIds');
```

### 7. Validating References Exist
```typescript
// Before creating news with category
await validateReferencesExist([
  {
    id: data.categoryId,
    type: 'Category',
    model: prisma.newsCategory
  }
]);
```

### 8. Validating No Dependents Before Deletion
```typescript
// Before deleting a category
await validateNoDependents(
  categoryId,
  'Category',
  [
    {
      model: prisma.news,
      field: 'categoryId',
      description: 'news articles'
    }
  ]
);
```

### 9. Validating Hierarchical Data
```typescript
// Before updating parent in menu
await validateHierarchyIntegrity(
  menuId,
  newParentId,
  prisma.menu,
  3 // Max depth
);
```

---

## Middleware Usage

### Route-Level Validation

```typescript
import {
  validatePaginationParams,
  validateBulkOperationSize,
  validateOrderParams,
  validateDateRangeParams,
  logDataProcessing
} from '../middleware/dataIntegrity.middleware';

// Pagination
router.get('/cms/news',
  validatePaginationParams,  // Validates page & limit
  newsController.getNews
);

// Bulk operations
router.post('/cms/users/bulk-delete',
  authMiddleware,
  validateBulkOperationSize(100, 'userIds'),  // Max 100, field = userIds
  userController.bulkDelete
);

// Date range filtering
router.get('/cms/reports',
  validateDateRangeParams('startDate', 'endDate'),
  reportController.getReports
);

// Audit logging
router.post('/cms/news',
  authMiddleware,
  logDataProcessing('create'),  // Logs operation
  createNewsValidation,
  validateRequest,
  newsController.createNews
);
```

---

## Domain-Specific Validators

### News Validation
```typescript
import {
  validateNewsPublishable,
  validateNewsStatusChange,
  validateNewsUpdate
} from '../validators/newsDataIntegrity.validator';

async updateNews(id, data, userId) {
  // Validate the update
  await validateNewsUpdate(id, data, prisma);
  
  // Process update...
}
```

### User Validation
```typescript
import {
  validateUserStatusChange,
  validateNotSelfDeletion,
  validateNotProtectedUser,
  validateBulkUserOperation,
  validateEmailUnique,
  validatePasswordStrength
} from '../validators/userDataIntegrity.validator';

async deleteUser(userId, currentUserId) {
  // Validate not deleting self
  validateNotSelfDeletion(userId, currentUserId);
  
  // Validate not protected user
  await validateNotProtectedUser(userId, prisma);
  
  // Process deletion...
}
```

### Role Validation
```typescript
import {
  validateNotSystemRole,
  validateRoleDeletion,
  validatePermissions
} from '../validators/roleDataIntegrity.validator';

async deleteRole(roleId) {
  // Validate can be deleted
  await validateRoleDeletion(roleId, prisma);
  
  // Process deletion...
}
```

---

## Error Handling

### Catching Data Integrity Errors
```typescript
import { DataIntegrityError } from '../utils/dataIntegrity.util';

try {
  validateNumericBounds(value, 'page', 1, 100);
} catch (error) {
  if (error instanceof DataIntegrityError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,              // 'DATA_INTEGRITY_ERROR'
        message: error.message,        // Human-readable message
        details: error.details         // Structured details
      }
    });
  }
  throw error; // Re-throw if not data integrity error
}
```

### Custom Data Integrity Checks
```typescript
async function validateBusinessRule() {
  const valid = await checkSomeCondition();
  
  if (!valid) {
    throw new DataIntegrityError(
      'Business rule violation',
      {
        rule: 'CUSTOM_RULE',
        reason: 'Detailed explanation',
        data: relevantData
      }
    );
  }
}
```

---

## Service Layer Pattern

### Complete Example

```typescript
import {
  validateStateTransition,
  validateRequiredFieldsForState,
  validateReferencesExist,
  DataIntegrityError
} from '../utils/dataIntegrity.util';

// Define state rules
const STATUS_TRANSITIONS = {
  'DRAFT': ['PUBLISHED', 'ARCHIVED'],
  'PUBLISHED': ['ARCHIVED'],
  'ARCHIVED': ['DRAFT']
};

const REQUIRED_FIELDS = {
  'PUBLISHED': ['title', 'content', 'thumbnail'],
  'DRAFT': ['title']
};

export class ArticleService {
  async updateArticle(id: string, data: any, userId: string) {
    // 1. Fetch existing article
    const existing = await prisma.article.findUnique({
      where: { id },
      select: {
        status: true,
        title: true,
        content: true,
        thumbnail: true,
        authorId: true
      }
    });

    if (!existing) {
      throw new DataIntegrityError('Article not found', { id });
    }

    // 2. Validate state transition
    if (data.status && data.status !== existing.status) {
      validateStateTransition(
        existing.status,
        data.status,
        STATUS_TRANSITIONS,
        'Article'
      );

      // 3. Validate required fields for new state
      const mergedData = { ...existing, ...data };
      validateRequiredFieldsForState(
        mergedData,
        data.status,
        REQUIRED_FIELDS
      );
    }

    // 4. Validate references if changing
    if (data.categoryId) {
      await validateReferencesExist([
        {
          id: data.categoryId,
          type: 'Category',
          model: prisma.category
        }
      ]);
    }

    // 5. Sanitize content
    if (data.content) {
      data.content = sanitizeHtmlContent(data.content);
    }

    // 6. Update with validation passed
    return await prisma.article.update({
      where: { id },
      data: {
        ...data,
        updatedById: userId,
        updatedAt: new Date()
      }
    });
  }
}
```

---

## Testing Pattern

```typescript
import { DataIntegrityError } from '../utils/dataIntegrity.util';

describe('Article Service', () => {
  describe('updateArticle', () => {
    it('should prevent invalid state transition', async () => {
      await expect(
        articleService.updateArticle(
          articleId,
          { status: 'INVALID_STATUS' },
          userId
        )
      ).rejects.toThrow(DataIntegrityError);
    });

    it('should prevent publishing without required fields', async () => {
      await expect(
        articleService.updateArticle(
          draftArticleId,
          { status: 'PUBLISHED' }, // Missing thumbnail
          userId
        )
      ).rejects.toThrow(DataIntegrityError);
    });

    it('should validate successfully for valid updates', async () => {
      const result = await articleService.updateArticle(
        articleId,
        {
          title: 'Updated Title',
          status: 'PUBLISHED',
          thumbnail: 'image.jpg'
        },
        userId
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('PUBLISHED');
    });
  });
});
```

---

## Checklist for New Features

When implementing new data operations, ensure:

- [ ] Numeric values have bounds checks
- [ ] State transitions are validated
- [ ] Required fields are validated by state
- [ ] Referenced entities are validated to exist
- [ ] Bulk operations have size limits
- [ ] No duplicate entries in collections
- [ ] Date ranges are validated
- [ ] Hierarchical data checked for cycles
- [ ] Protected entities cannot be modified
- [ ] Self-operations are prevented (delete self, etc.)
- [ ] Tests written for validation logic
- [ ] Error messages are descriptive

---

## Performance Tips

1. **Batch validations** when possible:
```typescript
await Promise.all([
  validateReferencesExist(references),
  validateNoDependents(id, type, checks)
]);
```

2. **Cache validation results** for repeated checks:
```typescript
const cachedRoles = await getRolesWithCache();
```

3. **Use database constraints** as first line of defense:
```prisma
model User {
  email String @unique
  // ...
}
```

4. **Validate early** in the request pipeline:
```typescript
// Middleware validates first, before heavy processing
router.post('/', validateMiddleware, heavyController);
```

---

## Additional Resources

- **Full Assessment**: `SECURITY_CONTROL_ASSESSMENT_MBSS2.0-ApplicationCoding-005.md`
- **Test Suite**: `backend/src/__tests__/dataIntegrity.test.ts`
- **Utility Source**: `backend/src/utils/dataIntegrity.util.ts`
- **Middleware Source**: `backend/src/middleware/dataIntegrity.middleware.ts`

---

**Last Updated**: February 16, 2026  
**Control**: MBSS2.0-ApplicationCoding-005  
**Status**: Implemented ✅
