/**
 * Unit tests for PortClient
 * Following TDD principles
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PortClient } from '../../src/client';

describe('PortClient', () => {
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
  });
});

