/**
 * Webhook resource operations
 */

import { BaseResource } from './base';
import type { HttpClient, RequestOptions } from '../http-client';
import type { Webhook, CreateWebhookInput, UpdateWebhookInput } from '../types/webhooks';
import { PortValidationError } from '../errors';

interface ApiWebhookResponse {
  webhook: any;
  ok: boolean;
}

interface ApiWebhooksResponse {
  webhooks: any[];
  ok: boolean;
}

/**
 * WebhookResource handles webhook CRUD operations
 */
export class WebhookResource extends BaseResource {
  private readonly basePath = '/v1/webhooks';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  async create(data: CreateWebhookInput, options?: RequestOptions): Promise<Webhook> {
    if (!data.identifier) {
      throw new PortValidationError('Identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    const response = await this.httpClient.post<ApiWebhookResponse>(
      this.basePath,
      data,
      options
    );

    return this.transformWebhook(response.webhook);
  }

  async get(identifier: string, options?: RequestOptions): Promise<Webhook> {
    if (!identifier) {
      throw new PortValidationError('Identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    const response = await this.httpClient.get<ApiWebhookResponse>(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      options
    );

    return this.transformWebhook(response.webhook);
  }

  async update(
    identifier: string,
    data: UpdateWebhookInput,
    options?: RequestOptions
  ): Promise<Webhook> {
    if (!identifier) {
      throw new PortValidationError('Identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    const response = await this.httpClient.patch<ApiWebhookResponse>(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      data,
      options
    );

    return this.transformWebhook(response.webhook);
  }

  async delete(identifier: string, options?: RequestOptions): Promise<void> {
    if (!identifier) {
      throw new PortValidationError('Identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    await this.httpClient.delete(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      options
    );
  }

  async list(options?: RequestOptions): Promise<Webhook[]> {
    const response = await this.httpClient.get<ApiWebhooksResponse>(
      this.basePath,
      options
    );

    return (response.webhooks || []).map((wh) => this.transformWebhook(wh));
  }

  private transformWebhook(apiWebhook: any): Webhook {
    return {
      identifier: apiWebhook.identifier,
      title: apiWebhook.title,
      description: apiWebhook.description,
      icon: apiWebhook.icon,
      enabled: apiWebhook.enabled ?? true,
      integrationType: apiWebhook.integrationType,
      url: apiWebhook.url,
      mappings: apiWebhook.mappings,
      security: apiWebhook.security,
      createdAt: apiWebhook.createdAt ? new Date(apiWebhook.createdAt) : undefined,
      updatedAt: apiWebhook.updatedAt ? new Date(apiWebhook.updatedAt) : undefined,
    };
  }
}

