/**
 * Tests for IntegrationResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntegrationResource } from '../../../src/resources/integrations';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import type {
  UpdateIntegrationInput,
  UpdateIntegrationConfigInput,
  IntegrationLogOptions,
} from '../../../src/types/integrations';

describe('IntegrationResource', () => {
  let mockHttpClient: HttpClient;
  let integrationResource: IntegrationResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
    } as unknown as HttpClient;

    integrationResource = new IntegrationResource(mockHttpClient);
  });

  describe('list', () => {
    it('should list all integrations', async () => {
      const mockResponse = {
        ok: true,
        integrations: [
          {
            identifier: 'integration-1',
            title: 'Kubernetes Integration',
            installationAppType: 'kubernetes',
            createdAt: '2025-10-05T00:00:00Z',
            updatedAt: '2025-10-05T00:00:00Z',
          },
          {
            identifier: 'integration-2',
            title: 'AWS Integration',
            installationAppType: 'aws',
            createdAt: '2025-10-05T00:00:00Z',
            updatedAt: '2025-10-05T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/integration', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('integration-1');
      expect(result[0].title).toBe('Kubernetes Integration');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should filter by actionsProcessingEnabled', async () => {
      const mockResponse = {
        ok: true,
        integrations: [
          {
            identifier: 'integration-1',
            actionsProcessingEnabled: true,
            createdAt: '2025-10-05T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.list({
        actionsProcessingEnabled: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/integration?actionsProcessingEnabled=true',
        undefined
      );
      expect(result).toHaveLength(1);
    });

    it('should handle empty integration list', async () => {
      const mockResponse = {
        ok: true,
        integrations: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should get an integration by identifier', async () => {
      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
          title: 'Kubernetes Integration',
          installationAppType: 'kubernetes',
          version: '1.0.0',
          createdAt: '2025-10-05T00:00:00Z',
          updatedAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.get('integration-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/integration/integration-1',
        undefined
      );
      expect(result.identifier).toBe('integration-1');
      expect(result.title).toBe('Kubernetes Integration');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should get an integration by installationId', async () => {
      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
          installationId: 'install-123',
          title: 'Kubernetes Integration',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.get('install-123', {
        byField: 'installationId',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/integration/install-123?byField=installationId',
        undefined
      );
      expect(result.installationId).toBe('install-123');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(integrationResource.get('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an integration', async () => {
      const updateData: UpdateIntegrationInput = {
        title: 'Updated Integration',
        actionsProcessingEnabled: true,
      };

      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
          title: 'Updated Integration',
          actionsProcessingEnabled: true,
          updatedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await integrationResource.update('integration-1', updateData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/integration/integration-1',
        updateData,
        undefined
      );
      expect(result.title).toBe('Updated Integration');
      expect(result.actionsProcessingEnabled).toBe(true);
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(
        integrationResource.update('', { title: 'Test' })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an integration', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await integrationResource.delete('integration-1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/integration/integration-1',
        undefined
      );
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(integrationResource.delete('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateConfig', () => {
    it('should update integration config', async () => {
      const configData: UpdateIntegrationConfigInput = {
        config: {
          deleteDependentEntities: true,
          createMissingRelatedEntities: false,
          resources: [],
        },
      };

      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
          config: configData.config,
          updatedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await integrationResource.updateConfig('integration-1', configData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/integration/integration-1/config',
        configData,
        undefined
      );
      expect(result.config).toEqual(configData.config);
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(
        integrationResource.updateConfig('', { config: null })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });
  });

  describe('getLogs', () => {
    it('should get integration logs', async () => {
      const mockResponse = {
        ok: true,
        logs: [
          {
            log_id: 'log-1',
            timestamp: '2025-10-05T00:00:00Z',
            message: 'Sync started',
            level: 'info',
          },
          {
            log_id: 'log-2',
            timestamp: '2025-10-05T00:01:00Z',
            message: 'Sync completed',
            level: 'info',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.getLogs('integration-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/integration/integration-1/logs',
        undefined
      );
      expect(result).toHaveLength(2);
      expect(result[0].log_id).toBe('log-1');
      expect(result[0].message).toBe('Sync started');
    });

    it('should get logs with options', async () => {
      const options: IntegrationLogOptions = {
        limit: 50,
        timestamp: '2025-10-05T00:00:00Z',
        direction: 'down',
      };

      const mockResponse = {
        ok: true,
        logs: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.getLogs('integration-1', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/integration/integration-1/logs?limit=50&timestamp=2025-10-05T00%3A00%3A00Z&direction=down',
        undefined
      );
      expect(result).toEqual([]);
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(integrationResource.getLogs('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('resync', () => {
    it('should trigger a resync by calling update with empty body', async () => {
      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
          title: 'Kubernetes Integration',
          updatedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await integrationResource.resync('integration-1');

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/integration/integration-1',
        {},
        undefined
      );
      expect(result.identifier).toBe('integration-1');
    });
  });

  describe('Date transformation', () => {
    it('should transform createdAt string to Date object', async () => {
      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
          createdAt: '2025-10-05T00:00:00.000Z',
          updatedAt: '2025-10-05T01:00:00.000Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.get('integration-1');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect((result.createdAt as Date).toISOString()).toBe('2025-10-05T00:00:00.000Z');
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect((result.updatedAt as Date).toISOString()).toBe('2025-10-05T01:00:00.000Z');
    });

    it('should handle missing dates', async () => {
      const mockResponse = {
        ok: true,
        integration: {
          identifier: 'integration-1',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await integrationResource.get('integration-1');

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });
  });
});

