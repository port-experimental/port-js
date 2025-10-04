/**
 * Error classes for Port SDK
 */

/**
 * Request context for debugging
 */
export interface RequestContext {
  url?: string;
  method?: string;
  requestId?: string;
}

/**
 * Base error class for all Port SDK errors
 * 
 * Includes request context for better debugging in production.
 */
export class PortError extends Error {
  public readonly context?: RequestContext;

  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly details?: unknown,
    context?: RequestContext
  ) {
    super(message);
    this.name = 'PortError';
    this.context = context;
    Object.setPrototypeOf(this, PortError.prototype);
  }

  /**
   * Get formatted error context for logging
   */
  getContext(): string {
    if (!this.context) return '';
    const parts: string[] = [];
    if (this.context.method) parts.push(`${this.context.method}`);
    if (this.context.url) parts.push(`${this.context.url}`);
    if (this.context.requestId) parts.push(`[${this.context.requestId}]`);
    return parts.join(' ');
  }
}

/**
 * Authentication error (401)
 */
export class PortAuthError extends PortError {
  constructor(message: string, details?: unknown, context?: RequestContext) {
    super(message, 'AUTH_ERROR', 401, details, context);
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
    details?: unknown,
    context?: RequestContext
  ) {
    super(message, 'FORBIDDEN', 403, details, context);
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
    details?: unknown,
    context?: RequestContext
  ) {
    super(
      `${resource} with identifier "${identifier}" not found`,
      'NOT_FOUND',
      404,
      details,
      context
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
    public readonly validationErrors: ValidationError[],
    context?: RequestContext
  ) {
    super(message, 'VALIDATION_ERROR', 422, validationErrors, context);
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
    details?: unknown,
    context?: RequestContext
  ) {
    super(message, 'RATE_LIMIT', 429, details, context);
    this.name = 'PortRateLimitError';
    Object.setPrototypeOf(this, PortRateLimitError.prototype);
  }
}

/**
 * Server error (5xx)
 */
export class PortServerError extends PortError {
  constructor(message: string, statusCode: number, details?: unknown, context?: RequestContext) {
    super(message, 'SERVER_ERROR', statusCode, details, context);
    this.name = 'PortServerError';
    Object.setPrototypeOf(this, PortServerError.prototype);
  }
}

/**
 * Network error (no response)
 */
export class PortNetworkError extends PortError {
  constructor(message: string, public readonly originalError?: Error, context?: RequestContext) {
    super(message, 'NETWORK_ERROR', undefined, originalError, context);
    this.name = 'PortNetworkError';
    Object.setPrototypeOf(this, PortNetworkError.prototype);
  }
}

/**
 * Timeout error (408)
 */
export class PortTimeoutError extends PortError {
  constructor(message: string, public readonly timeout: number, context?: RequestContext) {
    super(message, 'TIMEOUT', 408, { timeout }, context);
    this.name = 'PortTimeoutError';
    Object.setPrototypeOf(this, PortTimeoutError.prototype);
  }
}

