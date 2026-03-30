/**
 * Integration resource operations
 * 
 * Provides methods for managing integrations in Port:
 * - List and get integrations
 * - Update and delete integrations
 * - Manage integration configuration
 * - View integration logs
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Integration,
  UpdateIntegrationInput,
  UpdateIntegrationConfigInput,
  ListIntegrationsOptions,
  GetIntegrationOptions,
  IntegrationLog,
  IntegrationLogOptions,
} from '../types/integrations';
import type {
  ApiIntegrationResponse,
  ApiIntegrationsResponse,
  ApiIntegrationLogsResponse,
  ApiIntegration,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * Integration resource class
 * 
 * @example
 * ```typescript
 * const client = new PortClient({...});
 * 
 * // List all integrations
 * const integrations = await client.integrations.list();
 * 
 * // Get a specific integration
 * const integration = await client.integrations.get('my-integration');
 * 
 * // Update an integration
 * await client.integrations.update('my-integration', {
 *   title: 'Updated Integration',
 * });
 * 
 * // Trigger a resync (update with empty body)
 * await client.integrations.resync('my-integration');
 * ```
 */
export class IntegrationResource extends BaseResource {
  private readonly basePath = '/v1/integration';

  /**
   * List all integrations
   * 
   * @param options - Optional filtering options
   * @param requestOptions - Optional request options (timeout, headers, signal)
   * @returns Array of integrations
   * 
   * @throws {PortAuthError} If authentication fails
   * 
   * @example
   * ```typescript
   * // List all integrations
   * const integrations = await client.integrations.list();
   * 
   * // List only integrations with actions processing enabled
   * const integrations = await client.integrations.list({
   *   actionsProcessingEnabled: true,
   * });
   * ```
   */
  async list(
    options?: ListIntegrationsOptions & { requestOptions?: RequestOptions }
  ): Promise<Integration[]> {
    const url = this.buildUrl(this.basePath, {
      actionsProcessingEnabled: options?.actionsProcessingEnabled,
    });

    const response = await this.httpClient.get<ApiIntegrationsResponse>(
      url,
      options?.requestOptions
    );

    return (response.integrations || []).map((integration) =>
      this.transformIntegration(integration)
    );
  }

  /**
   * Get an integration by identifier
   * 
   * @param identifier - Integration identifier (or installationId/logIngestId if byField is set)
   * @param options - Optional get options (byField) and request options
   * @returns The integration
   * 
   * @throws {PortNotFoundError} If integration doesn't exist
   * 
   * @example
   * ```typescript
   * // Get by identifier
   * const integration = await client.integrations.get('my-integration');
   * 
   * // Get by installation ID
   * const integration = await client.integrations.get('install-123', {
   *   byField: 'installationId',
   * });
   * ```
   */
  async get(
    identifier: string,
    options?: GetIntegrationOptions & { requestOptions?: RequestOptions }
  ): Promise<Integration> {
    this.validateIdentifier(identifier);

    const url = this.buildUrl(`${this.basePath}/${encodeURIComponent(identifier)}`, {
      byField: options?.byField,
    });

    const response = await this.httpClient.get<ApiIntegrationResponse>(
      url,
      options?.requestOptions
    );

    return this.transformIntegration(response.integration);
  }

  /**
   * Update an integration
   * 
   * @param identifier - Integration identifier
   * @param data - Update data (partial)
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The updated integration
   * 
   * @throws {PortValidationError} If update data is invalid
   * @throws {PortNotFoundError} If integration doesn't exist
   * 
   * @example
   * ```typescript
   * const updated = await client.integrations.update('my-integration', {
   *   title: 'Updated Integration',
   *   actionsProcessingEnabled: true,
   * });
   * ```
   */
  async update(
    identifier: string,
    data: UpdateIntegrationInput,
    options?: RequestOptions
  ): Promise<Integration> {
    this.validateIdentifier(identifier);

    const response = await this.httpClient.patch<ApiIntegrationResponse>(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      data,
      options
    );

    return this.transformIntegration(response.integration);
  }

