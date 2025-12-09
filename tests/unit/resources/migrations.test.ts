/**
 * Tests for MigrationResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MigrationResource } from '../../../src/resources/migrations';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import type {
  CreateMigrationInput,
  CancelMigrationInput,
  ListMigrationsOptions,
} from '../../../src/types/migrations';

describe('MigrationResource', () => {
  let mockHttpClient: HttpClient;
  let migrationResource: MigrationResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    migrationResource = new MigrationResource(mockHttpClient);
  });

  describe('list', () => {
    it('should list all migrations', async () => {
      const mockResponse = {
        ok: true,
        migrations: [
          {
            id: 'migration-1',
            status: 'COMPLETED',
            sourceBlueprint: 'old-service',
            createdAt: '2025-10-05T00:00:00Z',
            updatedAt: '2025-10-05T01:00:00Z',
          },
          {
            id: 'migration-2',
            status: 'RUNNING',
            sourceBlueprint: 'old-service',
            createdAt: '2025-10-05T02:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/migrations', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('migration-1');
      expect(result[0].status).toBe('COMPLETED');
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should filter migrations by status', async () => {
      const mockResponse = {
        ok: true,
        migrations: [
          {
            id: 'migration-1',
            status: 'RUNNING',
            createdAt: '2025-10-05T00:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.list({
        status: ['RUNNING', 'PENDING'],
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/migrations?status=RUNNING%2CPENDING',
        undefined
      );
      expect(result).toHaveLength(1);
    });

    it('should filter migrations by blueprint', async () => {
      const mockResponse = {
        ok: true,
        migrations: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.list({
        blueprint: 'service',
      });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/migrations?blueprint=service',
        undefined
      );
      expect(result).toHaveLength(0);
    });

    it('should handle empty migrations list', async () => {
      const mockResponse = {
        ok: true,
        migrations: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.list();

      expect(result).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should get a migration by ID', async () => {
      const mockResponse = {
        ok: true,
        migration: {
          id: 'migration-1',
          status: 'COMPLETED',
          sourceBlueprint: 'old-service',
          createdAt: '2025-10-05T00:00:00Z',
          updatedAt: '2025-10-05T01:00:00Z',
          completedAt: '2025-10-05T01:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.get('migration-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/migrations/migration-1',
        undefined
      );
      expect(result.id).toBe('migration-1');
      expect(result.status).toBe('COMPLETED');
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError for empty migration ID', async () => {
      await expect(migrationResource.get('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a migration', async () => {
      const createData: CreateMigrationInput = {
        sourceBlueprint: 'old-service',
        mapping: {
          blueprint: 'new-service',
          entity: {
            identifier: '.identifier',
            title: '.title',
          },
        },
      };

      const mockResponse = {
        ok: true,
        migration: {
          id: 'migration-1',
          status: 'PENDING',
          sourceBlueprint: 'old-service',
          createdAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await migrationResource.create(createData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/migrations',
        createData,
        undefined
      );
      expect(result.id).toBe('migration-1');
      expect(result.status).toBe('PENDING');
    });

    it('should throw PortValidationError for empty source blueprint', async () => {
      await expect(
        migrationResource.create({
          sourceBlueprint: '',
          mapping: {
            entity: {},
          },
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for missing mapping', async () => {
      await expect(
        migrationResource.create({
          sourceBlueprint: 'old-service',
          mapping: null as any,
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError for missing entity mapping', async () => {
      await expect(
        migrationResource.create({
          sourceBlueprint: 'old-service',
          mapping: {
            blueprint: 'new-service',
            entity: null as any,
          },
        })
      ).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel a migration', async () => {
      const cancelData: CancelMigrationInput = {
        reason: 'No longer needed',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({ ok: true });

      await migrationResource.cancel('migration-1', cancelData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/migrations/migration-1/cancel',
        cancelData,
        undefined
      );
    });

    it('should cancel a migration without reason', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ ok: true });

      await migrationResource.cancel('migration-1');

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/migrations/migration-1/cancel',
        {},
        undefined
      );
    });

    it('should throw PortValidationError for empty migration ID', async () => {
      await expect(migrationResource.cancel('')).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('Date transformation', () => {
    it('should transform date strings to Date objects', async () => {
      const mockResponse = {
        ok: true,
        migration: {
          id: 'migration-1',
          status: 'COMPLETED',
          createdAt: '2025-10-05T00:00:00.000Z',
          updatedAt: '2025-10-05T01:00:00.000Z',
          completedAt: '2025-10-05T02:00:00.000Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.get('migration-1');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect((result.createdAt as Date).toISOString()).toBe('2025-10-05T00:00:00.000Z');
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should handle missing dates', async () => {
      const mockResponse = {
        ok: true,
        migration: {
          id: 'migration-1',
          status: 'PENDING',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await migrationResource.get('migration-1');

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
      expect(result.completedAt).toBeUndefined();
    });
  });
});

