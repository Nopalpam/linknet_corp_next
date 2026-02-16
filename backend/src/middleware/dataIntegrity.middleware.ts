/**
 * Data Processing Validation Middleware
 * 
 * Control: MBSS2.0-ApplicationCoding-005
 * Purpose: Apply data integrity validation during processing operations
 */

import { Request, Response, NextFunction } from 'express';
import {
  validateNumericBounds,
  validateCollectionSize,
  validateNoDuplicates,
  DataIntegrityError
} from '../utils/dataIntegrity.util';
import logger from '@utils/logger';

/**
 * Middleware to validate pagination parameters
 */
export const validatePaginationParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate page number
    validateNumericBounds(page, 'page', 1, 10000);

    // Validate limit
    validateNumericBounds(limit, 'limit', 1, 100);

    // Attach validated values
    req.query.page = page.toString();
    req.query.limit = limit.toString();

    next();
  } catch (error) {
    if (error instanceof DataIntegrityError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate bulk operation size
 */
export const validateBulkOperationSize = (
  maxSize: number = 100,
  fieldName: string = 'ids'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = req.body[fieldName];

      if (!Array.isArray(items)) {
        throw new DataIntegrityError(
          `${fieldName} must be an array`,
          { field: fieldName, receivedType: typeof items }
        );
      }

      validateCollectionSize(items, fieldName, 1, maxSize);
      validateNoDuplicates(items, fieldName);

      next();
    } catch (error) {
      if (error instanceof DataIntegrityError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate order/sort parameters
 */
export const validateOrderParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { order, sortOrder } = req.body;

    if (order !== undefined) {
      validateNumericBounds(order, 'order', 0, 10000);
    }

    if (sortOrder !== undefined && !['asc', 'desc'].includes(sortOrder)) {
      throw new DataIntegrityError(
        'sortOrder must be either "asc" or "desc"',
        { field: 'sortOrder', value: sortOrder }
      );
    }

    next();
  } catch (error) {
    if (error instanceof DataIntegrityError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    }
    next(error);
  }
};

/**
 * Middleware to validate date range parameters
 */
export const validateDateRangeParams = (
  startField: string = 'startDate',
  endField: string = 'endDate'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const startDate = req.query[startField] ? new Date(req.query[startField] as string) : null;
      const endDate = req.query[endField] ? new Date(req.query[endField] as string) : null;

      if (startDate && isNaN(startDate.getTime())) {
        throw new DataIntegrityError(
          `Invalid ${startField} format`,
          { field: startField, value: req.query[startField] }
        );
      }

      if (endDate && isNaN(endDate.getTime())) {
        throw new DataIntegrityError(
          `Invalid ${endField} format`,
          { field: endField, value: req.query[endField] }
        );
      }

      if (startDate && endDate && startDate > endDate) {
        throw new DataIntegrityError(
          `${startField} cannot be after ${endField}`,
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        );
      }

      next();
    } catch (error) {
      if (error instanceof DataIntegrityError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware to log data processing operations for audit trail
 */
export const logDataProcessing = (
  operationType: 'create' | 'update' | 'delete' | 'bulk_operation'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Attach operation metadata for logging
    req.body._operationMetadata = {
      operationType,
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    // Store original response.json to intercept
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      // Log successful operations
      if (body.success !== false) {
        logger.info('Data processing operation completed', {
          operationType,
          userId: (req as any).user?.id,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        });
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Middleware to validate JSON body structure
 */
export const validateJsonStructure = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;

      if (!body || typeof body !== 'object') {
        throw new DataIntegrityError(
          'Request body must be a valid JSON object',
          { receivedType: typeof body }
        );
      }

      const missingFields = requiredFields.filter(field => {
        const value = body[field];
        return value === undefined;
      });

      if (missingFields.length > 0) {
        throw new DataIntegrityError(
          'Missing required fields in request',
          { missingFields }
        );
      }

      next();
    } catch (error) {
      if (error instanceof DataIntegrityError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        });
      }
      next(error);
    }
  };
};
