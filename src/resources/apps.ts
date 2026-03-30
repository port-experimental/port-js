/**
 * App resource operations
 * 
 * Provides methods for managing Port app installations and credentials:
 * - List and get apps
 * - Update app name
 * - Delete apps
 * - Rotate app secrets
 */

import { BaseResource } from './base';
import { PortValidationError, PortNotFoundError } from '../errors';
import type {
  App,
  UpdateAppInput,
  AppSecret,
  ListAppsOptions,
} from '../types/apps';
import type {
  ApiAppsResponse,
  ApiAppResponse,
  ApiAppSecretResponse,
  ApiApp,
  ApiAppSecret,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * App resource class
 * 
 * @example
 * ```typescript
 * const client = new PortClient({...});
 * 
 * // List all apps
 * const apps = await client.apps.list();
 * 
 * // Get a specific app
 * const app = await client.apps.get('app-id');
 * 
 * // Update app name
 * await client.apps.update('app-id', { name: 'New Name' });
 * 
 * // Rotate secret
 * const rotated = await client.apps.rotateSecret('app-id');
 * ```
 */
export class AppResource extends BaseResource {
  private readonly basePath = '/v1/apps';

  /**
   * List all apps
   * 
   * @param options - Optional list options (fields) and request options
   * @returns Array of apps
   * 
   * @throws {PortAuthError} If authentication fails
   * 
   * @example
   * ```typescript
   * // List all apps
   * const apps = await client.apps.list();
   * 
   * // List apps with specific fields
   * const apps = await client.apps.list({
   *   fields: ['id', 'name', 'enabled'],
   * });
   * ```
   */
  async list(
    options?: ListAppsOptions & { requestOptions?: RequestOptions }
  ): Promise<App[]> {
    const url = this.buildUrl(this.basePath, {
      fields: options?.fields?.join(','),
    });

    const response = await this.httpClient.get<ApiAppsResponse>(
      url,
      options?.requestOptions
    );

    return (response.apps || []).map((app) => this.transformApp(app));
  }

  /**
   * Get an app by ID
   * 
   * Note: The API doesn't provide a direct GET endpoint for individual apps.
   * This method fetches all apps and filters by ID. For better performance,
   * consider using `list()` and filtering client-side.
   * 
   * @param id - App ID
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The app
   * 
   * @throws {PortNotFoundError} If app doesn't exist
   * 
   * @example
   * ```typescript
   * const app = await client.apps.get('app-id');
   * console.log(`App: ${app.name}`);
   * ```
   */
  async get(id: string, options?: RequestOptions): Promise<App> {
    this.validateId(id);

    // Fetch all apps and filter by ID
    // Note: This is less efficient than a direct GET, but the API doesn't provide one
    const apps = await this.list({ requestOptions: options });
    const app = apps.find((a) => a.id === id);

    if (!app) {
      throw new PortNotFoundError('App', id);
    }

    return app;
  }

  /**
   * Update an app name
   * 
   * @param id - App ID
   * @param data - Update data (name)
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The updated app
   * 
   * @throws {PortValidationError} If update data is invalid
   * @throws {PortNotFoundError} If app doesn't exist
   * 
   * @example
   * ```typescript
   * const updated = await client.apps.update('app-id', {
   *   name: 'Updated App Name',
   * });
   * ```
   */
  async update(
    id: string,
    data: UpdateAppInput,
    options?: RequestOptions
  ): Promise<App> {
    this.validateId(id);
    this.validateUpdateInput(data);

    const response = await this.httpClient.put<ApiAppResponse>(
      `${this.basePath}/${encodeURIComponent(id)}`,
      data,
      options
    );

    return this.transformApp(response.app);
  }

  /**
   * Delete an app
   * 
   * @param id - App ID
   * @param options - Optional request options (timeout, headers, signal)
   * 
   * @throws {PortNotFoundError} If app doesn't exist
   * 
   * @example
   * ```typescript
   * await client.apps.delete('app-id');
   * ```
   */
  async delete(id: string, options?: RequestOptions): Promise<void> {
    this.validateId(id);

    await this.httpClient.delete(`${this.basePath}/${encodeURIComponent(id)}`, options);
  }

  /**
   * Rotate app secret
   * 
   * @param id - App ID
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The app with new secret (secret is only returned immediately after rotation)
   * 
   * @throws {PortNotFoundError} If app doesn't exist
   * 
   * @example
   * ```typescript
   * const rotated = await client.apps.rotateSecret('app-id');
   * console.log(`New secret: ${rotated.secret}`);
   * console.log('⚠️  Save this secret immediately - it won't be returned again!');
   * ```
   */
  async rotateSecret(id: string, options?: RequestOptions): Promise<AppSecret> {
    this.validateId(id);

    const response = await this.httpClient.post<ApiAppSecretResponse>(
      `${this.basePath}/${encodeURIComponent(id)}/rotate-secret`,
      undefined,
      options
    );

    return this.transformAppSecret(response.app);
  }

  /**
   * Validate ID
   */
  private validateId(id: string): void {
    if (!id || id.trim() === '') {
      throw new PortValidationError('App ID is required', [
        { field: 'id', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate update input
   */
  private validateUpdateInput(data: UpdateAppInput): void {
    if (!data.name || data.name.trim() === '') {
      throw new PortValidationError('App name is required', [
        { field: 'name', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API app to SDK app
   */
  private transformApp(apiApp: ApiApp | App): App {
    const result: any = { ...apiApp };

    // Transform date strings to Date objects
    if (result.createdAt && typeof result.createdAt === 'string') {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt && typeof result.updatedAt === 'string') {
      result.updatedAt = new Date(result.updatedAt);
    }

    return result as App;
  }

  /**
   * Transform API app secret to SDK app secret
   */
  private transformAppSecret(apiAppSecret: ApiAppSecret | AppSecret): AppSecret {
    const result: any = { ...apiAppSecret };

    // Transform date strings to Date objects
    if (result.createdAt && typeof result.createdAt === 'string') {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt && typeof result.updatedAt === 'string') {
      result.updatedAt = new Date(result.updatedAt);
    }

    return result as AppSecret;
  }
}

