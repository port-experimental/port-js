/**
 * Organization resource operations
 * 
 * Provides methods for managing organization settings and secrets in Port:
 * - Get and update organization details
 * - Manage organization secrets (CRUD operations)
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Organization,
  UpdateOrganizationInput,
  PatchOrganizationInput,
  OrganizationSecret,
  CreateSecretInput,
  UpdateSecretInput,
} from '../types/organization';
import type {
  ApiOrganizationResponse,
  ApiOrganizationSecretsResponse,
  ApiOrganizationSecretResponse,
  ApiOrganization,
  ApiOrganizationSecret,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * Organization resource class
 * 
 * @example
 * ```typescript
 * const client = new PortClient({...});
 * 
 * // Get organization details
 * const org = await client.organization.get();
 * 
 * // Update organization
 * await client.organization.update({
 *   name: 'My Organization',
 *   settings: {
 *     hiddenBlueprints: ['internal-service'],
 *   },
 * });
 * 
 * // Manage secrets
 * await client.organization.secrets.create({
 *   secretName: 'api-key',
 *   secretValue: 'secret-value',
 *   description: 'API key for external service',
 * });
 * ```
 */
export class OrganizationResource extends BaseResource {
  private readonly basePath = '/v1/organization';

  /**
   * Get organization details
   * 
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The organization details
   * 
   * @throws {PortAuthError} If authentication fails
   * 
   * @example
   * ```typescript
   * const org = await client.organization.get();
   * console.log(`Organization: ${org.name}`);
   * console.log(`Hidden blueprints: ${org.settings?.hiddenBlueprints?.length || 0}`);
   * ```
   */
  async get(options?: RequestOptions): Promise<Organization> {
    const response = await this.httpClient.get<ApiOrganizationResponse>(
      this.basePath,
      options
    );

    return this.transformOrganization(response.organization);
  }

  /**
   * Update organization (full update using PUT)
   * 
   * @param data - Organization update data
   * @param options - Optional request options (timeout, headers, signal)
   * @returns Success indicator
   * 
   * @throws {PortValidationError} If update data is invalid
   * 
   * @example
   * ```typescript
   * await client.organization.update({
   *   name: 'Updated Organization Name',
   *   settings: {
   *     hiddenBlueprints: ['internal-service'],
   *     portalTitle: 'My Portal',
   *   },
   * });
   * ```
   */
  async update(
    data: UpdateOrganizationInput,
    options?: RequestOptions
  ): Promise<void> {
    this.validateUpdateInput(data);

    await this.httpClient.put<{ ok: boolean }>(this.basePath, data, options);
  }

  /**
   * Patch organization (partial update using PATCH)
   * 
   * @param data - Organization patch data
   * @param options - Optional request options (timeout, headers, signal)
   * @returns Success indicator
   * 
   * @throws {PortValidationError} If patch data is invalid
   * 
   * @example
   * ```typescript
   * await client.organization.patch({
   *   name: 'Updated Name',
   *   settings: {
   *     portalIcon: 'NewIcon',
   *   },
   * });
   * ```
   */
  async patch(
    data: PatchOrganizationInput,
    options?: RequestOptions
  ): Promise<void> {
    this.validatePatchInput(data);

    await this.httpClient.patch<{ ok: boolean }>(this.basePath, data, options);
  }

