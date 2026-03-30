/**
 * Tests for AppResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppResource } from '../../../src/resources/apps';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError, PortNotFoundError } from '../../../src/errors';
import type { UpdateAppInput } from '../../../src/types/apps';

describe('AppResource', () => {
  let mockHttpClient: HttpClient;
  let appResource: AppResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    appResource = new AppResource(mockHttpClient);
  });

  describe('list', () => {
    it('should list all apps', async () => {
      const mockResponse = {
        ok: true,
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
            enabled: true,
            createdAt: '2025-10-05T00:00:00Z',
            updatedAt: '2025-10-05T00:00:00Z',
          },
          {
            id: 'app-2',
            name: 'App 2',
            enabled: false,
            createdAt: '2025-10-05T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await appResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/apps', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('app-1');
      expect(result[0].name).toBe('App 1');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should list apps with specific fields', async () => {
      const mockResponse = {
        ok: true,
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
            enabled: true,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await appResource.list({
        fields: ['id', 'name', 'enabled'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/apps?fields=id%2Cname%2Cenabled',
        undefined
      );
      expect(result).toHaveLength(1);
    });

    it('should handle empty apps list', async () => {
      const mockResponse = {
        ok: true,
        apps: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await appResource.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should get an app by ID from list', async () => {
      const mockResponse = {
        ok: true,
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
            enabled: true,
            createdAt: '2025-10-05T00:00:00Z',
          },
          {
            id: 'app-2',
            name: 'App 2',
            enabled: false,
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await appResource.get('app-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/apps', undefined);
      expect(result.id).toBe('app-1');
      expect(result.name).toBe('App 1');
    });

    it('should throw PortNotFoundError when app not found', async () => {
      const mockResponse = {
        ok: true,
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await expect(appResource.get('non-existent')).rejects.toThrow(PortNotFoundError);
    });

    it('should throw PortValidationError for empty ID', async () => {
      await expect(appResource.get('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an app name', async () => {
      const updateData: UpdateAppInput = {
        name: 'Updated App Name',
      };

      const mockResponse = {
        ok: true,
        app: {
          id: 'app-1',
          name: 'Updated App Name',
          enabled: true,
          updatedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.put).mockResolvedValue(mockResponse);

      const result = await appResource.update('app-1', updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/v1/apps/app-1',
        updateData,
        undefined
      );
      expect(result.name).toBe('Updated App Name');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty ID', async () => {
      await expect(
        appResource.update('', { name: 'Test' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(
        appResource.update('app-1', { name: '' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an app', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue({ ok: true });

      await appResource.delete('app-1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/v1/apps/app-1', undefined);
    });

    it('should throw PortValidationError for empty ID', async () => {
      await expect(appResource.delete('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('rotateSecret', () => {
    it('should rotate app secret', async () => {
      const mockResponse = {
        ok: true,
        app: {
          id: 'app-1',
          name: 'App 1',
          secret: 'new-secret-value-123',
          enabled: true,
          updatedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await appResource.rotateSecret('app-1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/apps/app-1/rotate-secret',
        undefined,
        undefined
      );
      expect(result.id).toBe('app-1');
      expect(result.secret).toBe('new-secret-value-123');
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty ID', async () => {
      await expect(appResource.rotateSecret('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Date transformation', () => {
    it('should transform createdAt string to Date object', async () => {
      const mockResponse = {
        ok: true,
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
            createdAt: '2025-10-05T00:00:00.000Z',
            updatedAt: '2025-10-05T01:00:00.000Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await appResource.get('app-1');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect((result.createdAt as Date).toISOString()).toBe('2025-10-05T00:00:00.000Z');
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect((result.updatedAt as Date).toISOString()).toBe('2025-10-05T01:00:00.000Z');
    });

    it('should handle missing dates', async () => {
      const mockResponse = {
        ok: true,
        apps: [
          {
            id: 'app-1',
            name: 'App 1',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await appResource.get('app-1');

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });
  });
});

