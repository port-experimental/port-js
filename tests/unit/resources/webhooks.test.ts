/**
 * Tests for WebhookResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookResource } from '../../../src/resources/webhooks';
import type { HttpClient } from '../../../src/http-client';
import { PortValidationError } from '../../../src/errors';
import type { CreateWebhookInput, UpdateWebhookInput } from '../../../src/types/webhooks';

describe('WebhookResource', () => {
  let mockHttpClient: HttpClient;
  let webhookResource: WebhookResource;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
    } as unknown as HttpClient;

    webhookResource = new WebhookResource(mockHttpClient);
  });

  describe('create', () => {
    it('should create a webhook with valid data', async () => {
      const input: CreateWebhookInput = {
        identifier: 'slack-webhook',
        title: 'Slack Notifications',
        integrationType: 'slack',
        url: 'https://hooks.slack.com/services/xxx',
        enabled: true,
      };

      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'slack-webhook',
          title: 'Slack Notifications',
          integrationType: 'slack',
          url: 'https://hooks.slack.com/services/xxx',
          enabled: true,
          createdAt: '2025-10-05T00:00:00Z',
          updatedAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await webhookResource.create(input);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/webhooks', input, undefined);
      expect(result.identifier).toBe('slack-webhook');
      expect(result.title).toBe('Slack Notifications');
      expect(result.enabled).toBe(true);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should create webhook with all optional fields', async () => {
      const input: CreateWebhookInput = {
        identifier: 'webhook-1',
        title: 'Full Webhook',
        description: 'A comprehensive webhook',
        icon: 'webhook-icon',
        enabled: true,
        integrationType: 'custom',
        url: 'https://example.com/webhook',
        mappings: [
          {
            blueprint: 'service',
            filter: { combinator: 'and', rules: [] },
          },
        ],
        security: {
          secret: 'webhook-secret',
          signatureHeaderName: 'X-Signature',
        },
      };

      const mockResponse = {
        ok: true,
        webhook: {
          ...input,
          createdAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await webhookResource.create(input);

      expect(result.identifier).toBe('webhook-1');
      expect(result.description).toBe('A comprehensive webhook');
      expect(result.icon).toBe('webhook-icon');
      expect(result.mappings).toHaveLength(1);
      expect(result.security).toEqual({
        secret: 'webhook-secret',
        signatureHeaderName: 'X-Signature',
      });
    });

    it('should throw PortValidationError when identifier is missing', async () => {
      const input = {
        title: 'Test Webhook',
      } as CreateWebhookInput;

      await expect(webhookResource.create(input)).rejects.toThrow(PortValidationError);
      await expect(webhookResource.create(input)).rejects.toThrow('Identifier is required');
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should throw PortValidationError when identifier is empty', async () => {
      const input = {
        identifier: '',
        title: 'Test Webhook',
      } as CreateWebhookInput;

      await expect(webhookResource.create(input)).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });

    it('should pass request options', async () => {
      const input: CreateWebhookInput = {
        identifier: 'webhook-1',
        title: 'Test',
        integrationType: 'custom',
        url: 'https://example.com',
      };

      const mockResponse = { ok: true, webhook: input };
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const options = { skipRetry: true };
      await webhookResource.create(input, options);

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/webhooks', input, options);
    });

    it('should handle enabled field defaulting to true', async () => {
      const input: CreateWebhookInput = {
        identifier: 'webhook-1',
        title: 'Test',
        integrationType: 'custom',
        url: 'https://example.com',
      };

      const mockResponse = {
        ok: true,
        webhook: {
          ...input,
          // enabled field is missing from API response
        },
      };

      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await webhookResource.create(input);

      expect(result.enabled).toBe(true);
    });
  });

  describe('get', () => {
    it('should fetch a webhook by identifier', async () => {
      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test Webhook',
          enabled: true,
          integrationType: 'slack',
          url: 'https://hooks.slack.com/services/xxx',
          createdAt: '2025-10-05T00:00:00Z',
          updatedAt: '2025-10-05T00:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.get('webhook-1');

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/webhooks/webhook-1', undefined);
      expect(result.identifier).toBe('webhook-1');
      expect(result.title).toBe('Test Webhook');
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should URL-encode webhook identifier', async () => {
      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook with spaces',
          title: 'Test',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      await webhookResource.get('webhook with spaces');

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/webhooks/webhook%20with%20spaces',
        undefined
      );
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(webhookResource.get('')).rejects.toThrow(PortValidationError);
      await expect(webhookResource.get('')).rejects.toThrow('Identifier is required');
      expect(mockHttpClient.get).not.toHaveBeenCalled();
    });

    it('should pass request options', async () => {
      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const options = { skipRetry: true };
      await webhookResource.get('webhook-1', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/webhooks/webhook-1', options);
    });

    it('should handle webhook without timestamps', async () => {
      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test',
          enabled: false,
          integrationType: 'custom',
          url: 'https://example.com',
          // No createdAt/updatedAt
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.get('webhook-1');

      expect(result.createdAt).toBeUndefined();
      expect(result.updatedAt).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update a webhook', async () => {
      const updateData: UpdateWebhookInput = {
        title: 'Updated Webhook',
        enabled: false,
      };

      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Updated Webhook',
          enabled: false,
          integrationType: 'slack',
          url: 'https://hooks.slack.com/services/xxx',
          updatedAt: '2025-10-05T12:00:00Z',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await webhookResource.update('webhook-1', updateData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/webhooks/webhook-1',
        updateData,
        undefined
      );
      expect(result.title).toBe('Updated Webhook');
      expect(result.enabled).toBe(false);
    });

    it('should update webhook URL', async () => {
      const updateData: UpdateWebhookInput = {
        url: 'https://new-url.example.com/webhook',
      };

      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test',
          enabled: true,
          integrationType: 'custom',
          url: 'https://new-url.example.com/webhook',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await webhookResource.update('webhook-1', updateData);

      expect(result.url).toBe('https://new-url.example.com/webhook');
    });

    it('should update webhook mappings', async () => {
      const updateData: UpdateWebhookInput = {
        mappings: [
          {
            blueprint: 'service',
            filter: {
              combinator: 'and',
              rules: [{ property: 'environment', operator: '=', value: 'production' }],
            },
          },
        ],
      };

      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
          mappings: updateData.mappings,
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const result = await webhookResource.update('webhook-1', updateData);

      expect(result.mappings).toHaveLength(1);
      expect(result.mappings?.[0].blueprint).toBe('service');
    });

    it('should throw PortValidationError for empty identifier', async () => {
      const updateData = { title: 'Updated' };

      await expect(webhookResource.update('', updateData)).rejects.toThrow(PortValidationError);
      expect(mockHttpClient.patch).not.toHaveBeenCalled();
    });

    it('should URL-encode webhook identifier', async () => {
      const updateData = { title: 'Updated' };

      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-id',
          title: 'Updated',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      await webhookResource.update('webhook@special', updateData);

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        '/v1/webhooks/webhook%40special',
        updateData,
        undefined
      );
    });

    it('should pass request options', async () => {
      const updateData = { title: 'Updated' };

      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Updated',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
        },
      };

      vi.mocked(mockHttpClient.patch).mockResolvedValue(mockResponse);

      const options = { skipRetry: true };
      await webhookResource.update('webhook-1', updateData, options);

      expect(mockHttpClient.patch).toHaveBeenCalledWith('/v1/webhooks/webhook-1', updateData, options);
    });
  });

  describe('delete', () => {
    it('should delete a webhook by identifier', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await webhookResource.delete('webhook-1');

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/v1/webhooks/webhook-1', undefined);
    });

    it('should URL-encode webhook identifier', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      await webhookResource.delete('webhook/with/slashes');

      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        '/v1/webhooks/webhook%2Fwith%2Fslashes',
        undefined
      );
    });

    it('should throw PortValidationError for empty identifier', async () => {
      await expect(webhookResource.delete('')).rejects.toThrow(PortValidationError);
      await expect(webhookResource.delete('')).rejects.toThrow('Identifier is required');
      expect(mockHttpClient.delete).not.toHaveBeenCalled();
    });

    it('should pass request options', async () => {
      vi.mocked(mockHttpClient.delete).mockResolvedValue(undefined);

      const options = { skipRetry: true };
      await webhookResource.delete('webhook-1', options);

      expect(mockHttpClient.delete).toHaveBeenCalledWith('/v1/webhooks/webhook-1', options);
    });
  });

  describe('list', () => {
    it('should list all webhooks', async () => {
      const mockResponse = {
        ok: true,
        webhooks: [
          {
            identifier: 'webhook-1',
            title: 'Slack',
            enabled: true,
            integrationType: 'slack',
            url: 'https://hooks.slack.com/1',
            createdAt: '2025-10-05T00:00:00Z',
          },
          {
            identifier: 'webhook-2',
            title: 'Discord',
            enabled: true,
            integrationType: 'discord',
            url: 'https://discord.com/api/webhooks/2',
            createdAt: '2025-10-05T01:00:00Z',
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/webhooks', undefined);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('webhook-1');
      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[1].identifier).toBe('webhook-2');
    });

    it('should handle empty webhook list', async () => {
      const mockResponse = {
        ok: true,
        webhooks: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.list();

      expect(result).toEqual([]);
    });

    it('should handle missing webhooks property', async () => {
      const mockResponse = {
        ok: true,
        // webhooks property is missing
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.list();

      expect(result).toEqual([]);
    });

    it('should pass request options', async () => {
      const mockResponse = {
        ok: true,
        webhooks: [],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const options = { skipRetry: true };
      await webhookResource.list(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/v1/webhooks', options);
    });

    it('should transform all webhook dates', async () => {
      const mockResponse = {
        ok: true,
        webhooks: [
          {
            identifier: 'webhook-1',
            title: 'Test 1',
            enabled: true,
            integrationType: 'custom',
            url: 'https://example.com',
            createdAt: '2025-10-05T00:00:00Z',
            updatedAt: '2025-10-05T01:00:00Z',
          },
          {
            identifier: 'webhook-2',
            title: 'Test 2',
            enabled: false,
            integrationType: 'custom',
            url: 'https://example.com',
            createdAt: '2025-10-04T00:00:00Z',
            // No updatedAt
          },
        ],
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.list();

      expect(result[0].createdAt).toBeInstanceOf(Date);
      expect(result[0].updatedAt).toBeInstanceOf(Date);
      expect(result[1].createdAt).toBeInstanceOf(Date);
      expect(result[1].updatedAt).toBeUndefined();
    });
  });

  describe('date transformation', () => {
    it('should convert createdAt string to Date object', async () => {
      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
          createdAt: '2025-10-05T10:30:00.000Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.get('webhook-1');

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt?.toISOString()).toBe('2025-10-05T10:30:00.000Z');
    });

    it('should convert updatedAt string to Date object', async () => {
      const mockResponse = {
        ok: true,
        webhook: {
          identifier: 'webhook-1',
          title: 'Test',
          enabled: true,
          integrationType: 'custom',
          url: 'https://example.com',
          updatedAt: '2025-10-05T15:45:30.123Z',
        },
      };

      vi.mocked(mockHttpClient.get).mockResolvedValue(mockResponse);

      const result = await webhookResource.get('webhook-1');

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.updatedAt?.toISOString()).toBe('2025-10-05T15:45:30.123Z');
    });
  });
});
