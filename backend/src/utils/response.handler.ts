import { Response } from 'express';
import { ApiResponse } from '../types/index';

export class ResponseHandler {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    return this.success(res, message, data, 201);
  }

  static badRequest(res: Response, message: string, error?: string): Response {
    return this.error(res, message, 400, error);
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string, error?: string): Response {
    return this.error(res, message, 409, error);
  }

  static validationError(res: Response, errors: unknown): Response {
    return this.error(res, 'Validation failed', 422, JSON.stringify(errors));
  }
}
