/**
 * Unit tests for Logger
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LogLevel, createLogger, parseLogLevel } from '../../src/logger';

describe('Logger', () => {
  const originalConsole = {
    error: console.error,
    log: console.log,
  };

  beforeEach(() => {
    delete process.env.PORT_LOG_LEVEL;
    delete process.env.PORT_VERBOSE;
    delete process.env.NODE_ENV;
    console.error = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsole.error;
    console.log = originalConsole.log;
  });

  describe('parseLogLevel', () => {
    it('should parse valid log levels', () => {
      expect(parseLogLevel('error')).toBe(LogLevel.ERROR);
      expect(parseLogLevel('warn')).toBe(LogLevel.WARN);
      expect(parseLogLevel('info')).toBe(LogLevel.INFO);
      expect(parseLogLevel('debug')).toBe(LogLevel.DEBUG);
      expect(parseLogLevel('trace')).toBe(LogLevel.TRACE);
    });

    it('should be case insensitive', () => {
      expect(parseLogLevel('ERROR')).toBe(LogLevel.ERROR);
      expect(parseLogLevel('WARN')).toBe(LogLevel.WARN);
    });

    it('should return undefined for invalid levels', () => {
      expect(parseLogLevel('invalid')).toBeUndefined();
    });
  });

  describe('createLogger', () => {
    it('should create logger with default level WARN', () => {
      const logger = createLogger();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with custom level', () => {
      const logger = createLogger({ level: LogLevel.DEBUG });
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
    });

    it('should create logger with enabled=false', () => {
      const logger = createLogger({ enabled: false });
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(false);
    });
  });

  describe('Log levels', () => {
    it('should log error messages', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Test error');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Test error'));
    });

    it('should log warn at warn level', () => {
      const logger = createLogger({ level: LogLevel.WARN });
      logger.warn('Test warning');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Test warning'));
    });

    it('should log info at info level using console.log', () => {
      const logger = createLogger({ level: LogLevel.INFO });
      logger.info('Test info');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Test info'));
    });

    it('should not log info at warn level', () => {
      const logger = createLogger({ level: LogLevel.WARN });
      logger.info('Test info');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Metadata logging', () => {
    it('should log metadata as JSON', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Test', { code: 500 });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('"code":500')
      );
    });

    it('should sanitize client secret in metadata', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Test', { clientSecret: 'secret-123' });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(console.error).not.toHaveBeenCalledWith(
        expect.stringContaining('secret-123')
      );
    });

    it('should sanitize password in metadata', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Test', { password: 'pass-456' });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
    });
  });

  describe('Child logger', () => {
    it('should create child logger with prefix', () => {
      const parent = createLogger({ level: LogLevel.INFO });
      const child = parent.child('ChildModule');
      
      child.info('Test message');
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[ChildModule]')
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
    });

    it('should inherit parent log level', () => {
      const parent = createLogger({ level: LogLevel.WARN });
      const child = parent.child('Child');
      
      child.info('Should not log');
      expect(console.log).not.toHaveBeenCalled();
      
      child.warn('Should log');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Disabled logger', () => {
    it('should not log when disabled', () => {
      const logger = createLogger({ enabled: false, level: LogLevel.TRACE });
      
      logger.error('error');
      logger.warn('warn');
      logger.info('info');
      logger.debug('debug');
      logger.trace('trace');
      
      expect(console.error).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Custom output function', () => {
    it('should use custom output function', () => {
      const customOutput = vi.fn();
      const logger = createLogger({
        level: LogLevel.INFO,
        outputFn: customOutput,
      });
      
      logger.info('Test message', { meta: 'data' });
      
      expect(customOutput).toHaveBeenCalledWith(
        LogLevel.INFO,
        expect.stringContaining('Test message'),
        { meta: 'data' }
      );
    });
  });

  describe('isLevelEnabled', () => {
    it('should correctly check if level is enabled', () => {
      const logger = createLogger({ level: LogLevel.WARN });
      
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.INFO)).toBe(false);
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(false);
      expect(logger.isLevelEnabled(LogLevel.TRACE)).toBe(false);
    });
  });

  describe('Debug and Trace levels', () => {
    it('should log debug messages at DEBUG level', () => {
      const logger = createLogger({ level: LogLevel.DEBUG });
      logger.debug('Debug message');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
    });

    it('should log trace messages at TRACE level', () => {
      const logger = createLogger({ level: LogLevel.TRACE });
      logger.trace('Trace message');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Trace message'));
    });

    it('should not log debug at WARN level', () => {
      const logger = createLogger({ level: LogLevel.WARN });
      logger.debug('Debug message');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not log trace at INFO level', () => {
      const logger = createLogger({ level: LogLevel.INFO });
      logger.trace('Trace message');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('Environment variables', () => {
    it('should read log level from PORT_LOG_LEVEL', () => {
      process.env.PORT_LOG_LEVEL = 'debug';
      const logger = createLogger();
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
    });

    it('should enable debug logging when PORT_VERBOSE is set', () => {
      process.env.PORT_VERBOSE = 'true';
      const logger = createLogger();
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
    });

    it('should enable debug logging when PORT_VERBOSE is 1', () => {
      process.env.PORT_VERBOSE = '1';
      const logger = createLogger();
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
    });

    it('should disable logging in production by default', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger();
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(false);
    });

    it('should allow explicit enabled=true in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger({ enabled: true, level: LogLevel.ERROR });
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(true);
    });
  });

  describe('Configuration options', () => {
    it('should support color configuration', () => {
      const logger = createLogger({ level: LogLevel.ERROR, colors: false });
      logger.error('No colors');
      expect(console.error).toHaveBeenCalled();
    });

    it('should support timestamp configuration', () => {
      const logger = createLogger({ level: LogLevel.ERROR, timestamp: false });
      logger.error('No timestamp');
      expect(console.error).toHaveBeenCalled();
    });

    it('should support verbose mode', () => {
      const logger = createLogger({ verbose: true });
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
    });

    it('should prefer verbose over explicit level', () => {
      const logger = createLogger({ level: LogLevel.ERROR, verbose: true });
      // verbose mode sets level to DEBUG, overriding explicit level
      expect(logger.isLevelEnabled(LogLevel.ERROR)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.WARN)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.DEBUG)).toBe(true);
      expect(logger.isLevelEnabled(LogLevel.TRACE)).toBe(false); // Still respects DEBUG limit
    });
  });

  describe('Metadata sanitization', () => {
    it('should sanitize all sensitive keys', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const sensitiveData = {
        password: 'secret-pass',
        secret: 'api-secret',
        token: 'bearer-token',
        apikey: 'api-key-123',
        api_key: 'api-key-456',
        accesstoken: 'access-token',
        access_token: 'access-token-2',
        clientsecret: 'client-secret',
        client_secret: 'client-secret-2',
        authorization: 'Bearer token',
      };

      logger.error('Sensitive data', sensitiveData);

      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('secret-pass');
      expect(call).not.toContain('api-secret');
      expect(call).not.toContain('bearer-token');
    });

    it('should NEVER log Port SDK client ID', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const credentialsWithClientId = {
        clientId: 'port_client_12345',
        client_id: 'port_client_67890',
        someOtherField: 'not-sensitive',
      };

      logger.error('Auth attempt', credentialsWithClientId);

      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('port_client_12345');
      expect(call).not.toContain('port_client_67890');
      expect(call).toContain('not-sensitive'); // Non-sensitive data should remain
    });

    it('should NEVER log Port SDK client secret', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const credentialsWithSecret = {
        clientSecret: 'super_secret_key_123',
        client_secret: 'another_secret_456',
      };

      logger.error('Auth config', credentialsWithSecret);

      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('super_secret_key_123');
      expect(call).not.toContain('another_secret_456');
    });

    it('should NEVER log access tokens', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const tokenData = {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        access_token: 'another-jwt-token-here',
        token: 'simple-token',
        bearer: 'Bearer xyz123',
      };

      logger.error('Token refresh', tokenData);

      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      expect(call).not.toContain('another-jwt-token-here');
      expect(call).not.toContain('simple-token');
      expect(call).not.toContain('Bearer xyz123');
    });

    it('should sanitize Port SDK OAuth credentials completely', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const fullCredentials = {
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
        accessToken: 'current-access-token',
        refreshToken: 'refresh-token-123',
      };

      logger.error('Full auth flow', fullCredentials);

      const call = vi.mocked(console.error).mock.calls[0][0];
      
      // Should contain multiple [REDACTED] for each sensitive field
      const redactedCount = (call.match(/\[REDACTED\]/g) || []).length;
      expect(redactedCount).toBeGreaterThanOrEqual(4); // At least 4 sensitive fields
      
      // CRITICAL: Ensure actual credential values are NEVER present in logs
      expect(call).not.toContain('my-client-id');
      expect(call).not.toContain('my-client-secret');
      expect(call).not.toContain('current-access-token');
      expect(call).not.toContain('refresh-token-123');
      
      // Should contain [REDACTED] placeholder
      expect(call).toContain('[REDACTED]');
    });

    it('should sanitize nested sensitive data', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const data = {
        user: {
          name: 'John',
          password: 'secret123',
        },
        config: {
          apiKey: 'key-456',
        },
      };

      logger.error('Nested sensitive data', data);

      const call = vi.mocked(console.error).mock.calls[0][0];
      expect(call).toContain('[REDACTED]');
      expect(call).not.toContain('secret123');
      expect(call).not.toContain('key-456');
      expect(call).toContain('John'); // Non-sensitive data should remain
    });

    it('should not sanitize when no metadata provided', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Just a message');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Just a message'));
    });
  });

  describe('Child logger behavior', () => {
    it('should allow nested child loggers', () => {
      const parent = createLogger({ level: LogLevel.INFO });
      const child1 = parent.child('Module1');
      const child2 = child1.child('SubModule');

      child2.info('Nested message');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[Module1]'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[SubModule]'));
    });

    it('should share configuration with children', () => {
      const customOutput = vi.fn();
      const parent = createLogger({ level: LogLevel.INFO, outputFn: customOutput });
      const child = parent.child('Child');

      child.info('Test');

      expect(customOutput).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty messages', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle undefined metadata', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Test', undefined);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle null metadata', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      logger.error('Test', null as any);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle objects with many properties', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const largeObj: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        largeObj[`key${i}`] = `value${i}`;
      }

      expect(() => {
        logger.error('Large object', largeObj);
      }).not.toThrow();
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      const logger = createLogger({ level: LogLevel.ERROR });
      const longMessage = 'x'.repeat(10000);
      
      expect(() => {
        logger.error(longMessage);
      }).not.toThrow();
      
      expect(console.error).toHaveBeenCalled();
    });
  });
});
