import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditResource } from '../../../src/resources/audit';
import type { HttpClient } from '../../../src/http-client';
import { createMockHttpClient } from '../../helpers/mocks';

describe('AuditResource', () => {
  let mockHttpClient: HttpClient;
  let auditResource: AuditResource;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient() as unknown as HttpClient;
    auditResource = new AuditResource(mockHttpClient);
  });

  describe('query()', () => {
    it('should query all audit logs', async () => {
      const expected = {
        auditLogs: [
          {
            identifier: 'log-1',
            action: 'CREATE',
            resourceType: 'Entity',
            status: 'SUCCESS',
            userEmail: 'alice@company.com',
            timestamp: '2025-10-04T00:00:00Z',
          },
          {
            identifier: 'log-2',
            action: 'UPDATE',
            resourceType: 'Blueprint',
            status: 'SUCCESS',
            userEmail: 'bob@company.com',
            timestamp: '2025-10-04T01:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.query();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/audit-log', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('log-1');
      expect(result[1].identifier).toBe('log-2');
    });

    it('should filter by entity', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ entity: 'my-entity' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?entity=my-entity',
        undefined
      );
    });

    it('should filter by blueprint', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ blueprint: 'service' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?blueprint=service',
        undefined
      );
    });

    it('should filter by action run ID', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ runId: 'run-123' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?run_id=run-123',
        undefined
      );
    });

    it('should filter by action type', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ action: 'CREATE' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?action=CREATE',
        undefined
      );
    });

    it('should filter by status', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ status: 'SUCCESS' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?status=SUCCESS',
        undefined
      );
    });

    it('should filter by time range', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({
        from: '2025-10-01T00:00:00Z',
        to: '2025-10-04T23:59:59Z',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?from=2025-10-01T00%3A00%3A00Z&to=2025-10-04T23%3A59%3A59Z',
        undefined
      );
    });

    it('should convert Date objects to ISO strings', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const from = new Date('2025-10-01T00:00:00Z');
      const to = new Date('2025-10-04T23:59:59Z');

      await auditResource.query({ from, to });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?from=2025-10-01T00%3A00%3A00.000Z&to=2025-10-04T23%3A59%3A59.000Z',
        undefined
      );
    });

    it('should filter by origin', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ origin: 'UI' });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?origin=UI',
        undefined
      );
    });

    it('should filter by multiple origins', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ origin: ['UI', 'API'] });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?origin=UI%2CAPI',
        undefined
      );
    });

    it('should filter by resource types', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ resources: ['Entity', 'Blueprint'] });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?resources=Entity%2CBlueprint',
        undefined
      );
    });

    it('should support limit parameter', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({ limit: 100 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?limit=100',
        undefined
      );
    });

    it('should combine multiple filters', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.query({
        entity: 'my-entity',
        blueprint: 'service',
        action: 'UPDATE',
        status: 'SUCCESS',
        limit: 50,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?entity=my-entity&blueprint=service&action=UPDATE&status=SUCCESS&limit=50',
        undefined
      );
    });

    it('should transform timestamp strings to Date objects', async () => {
      const expected = {
        auditLogs: [
          {
            identifier: 'log-1',
            action: 'CREATE',
            status: 'SUCCESS',
            timestamp: '2025-10-04T10:30:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.query();

      expect(result[0].timestamp).toBeInstanceOf(Date);
      expect(result[0].timestamp.toISOString()).toBe('2025-10-04T10:30:00.000Z');
    });

    it('should return empty array when no logs', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.query();

      expect(result).toEqual([]);
    });
  });

  describe('getEntityLogs()', () => {
    it('should get logs for a specific entity', async () => {
      const expected = {
        auditLogs: [
          {
            identifier: 'log-1',
            action: 'UPDATE',
            status: 'SUCCESS',
            entity: 'my-service',
            blueprint: 'service',
            timestamp: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.getEntityLogs('my-service', 'service');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?entity=my-service&blueprint=service',
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0].entity).toBe('my-service');
    });

    it('should support additional options', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.getEntityLogs('my-service', 'service', {
        action: 'UPDATE',
        limit: 10,
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?entity=my-service&blueprint=service&action=UPDATE&limit=10',
        undefined
      );
    });
  });

  describe('getRunLogs()', () => {
    it('should get logs for a specific action run', async () => {
      const expected = {
        auditLogs: [
          {
            identifier: 'log-1',
            action: 'EXECUTE',
            status: 'SUCCESS',
            runId: 'run-123',
            timestamp: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.getRunLogs('run-123');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?run_id=run-123',
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0].runId).toBe('run-123');
    });

    it('should support additional options', async () => {
      const expected = {
        auditLogs: [],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      await auditResource.getRunLogs('run-123', { limit: 20 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/audit-log?run_id=run-123&limit=20',
        undefined
      );
    });
  });

  describe('getUserLogs()', () => {
    it('should filter logs by user email', async () => {
      const expected = {
        auditLogs: [
          {
            identifier: 'log-1',
            action: 'CREATE',
            status: 'SUCCESS',
            userEmail: 'alice@company.com',
            timestamp: '2025-10-04T00:00:00Z',
          },
          {
            identifier: 'log-2',
            action: 'UPDATE',
            status: 'SUCCESS',
            userEmail: 'bob@company.com',
            timestamp: '2025-10-04T01:00:00Z',
          },
          {
            identifier: 'log-3',
            action: 'DELETE',
            status: 'SUCCESS',
            userEmail: 'alice@company.com',
            timestamp: '2025-10-04T02:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.getUserLogs('alice@company.com');

      expect(result).toHaveLength(2);
      expect(result[0].userEmail).toBe('alice@company.com');
      expect(result[1].userEmail).toBe('alice@company.com');
    });

    it('should return empty array when no matching logs', async () => {
      const expected = {
        auditLogs: [
          {
            identifier: 'log-1',
            action: 'CREATE',
            status: 'SUCCESS',
            userEmail: 'bob@company.com',
            timestamp: '2025-10-04T00:00:00Z',
          },
        ],
        ok: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await auditResource.getUserLogs('alice@company.com');

      expect(result).toEqual([]);
    });
  });
});

