import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void => {
  const requestId = typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined;
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(requestId ? { requestId } : {}),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: string,
  details?: unknown
): void => {
  const requestId = typeof res.locals.requestId === 'string' ? res.locals.requestId : undefined;
  const response: ApiResponse = {
    success: false,
    message,
    ...(error ? { error } : {}),
    ...(requestId ? { requestId } : {}),
    ...(details ? { details } : {}),
  };
  res.status(statusCode).json(response);
};
