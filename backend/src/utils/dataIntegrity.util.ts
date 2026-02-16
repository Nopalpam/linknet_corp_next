/**
 * Data Integrity Validation Utilities
 * 
 * Control: MBSS2.0-ApplicationCoding-005
 * Purpose: Validate data integrity during processing to detect corruption, 
 *          processing errors, or deliberate data manipulation
 */

import { AppError } from '../types/error.types';
import crypto from 'crypto';

/**
 * Data Integrity Error
 */
export class DataIntegrityError extends AppError {
  public readonly integrityDetails?: any;
  
  constructor(message: string, details?: any) {
    super(message, 422, 'DATA_INTEGRITY_ERROR', true);
    this.integrityDetails = details;
    // Also set the details property from parent class
    (this as any).details = details;
  }
}

/**
 * Validate numeric bounds to prevent overflow/underflow
 */
export function validateNumericBounds(
  value: number,
  fieldName: string,
  min: number = Number.MIN_SAFE_INTEGER,
  max: number = Number.MAX_SAFE_INTEGER
): void {
  if (!Number.isFinite(value)) {
    throw new DataIntegrityError(
      `${fieldName} must be a finite number`,
      { field: fieldName, value }
    );
  }

  if (value < min || value > max) {
    throw new DataIntegrityError(
      `${fieldName} is out of bounds (${min} to ${max})`,
      { field: fieldName, value, min, max }
    );
  }
}

/**
 * Validate increment/decrement operations won't cause overflow
 */
export function validateIncrementSafety(
  currentValue: number,
  increment: number,
  fieldName: string,
  max: number = Number.MAX_SAFE_INTEGER
): void {
  const newValue = currentValue + increment;
  
  if (newValue > max || newValue < 0) {
    throw new DataIntegrityError(
      `${fieldName} increment would cause overflow/underflow`,
      { field: fieldName, currentValue, increment, resultingValue: newValue, max }
    );
  }
}

/**
 * Validate array indices to prevent out-of-bounds access
 */
export function validateArrayIndex(
  index: number,
  arrayLength: number,
  fieldName: string
): void {
  if (!Number.isInteger(index) || index < 0 || index >= arrayLength) {
    throw new DataIntegrityError(
      `Invalid ${fieldName} index: ${index} (array length: ${arrayLength})`,
      { field: fieldName, index, arrayLength }
    );
  }
}

/**
 * Validate state transitions
 */
export function validateStateTransition(
  currentState: string,
  newState: string,
  allowedTransitions: Record<string, string[]>,
  entityType: string
): void {
  const allowed = allowedTransitions[currentState];
  
  if (!allowed || !allowed.includes(newState)) {
    throw new DataIntegrityError(
      `Invalid ${entityType} state transition: ${currentState} → ${newState}`,
      {
        entityType,
        currentState,
        newState,
        allowedTransitions: allowed || []
      }
    );
  }
}

/**
 * Validate referenced entities exist (referential integrity)
 */
export async function validateReferencesExist(
  references: Array<{ id: string; type: string; model: any }>
): Promise<void> {
  const checks = references.map(async ({ id, type, model }) => {
    const exists = await model.findUnique({ where: { id } });
    if (!exists) {
      throw new DataIntegrityError(
        `Referenced ${type} not found`,
        { type, id }
      );
    }
  });

  await Promise.all(checks);
}

/**
 * Validate no orphaned references before deletion
 */
export async function validateNoDependents(
  entityId: string,
  entityType: string,
  dependentChecks: Array<{
    model: any;
    field: string;
    description: string;
  }>
): Promise<void> {
  for (const check of dependentChecks) {
    const count = await check.model.count({
      where: {
        [check.field]: entityId,
        deletedAt: null,
      },
    });

    if (count > 0) {
      throw new DataIntegrityError(
        `Cannot delete ${entityType}: ${count} ${check.description} still reference it`,
        {
          entityType,
          entityId,
          dependentType: check.description,
          dependentCount: count
        }
      );
    }
  }
}

/**
 * Generate data checksum for integrity verification
 */
