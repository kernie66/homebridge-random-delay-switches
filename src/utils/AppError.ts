/**
 * Base Application Error
 * All custom domain errors extend this class.
 */

class AppError extends Error {
  statusCode: number;
  errorCode: string;
  isOperational: boolean;
  details?: string[];

  constructor(message: string, statusCode = 500, errorCode = 'INTERNAL_ERROR', isOperational = true) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // Retain clean stack trace in V8 engine (Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid request payload', details: string[] = []) {
    super(message, 400, 'VALIDATION_ERROR', true);
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} was not found`, 404, 'NOT_FOUND', true);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

class SystemBugError extends AppError {
  constructor(message = 'Critical system error encountered') {
    // Programmer errors are marked as non-operational (isOperational = false)
    super(message, 500, 'CRITICAL_BUG', false);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  SystemBugError,
};
