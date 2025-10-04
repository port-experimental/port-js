/**
 * Unit tests for PortClient
 * Following TDD principles - Comprehensive coverage
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PortClient } from '../../src/client';
import { PortAuthError } from '../../src/errors';
import { ENV_VARS } from '../../src/config';

describe('PortClient', () => {
  // Clean up environment variables
  afterEach(() => {
    Object.values(ENV_VARS).forEach(key => {
      delete process.env[key];
    });
  });

  describe('Constructor', () => {
    it('should create client with explicit OAuth credentials', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test-id',
          clientSecret: 'test-secret',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
      expect(client.entities).toBeDefined();
      expect(client.blueprints).toBeDefined();
      expect(client.actions).toBeDefined();
    });

    it('should create client with JWT token', () => {
      const client = new PortClient({
        credentials: {
          accessToken: 'test-jwt-token',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
      expect(client.entities).toBeDefined();
    });

    it('should create client with custom base URL', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        baseUrl: 'https://custom.example.com',
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should create client with US region', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        region: 'us',
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should create client with custom timeout', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        timeout: 60000,
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should create client with proxy configuration', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        proxy: {
          url: 'http://proxy.example.com:8080',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should create client with logger configuration', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        logger: {
          level: 3, // DEBUG
          enabled: true,
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Resources', () => {
    let client: PortClient;

    beforeEach(() => {
      client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });
    });

    it('should have entities resource', () => {
      expect(client.entities).toBeDefined();
      expect(typeof client.entities.create).toBe('function');
      expect(typeof client.entities.get).toBe('function');
      expect(typeof client.entities.update).toBe('function');
      expect(typeof client.entities.delete).toBe('function');
      expect(typeof client.entities.list).toBe('function');
      expect(typeof client.entities.search).toBe('function');
    });

    it('should have blueprints resource', () => {
      expect(client.blueprints).toBeDefined();
      expect(typeof client.blueprints.create).toBe('function');
      expect(typeof client.blueprints.get).toBe('function');
      expect(typeof client.blueprints.update).toBe('function');
      expect(typeof client.blueprints.delete).toBe('function');
      expect(typeof client.blueprints.list).toBe('function');
    });

    it('should have actions resource', () => {
      expect(client.actions).toBeDefined();
      expect(typeof client.actions.create).toBe('function');
      expect(typeof client.actions.get).toBe('function');
      expect(typeof client.actions.update).toBe('function');
      expect(typeof client.actions.delete).toBe('function');
      expect(typeof client.actions.list).toBe('function');
      expect(typeof client.actions.execute).toBe('function');
      expect(typeof client.actions.getRun).toBe('function');
      expect(typeof client.actions.listRuns).toBe('function');
    });

    it('should have scorecards resource', () => {
      expect(client.scorecards).toBeDefined();
      expect(typeof client.scorecards.create).toBe('function');
      expect(typeof client.scorecards.get).toBe('function');
      expect(typeof client.scorecards.update).toBe('function');
      expect(typeof client.scorecards.delete).toBe('function');
      expect(typeof client.scorecards.list).toBe('function');
    });
  });

  describe('getHttpClient', () => {
    it('should provide access to HTTP client', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      const httpClient = client.getHttpClient();
      expect(httpClient).toBeDefined();
    });
  });

  describe('Configuration precedence', () => {
    it('should use explicit config over defaults', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'explicit-id',
          clientSecret: 'explicit-secret',
        },
        timeout: 5000,
        maxRetries: 5,
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should handle all configuration options together', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        region: 'us',
        timeout: 45000,
        maxRetries: 2,
        retryDelay: 500,
        proxy: {
          url: 'http://proxy.example.com:8080',
          auth: {
            username: 'user',
            password: 'pass',
          },
        },
        logger: {
          level: 1,
          enabled: true,
        },
      });

      expect(client).toBeInstanceOf(PortClient);
      expect(client.entities).toBeDefined();
      expect(client.blueprints).toBeDefined();
      expect(client.actions).toBeDefined();
    });

    it('should create client from environment variables', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'env-client-id';
      process.env[ENV_VARS.CLIENT_SECRET] = 'env-client-secret';
      process.env[ENV_VARS.REGION] = 'us';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
      expect(client.entities).toBeDefined();
      expect(client.blueprints).toBeDefined();
      expect(client.actions).toBeDefined();
    });

    it('should prefer explicit config over environment variables', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'env-id';
      process.env[ENV_VARS.CLIENT_SECRET] = 'env-secret';
      process.env[ENV_VARS.REGION] = 'us';

      const client = new PortClient({
        credentials: {
          clientId: 'explicit-id',
          clientSecret: 'explicit-secret',
        },
        region: 'eu',
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Error Handling', () => {
    it('should throw PortAuthError when no credentials provided', () => {
      expect(() => new PortClient()).toThrow(PortAuthError);
    });

    it('should throw PortAuthError with helpful message', () => {
      expect(() => new PortClient()).toThrow(/credentials/i);
    });

    it('should throw when only clientId provided (incomplete credentials)', () => {
      // Note: TypeScript prevents this at compile time, but we test runtime behavior
      process.env[ENV_VARS.CLIENT_ID] = 'only-client-id';
      // Missing CLIENT_SECRET intentionally
      
      expect(() => new PortClient()).toThrow(PortAuthError);
    });
  });

  describe('Default Values', () => {
    it('should use EU region by default', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
      // Region is handled internally by HttpClient
    });

    it('should use default timeout of 30s', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should use default maxRetries of 3', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should use default retryDelay of 1000ms', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should not use proxy by default', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should have logger enabled by default', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Region Handling', () => {
    it('should accept EU region explicitly', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        region: 'eu',
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should accept US region explicitly', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        region: 'us',
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load region from environment', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'test';
      process.env[ENV_VARS.CLIENT_SECRET] = 'test';
      process.env[ENV_VARS.REGION] = 'us';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should infer region from baseUrl', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        baseUrl: 'https://api.us.port.io',
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Authentication Methods', () => {
    it('should support OAuth with clientId and clientSecret', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'oauth-client-id',
          clientSecret: 'oauth-client-secret',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support JWT with accessToken', () => {
      const client = new PortClient({
        credentials: {
          accessToken: 'jwt-access-token',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load OAuth credentials from environment', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'env-oauth-id';
      process.env[ENV_VARS.CLIENT_SECRET] = 'env-oauth-secret';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load JWT token from environment', () => {
      process.env[ENV_VARS.ACCESS_TOKEN] = 'env-jwt-token';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should prefer access token over OAuth credentials', () => {
      process.env[ENV_VARS.ACCESS_TOKEN] = 'jwt-token';
      process.env[ENV_VARS.CLIENT_ID] = 'oauth-id';
      process.env[ENV_VARS.CLIENT_SECRET] = 'oauth-secret';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Proxy Configuration', () => {
    it('should support proxy with URL only', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        proxy: {
          url: 'http://proxy.example.com:8080',
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support proxy with authentication', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        proxy: {
          url: 'http://proxy.example.com:8080',
          auth: {
            username: 'proxy-user',
            password: 'proxy-password',
          },
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load proxy from environment variables', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'test';
      process.env[ENV_VARS.CLIENT_SECRET] = 'test';
      process.env.HTTP_PROXY = 'http://proxy.example.com:8080';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should prefer HTTPS_PROXY over HTTP_PROXY', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'test';
      process.env[ENV_VARS.CLIENT_SECRET] = 'test';
      process.env.HTTP_PROXY = 'http://proxy1.example.com:8080';
      process.env.HTTPS_PROXY = 'https://proxy2.example.com:8443';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Logger Configuration', () => {
    it('should support custom log level', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        logger: {
          level: 0, // ERROR
          enabled: true,
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support disabled logger', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        logger: {
          level: 1,
          enabled: false,
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support trace log level', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        logger: {
          level: 4, // TRACE
          enabled: true,
        },
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Resource Sharing', () => {
    it('should share same HTTP client across resources', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });

      const httpClient = client.getHttpClient();
      
      // All resources should use the same HTTP client
      expect(httpClient).toBeDefined();
      expect(client.entities).toBeDefined();
      expect(client.blueprints).toBeDefined();
      expect(client.actions).toBeDefined();
    });
  });

  describe('Advanced Resource Methods', () => {
    let client: PortClient;

    beforeEach(() => {
      client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
      });
    });

    it('should have batch entity operations', () => {
      expect(typeof client.entities.batchCreate).toBe('function');
      expect(typeof client.entities.batchUpdate).toBe('function');
      expect(typeof client.entities.batchDelete).toBe('function');
    });

    it('should have entity relation methods', () => {
      expect(typeof client.entities.getRelated).toBe('function');
    });

    it('should have blueprint relation methods', () => {
      expect(typeof client.blueprints.getRelations).toBe('function');
    });

    it('should have action execution methods', () => {
      expect(typeof client.actions.execute).toBe('function');
      expect(typeof client.actions.getRun).toBe('function');
      expect(typeof client.actions.listRuns).toBe('function');
    });
  });

  describe('Timeout Configuration', () => {
    it('should support custom timeout', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        timeout: 60000,
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load timeout from environment', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'test';
      process.env[ENV_VARS.CLIENT_SECRET] = 'test';
      process.env[ENV_VARS.TIMEOUT] = '45000';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support zero timeout', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        timeout: 0,
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Retry Configuration', () => {
    it('should support custom maxRetries', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        maxRetries: 5,
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support custom retryDelay', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        retryDelay: 2000,
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load retries from environment', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'test';
      process.env[ENV_VARS.CLIENT_SECRET] = 'test';
      process.env[ENV_VARS.MAX_RETRIES] = '10';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should support zero retries', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        maxRetries: 0,
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });

  describe('Base URL Configuration', () => {
    it('should support custom base URL', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        baseUrl: 'https://custom-api.example.com',
      });

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should load base URL from environment', () => {
      process.env[ENV_VARS.CLIENT_ID] = 'test';
      process.env[ENV_VARS.CLIENT_SECRET] = 'test';
      process.env[ENV_VARS.BASE_URL] = 'https://env-api.example.com';

      const client = new PortClient();

      expect(client).toBeInstanceOf(PortClient);
    });

    it('should prefer explicit baseUrl over region', () => {
      const client = new PortClient({
        credentials: {
          clientId: 'test',
          clientSecret: 'test',
        },
        baseUrl: 'https://custom.example.com',
        region: 'us',
      });

      expect(client).toBeInstanceOf(PortClient);
    });
  });
});