  /**
   * Delete an integration
   * 
   * @param identifier - Integration identifier
   * @param options - Optional request options (timeout, headers, signal)
   * 
   * @throws {PortNotFoundError} If integration doesn't exist
   * 
   * @example
   * ```typescript
   * await client.integrations.delete('my-integration');
   * ```
   */
  async delete(identifier: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(identifier);

    await this.httpClient.delete(
      `${this.basePath}/${encodeURIComponent(identifier)}`,
      options
    );
  }

  /**
   * Update integration configuration only
   * 
   * @param identifier - Integration identifier
   * @param config - Configuration data
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The updated integration
   * 
   * @throws {PortValidationError} If config is invalid
   * @throws {PortNotFoundError} If integration doesn't exist
   * 
   * @example
   * ```typescript
   * await client.integrations.updateConfig('my-integration', {
   *   config: {
   *     deleteDependentEntities: true,
   *     createMissingRelatedEntities: false,
   *     resources: [...],
   *   },
   * });
   * ```
   */
  async updateConfig(
    identifier: string,
    config: UpdateIntegrationConfigInput,
    options?: RequestOptions
  ): Promise<Integration> {
    this.validateIdentifier(identifier);

    const response = await this.httpClient.patch<ApiIntegrationResponse>(
      `${this.basePath}/${encodeURIComponent(identifier)}/config`,
      config,
      options
    );

    return this.transformIntegration(response.integration);
  }

  /**
   * Get integration logs
   * 
   * @param identifier - Integration identifier
   * @param options - Log query options and request options
   * @returns Array of integration logs
   * 
   * @throws {PortNotFoundError} If integration doesn't exist
   * 
   * @example
   * ```typescript
   * // Get recent logs
   * const logs = await client.integrations.getLogs('my-integration', {
   *   limit: 50,
   * });
   * 
   * // Get logs from a specific timestamp
   * const logs = await client.integrations.getLogs('my-integration', {
   *   timestamp: '2025-12-09T00:00:00Z',
   *   direction: 'down',
   *   limit: 100,
   * });
   * ```
   */
  async getLogs(
    identifier: string,
    options?: IntegrationLogOptions & { requestOptions?: RequestOptions }
  ): Promise<IntegrationLog[]> {
    this.validateIdentifier(identifier);

    const url = this.buildUrl(`${this.basePath}/${encodeURIComponent(identifier)}/logs`, {
      limit: options?.limit,
      timestamp: options?.timestamp,
      log_id: options?.log_id,
      direction: options?.direction,
    });

    const response = await this.httpClient.get<ApiIntegrationLogsResponse>(
      url,
      options?.requestOptions
    );

    return response.logs || [];
  }

  /**
   * Trigger a resync of an integration
   * 
   * This is a convenience method that calls update with an empty body,
   * which triggers a resync without changing the integration configuration.
   * 
   * @param identifier - Integration identifier
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The integration (after resync is triggered)
   * 
   * @throws {PortNotFoundError} If integration doesn't exist
   * 
   * @example
   * ```typescript
   * // Trigger a resync
   * await client.integrations.resync('my-integration');
   * ```
   */
  async resync(identifier: string, options?: RequestOptions): Promise<Integration> {
    return this.update(identifier, {}, options);
  }

  /**
   * Validate identifier
   */
  private validateIdentifier(identifier: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError('Identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API integration to SDK integration
   */
  private transformIntegration(apiIntegration: ApiIntegration | Integration): Integration {
    const result: any = { ...apiIntegration };

    // Transform date strings to Date objects
    if (result.createdAt && typeof result.createdAt === 'string') {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt && typeof result.updatedAt === 'string') {
      result.updatedAt = new Date(result.updatedAt);
    }

    return result as Integration;
  }
}

