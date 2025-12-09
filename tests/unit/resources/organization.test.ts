/**
 * Tests for OrganizationResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationResource } from '../../../src/resources/organization';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import type {
  UpdateOrganizationInput,
  PatchOrganizationInput,
  CreateSecretInput,
  UpdateSecretInput,
} from '../../../src/types/organization';

describe('OrganizationResource', () => {
  let mockHttpClient: HttpClient;
  let organizationResource: OrganizationResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    organizationResource = new OrganizationResource(mockHttpClient);
  });

  describe('get', () => {
    it('should get organization details', async () => {
      const mockResponse = {
        ok: true,
        organization: {
          id: 'org-123',
          name: 'My Organization',
          settings: {
            hiddenBlueprints: ['internal-service'],
            portalTitle: 'My Portal',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.get();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/organization', undefined);
      expect(result.name).toBe('My Organization');
      expect(result.settings?.hiddenBlueprints).toEqual(['internal-service']);
    });

    it('should transform supportUserExpiresAt from string to Date', async () => {
      const mockResponse = {
        ok: true,
        organization: {
          name: 'My Organization',
          settings: {
            supportUserExpiresAt: '2025-12-31T00:00:00.000Z',
          },
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.get();

      expect(result.settings?.supportUserExpiresAt).toBeInstanceOf(Date);
      expect((result.settings?.supportUserExpiresAt as Date).toISOString()).toBe(
        '2025-12-31T00:00:00.000Z'
      );
    });
  });

  describe('update', () => {
    it('should update organization using PUT', async () => {
      const updateData: UpdateOrganizationInput = {
        name: 'Updated Organization',
        settings: {
          hiddenBlueprints: ['service-1', 'service-2'],
          portalTitle: 'Updated Portal',
        },
      };

      vi.mocked(mockHttpClient.put).mockResolvedValue({ ok: true });

      await organizationResource.update(updateData);

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        '/v1/organization',
        updateData,
        undefined
      );
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(
        organizationResource.update({ name: '' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.put).not.toHaveBeenCalled();
    });
  });

  describe('patch', () => {
    it('should patch organization using PATCH', async () => {
      const patchData: PatchOrganizationInput = {
        name: 'Patched Organization',
        settings: {
          portalIcon: 'NewIcon',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue({ ok: true });

      await organizationResource.patch(patchData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/organization',
        patchData,
        undefined
      );
    });

    it('should throw PortValidationError for empty name', async () => {
      await expect(
        organizationResource.patch({ name: '' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('secrets.list', () => {
    it('should list all secrets', async () => {
      const mockResponse = {
        ok: true,
        secrets: [
          {
            secretName: 'api-key',
            description: 'API key for external service',
            createdAt: '2025-10-05T00:00:00Z',
            updatedAt: '2025-10-05T00:00:00Z',
          },
          {
            secretName: 'db-password',
            description: 'Database password',
            createdAt: '2025-10-05T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/organization/secrets',
        undefined
      );
      expect(result).toHaveLength(2);
      expect(result[0].secretName).toBe('api-key');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should handle empty secrets list', async () => {
      const mockResponse = {
        ok: true,
        secrets: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('secrets.get', () => {
    it('should get a secret by name', async () => {
      const mockResponse = {
        ok: true,
        secret: {
          secretName: 'api-key',
          description: 'API key for external service',
          createdAt: '2025-10-05T00:00:00Z',
          updatedAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.get('api-key');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/organization/secrets/api-key',
        undefined
      );
      expect(result.secretName).toBe('api-key');
      expect(result.description).toBe('API key for external service');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty secret name', async () => {
      await expect(organizationResource.secrets.get('')).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('secrets.create', () => {
    it('should create a secret', async () => {
      const createData: CreateSecretInput = {
        secretName: 'api-key',
        secretValue: 'secret-value-123',
        description: 'API key for external service',
      };

      const mockResponse = {
        ok: true,
        secret: {
          secretName: 'api-key',
          description: 'API key for external service',
          createdAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.create(createData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/organization/secrets',
        {
          secretName: 'api-key',
          secretValue: 'secret-value-123',
          description: 'API key for external service',
        },
        undefined
      );
      expect(result.secretName).toBe('api-key');
      expect(result.description).toBe('API key for external service');
    });

    it('should throw PortValidationError for empty secret name', async () => {
      await expect(
        organizationResource.secrets.create({
          secretName: '',
          secretValue: 'value',
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for empty secret value', async () => {
      await expect(
        organizationResource.secrets.create({
          secretName: 'api-key',
          secretValue: '',
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('secrets.update', () => {
    it('should update a secret', async () => {
      const updateData: UpdateSecretInput = {
        secretValue: 'new-secret-value',
        description: 'Updated description',
      };

      const mockResponse = {
        ok: true,
        secret: {
          secretName: 'api-key',
          description: 'Updated description',
          updatedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.update('api-key', updateData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/organization/secrets/api-key',
        updateData,
        undefined
      );
      expect(result.secretName).toBe('api-key');
      expect(result.description).toBe('Updated description');
    });

    it('should throw PortValidationError for empty secret name', async () => {
      await expect(
        organizationResource.secrets.update('', { secretValue: 'value' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('secrets.delete', () => {
    it('should delete a secret', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await organizationResource.secrets.delete('api-key');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/organization/secrets/api-key',
        undefined
      );
    });

    it('should throw PortValidationError for empty secret name', async () => {
      await expect(organizationResource.secrets.delete('')).rejects.toThrow(
        PortValidationError
      );
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('Date transformation', () => {
    it('should transform secret createdAt string to Date object', async () => {
      const mockResponse = {
        ok: true,
        secret: {
          secretName: 'api-key',
          createdAt: '2025-10-05T00:00:00.000Z',
          updatedAt: '2025-10-05T01:00:00.000Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.get('api-key');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect((result.createdAt as Date).toISOString()).toBe('2025-10-05T00:00:00.000Z');
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect((result.updatedAt as Date).toISOString()).toBe('2025-10-05T01:00:00.000Z');
    });

    it('should handle missing dates', async () => {
      const mockResponse = {
        ok: true,
        secret: {
          secretName: 'api-key',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await organizationResource.secrets.get('api-key');

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });
  });
});

