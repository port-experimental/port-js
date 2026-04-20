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
        input,
        undefined
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

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/entities/test-entity', undefined);
      expect(result.identifier).toBe('test-entity');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(entityResource.get(''))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should fetch an entity by identifier with blueprint', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ entity: { identifier: 'e1' } });
      await entityResource.get('e1', { blueprint: 'b1' });
      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/blueprints/b1/entities/e1', { blueprint: 'b1' });
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
        updates,
        undefined
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should update an entity with blueprint', async () => {
      vi.mocked(mockHttpClient.patch).mockResolvedValue({ entity: { identifier: 'e1' } });
      await entityResource.update('e1', { title: 'T' }, { blueprint: 'b1' });
      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/blueprints/b1/entities/e1',
        { title: 'T' },
        { blueprint: 'b1' }
      );
    });
  });

  describe('delete', () => {
    it('should delete an entity', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await entityResource.delete('test-entity');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/v1/entities/test-entity', undefined);
    });

    it('should delete an entity with blueprint', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await entityResource.delete('test-entity', { blueprint: 'service' });

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/blueprints/service/entities/test-entity',
        { blueprint: 'service' }
      );
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

    it('should list entities with blueprint', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ entities: [] });
      await entityResource.list({ blueprint: 'service' });
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/blueprints/service/entities'
      );
    });
  });

  describe('aggregateOverTime', () => {
    it('should aggregate entities over time', async () => {
      const input = {
        func: 'count' as const,
        query: { blueprint: 'service' },
      };
      const expected = { ok: true, aggregation: { value: 10 } };
      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await entityResource.aggregateOverTime(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/entities/aggregate-over-time', input, undefined);
      expect(result.value).toBe(10);
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
        {
          identifier: 'entity-1',
          data: {
            properties: { stringProps: { status: 'active' } }
          }
        },
      ];

      vi.mocked(mockHttpClient.patch).mockResolvedValue({
        entities: [{ identifier: 'entity-1', properties: { stringProps: { status: 'active' } } }],
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

    it('should get related entities with blueprint', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ entities: [] });
      await entityResource.getRelated('e1', 'r1', { blueprint: 'b1' });
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/blueprints/b1/entities/e1/relations/r1',
        { blueprint: 'b1' }
      );
    });
  });

  describe('aggregate', () => {
    it('should aggregate entities', async () => {
      const input = {
        func: 'count' as const,
        query: { blueprint: 'service' },
      };
      const expected = { ok: true, aggregation: { value: 10 } };
      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);

      const result = await entityResource.aggregate(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/entities/aggregate', input, undefined);
      expect(result.value).toBe(10);
    });
  });

  describe('getCount', () => {
    it('should get entity count for a blueprint', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({ ok: true, count: 42 });

      const result = await entityResource.getCount('service');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/blueprints/service/entities-count', undefined);
      expect(result).toBe(42);
    });
  });

  describe('bulk operations', () => {
    it('should bulk delete entities', async () => {
      const identifiers = ['e1', 'e2'];
      vi.mocked(mockHttpClient.post).mockResolvedValue({ ok: true, deletedEntities: identifiers });

      const result = await entityResource.bulkDelete('service', identifiers, { delete_dependents: true });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/blueprints/service/bulk/entities/delete?delete_dependents=true',
        { entities: identifiers },
        undefined
      );
      expect(result).toEqual(identifiers);
    });

    it('should delete all entities of a blueprint', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue({ ok: true });

      await entityResource.deleteAll('service', { delete_blueprint: true });

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/blueprints/service/all-entities?delete_blueprint=true',
        undefined
      );
    });
  });

  describe('getPropertiesHistory', () => {
    it('should return history property from response', async () => {
      const history = [{ value: 1 }];
      vi.mocked(mockHttpClient.post).mockResolvedValue({ ok: true, history });
      const result = await entityResource.getPropertiesHistory({
        entityIdentifier: 'e1',
        blueprintIdentifier: 'b1',
        propertyNames: ['p1']
      });
      expect(result).toEqual(history);
    });

    it('should return raw response if history is missing', async () => {
      const expected = { ok: true, something: 'else' };
      vi.mocked(mockHttpClient.post).mockResolvedValue(expected);
      const result = await entityResource.getPropertiesHistory({
        entityIdentifier: 'e1',
        blueprintIdentifier: 'b1',
        propertyNames: ['p1']
      });
      expect(result).toEqual(expected);
    });
  });

  describe('Validation edge cases', () => {
    it('should throw PortValidationError for invalid identifier format in create', async () => {
      await expect(entityResource.create({ identifier: 'invalid space', blueprint: 'b1' }))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should throw PortValidationError for invalid identifier format in validateIdentifier', async () => {
      await expect(entityResource.get('invalid space'))
        .rejects
        .toThrow(PortValidationError);
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

    it('should transform updatedAt string to Date', async () => {
      const entity = {
        identifier: 'test',
        blueprint: 'service',
        updatedAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ entity });

      const result = await entityResource.get('test');

      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('stream', () => {
    it('should yield entities one by one', async () => {
      const page1 = {
        entities: [{ identifier: 'e1', blueprint: 's1' }],
        total: 2,
        limit: 1,
        offset: 0,
        hasMore: true,
      };
      const page2 = {
        entities: [{ identifier: 'e2', blueprint: 's1' }],
        total: 2,
        limit: 1,
        offset: 1,
        hasMore: false,
      };

      vi.mocked(mockHttpClient.get)
        .mockResolvedValueOnce(page1)
        .mockResolvedValueOnce(page2);

      const items: any[] = [];
      for await (const item of entityResource.stream({ blueprint: 's1' })) {
        items.push(item);
      }

      expect(items).toHaveLength(2);
      expect(items[0].identifier).toBe('e1');
      expect(items[1].identifier).toBe('e2');
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
    });

    it('should yield entities one by one without blueprint', async () => {
      const page = {
        entities: [{ identifier: 'e1', blueprint: 's1' }],
        total: 1,
        limit: 1,
        offset: 0,
        hasMore: false,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(page);

      const items: any[] = [];
      for await (const item of entityResource.stream()) {
        items.push(item);
      }

      expect(items).toHaveLength(1);
      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/entities?offset=0');
    });
  });
});
