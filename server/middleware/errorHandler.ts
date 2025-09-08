import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🔒' : err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Default error status
  const status = err.status || 500;
  
  // Prepare error response
  const errorResponse: Record<string, any> = {
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
  };

  // Add error code if present
  if (err.code) {
    errorResponse.code = err.code;
  }

  // Add validation errors if present
  if (err.details) {
    errorResponse.details = err.details;
  }

  // In development, include stack trace
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(status).json(errorResponse);
}

// Create a custom error class for API errors
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found error
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

// 400 Bad Request error
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

// 401 Unauthorized error
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 403 Forbidden error
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

// 409 Conflict error
export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

// 500 Internal Server Error
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

// Validation error (422 Unprocessable Entity)
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}
