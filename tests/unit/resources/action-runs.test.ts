import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionRunResource } from '../../../src/resources/action-runs';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import { createMockHttpClient } from '../../helpers/mocks';

describe('ActionRunResource', () => {
  let mockHttpClient: HttpClient;
  let actionRunResource: ActionRunResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient() as unknown as HttpClient;
    actionRunResource = new ActionRunResource(mockHttpClient);
  });

  describe('get()', () => {
    it('should get an action run by ID', async () => {
      const expected = {
        run: {
          id: 'run-123',
          status: 'SUCCESS' as const,
          statusLabel: 'Completed',
          action: { identifier: 'deploy_service', title: 'Deploy Service' },
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:10:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.get('run-123');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs/run-123',
        undefined
      );
      expect(result.id).toBe('run-123');
      expect(result.status).toBe('SUCCESS');
      expect(result.action.identifier).toBe('deploy_service');
    });

    it('should transform date strings to Date objects', async () => {
      const expected = {
        run: {
          id: 'run-123',
          status: 'SUCCESS' as const,
          action: { identifier: 'deploy' },
          createdAt: '2025-10-04T10:30:00Z',
          updatedAt: '2025-10-04T10:35:00Z',
          endedAt: '2025-10-04T10:40:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.get('run-123');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.endedAt).toBeInstanceOf(Date);
    });

    it('should throw error for empty run ID', async () => {
      await expect(
        actionRunResource.get('')
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      const expected = {
        run: {
          id: 'run-123',
          status: 'SUCCESS' as const,
          action: { identifier: 'deploy' },
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.get('run-123', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs/run-123',
        options
      );
    });
  });

  describe('list()', () => {
    it('should list all action runs', async () => {
      const expected = {
        runs: [
          {
            id: 'run-1',
            status: 'SUCCESS' as const,
            action: { identifier: 'deploy' },
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
          {
            id: 'run-2',
            status: 'IN_PROGRESS' as const,
            action: { identifier: 'restart' },
            createdAt: '2025-10-04T01:00:00Z',
            updatedAt: '2025-10-04T01:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/actions/runs', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('run-1');
      expect(result[1].id).toBe('run-2');
    });

    it('should filter by entity', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.list({ entity: 'my-entity' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs?entity=my-entity',
        undefined
      );
    });

    it('should filter by blueprint', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.list({ blueprint: 'service' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs?blueprint=service',
        undefined
      );
    });

    it('should filter by active status', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.list({ active: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs?active=true',
        undefined
      );
    });

    it('should filter by user email', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.list({ userEmail: 'alice@company.com' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs?user_email=alice%40company.com',
        undefined
      );
    });

    it('should support pagination', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.list({ page: 2, pageSize: 50 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs?page=2&pageSize=50',
        undefined
      );
    });

    it('should combine multiple filters', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.list({
        entity: 'my-entity',
        blueprint: 'service',
        active: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs?entity=my-entity&blueprint=service&active=true',
        undefined
      );
    });

    it('should return empty array when no runs', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.list();

      expect(result).toEqual([]);
    });
  });

  describe('listForAction()', () => {
    it('should list runs for a specific action', async () => {
      const expected = {
        runs: [
          {
            id: 'run-1',
            status: 'SUCCESS' as const,
            action: { identifier: 'deploy_service' },
            createdAt: '2025-10-04T00:00:00Z',
            updatedAt: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.listForAction('deploy_service');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/deploy_service/runs',
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('run-1');
    });

    it('should encode action identifier in URL', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.listForAction('deploy/service');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/deploy%2Fservice/runs',
        undefined
      );
    });

    it('should support filtering options', async () => {
      const expected = {
        runs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await actionRunResource.listForAction('deploy_service', {
        entity: 'my-entity',
        active: true,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/deploy_service/runs?entity=my-entity&active=true',
        undefined
      );
    });

    it('should throw error for empty action identifier', async () => {
      await expect(
        actionRunResource.listForAction('')
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('getLogs()', () => {
    it('should get logs for an action run', async () => {
      const expected = {
        logs: [
          {
            timestamp: '2025-10-04T00:00:00Z',
            message: 'Starting deployment',
            level: 'info',
          },
          {
            timestamp: '2025-10-04T00:01:00Z',
            message: 'Deployment complete',
            level: 'info',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.getLogs('run-123');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/actions/runs/run-123/logs',
        undefined
      );
      expect(result.runId).toBe('run-123');
      expect(result.logs).toHaveLength(2);
      expect(result.logs[0].message).toBe('Starting deployment');
    });

    it('should return empty logs array', async () => {
      const expected = {
        logs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await actionRunResource.getLogs('run-123');

      expect(result.logs).toEqual([]);
    });

    it('should throw error for empty run ID', async () => {
      await expect(
        actionRunResource.getLogs('')
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('updateApproval()', () => {
    it('should approve an action run', async () => {
      const expected = {
        run: {
          id: 'run-123',
          status: 'SUCCESS' as const,
          action: { identifier: 'deploy' },
          approval: {
            required: true,
            status: 'approved',
          },
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:10:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await actionRunResource.updateApproval('run-123', {
        approved: true,
        reason: 'Looks good',
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/actions/runs/run-123/approval',
        {
          approved: true,
          reason: 'Looks good',
        },
        undefined
      );
      expect(result.id).toBe('run-123');
      expect(result.approval?.status).toBe('approved');
    });

    it('should reject an action run', async () => {
      const expected = {
        run: {
          id: 'run-123',
          status: 'FAILURE' as const,
          action: { identifier: 'deploy' },
          approval: {
            required: true,
            status: 'rejected',
          },
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:10:00Z',
        },
        ok: true,
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await actionRunResource.updateApproval('run-123', {
        approved: false,
        reason: 'Security concerns',
      });

      expect(result.approval?.status).toBe('rejected');
    });

    it('should throw error for empty run ID', async () => {
      await expect(
        actionRunResource.updateApproval('', { approved: true })
      ).rejects.toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });
});

