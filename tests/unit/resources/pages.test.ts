/**
 * Unit tests for PageResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PageResource } from '../../../src/resources/pages';
import { PortValidationError } from '../../../src/errors';
import type { HttpClient } from '../../../src/http-client';

describe('PageResource', () => {
  let mockHttpClient: HttpClient;
  let pageResource: PageResource;

  beforeEach(() => {
    // Create mock HTTP client
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as HttpClient;

    pageResource = new PageResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create a page with valid data', async () => {
      const input = {
        identifier: 'test-page',
        title: 'Test Page',
        widgets: []
      };

      const expected = {
        ...input,
        createdAt: '2025-10-04T00:00:00Z',
        updatedAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({ page: expected });

      const result = await pageResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/pages',
        input,
        undefined
      );
      expect(result.identifier).toBe('test-page');
      expect(result.title).toBe('Test Page');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw PortValidationError when identifier is missing', async () => {
      const input = {
        identifier: '',
        title: 'Test',
      };

      await expect(pageResource.create(input as any))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should fetch a page by identifier', async () => {
      const expected = {
        identifier: 'test-page',
        title: 'Test Page',
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue({ page: expected });

      const result = await pageResource.get('test-page');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/pages/test-page', undefined);
      expect(result.identifier).toBe('test-page');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(pageResource.get(''))
        .rejects
        .toThrow(PortValidationError);

      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a page', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const expected = {
        identifier: 'test-page',
        title: 'Updated Title',
        description: 'Updated description',
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue({ page: expected });

      const result = await pageResource.update('test-page', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/pages/test-page',
        updates,
        undefined
      );
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('delete', () => {
    it('should delete a page', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await pageResource.delete('test-page');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/pages/test-page',
        undefined
      );
    });
  });

  describe('list', () => {
    it('should list all pages', async () => {
      const pages = [
        { identifier: 'page-1', title: 'Page 1' },
        { identifier: 'page-2', title: 'Page 2' },
      ];

      vi.mocked(mockHttpClient.get).mockResolvedValue({
        pages,
        ok: true,
      });

      const result = await pageResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/pages', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('page-1');
    });

    it('should handle compact option', async () => {
      vi.mocked(mockHttpClient.get).mockResolvedValue({
        pages: [],
        ok: true,
      });

      await pageResource.list({ compact: true });

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/pages?compact=true', undefined);
    });
  });

  describe('widgets', () => {
    it('should create a widget in a page', async () => {
      const widget = {
        type: 'markdown-widget',
        title: 'Markdown Widget',
        markdown: '# Hello'
      };

      const expected = {
        ...widget,
        id: 'widget-1',
        createdAt: '2025-10-04T00:00:00Z',
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue({ widget: expected });

      const result = await pageResource.createWidget('test-page', widget as any);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/v1/pages/test-page/widgets',
        { widget },
        undefined
      );
      expect(result.id).toBe('widget-1');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should update a widget in a page', async () => {
      const updates = {
        title: 'Updated Widget Title',
      };

      const expected = {
        id: 'widget-1',
        type: 'markdown-widget',
        title: 'Updated Widget Title',
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue({ widget: expected });

      const result = await pageResource.updateWidget('test-page', 'widget-1', updates);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/pages/test-page/widgets/widget-1',
        { widget: updates },
        undefined
      );
      expect(result.title).toBe('Updated Widget Title');
    });

    it('should delete a widget from a page', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await pageResource.deleteWidget('test-page', 'widget-1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/pages/test-page/widgets/widget-1',
        undefined
      );
    });

    it('should throw PortValidationError when widgetId is missing for update', async () => {
      await expect(pageResource.updateWidget('test-page', '', { title: 'Test' }))
        .rejects
        .toThrow(PortValidationError);
    });

    it('should throw PortValidationError when widgetId is missing for delete', async () => {
      await expect(pageResource.deleteWidget('test-page', ''))
        .rejects
        .toThrow(PortValidationError);
    });
  });
});
