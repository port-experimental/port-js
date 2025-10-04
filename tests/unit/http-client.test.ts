/**
 * Comprehensive unit tests for HttpClient
 * Testing the most critical infrastructure component
 * Following TDD principles
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient, HttpClientConfig } from '../../src/http-client';
import {
  PortAuthError,
  PortNotFoundError,
  PortValidationError,
  PortRateLimitError,
  PortServerError,
  PortNetworkError,
  PortTimeoutError,
} from '../../src/errors';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('HttpClient', () => {
  let config: HttpClientConfig;

  beforeEach(() => {
    config = {
      credentials: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
      },
      baseUrl: 'https://api.port.io',
      timeout: 5000,
      maxRetries: 3,
      retryDelay: 100,
    };

    // Reset mocks
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with OAuth credentials', () => {
      const client = new HttpClient(config);
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should initialize with JWT credentials', () => {
      const jwtConfig = {
        ...config,
        credentials: {
          accessToken: 'test-jwt-token',
        },
      };
      const client = new HttpClient(jwtConfig);
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should initialize with proxy configuration', () => {
      const proxyConfig = {
        ...config,
        proxy: {
          url: 'http://proxy.example.com:8080',
        },
      };
      const client = new HttpClient(proxyConfig);
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should initialize with proxy authentication', () => {
      const proxyConfig = {
        ...config,
        proxy: {
          url: 'http://proxy.example.com:8080',
          auth: {
            username: 'proxy-user',
            password: 'proxy-pass',
          },
        },
      };
      const client = new HttpClient(proxyConfig);
      expect(client).toBeInstanceOf(HttpClient);
    });

    it('should initialize logger with custom config', () => {
      const loggerConfig = {
        ...config,
        logger: {
          level: 3,
          enabled: true,
        },
      };
      const client = new HttpClient(loggerConfig);
      expect(client).toBeInstanceOf(HttpClient);
    });
  });

  describe('Token Management - OAuth', () => {
    it('should fetch access token on first request', async () => {
      // Mock token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-access-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });

      // Mock actual request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      // First call: token request
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        'https://api.port.io/v1/auth/access_token',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
          }),
        })
      );
      // Second call: actual request with token
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        'https://api.port.io/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should reuse valid access token', async () => {
      // Mock token response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-access-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });

      // Mock two actual requests
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.get('/test1');
      await client.get('/test2');

      // Should only fetch token once
      expect(mockFetch).toHaveBeenCalledTimes(3); // 1 token + 2 requests
    });

    it('should refresh expired token', async () => {
      // Mock initial token (expires immediately)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'old-token',
          expiresIn: 0, // Expires immediately
          tokenType: 'Bearer',
        }),
      });

      // Mock first request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'first' }),
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Mock token refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'new-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });

      // Mock second request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'second' }),
      });

      const client = new HttpClient(config);
      await client.get('/test1');
      await client.get('/test2');

      expect(mockFetch).toHaveBeenCalledTimes(4); // 2 tokens + 2 requests
    });

    it('should throw PortAuthError on token fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow(PortAuthError);
    });
  });

  describe('Token Management - JWT', () => {
    it('should use provided JWT token', async () => {
      const jwtConfig = {
        ...config,
        credentials: {
          accessToken: 'provided-jwt-token',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(jwtConfig);
      await client.get('/test');

      // Should not fetch token, use provided one
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer provided-jwt-token',
          }),
        })
      );
    });
  });

  describe('GET Requests', () => {
    beforeEach(() => {
      // Mock token response for all tests
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should perform GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', name: 'Test' }),
      });

      const client = new HttpClient(config);
      const result = await client.get('/entities/123');

      expect(result).toEqual({ id: '123', name: 'Test' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/entities/123',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should include custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.get('/test', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('POST Requests', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should perform POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: '456', name: 'Created' }),
      });

      const client = new HttpClient(config);
      const result = await client.post('/entities', {
        name: 'New Entity',
        type: 'service',
      });

      expect(result).toEqual({ id: '456', name: 'Created' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/entities',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Entity', type: 'service' }),
        })
      );
    });
  });

  describe('PATCH Requests', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should perform PATCH request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', name: 'Updated' }),
      });

      const client = new HttpClient(config);
      const result = await client.patch('/entities/123', { name: 'Updated' });

      expect(result).toEqual({ id: '123', name: 'Updated' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/entities/123',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });

  describe('PUT Requests', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should perform PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: '123', name: 'Replaced' }),
      });

      const client = new HttpClient(config);
      const result = await client.put('/entities/123', { name: 'Replaced' });

      expect(result).toEqual({ id: '123', name: 'Replaced' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/entities/123',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  describe('DELETE Requests', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should perform DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => undefined,
      });

      const client = new HttpClient(config);
      await client.delete('/entities/123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.port.io/entities/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should throw PortAuthError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow(PortAuthError);
    });

    it('should throw PortNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/entities/999')).rejects.toThrow(PortNotFoundError);
    });

    it('should throw PortValidationError on 422', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'Validation failed',
          errors: [{ field: 'name', message: 'Required' }],
        }),
      });

      const client = new HttpClient(config);
      
      await expect(client.post('/entities', {})).rejects.toThrow(
        PortValidationError
      );
    });

    it('should throw PortRateLimitError on 429', async () => {
      // Mock rate limit responses (will retry)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: (name: string) => (name === 'Retry-After' ? '0' : null), // Short retry
        },
        json: async () => ({ message: 'Rate limit exceeded' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: (name: string) => (name === 'Retry-After' ? '0' : null),
        },
        json: async () => ({ message: 'Rate limit exceeded' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: {
          get: (name: string) => (name === 'Retry-After' ? '0' : null),
        },
        json: async () => ({ message: 'Rate limit exceeded' }),
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow(PortRateLimitError);
    });

    it('should throw PortServerError on 500', async () => {
      // Mock multiple server errors (will retry on 500)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => null },
        json: async () => ({ message: 'Internal server error' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => null },
        json: async () => ({ message: 'Internal server error' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => null },
        json: async () => ({ message: 'Internal server error' }),
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow(PortServerError);
    });

    it('should handle malformed error responses', async () => {
      // Mock multiple malformed responses (will retry on 500)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => null },
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => null },
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => null },
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow(PortServerError);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network error', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      // Fail twice, succeed on third attempt
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      const result = await client.get('/test');

      expect(result).toEqual({ data: 'success' });
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 token + 3 attempts
    });

    it('should retry on 503 Service Unavailable', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ message: 'Service unavailable' }),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      const result = await client.get('/test');

      expect(result).toEqual({ data: 'success' });
    });

    it('should not retry on 4xx errors (except 429)', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      });

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(2); // 1 token + 1 attempt (no retry)
    });

    it('should throw after max retries exceeded', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      // All attempts fail
      mockFetch.mockRejectedValue(new TypeError('Network error'));

      const client = new HttpClient(config);
      
      await expect(client.get('/test')).rejects.toThrow(PortNetworkError);
      expect(mockFetch).toHaveBeenCalledTimes(4); // 1 token + 3 attempts
    });

    it('should respect skipRetry option', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      mockFetch.mockRejectedValueOnce(new TypeError('Network error'));

      const client = new HttpClient(config);
      
      await expect(client.get('/test', { skipRetry: true })).rejects.toThrow(
        PortNetworkError
      );
      expect(mockFetch).toHaveBeenCalledTimes(2); // 1 token + 1 attempt (no retry)
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout after configured duration', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      // Mock a slow response that triggers abort
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            }, 50);
          })
      );

      const client = new HttpClient({ ...config, timeout: 100 });
      
      await expect(client.get('/test')).rejects.toThrow(PortTimeoutError);
    }, 10000);

    it('should respect custom timeout option', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      // Mock a slow response that triggers abort
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            }, 25);
          })
      );

      const client = new HttpClient(config);
      
      await expect(client.get('/test', { timeout: 50 })).rejects.toThrow(
        PortTimeoutError
      );
    }, 10000);
  });

  describe('Request Headers', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
    });

    it('should include default headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });

    it('should merge custom headers with defaults', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.get('/test', {
        headers: {
          'X-Request-ID': 'custom-request-id',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Bearer'),
            'X-Request-ID': 'custom-request-id',
          }),
        })
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => undefined,
      });

      const client = new HttpClient(config);
      const result = await client.delete('/test');

      expect(result).toBeUndefined();
    });

    it('should handle null request body', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.post('/test', null);

      // Verify the POST was called (null becomes undefined in executeRequest)
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle empty object request body', async () => {
      // Token request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          accessToken: 'test-token',
          expiresIn: 3600,
          tokenType: 'Bearer',
        }),
      });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'success' }),
      });

      const client = new HttpClient(config);
      await client.post('/test', {});

      // Check that body is '{}'
      const actualRequestCall = mockFetch.mock.calls[1];
      expect(actualRequestCall[1]).toHaveProperty('body', '{}');
    });
  });
});