  /**
   * Secrets sub-resource
   */
  readonly secrets = {
    /**
     * List all organization secrets
     * 
     * @param options - Optional request options (timeout, headers, signal)
     * @returns Array of secret metadata (values are never returned)
     * 
     * @throws {PortAuthError} If authentication fails
     * 
     * @example
     * ```typescript
     * const secrets = await client.organization.secrets.list();
     * console.log(`Found ${secrets.length} secret(s)`);
     * ```
     */
    list: async (options?: RequestOptions): Promise<OrganizationSecret[]> => {
      const response = await this.httpClient.get<ApiOrganizationSecretsResponse>(
        `${this.basePath}/secrets`,
        options
      );

      return (response.secrets || []).map((secret) =>
        this.transformSecret(secret)
      );
    },

    /**
     * Get a secret's metadata
     * 
     * @param secretName - The name of the secret
     * @param options - Optional request options (timeout, headers, signal)
     * @returns Secret metadata (value is never returned)
     * 
     * @throws {PortNotFoundError} If secret doesn't exist
     * 
     * @example
     * ```typescript
     * const secret = await client.organization.secrets.get('api-key');
     * console.log(`Secret: ${secret.secretName}`);
     * console.log(`Description: ${secret.description || 'N/A'}`);
     * ```
     */
    get: async (
      secretName: string,
      options?: RequestOptions
    ): Promise<OrganizationSecret> => {
      this.validateSecretName(secretName);

      const response = await this.httpClient.get<ApiOrganizationSecretResponse>(
        `${this.basePath}/secrets/${encodeURIComponent(secretName)}`,
        options
      );

      return this.transformSecret(response.secret);
    },

    /**
     * Create a new secret
     * 
     * @param data - Secret creation data
     * @param options - Optional request options (timeout, headers, signal)
     * @returns Secret metadata (value is never returned)
     * 
     * @throws {PortValidationError} If secret data is invalid
     * 
     * @example
     * ```typescript
     * const secret = await client.organization.secrets.create({
     *   secretName: 'api-key',
     *   secretValue: 'my-secret-value',
     *   description: 'API key for external service',
     * });
     * ```
     */
    create: async (
      data: CreateSecretInput,
      options?: RequestOptions
    ): Promise<OrganizationSecret> => {
      this.validateCreateSecretInput(data);

      const response = await this.httpClient.post<ApiOrganizationSecretResponse>(
        `${this.basePath}/secrets`,
        {
          secretName: data.secretName,
          secretValue: data.secretValue,
          description: data.description,
        },
        options
      );

      return this.transformSecret(response.secret);
    },

    /**
     * Update a secret
     * 
     * @param secretName - The name of the secret
     * @param data - Secret update data
     * @param options - Optional request options (timeout, headers, signal)
     * @returns Secret metadata (value is never returned)
     * 
     * @throws {PortValidationError} If secret name or data is invalid
     * @throws {PortNotFoundError} If secret doesn't exist
     * 
     * @example
     * ```typescript
     * const updated = await client.organization.secrets.update('api-key', {
     *   secretValue: 'new-secret-value',
     *   description: 'Updated description',
     * });
     * ```
     */
    update: async (
      secretName: string,
      data: UpdateSecretInput,
      options?: RequestOptions
    ): Promise<OrganizationSecret> => {
      this.validateSecretName(secretName);

      const response = await this.httpClient.patch<ApiOrganizationSecretResponse>(
        `${this.basePath}/secrets/${encodeURIComponent(secretName)}`,
        data,
        options
      );

      return this.transformSecret(response.secret);
    },

    /**
     * Delete a secret
     * 
     * @param secretName - The name of the secret
     * @param options - Optional request options (timeout, headers, signal)
     * 
     * @throws {PortValidationError} If secret name is invalid
     * @throws {PortNotFoundError} If secret doesn't exist
     * 
     * @example
     * ```typescript
     * await client.organization.secrets.delete('api-key');
     * ```
     */
    delete: async (secretName: string, options?: RequestOptions): Promise<void> => {
      this.validateSecretName(secretName);

      await this.httpClient.delete(
        `${this.basePath}/secrets/${encodeURIComponent(secretName)}`,
        options
      );
    },
  };

  /**
   * Validate update input
   */
  private validateUpdateInput(data: UpdateOrganizationInput): void {
    if (!data.name || data.name.trim() === '') {
      throw new PortValidationError('Organization name is required', [
        { field: 'name', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate patch input
   */
  private validatePatchInput(data: PatchOrganizationInput): void {
    if (!data.name || data.name.trim() === '') {
      throw new PortValidationError('Organization name is required', [
        { field: 'name', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate secret name
   */
  private validateSecretName(secretName: string): void {
    if (!secretName || secretName.trim() === '') {
      throw new PortValidationError('Secret name is required', [
        { field: 'secretName', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate create secret input
   */
  private validateCreateSecretInput(data: CreateSecretInput): void {
    if (!data.secretName || data.secretName.trim() === '') {
      throw new PortValidationError('Secret name is required', [
        { field: 'secretName', message: 'Required field' },
      ]);
    }

    if (!data.secretValue || data.secretValue.trim() === '') {
      throw new PortValidationError('Secret value is required', [
        { field: 'secretValue', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API organization to SDK organization
   */
  private transformOrganization(
    apiOrganization: ApiOrganization | Organization
  ): Organization {
    const result: any = { ...apiOrganization };

    // Transform supportUserExpiresAt from string to Date if present
    if (result.settings?.supportUserExpiresAt) {
      if (typeof result.settings.supportUserExpiresAt === 'string') {
        result.settings.supportUserExpiresAt = new Date(
          result.settings.supportUserExpiresAt
        );
      }
    }

    return result as Organization;
  }

  /**
   * Transform API secret to SDK secret
   */
  private transformSecret(
    apiSecret: ApiOrganizationSecret | OrganizationSecret
  ): OrganizationSecret {
    const result: any = { ...apiSecret };

    // Transform date strings to Date objects
    if (result.createdAt && typeof result.createdAt === 'string') {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt && typeof result.updatedAt === 'string') {
      result.updatedAt = new Date(result.updatedAt);
    }

    return result as OrganizationSecret;
  }
}

