/**
 * Unit tests for BaseResource
 * Following TDD principles
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseResource } from '../../../src/resources/base';
import type { HttpClient } from '../../../src/http-client';

// Concrete implementation for testing
class TestResource extends BaseResource {
  public buildTestUrl(path: string, params?: Record<string, string | number | boolean>): string {
    return this.buildUrl(path, params);
  }

  public paginateTest<T>(path: string, options?: any): Promise<any> {
    return this.paginate<T>(path, options);
  }
}

describe('BaseResource', () => {
  let mockHttpClient: HttpClient;
  let testResource: TestResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    testResource = new TestResource(mockHttpClient);
  });

  describe('buildUrl', () => {
    it('should build URL without params', () => {
      const url = testResource.buildTestUrl('/entities');
      expect(url).toBe('/entities');
    });

    it('should build URL with single param', () => {
      const url = testResource.buildTestUrl('/entities', { limit: 10 });
      expect(url).toBe('/entities?limit=10');
    });

    it('should build URL with multiple params', () => {
      const url = testResource.buildTestUrl('/entities', {
        limit: 10,
        offset: 20,
        blueprint: 'service',
      });
      expect(url).toContain('limit=10');
      expect(url).toContain('offset=20');
      expect(url).toContain('blueprint=service');
    });

    it('should handle boolean params', () => {
      const url = testResource.buildTestUrl('/entities', { active: true });
      expect(url).toBe('/entities?active=true');
    });

    it('should skip undefined params', () => {
      const url = testResource.buildTestUrl('/entities', {
        limit: 10,
        offset: undefined as any,
      });
      expect(url).toBe('/entities?limit=10');
      expect(url).not.toContain('offset');
    });

    it('should skip null params', () => {
      const url = testResource.buildTestUrl('/entities', {
        limit: 10,
        name: null as any,
      });
      expect(url).toBe('/entities?limit=10');
      expect(url).not.toContain('name');
    });

    it('should handle empty params object', () => {
      const url = testResource.buildTestUrl('/entities', {});
      expect(url).toBe('/entities');
    });
  });

  describe('paginate', () => {
    it('should paginate with limit and offset', async () => {
      const mockData = {
        entities: [{ id: 1 }, { id: 2 }],
        total: 100,
        limit: 10,
        offset: 0,
        hasMore: true,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockData);

      const result = await testResource.paginateTest('/entities', {
        limit: 10,
        offset: 0,
      });

      expect(result.data).toEqual([{ id: 1 }, { id: 2 }]);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.hasMore).toBe(true);
    });

    it('should handle cursor-based pagination', async () => {
      const mockData = {
        entities: [{ id: 1 }],
        total: 100,
        limit: 10,
        offset: 0,
        hasMore: true,
        nextCursor: 'cursor-123',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockData);

      const result = await testResource.paginateTest('/entities', {
        cursor: 'cursor-123',
      });

      expect(result.pagination.nextCursor).toBe('cursor-123');
    });

    it('should handle empty result set', async () => {
      const mockData = {
        entities: [],
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false,
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockData);

      const result = await testResource.paginateTest('/entities', {
        limit: 10,
      });

      expect(result.data).toEqual([]);
      expect(result.pagination.hasMore).toBe(false);
    });
  });
});

