/**
 * Error classes for Port SDK
 */

/**
 * Base error class for all Port SDK errors
 */
export class PortError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'PortError';
    Object.setPrototypeOf(this, PortError.prototype);
  }
}

/**
 * Authentication error (401)
 */
export class PortAuthError extends PortError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'PortAuthError';
    Object.setPrototypeOf(this, PortAuthError.prototype);
  }
}

/**
 * Authorization error (403)
 */
export class PortForbiddenError extends PortError {
  constructor(
    message: string,
    public readonly resource?: string,
    details?: unknown
  ) {
    super(message, 'FORBIDDEN', 403, details);
    this.name = 'PortForbiddenError';
    Object.setPrototypeOf(this, PortForbiddenError.prototype);
  }
}

/**
 * Resource not found error (404)
 */
export class PortNotFoundError extends PortError {
  constructor(
    public readonly resource: string,
    public readonly identifier: string,
    details?: unknown
  ) {
    super(
      `${resource} with identifier "${identifier}" not found`,
      'NOT_FOUND',
      404,
      details
    );
    this.name = 'PortNotFoundError';
    Object.setPrototypeOf(this, PortNotFoundError.prototype);
  }
}

/**
 * Validation error (422)
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export class PortValidationError extends PortError {
  constructor(
    message: string,
    public readonly validationErrors: ValidationError[]
  ) {
    super(message, 'VALIDATION_ERROR', 422, validationErrors);
    this.name = 'PortValidationError';
    Object.setPrototypeOf(this, PortValidationError.prototype);
  }
}

/**
 * Rate limit error (429)
 */
export class PortRateLimitError extends PortError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    details?: unknown
  ) {
    super(message, 'RATE_LIMIT', 429, details);
    this.name = 'PortRateLimitError';
    Object.setPrototypeOf(this, PortRateLimitError.prototype);
  }
}

/**
 * Server error (5xx)
 */
export class PortServerError extends PortError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super(message, 'SERVER_ERROR', statusCode, details);
    this.name = 'PortServerError';
    Object.setPrototypeOf(this, PortServerError.prototype);
  }
}

/**
 * Network error (no response)
 */
export class PortNetworkError extends PortError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'NETWORK_ERROR', undefined, originalError);
    this.name = 'PortNetworkError';
    Object.setPrototypeOf(this, PortNetworkError.prototype);
  }
}

/**
 * Timeout error (408)
 */
export class PortTimeoutError extends PortError {
  constructor(message: string, public readonly timeout: number) {
    super(message, 'TIMEOUT', 408, { timeout });
    this.name = 'PortTimeoutError';
    Object.setPrototypeOf(this, PortTimeoutError.prototype);
  }
}