export function generateDataChecksum(data: any): string {
  const normalized = JSON.stringify(data, Object.keys(data).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Verify data checksum matches expected
 */
export function verifyDataChecksum(
  data: any,
  expectedChecksum: string,
  entityType: string
): void {
  const actualChecksum = generateDataChecksum(data);
  
  if (actualChecksum !== expectedChecksum) {
    throw new DataIntegrityError(
      `${entityType} data integrity check failed: checksum mismatch`,
      {
        entityType,
        expectedChecksum,
        actualChecksum
      }
    );
  }
}

/**
 * Validate date ranges are logical
 */
export function validateDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  fieldNames: { start: string; end: string }
): void {
  if (startDate && endDate && startDate > endDate) {
    throw new DataIntegrityError(
      `${fieldNames.start} cannot be after ${fieldNames.end}`,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    );
  }
}

/**
 * Validate collection size limits
 */
export function validateCollectionSize(
  collection: any[],
  fieldName: string,
  minSize: number = 0,
  maxSize: number = 1000
): void {
  if (collection.length < minSize) {
    throw new DataIntegrityError(
      `${fieldName} must contain at least ${minSize} items`,
      { field: fieldName, actualSize: collection.length, minSize }
    );
  }

  if (collection.length > maxSize) {
    throw new DataIntegrityError(
      `${fieldName} exceeds maximum size of ${maxSize} items`,
      { field: fieldName, actualSize: collection.length, maxSize }
    );
  }
}

/**
 * Validate no duplicate values in collection
 */
export function validateNoDuplicates<T>(
  collection: T[],
  fieldName: string,
  keyExtractor?: (item: T) => any
): void {
  const keys = keyExtractor 
    ? collection.map(keyExtractor)
    : collection;

  const uniqueKeys = new Set(keys);
  
  if (uniqueKeys.size !== keys.length) {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    throw new DataIntegrityError(
      `${fieldName} contains duplicate values`,
      { field: fieldName, duplicates: Array.from(new Set(duplicates)) }
    );
  }
}

/**
 * Validate required fields are present for state
 */
export function validateRequiredFieldsForState(
  data: Record<string, any>,
  state: string,
  requiredFields: Record<string, string[]>
): void {
  const required = requiredFields[state];
  
  if (!required) return;

  const missing = required.filter(field => {
    const value = data[field];
    return value === null || value === undefined || value === '';
  });

  if (missing.length > 0) {
    throw new DataIntegrityError(
      `Missing required fields for state '${state}'`,
      { state, missingFields: missing }
    );
  }
}

/**
 * Validate business rule constraints
 */
export async function validateBusinessRule(
  condition: boolean,
  message: string,
  details?: any
): Promise<void> {
  if (!condition) {
    throw new DataIntegrityError(message, details);
  }
}

/**
 * Validate data consistency in batch operations
 */
export function validateBatchConsistency<T>(
  items: T[],
  fieldName: string,
  validator: (item: T, index: number) => { valid: boolean; error?: string }
): void {
  const errors: Array<{ index: number; error: string }> = [];

  items.forEach((item, index) => {
    const result = validator(item, index);
    if (!result.valid) {
      errors.push({ index, error: result.error || 'Validation failed' });
    }
  });

  if (errors.length > 0) {
    throw new DataIntegrityError(
      `${fieldName} batch validation failed`,
      { fieldName, errors }
    );
  }
}

/**
 * Validate concurrent modification (optimistic locking)
 */
export async function validateVersionMatch(
  model: any,
  id: string,
  expectedVersion: number,
  entityType: string
): Promise<void> {
  const current = await model.findUnique({
    where: { id },
    select: { version: true }
  });

  if (!current) {
    throw new DataIntegrityError(
      `${entityType} not found`,
      { entityType, id }
    );
  }

  if (current.version !== expectedVersion) {
    throw new DataIntegrityError(
      `${entityType} has been modified by another user`,
      {
        entityType,
        id,
        expectedVersion,
        currentVersion: current.version
      }
    );
  }
}

/**
 * Validate JSON data structure
 */
export function validateJsonStructure(
  data: any,
  requiredKeys: string[],
  fieldName: string
): void {
  if (typeof data !== 'object' || data === null) {
    throw new DataIntegrityError(
      `${fieldName} must be a valid object`,
      { fieldName, receivedType: typeof data }
    );
  }

  const missingKeys = requiredKeys.filter(key => !(key in data));
  
  if (missingKeys.length > 0) {
    throw new DataIntegrityError(
      `${fieldName} is missing required keys`,
      { fieldName, missingKeys }
    );
  }
}

/**
 * Validate hierarchical data integrity (no cycles, max depth)
 */
export async function validateHierarchyIntegrity(
  nodeId: string | bigint,
  parentId: string | bigint | null,
  model: any,
  maxDepth: number = 10
): Promise<void> {
  // Check for self-reference
  if (parentId && nodeId.toString() === parentId.toString()) {
    throw new DataIntegrityError(
      'Node cannot be its own parent (self-reference)',
      { nodeId, parentId }
    );
  }

  // Check for circular references
  if (parentId) {
    const visited = new Set<string>();
    let currentId: string | bigint | null = parentId;
    let depth = 0;

    while (currentId && depth < maxDepth) {
      const currentIdStr = currentId.toString();
      
      if (visited.has(currentIdStr)) {
        throw new DataIntegrityError(
          'Circular reference detected in hierarchy',
          { nodeId, parentId, circularPath: Array.from(visited) }
        );
      }

      if (currentIdStr === nodeId.toString()) {
        throw new DataIntegrityError(
          'Cannot set descendant as parent (circular reference)',
          { nodeId, parentId }
        );
      }

      visited.add(currentIdStr);

      const parent: any = await model.findUnique({
        where: { id: currentId },
        select: { parentId: true }
      });

      currentId = parent?.parentId || null;
      depth++;
    }

    if (depth >= maxDepth) {
      throw new DataIntegrityError(
        `Hierarchy depth exceeds maximum of ${maxDepth}`,
        { nodeId, parentId, maxDepth }
      );
    }
  }
}
