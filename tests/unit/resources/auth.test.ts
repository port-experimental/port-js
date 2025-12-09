/**
 * Tests for AuthResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthResource } from '../../../src/resources/auth';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import type { CreateAccessTokenInput } from '../../../src/types/auth';

describe('AuthResource', () => {
  let mockHttpClient: HttpClient;
  let authResource: AuthResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    authResource = new AuthResource(mockHttpClient);
  });

  describe('createAccessToken', () => {
    it('should create an access token', async () => {
      const createData: CreateAccessTokenInput = {
        clientId: 'client-id-123',
        clientSecret: 'client-secret-456',
      };

      const mockResponse = {
        ok: true,
        accessToken: 'access-token-789',
        expiresIn: 3600,
        tokenType: 'Bearer',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await authResource.createAccessToken(createData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/auth/access_token',
        createData,
        undefined
      );
      expect(result.accessToken).toBe('access-token-789');
      expect(result.expiresIn).toBe(3600);
      expect(result.tokenType).toBe('Bearer');
      expect(result.ok).toBe(true);
    });

    it('should throw PortValidationError for empty client ID', async () => {
      await expect(
        authResource.createAccessToken({
          clientId: '',
          clientSecret: 'secret',
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for empty client secret', async () => {
      await expect(
        authResource.createAccessToken({
          clientId: 'client-id',
          clientSecret: '',
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });
});

