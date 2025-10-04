/**
 * Unit tests for ActionResource
 * Following TDD: Tests written BEFORE implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionResource } from '../../../src/resources/actions';
import { PortValidationError, PortNotFoundError } from '../../../src/errors';
import type { HttpClient } from '../../../src/http-client';

describe('ActionResource', () => {
  let mockHttpClient: HttpClient;
  let actionResource: ActionResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    actionResource = new ActionResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create an action with valid data', async () => {
      const input = {
        identifier: 'create-deployment',
        title: 'Create Deployment',
        blueprint: 'service',
        trigger: 'CREATE' as const,
        invocationMethod: {
          type: 'WEBHOOK' as const,
          url: 'https://example.com/webhook',
        },
      };

      const expected = {
        ...input,
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({ action: expected });

      const result = await actionResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/actions', input);
      expect(result.identifier).toBe('create-deployment');
      expect(result.title).toBe('Create Deployment');
    });

    it('should throw PortValidationError when identifier is missing', async () => {
      const input = {
        identifier: '',
        title: 'Test',
        blueprint: 'service',
      };

      await expect(actionResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when title is missing', async () => {
      const input = {
        identifier: 'test',
        title: '',
        blueprint: 'service',
      };

      await expect(actionResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should throw PortValidationError when blueprint is missing', async () => {
      const input = {
        identifier: 'test',
        title: 'Test',
        blueprint: '',
      };

      await expect(actionResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('get', () => {
    it('should fetch an action by identifier', async () => {
      const expected = {
        identifier: 'create-deployment',
        title: 'Create Deployment',
        blueprint: 'service',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ action: expected });

      const result = await actionResource.get('create-deployment');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/actions/create-deployment');
      expect(result.identifier).toBe('create-deployment');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(actionResource.get(''))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw PortNotFoundError when action does not exist', async () => {
      vi.mocked(mockHttpClient.get).mockRejectedValue(
        new PortNotFoundError('action', 'nonexistent')
      );

      await expect(actionResource.get('nonexistent'))
        .rejects
        .toThrow(PortNotFoundError);
    });
  });

  describe('update', () => {
    it('should update an action', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const expected = {
        identifier: 'create-deployment',
        title: 'Updated Title',
        description: 'Updated description',
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue({ action: expected });

      const result = await actionResource.update('create-deployment', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/actions/create-deployment',
        updates
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(actionResource.update('', { title: 'Test' }))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('delete', () => {
    it('should delete an action', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await actionResource.delete('create-deployment');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/actions/create-deployment'
      );
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(actionResource.delete(''))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });

    it('should throw PortNotFoundError when action does not exist', async () => {
      vi.mocked(mockHttpClient.delete).mockRejectedValue(
        new PortNotFoundError('action', 'nonexistent')
      );

      await expect(actionResource.delete('nonexistent'))
        .rejects
        .toThrow(PortNotFoundError);
    });
  });

  describe('list', () => {
    it('should list all actions', async () => {
      const actions = [
        { identifier: 'create-deployment', title: 'Create Deployment' },
        { identifier: 'rollback', title: 'Rollback' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        actions,
        ok: true,
      });

      const result = await actionResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/actions');
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('create-deployment');
    });

    it('should list actions by blueprint', async () => {
      const actions = [
        { identifier: 'deploy', title: 'Deploy', blueprint: 'service' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({ actions });

      const result = await actionResource.list({ blueprint: 'service' });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/blueprints/service/actions');
      expect(result).toHaveLength(1);
    });

    it('should handle empty action list', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        actions: [],
        ok: true,
      });

      const result = await actionResource.list();

      expect(result).toEqual([]);
    });
  });

  describe('execute', () => {
    it('should execute an action', async () => {
      const runId = 'run-12345';
      const properties = {
        environment: 'production',
        version: '1.2.3',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({
        run: {
          id: runId,
          status: 'in_progress',
        },
      });

      const result = await actionResource.execute('create-deployment', {
        entityIdentifier: 'my-service',
        properties,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/actions/create-deployment/runs',
        {
          entity: 'my-service',
          properties,
        }
      );
      expect(result.id).toBe(runId);
      expect(result.status).toBe('in_progress');
    });

    it('should execute action without entity', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({
        run: {
          id: 'run-123',
          status: 'in_progress',
        },
      });

      await actionResource.execute('global-action', {
        properties: { key: 'value' },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/actions/global-action/runs',
        {
          properties: { key: 'value' },
        }
      );
    });

    it('should throw PortValidationError for empty action identifier', async () => {
      await expect(
        actionResource.execute('', { properties: {} })
      ).rejects.toThrow(PortValidationError);
    });
  });

  describe('getRun', () => {
    it('should get action run status', async () => {
      const run = {
        id: 'run-123',
        status: 'success',
        createdAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ run });

      const result = await actionResource.getRun('run-123');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/actions/runs/run-123');
      expect(result.id).toBe('run-123');
      expect(result.status).toBe('success');
    });

    it('should throw PortValidationError for empty run ID', async () => {
      await expect(actionResource.getRun(''))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('listRuns', () => {
    it('should list all runs for an action', async () => {
      const runs = [
        { id: 'run-1', status: 'success' },
        { id: 'run-2', status: 'in_progress' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({ runs });

      const result = await actionResource.listRuns('create-deployment');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/create-deployment/runs'
      );
      expect(result).toHaveLength(2);
    });

    it('should throw PortValidationError for empty action identifier', async () => {
      await expect(actionResource.listRuns(''))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('Validation', () => {
    it('should validate identifier format', async () => {
      const validIdentifiers = [
        'deploy',
        'create-deployment',
        'rollback_v2',
        'action123',
      ];

      validIdentifiers.forEach(async (id) => {
        vi.mocked(mockHttpClient.get).mockResolvedValue({
          action: { identifier: id },
        });

        await expect(actionResource.get(id)).resolves.toBeDefined();
      });
    });

    it('should reject identifiers with spaces', async () => {
      await expect(actionResource.get('my action'))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should reject identifiers with special characters', async () => {
      await expect(actionResource.get('action!'))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('Date transformation', () => {
    it('should transform createdAt string to Date object', async () => {
      const action = {
        identifier: 'test',
        title: 'Test',
        createdAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ action });

      const result = await actionResource.get('test');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt?.toISOString()).toBe('2025-10-04T00:00:00.000Z');
    });

    it('should transform updatedAt string to Date object', async () => {
      const action = {
        identifier: 'test',
        title: 'Test',
        updatedAt: '2025-10-04T12:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ action });

      const result = await actionResource.get('test');

      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});

