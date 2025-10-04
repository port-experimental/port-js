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
});
