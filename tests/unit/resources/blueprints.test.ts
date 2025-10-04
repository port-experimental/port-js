/**
 * Unit tests for BlueprintResource
 * Following TDD: Tests written BEFORE implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprintResource } from '../../../src/resources/blueprints';
import { PortValidationError, PortNotFoundError } from '../../../src/errors';
import type { HttpClient } from '../../../src/http-client';

describe('BlueprintResource', () => {
  let mockHttpClient: HttpClient;
  let blueprintResource: BlueprintResource;

  beforeEach(() => {
    // Create mock HTTP client
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    blueprintResource = new BlueprintResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create a blueprint with valid data', async () => {
      const input = {
        identifier: 'test-blueprint',
        title: 'Test Blueprint',
        icon: 'Blueprint',
        schema: {
          properties: {},
        },
      };

      const expected = {
        ...input,
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({ blueprint: expected });

      const result = await blueprintResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/blueprints',
        input
      );
      expect(result.identifier).toBe('test-blueprint');
      expect(result.title).toBe('Test Blueprint');
    });

    it('should throw PortValidationError when identifier is missing', async () => {
      const input = {
        identifier: '',
        title: 'Test',
        schema: { properties: {} },
      };

      await expect(blueprintResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when identifier has invalid format', async () => {
      const input = {
        identifier: 'Invalid Blueprint!',
        title: 'Test',
        schema: { properties: {} },
      };

      await expect(blueprintResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should throw PortValidationError when title is missing', async () => {
      const input = {
        identifier: 'test',
        title: '',
        schema: { properties: {} },
      };

      await expect(blueprintResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('get', () => {
    it('should fetch a blueprint by identifier', async () => {
      const expected = {
        identifier: 'service',
        title: 'Service',
        icon: 'Service',
        schema: { properties: {} },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ blueprint: expected });

      const result = await blueprintResource.get('service');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/blueprints/service');
      expect(result.identifier).toBe('service');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(blueprintResource.get(''))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should throw PortNotFoundError when blueprint does not exist', async () => {
      vi.mocked(mockHttpClient.get).mockRejectedValue(
        new PortNotFoundError('blueprint', 'nonexistent')
      );

      await expect(blueprintResource.get('nonexistent'))
        .rejects
        .toThrow(PortNotFoundError);
    });
  });

  describe('update', () => {
    it('should update a blueprint', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const expected = {
        identifier: 'service',
        title: 'Updated Title',
        description: 'Updated description',
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue({ blueprint: expected });

      const result = await blueprintResource.update('service', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/blueprints/service',
        updates
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(blueprintResource.update('', { title: 'Test' }))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should allow updating schema', async () => {
      const updates = {
        schema: {
          properties: {
            name: { type: 'string' as const },
          },
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue({
        blueprint: { identifier: 'service', ...updates },
      });

      await blueprintResource.update('service', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/blueprints/service',
        updates
      );
    });
  });

  describe('delete', () => {
    it('should delete a blueprint', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await blueprintResource.delete('test-blueprint');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/blueprints/test-blueprint'
      );
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(blueprintResource.delete(''))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });

    it('should throw PortNotFoundError when blueprint does not exist', async () => {
      vi.mocked(mockHttpClient.delete).mockRejectedValue(
        new PortNotFoundError('blueprint', 'nonexistent')
      );

      await expect(blueprintResource.delete('nonexistent'))
        .rejects
        .toThrow(PortNotFoundError);
    });
  });

  describe('list', () => {
    it('should list all blueprints', async () => {
      const blueprints = [
        { identifier: 'service', title: 'Service' },
        { identifier: 'deployment', title: 'Deployment' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        blueprints,
        ok: true,
      });

      const result = await blueprintResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/blueprints');
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('service');
    });

    it('should handle empty blueprint list', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        blueprints: [],
        ok: true,
      });

      const result = await blueprintResource.list();

      expect(result).toEqual([]);
    });
  });

  describe('getRelations', () => {
    it('should get relations for a blueprint', async () => {
      const relations = [
        { identifier: 'service', target: 'deployment' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({ relations });

      const result = await blueprintResource.getRelations('service');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/blueprints/service/relations'
      );
      expect(result).toEqual(relations);
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(blueprintResource.getRelations(''))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('Validation', () => {
    it('should validate identifier format allows alphanumeric, hyphens, underscores', () => {
      const validIdentifiers = [
        'service',
        'my-service',
        'my_service',
        'service123',
        'service-123_test',
      ];

      validIdentifiers.forEach(async (id) => {
        vi.mocked(mockHttpClient.get).mockResolvedValue({
          blueprint: { identifier: id },
        });

        await expect(blueprintResource.get(id)).resolves.toBeDefined();
      });
    });

    it('should reject identifiers with spaces', async () => {
      await expect(blueprintResource.get('my service'))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should reject identifiers with special characters', async () => {
      await expect(blueprintResource.get('service!'))
        .rejects
        .toThrow(PortValidationError);
    });
  });

  describe('Date transformation', () => {
    it('should transform createdAt string to Date object', async () => {
      const blueprint = {
        identifier: 'service',
        title: 'Service',
        createdAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ blueprint });

      const result = await blueprintResource.get('service');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt?.toISOString()).toBe('2025-10-04T00:00:00.000Z');
    });

    it('should transform updatedAt string to Date object', async () => {
      const blueprint = {
        identifier: 'service',
        title: 'Service',
        updatedAt: '2025-10-04T12:00:00Z',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ blueprint });

      const result = await blueprintResource.get('service');

      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });
});

