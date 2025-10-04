/**
 * Unit tests for configuration module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { REGION_BASE_URLS, resolveConfig, type PortRegion } from '../../src/config';
import { PortAuthError } from '../../src/errors';
import type { LogLevel } from '../../src/logger';

describe('Configuration', () => {
  describe('REGION_BASE_URLS', () => {
    it('should have correct EU base URL', () => {
      expect(REGION_BASE_URLS.eu).toBe('https://api.port.io');
    });

    it('should have correct US base URL', () => {
      expect(REGION_BASE_URLS.us).toBe('https://api.us.port.io');
    });
  });

  describe('resolveConfig', () => {
    // Save original env vars
    const originalEnv = { ...process.env };

    beforeEach(() => {
      // Clean environment before each test
      delete process.env.PORT_CLIENT_ID;
      delete process.env.PORT_CLIENT_SECRET;
      delete process.env.PORT_ACCESS_TOKEN;
      delete process.env.PORT_REGION;
      delete process.env.PORT_BASE_URL;
    });

    afterEach(() => {
      // Restore original environment
      process.env = { ...originalEnv };
    });

    describe('Credentials', () => {
      it('should throw error when no credentials provided', () => {
        expect(() => {
          resolveConfig({ loadEnv: false });
        }).toThrow(PortAuthError);
      });

      it('should accept OAuth credentials from config', () => {
        const config = resolveConfig({
          credentials: {
            clientId: 'test-id',
            clientSecret: 'test-secret',
          },
          loadEnv: false,
        });

        expect(config.credentials).toEqual({
          clientId: 'test-id',
          clientSecret: 'test-secret',
        });
      });

      it('should accept JWT token from config', () => {
        const config = resolveConfig({
          credentials: {
            accessToken: 'test-token',
          },
          loadEnv: false,
        });

        expect(config.credentials).toEqual({
          accessToken: 'test-token',
        });
      });

      it('should load OAuth credentials from environment', () => {
        process.env.PORT_CLIENT_ID = 'env-id';
        process.env.PORT_CLIENT_SECRET = 'env-secret';

        const config = resolveConfig({ loadEnv: false });

        expect(config.credentials).toEqual({
          clientId: 'env-id',
          clientSecret: 'env-secret',
        });
      });

      it('should load JWT token from environment', () => {
        process.env.PORT_ACCESS_TOKEN = 'env-token';

        const config = resolveConfig({ loadEnv: false });

        expect(config.credentials).toEqual({
          accessToken: 'env-token',
        });
      });

      it('should prefer config credentials over environment', () => {
        process.env.PORT_CLIENT_ID = 'env-id';
        process.env.PORT_CLIENT_SECRET = 'env-secret';

        const config = resolveConfig({
          credentials: {
            clientId: 'config-id',
            clientSecret: 'config-secret',
          },
          loadEnv: false,
        });

        expect(config.credentials).toEqual({
          clientId: 'config-id',
          clientSecret: 'config-secret',
        });
      });
    });

    describe('Region and Base URL', () => {
      const credentials = { clientId: 'test', clientSecret: 'test' };

      it('should default to EU region when not specified', () => {
        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.region).toBe('eu');
        expect(config.baseUrl).toBe('https://api.port.io');
      });

      it('should use EU region when explicitly set', () => {
        const config = resolveConfig({
          credentials,
          region: 'eu',
          loadEnv: false,
        });

        expect(config.region).toBe('eu');
        expect(config.baseUrl).toBe('https://api.port.io');
      });

      it('should use US region when explicitly set', () => {
        const config = resolveConfig({
          credentials,
          region: 'us',
          loadEnv: false,
        });

        expect(config.region).toBe('us');
        expect(config.baseUrl).toBe('https://api.us.port.io');
      });

      it('should use explicit EU base URL', () => {
        const config = resolveConfig({
          credentials,
          baseUrl: 'https://api.port.io',
          loadEnv: false,
        });

        expect(config.baseUrl).toBe('https://api.port.io');
        expect(config.region).toBe('eu');
      });

      it('should use explicit US base URL', () => {
        const config = resolveConfig({
          credentials,
          baseUrl: 'https://api.us.port.io',
          loadEnv: false,
        });

        expect(config.baseUrl).toBe('https://api.us.port.io');
        expect(config.region).toBe('us');
      });

      it('should infer EU region from custom base URL', () => {
        const config = resolveConfig({
          credentials,
          baseUrl: 'https://custom.port.io',
          loadEnv: false,
        });

        expect(config.baseUrl).toBe('https://custom.port.io');
        expect(config.region).toBe('eu');
      });

      it('should infer US region from custom base URL', () => {
        const config = resolveConfig({
          credentials,
          baseUrl: 'https://api.us.port.io',
          loadEnv: false,
        });

        expect(config.region).toBe('us');
      });

      it('should load region from environment variable', () => {
        process.env.PORT_REGION = 'us';

        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.region).toBe('us');
        expect(config.baseUrl).toBe('https://api.us.port.io');
      });

      it('should prefer explicit region over environment', () => {
        process.env.PORT_REGION = 'us';

        const config = resolveConfig({
          credentials,
          region: 'eu',
          loadEnv: false,
        });

        expect(config.region).toBe('eu');
        expect(config.baseUrl).toBe('https://api.port.io');
      });

      it('should prefer explicit baseUrl over region', () => {
        const config = resolveConfig({
          credentials,
          baseUrl: 'https://api.us.port.io',
          region: 'eu', // This should be ignored
          loadEnv: false,
        });

        expect(config.baseUrl).toBe('https://api.us.port.io');
        expect(config.region).toBe('us');
      });
    });

    describe('Timeout and Retries', () => {
      const credentials = { clientId: 'test', clientSecret: 'test' };

      it('should use default timeout', () => {
        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.timeout).toBe(30000);
      });

      it('should use custom timeout from config', () => {
        const config = resolveConfig({
          credentials,
          timeout: 60000,
          loadEnv: false,
        });

        expect(config.timeout).toBe(60000);
      });

      it('should use default max retries', () => {
        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.maxRetries).toBe(3);
      });

      it('should use custom max retries from config', () => {
        const config = resolveConfig({
          credentials,
          maxRetries: 5,
          loadEnv: false,
        });

        expect(config.maxRetries).toBe(5);
      });

      it('should use default retry delay', () => {
        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.retryDelay).toBe(1000);
      });

      it('should use custom retry delay from config', () => {
        const config = resolveConfig({
          credentials,
          retryDelay: 2000,
          loadEnv: false,
        });

        expect(config.retryDelay).toBe(2000);
      });
    });

    describe('Proxy Configuration', () => {
      const credentials = { clientId: 'test', clientSecret: 'test' };

      beforeEach(() => {
        delete process.env.HTTP_PROXY;
        delete process.env.HTTPS_PROXY;
        delete process.env.NO_PROXY;
      });

      it('should not have proxy by default', () => {
        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.proxy).toBeUndefined();
      });

      it('should use explicit proxy configuration', () => {
        const config = resolveConfig({
          credentials,
          proxy: {
            url: 'http://proxy.example.com:8080',
          },
          loadEnv: false,
        });

        expect(config.proxy).toEqual({
          url: 'http://proxy.example.com:8080',
        });
      });

      it('should use proxy with authentication', () => {
        const config = resolveConfig({
          credentials,
          proxy: {
            url: 'http://proxy.example.com:8080',
            auth: {
              username: 'user',
              password: 'pass',
            },
          },
          loadEnv: false,
        });

        expect(config.proxy).toEqual({
          url: 'http://proxy.example.com:8080',
          auth: {
            username: 'user',
            password: 'pass',
          },
        });
      });
    });

    describe('Logger Configuration', () => {
      const credentials = { clientId: 'test', clientSecret: 'test' };

      it('should accept logger configuration', () => {
        const loggerConfig = {
          level: 'debug' as const,
          enabled: true,
        };

        const config = resolveConfig({
          credentials,
          logger: loggerConfig,
          loadEnv: false,
        });

        expect(config.logger).toEqual(loggerConfig);
      });

      it('should not have logger config by default', () => {
        const config = resolveConfig({
          credentials,
          loadEnv: false,
        });

        expect(config.logger).toBeUndefined();
      });
    });
  });
});

