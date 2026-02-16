/**
 * Data Integrity Validation Tests
 * 
 * Control: MBSS2.0-ApplicationCoding-005
 * Purpose: Test data validation checks during processing
 */

import {
  validateNumericBounds,
  validateIncrementSafety,
  validateStateTransition,
  validateDateRange,
  validateCollectionSize,
  validateNoDuplicates,
  validateRequiredFieldsForState,
  validateJsonStructure,
  validateHierarchyIntegrity,
  DataIntegrityError,
  generateDataChecksum,
  verifyDataChecksum
} from '../utils/dataIntegrity.util';

describe('Data Integrity Validation Utilities', () => {
  describe('validateNumericBounds', () => {
    it('should pass for valid numeric values', () => {
      expect(() => validateNumericBounds(50, 'testField', 0, 100)).not.toThrow();
    });

    it('should throw error for values below minimum', () => {
      expect(() => validateNumericBounds(-10, 'testField', 0, 100))
        .toThrow(DataIntegrityError);
    });

    it('should throw error for values above maximum', () => {
      expect(() => validateNumericBounds(150, 'testField', 0, 100))
        .toThrow(DataIntegrityError);
    });

    it('should throw error for non-finite values', () => {
      expect(() => validateNumericBounds(Infinity, 'testField'))
        .toThrow(DataIntegrityError);
      expect(() => validateNumericBounds(NaN, 'testField'))
        .toThrow(DataIntegrityError);
    });
  });

  describe('validateIncrementSafety', () => {
    it('should pass for safe increments', () => {
      expect(() => validateIncrementSafety(100, 50, 'counter', 1000))
        .not.toThrow();
    });

    it('should throw error when increment causes overflow', () => {
      expect(() => validateIncrementSafety(950, 100, 'counter', 1000))
        .toThrow(DataIntegrityError);
    });

    it('should throw error when increment causes underflow', () => {
      expect(() => validateIncrementSafety(5, -10, 'counter', 1000))
        .toThrow(DataIntegrityError);
    });
  });

  describe('validateStateTransition', () => {
    const transitions = {
      'DRAFT': ['PUBLISHED', 'ARCHIVED'],
      'PUBLISHED': ['ARCHIVED'],
      'ARCHIVED': []
    };

    it('should pass for valid state transitions', () => {
      expect(() => 
        validateStateTransition('DRAFT', 'PUBLISHED', transitions, 'Document')
      ).not.toThrow();
    });

    it('should throw error for invalid state transitions', () => {
      expect(() => 
        validateStateTransition('PUBLISHED', 'DRAFT', transitions, 'Document')
      ).toThrow(DataIntegrityError);
    });

    it('should throw error for transitioning from unknown state', () => {
      expect(() => 
        validateStateTransition('UNKNOWN', 'DRAFT', transitions, 'Document')
      ).toThrow(DataIntegrityError);
    });
  });

  describe('validateDateRange', () => {
    it('should pass for valid date ranges', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-12-31');
      
      expect(() => 
        validateDateRange(start, end, { start: 'startDate', end: 'endDate' })
      ).not.toThrow();
    });

    it('should throw error when start date is after end date', () => {
      const start = new Date('2024-12-31');
      const end = new Date('2024-01-01');
      
      expect(() => 
        validateDateRange(start, end, { start: 'startDate', end: 'endDate' })
      ).toThrow(DataIntegrityError);
    });

    it('should pass when dates are null', () => {
      expect(() => 
        validateDateRange(null, null, { start: 'startDate', end: 'endDate' })
      ).not.toThrow();
    });
  });

  describe('validateCollectionSize', () => {
    it('should pass for collections within size limits', () => {
      expect(() => validateCollectionSize([1, 2, 3], 'items', 1, 10))
        .not.toThrow();
    });

    it('should throw error for collections below minimum size', () => {
      expect(() => validateCollectionSize([], 'items', 1, 10))
        .toThrow(DataIntegrityError);
    });

    it('should throw error for collections above maximum size', () => {
      const largeArray = Array(101).fill(1);
      expect(() => validateCollectionSize(largeArray, 'items', 0, 100))
        .toThrow(DataIntegrityError);
    });
  });

  describe('validateNoDuplicates', () => {
    it('should pass for collections without duplicates', () => {
      expect(() => validateNoDuplicates([1, 2, 3, 4], 'ids'))
        .not.toThrow();
    });

    it('should throw error for collections with duplicates', () => {
      expect(() => validateNoDuplicates([1, 2, 2, 3], 'ids'))
        .toThrow(DataIntegrityError);
    });

    it('should work with key extractor for objects', () => {
      const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' } // Duplicate ID
      ];
      
      expect(() => validateNoDuplicates(items, 'items', (item) => item.id))
        .toThrow(DataIntegrityError);
    });
  });

  describe('validateRequiredFieldsForState', () => {
    const requiredFields = {
      'PUBLISHED': ['title', 'content', 'author'],
      'DRAFT': ['title']
    };

    it('should pass when all required fields are present', () => {
      const data = { title: 'Test', content: 'Content', author: 'Author' };
      
      expect(() => 
        validateRequiredFieldsForState(data, 'PUBLISHED', requiredFields)
      ).not.toThrow();
    });

    it('should throw error when required fields are missing', () => {
      const data = { title: 'Test' };
      
      expect(() => 
        validateRequiredFieldsForState(data, 'PUBLISHED', requiredFields)
      ).toThrow(DataIntegrityError);
    });

    it('should throw error for empty string values', () => {
      const data = { title: '', content: 'Content', author: 'Author' };
      
      expect(() => 
        validateRequiredFieldsForState(data, 'PUBLISHED', requiredFields)
      ).toThrow(DataIntegrityError);
    });
  });

  describe('validateJsonStructure', () => {
    it('should pass for valid JSON objects with required keys', () => {
      const data = { name: 'Test', email: 'test@example.com' };
      
      expect(() => validateJsonStructure(data, ['name', 'email'], 'userData'))
        .not.toThrow();
    });

    it('should throw error for non-object data', () => {
      expect(() => validateJsonStructure('string', ['name'], 'userData'))
        .toThrow(DataIntegrityError);
      expect(() => validateJsonStructure(null, ['name'], 'userData'))
        .toThrow(DataIntegrityError);
    });

    it('should throw error when required keys are missing', () => {
      const data = { name: 'Test' };
      
      expect(() => validateJsonStructure(data, ['name', 'email'], 'userData'))
        .toThrow(DataIntegrityError);
    });
  });

  describe('Data Checksum', () => {
    it('should generate consistent checksums for same data', () => {
      const data = { id: 1, name: 'Test', value: 100 };
      const checksum1 = generateDataChecksum(data);
      const checksum2 = generateDataChecksum(data);
      
      expect(checksum1).toBe(checksum2);
    });

    it('should generate different checksums for different data', () => {
      const data1 = { id: 1, name: 'Test' };
      const data2 = { id: 2, name: 'Test' };
      
      expect(generateDataChecksum(data1)).not.toBe(generateDataChecksum(data2));
    });

    it('should pass verification for matching checksums', () => {
      const data = { id: 1, name: 'Test' };
      const checksum = generateDataChecksum(data);
      
      expect(() => verifyDataChecksum(data, checksum, 'TestEntity'))
        .not.toThrow();
    });

    it('should throw error for mismatched checksums', () => {
      const data = { id: 1, name: 'Test' };
      const wrongChecksum = 'invalid_checksum';
      
      expect(() => verifyDataChecksum(data, wrongChecksum, 'TestEntity'))
        .toThrow(DataIntegrityError);
    });
  });

  describe('validateHierarchyIntegrity', () => {
    // Mock Prisma model
    const createMockModel = (parentMap: Record<string, string | null>) => ({
      findUnique: jest.fn(({ where }) => {
        const id = where.id.toString();
        return Promise.resolve(
          parentMap[id] !== undefined ? { parentId: parentMap[id] } : null
        );
      })
    });

    it('should pass for valid hierarchy without cycles', async () => {
      const model = createMockModel({
        '1': null,      // Root
        '2': '1',       // Child of 1
        '3': '2'        // Child of 2
      });

      await expect(
        validateHierarchyIntegrity('3', '2', model, 10)
      ).resolves.not.toThrow();
    });

    it('should throw error for self-reference', async () => {
      const model = createMockModel({});

      await expect(
        validateHierarchyIntegrity('1', '1', model, 10)
      ).rejects.toThrow(DataIntegrityError);
    });

    it('should throw error for circular references', async () => {
      const model = createMockModel({
        '1': '2',
        '2': '3',
        '3': '1'  // Circular
      });

      await expect(
        validateHierarchyIntegrity('3', '2', model, 10)
      ).rejects.toThrow(DataIntegrityError);
    });

    it('should throw error when max depth exceeded', async () => {
      const model = createMockModel({
        '1': null,
        '2': '1',
        '3': '2',
        '4': '3'
      });

      await expect(
        validateHierarchyIntegrity('4', '3', model, 2)
      ).rejects.toThrow(DataIntegrityError);
    });
  });

  describe('DataIntegrityError', () => {
    it('should create error with proper properties', () => {
      const error = new DataIntegrityError('Test error', { field: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('DATA_INTEGRITY_ERROR');
      expect(error.details).toEqual({ field: 'test' });
      expect(error.isOperational).toBe(true);
    });
  });
});
