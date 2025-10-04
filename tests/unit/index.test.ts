/**
 * Unit tests for main index.ts exports
 * Ensures public API is correctly exported
 */

import { describe, it, expect } from 'vitest';
import * as PortSDK from '../../src/index';

describe('Port SDK Exports', () => {
  describe('Main Client', () => {
    it('should export PortClient', () => {
      expect(PortSDK.PortClient).toBeDefined();
      expect(typeof PortSDK.PortClient).toBe('function');
    });

    it('should be able to instantiate PortClient', () => {
      const client = new PortSDK.PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortSDK.PortClient);
    });
  });

  describe('Error Classes', () => {
    it('should export PortError', () => {
      expect(PortSDK.PortError).toBeDefined();
      expect(typeof PortSDK.PortError).toBe('function');
    });

    it('should export PortAuthError', () => {
      expect(PortSDK.PortAuthError).toBeDefined();
      expect(typeof PortSDK.PortAuthError).toBe('function');
    });

    it('should export PortForbiddenError', () => {
      expect(PortSDK.PortForbiddenError).toBeDefined();
      expect(typeof PortSDK.PortForbiddenError).toBe('function');
    });

    it('should export PortNotFoundError', () => {
      expect(PortSDK.PortNotFoundError).toBeDefined();
      expect(typeof PortSDK.PortNotFoundError).toBe('function');
    });

    it('should export PortValidationError', () => {
      expect(PortSDK.PortValidationError).toBeDefined();
      expect(typeof PortSDK.PortValidationError).toBe('function');
    });

    it('should export PortRateLimitError', () => {
      expect(PortSDK.PortRateLimitError).toBeDefined();
      expect(typeof PortSDK.PortRateLimitError).toBe('function');
    });

    it('should export PortServerError', () => {
      expect(PortSDK.PortServerError).toBeDefined();
      expect(typeof PortSDK.PortServerError).toBe('function');
    });

    it('should export PortNetworkError', () => {
      expect(PortSDK.PortNetworkError).toBeDefined();
      expect(typeof PortSDK.PortNetworkError).toBe('function');
    });

    it('should export PortTimeoutError', () => {
      expect(PortSDK.PortTimeoutError).toBeDefined();
      expect(typeof PortSDK.PortTimeoutError).toBe('function');
    });
  });

  describe('Logger', () => {
    it('should export Logger class', () => {
      expect(PortSDK.Logger).toBeDefined();
      expect(typeof PortSDK.Logger).toBe('function');
    });

    it('should export LogLevel enum', () => {
      expect(PortSDK.LogLevel).toBeDefined();
      expect(PortSDK.LogLevel.ERROR).toBe(0);
      expect(PortSDK.LogLevel.WARN).toBe(1);
      expect(PortSDK.LogLevel.INFO).toBe(2);
      expect(PortSDK.LogLevel.DEBUG).toBe(3);
      expect(PortSDK.LogLevel.TRACE).toBe(4);
    });

    it('should export createLogger function', () => {
      expect(PortSDK.createLogger).toBeDefined();
      expect(typeof PortSDK.createLogger).toBe('function');
    });

    it('should export parseLogLevel function', () => {
      expect(PortSDK.parseLogLevel).toBeDefined();
      expect(typeof PortSDK.parseLogLevel).toBe('function');
    });
  });

  describe('Error instantiation', () => {
    it('should create PortError instances', () => {
      const error = new PortSDK.PortError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PortSDK.PortError);
      expect(error.message).toBe('Test error');
    });

    it('should create PortAuthError instances', () => {
      const error = new PortSDK.PortAuthError('Auth failed');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PortSDK.PortError);
      expect(error).toBeInstanceOf(PortSDK.PortAuthError);
      expect(error.statusCode).toBe(401);
    });

    it('should create PortNotFoundError instances', () => {
      const error = new PortSDK.PortNotFoundError('entity', 'test-123');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PortSDK.PortError);
      expect(error).toBeInstanceOf(PortSDK.PortNotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.resource).toBe('entity');
      expect(error.identifier).toBe('test-123');
    });

    it('should create PortValidationError instances', () => {
      const errors = [{ field: 'name', message: 'Required' }];
      const error = new PortSDK.PortValidationError('Validation failed', errors);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(PortSDK.PortError);
      expect(error).toBeInstanceOf(PortSDK.PortValidationError);
      expect(error.statusCode).toBe(422);
      expect(error.validationErrors).toEqual(errors);
    });
  });

  describe('Logger usage', () => {
    it('should create logger with createLogger', () => {
      const logger = PortSDK.createLogger({ level: PortSDK.LogLevel.INFO });
      expect(logger).toBeInstanceOf(PortSDK.Logger);
    });

    it('should parse log levels with parseLogLevel', () => {
      expect(PortSDK.parseLogLevel('error')).toBe(PortSDK.LogLevel.ERROR);
      expect(PortSDK.parseLogLevel('warn')).toBe(PortSDK.LogLevel.WARN);
      expect(PortSDK.parseLogLevel('info')).toBe(PortSDK.LogLevel.INFO);
      expect(PortSDK.parseLogLevel('debug')).toBe(PortSDK.LogLevel.DEBUG);
      expect(PortSDK.parseLogLevel('trace')).toBe(PortSDK.LogLevel.TRACE);
    });
  });
});

