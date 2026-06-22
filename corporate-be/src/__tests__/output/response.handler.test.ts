/**
 * Output Validation Tests: Response Handler
 * MBSS2.0-ApplicationCoding-004: Application output validation
 * 
 * Purpose: Validate that all API responses conform to expected structure
 * and contain appropriate data for their intended use.
 */

import { Response } from 'express';
import { ResponseHandler } from '../../utils/response.handler';

describe('ResponseHandler Output Validation', () => {
  let mockRes: Partial<Response>;
  let responseBody: any;

  beforeEach(() => {
    responseBody = null;
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((data) => {
        responseBody = data;
        return mockRes as Response;
      }),
    };
  });

  describe('Success Response Structure', () => {
    it('should output success response with correct structure', () => {
      const testData = { id: '123', name: 'Test' };
      
      ResponseHandler.success(mockRes as Response, 'Operation successful', testData);
      
      // Validate output structure
      expect(responseBody).toHaveProperty('success', true);
      expect(responseBody).toHaveProperty('message', 'Operation successful');
      expect(responseBody).toHaveProperty('data', testData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should output success response without data', () => {
      ResponseHandler.success(mockRes as Response, 'Operation successful');
      
      expect(responseBody.success).toBe(true);
      expect(responseBody.message).toBe('Operation successful');
      expect(responseBody.data).toBeUndefined();
    });

    it('should output created response with 201 status', () => {
      const createdData = { id: 'new-123', name: 'New Item' };
      
      ResponseHandler.created(mockRes as Response, 'Resource created', createdData);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toEqual(createdData);
    });
  });

  describe('Error Response Structure', () => {
    it('should output error response with correct structure', () => {
      ResponseHandler.error(mockRes as Response, 'An error occurred', 500, 'Internal Server Error');
      
      expect(responseBody).toHaveProperty('success', false);
      expect(responseBody).toHaveProperty('message', 'An error occurred');
      expect(responseBody).toHaveProperty('error', 'Internal Server Error');
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should output bad request with 400 status', () => {
      ResponseHandler.badRequest(mockRes as Response, 'Invalid input');
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(responseBody.success).toBe(false);
    });

    it('should output unauthorized with 401 status', () => {
      ResponseHandler.unauthorized(mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(responseBody.message).toBe('Unauthorized');
    });

    it('should output forbidden with 403 status', () => {
      ResponseHandler.forbidden(mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(responseBody.message).toBe('Forbidden');
    });

    it('should output not found with 404 status', () => {
      ResponseHandler.notFound(mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(responseBody.message).toBe('Resource not found');
    });

    it('should output validation error with 422 status', () => {
      const errors = { email: 'Invalid email format' };
      
      ResponseHandler.validationError(mockRes as Response, errors);
      
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Validation failed');
    });
  });

  describe('Output Data Integrity', () => {
    it('should not mutate input data', () => {
      const originalData = { id: '123', value: 'test' };
      const dataCopy = { ...originalData };
      
      ResponseHandler.success(mockRes as Response, 'Success', originalData);
      
      expect(originalData).toEqual(dataCopy);
    });

    it('should handle null data appropriately', () => {
      ResponseHandler.success(mockRes as Response, 'Success', null);
      
      expect(responseBody.data).toBeNull();
      expect(responseBody.success).toBe(true);
    });

    it('should handle array data correctly', () => {
      const arrayData = [{ id: '1' }, { id: '2' }];
      
      ResponseHandler.success(mockRes as Response, 'Success', arrayData);
      
      expect(Array.isArray(responseBody.data)).toBe(true);
      expect(responseBody.data).toHaveLength(2);
    });
  });

  describe('Output Content Type', () => {
    it('should always output valid JSON structure', () => {
      ResponseHandler.success(mockRes as Response, 'Test', { nested: { value: 'deep' } });
      
      // Verify JSON serializable
      expect(() => JSON.stringify(responseBody)).not.toThrow();
    });
  });
});
