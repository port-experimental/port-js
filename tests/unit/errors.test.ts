/**
 * Unit tests for error classes
 */

import { describe, it, expect } from 'vitest';
import {
  PortError,
  PortAuthError,
  PortForbiddenError,
  PortNotFoundError,
  PortValidationError,
  PortRateLimitError,
  PortServerError,
  PortNetworkError,
  PortTimeoutError,
} from '../../src/errors';

describe('Error Classes', () => {
  describe('PortError', () => {
    it('should create basic error', () => {
      const error = new PortError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PortError);
      expect(error.name).toBe('PortError');
      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with code', () => {
      const error = new PortError('Test error', 'TEST_CODE');

      expect(error.code).toBe('TEST_CODE');
    });

    it('should create error with status code', () => {
      const error = new PortError('Test error', 'TEST_CODE', 500);

      expect(error.statusCode).toBe(500);
    });

    it('should create error with details', () => {
      const details = { field: 'test', value: 123 };
      const error = new PortError('Test error', 'TEST_CODE', 500, details);

      expect(error.details).toEqual(details);
    });

    it('should have stack trace', () => {
      const error = new PortError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('PortError');
    });
  });

  describe('PortAuthError', () => {
    it('should create authentication error', () => {
      const error = new PortAuthError('Invalid credentials');

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortAuthError);
      expect(error.name).toBe('PortAuthError');
      expect(error.message).toBe('Invalid credentials');
      expect(error.code).toBe('AUTH_ERROR');
      expect(error.statusCode).toBe(401);
    });

    it('should accept custom details', () => {
      const details = { reason: 'token_expired' };
      const error = new PortAuthError('Token expired', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('PortForbiddenError', () => {
    it('should create forbidden error', () => {
      const error = new PortForbiddenError('Access denied', 'blueprints');

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortForbiddenError);
      expect(error.name).toBe('PortForbiddenError');
      expect(error.message).toBe('Access denied');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error.resource).toBe('blueprints');
    });

    it('should accept optional details', () => {
      const details = { requiredPermission: 'write:blueprints' };
      const error = new PortForbiddenError('No permission', 'blueprints', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('PortNotFoundError', () => {
    it('should create not found error', () => {
      const error = new PortNotFoundError('entity', 'my-service');

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortNotFoundError);
      expect(error.name).toBe('PortNotFoundError');
      expect(error.message).toBe('entity with identifier "my-service" not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.resource).toBe('entity');
      expect(error.identifier).toBe('my-service');
    });

    it('should accept optional details', () => {
      const details = { blueprint: 'service' };
      const error = new PortNotFoundError('entity', 'my-service', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('PortValidationError', () => {
    it('should create validation error', () => {
      const validationErrors = [
        { field: 'identifier', message: 'Required field' },
        { field: 'title', message: 'Must be at least 3 characters' },
      ];
      const error = new PortValidationError('Validation failed', validationErrors);

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortValidationError);
      expect(error.name).toBe('PortValidationError');
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(422);
      expect(error.validationErrors).toEqual(validationErrors);
    });

    it('should handle single validation error', () => {
      const error = new PortValidationError('Invalid identifier', [
        { field: 'identifier', message: 'Invalid format' },
      ]);

      expect(error.validationErrors).toHaveLength(1);
    });

    it('should handle empty validation errors', () => {
      const error = new PortValidationError('Validation failed', []);

      expect(error.validationErrors).toEqual([]);
    });
  });

  describe('PortRateLimitError', () => {
    it('should create rate limit error', () => {
      const retryAfter = 60;
      const error = new PortRateLimitError('Rate limit exceeded', retryAfter);

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortRateLimitError);
      expect(error.name).toBe('PortRateLimitError');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT');
      expect(error.statusCode).toBe(429);
      expect(error.retryAfter).toBe(60);
    });

    it('should accept optional details', () => {
      const details = { limit: 100, remaining: 0 };
      const error = new PortRateLimitError('Rate limit exceeded', 30, details);

      expect(error.details).toEqual(details);
    });
  });

  describe('PortServerError', () => {
    it('should create server error', () => {
      const error = new PortServerError('Internal server error', 500);

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortServerError);
      expect(error.name).toBe('PortServerError');
      expect(error.message).toBe('Internal server error');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.statusCode).toBe(500);
    });

    it('should accept different status codes', () => {
      const error502 = new PortServerError('Bad Gateway', 502);
      const error503 = new PortServerError('Service Unavailable', 503);

      expect(error502.statusCode).toBe(502);
      expect(error503.statusCode).toBe(503);
    });

    it('should accept optional details', () => {
      const details = { requestId: '123-456' };
      const error = new PortServerError('Server error', 500, details);

      expect(error.details).toEqual(details);
    });
  });

  describe('PortNetworkError', () => {
    it('should create network error', () => {
      const originalError = new Error('ECONNREFUSED');
      const error = new PortNetworkError('Network request failed', originalError);

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortNetworkError);
      expect(error.name).toBe('PortNetworkError');
      expect(error.message).toBe('Network request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.originalError).toBe(originalError);
    });

    it('should preserve original error details', () => {
      const originalError = new Error('Connection timeout');
      originalError.name = 'TimeoutError';
      const error = new PortNetworkError('Request failed', originalError);

      expect(error.originalError?.name).toBe('TimeoutError');
      expect(error.originalError?.message).toBe('Connection timeout');
    });
  });

  describe('PortTimeoutError', () => {
    it('should create timeout error', () => {
      const timeout = 30000;
      const error = new PortTimeoutError('Request timed out', timeout);

      expect(error).toBeInstanceOf(PortError);
      expect(error).toBeInstanceOf(PortTimeoutError);
      expect(error.name).toBe('PortTimeoutError');
      expect(error.message).toBe('Request timed out');
      expect(error.code).toBe('TIMEOUT');
      expect(error.statusCode).toBe(408);
      expect(error.timeout).toBe(30000);
    });

    it('should handle different timeout values', () => {
      const error1 = new PortTimeoutError('Timeout', 5000);
      const error2 = new PortTimeoutError('Timeout', 60000);

      expect(error1.timeout).toBe(5000);
      expect(error2.timeout).toBe(60000);
    });
  });

  describe('Error Inheritance', () => {
    it('should maintain proper instanceof chain', () => {
      const authError = new PortAuthError('Auth failed');

      expect(authError instanceof Error).toBe(true);
      expect(authError instanceof PortError).toBe(true);
      expect(authError instanceof PortAuthError).toBe(true);
    });

    it('should maintain proper instanceof chain for all errors', () => {
      const errors = [
        new PortAuthError('Auth'),
        new PortForbiddenError('Forbidden', 'resource'),
        new PortNotFoundError('entity', 'id'),
        new PortValidationError('Invalid', []),
        new PortRateLimitError('Rate limit', 60),
        new PortServerError('Server', 500),
        new PortNetworkError('Network', new Error()),
        new PortTimeoutError('Timeout', 30000),
      ];

      errors.forEach(error => {
        expect(error instanceof Error).toBe(true);
        expect(error instanceof PortError).toBe(true);
      });
    });
  });
});

