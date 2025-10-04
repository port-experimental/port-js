/**
 * Unit tests for EntityResource
 * Following TDD principles
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EntityResource } from '../../../src/resources/entities';
import { PortValidationError, PortNotFoundError } from '../../../src/errors';
import type { HttpClient } from '../../../src/http-client';

describe('EntityResource', () => {
  let mockHttpClient: HttpClient;
  let entityResource: EntityResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    entityResource = new EntityResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create an entity with valid data', async () => {
      const input = {
        identifier: 'test-entity',
        blueprint: 'service',
        title: 'Test Entity',
        properties: {
          stringProps: { name: 'Test' },
        },
      };

      const expected = {
        entity: {
          ...input,
          createdAt: '2025-10-04T00:00:00Z',
          updatedAt: '2025-10-04T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await entityResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/blueprints/service/entities',
        input
      );
      expect(result.identifier).toBe('test-entity');
    });

    it('should throw PortValidationError when identifier is missing', async () => {
      const input = {
        identifier: '',
        blueprint: 'service',
        title: 'Test',
      };

      await expect(entityResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when blueprint is missing', async () => {
      const input = {
        identifier: 'test',
        blueprint: '',
        title: 'Test',
      };

      await expect(entityResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('get', () => {
    it('should fetch an entity by identifier', async () => {
      const expected = {
        entity: {
          identifier: 'test-entity',
          blueprint: 'service',
          title: 'Test',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(expected);

      const result = await entityResource.get('test-entity');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/entities/test-entity');
      expect(result.identifier).toBe('test-entity');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(entityResource.get(''))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('update', () => {
    it('should update an entity', async () => {
      const updates = {
        title: 'Updated Title',
        properties: {
          stringProps: { status: 'active' },
        },
      };

      const expected = {
        entity: {
          identifier: 'test-entity',
          ...updates,
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(expected);

      const result = await entityResource.update('test-entity', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/entities/test-entity',
        updates
      );
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await entityResource.delete('test-entity');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/v1/entities/test-entity');
    });
  });

  describe('list', () => {
    it('should list entities with pagination', async () => {
      const entities = [
        { identifier: 'entity-1', blueprint: 'service' },
        { identifier: 'entity-2', blueprint: 'service' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({ entities });

      const result = await entityResource.list({ limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('search', () => {
    it('should search entities by query', async () => {
      const entities = [
        { identifier: 'match-1', blueprint: 'service' },
      ];

      vi.mocked(mockHttpClient.post).mockResolvedValue({ entities });

      const result = await entityResource.search({
        combinator: 'and',
        rules: [
          { property: 'name', operator: '=', value: 'test' },
        ],
      });

      expect(result).toHaveLength(1);
    });
  });

  describe('batchCreate', () => {
    it('should create multiple entities', async () => {
      const inputs = [
        { identifier: 'entity-1', blueprint: 'service', title: 'E1' },
        { identifier: 'entity-2', blueprint: 'service', title: 'E2' },
      ];

      vi.mocked(mockHttpClient.post).mockResolvedValue({
        entities: inputs.map((e) => ({ ...e, createdAt: '2025-10-04T00:00:00Z' })),
      });

      const result = await entityResource.batchCreate(inputs);

      expect(result).toHaveLength(2);
    });
  });

  describe('batchUpdate', () => {
    it('should update multiple entities', async () => {
      const updates = [
        { identifier: 'entity-1', properties: { stringProps: { status: 'active' } } },
      ];

      vi.mocked(mockHttpClient.patch).mockResolvedValue({
        entities: updates,
      });

      const result = await entityResource.batchUpdate(updates);

      expect(result).toHaveLength(1);
    });
  });

  describe('batchDelete', () => {
    it('should delete multiple entities', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue(undefined);

      await entityResource.batchDelete(['entity-1', 'entity-2']);

      expect(mockHttpClient.post).toHaveBeenCalled();
    });
  });

  describe('getRelated', () => {
    it('should get related entities', async () => {
      const entities = [
        { identifier: 'related-1', blueprint: 'deployment' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({ entities });

      const result = await entityResource.getRelated('service-1', 'deployments');

      expect(result).toHaveLength(1);
    });
  });

  describe('Date transformation', () => {
    it('should transform createdAt string to Date', async () => {
      const entity = {
        identifier: 'test',
        blueprint: 'service',
        createdAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ entity });

      const result = await entityResource.get('test');

      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});

