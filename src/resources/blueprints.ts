/**
 * Blueprint resource for Port API
 * Handles blueprint CRUD operations
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Blueprint,
  CreateBlueprintInput,
  UpdateBlueprintInput,
  BlueprintPermissions,
} from '../types/blueprints';
import type {
  ApiBlueprintResponse,
  ApiBlueprintsResponse,
  ApiBlueprintRelationsResponse,
  ApiBlueprint,
  ApiItemResponse,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * BlueprintResource provides methods for managing Port blueprints
 */
export class BlueprintResource extends BaseResource {
  private readonly basePath = '/v1/blueprints';

  /**
   * Create a new blueprint
   * 
   * @param data - Blueprint creation data
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The created blueprint
   * 
   * @example
   * ```typescript
   * const blueprint = await client.blueprints.create({
   *   identifier: 'microservice',
   *   title: 'Microservice',
   *   icon: 'Microservice',
   *   schema: {
   *     properties: {
   *       name: { type: 'string', title: 'Name' },
   *       language: { type: 'string', title: 'Language' }
   *     },
   *     required: ['name']
   *   }
   * });
   * console.log(`Created: ${blueprint.identifier}`);
   * ```
   */
  async create(data: CreateBlueprintInput, options?: RequestOptions): Promise<Blueprint> {
    this.validateCreateInput(data);
    const response = await this.httpClient.post<ApiBlueprintResponse>(this.basePath, data, options);
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Get a blueprint by identifier
   * 
   * @param identifier - Blueprint identifier
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The blueprint
   * 
   * @example
   * ```typescript
   * const blueprint = await client.blueprints.get('microservice');
   * console.log(`Title: ${blueprint.title}`);
   * console.log(`Properties: ${Object.keys(blueprint.schema?.properties || {}).length}`);
   * ```
   */
  async get(identifier: string, options?: RequestOptions): Promise<Blueprint> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<ApiBlueprintResponse>(
      `${this.basePath}/${identifier}`,
      options
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Update a blueprint
   * 
   * @param identifier - Blueprint identifier
   * @param data - Blueprint update data (partial)
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The updated blueprint
   * 
   * @example
   * ```typescript
   * const updated = await client.blueprints.update('microservice', {
   *   title: 'Microservice (Updated)',
   *   description: 'A microservice blueprint',
   *   schema: {
   *     properties: {
   *       name: { type: 'string', title: 'Name' },
   *       version: { type: 'string', title: 'Version' }
   *     }
   *   }
   * });
   * console.log(`Updated: ${updated.identifier}`);
   * ```
   */
  async update(identifier: string, data: UpdateBlueprintInput, options?: RequestOptions): Promise<Blueprint> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.patch<ApiBlueprintResponse>(
      `${this.basePath}/${identifier}`,
      data,
      options
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Delete a blueprint
   * 
   * @param identifier - Blueprint identifier
   * @param options - Optional request options (timeout, headers, signal)
   * 
   * @example
   * ```typescript
   * await client.blueprints.delete('microservice');
   * console.log('Blueprint deleted');
   * ```
   */
  async delete(identifier: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(identifier);
    await this.httpClient.delete(`${this.basePath}/${identifier}`, options);
  }

  /**
   * List all blueprints
   * 
   * @param options - Optional request options (timeout, headers, signal)
   * @returns Array of all blueprints
   * 
   * @example
   * ```typescript
   * const blueprints = await client.blueprints.list();
   * console.log(`Found ${blueprints.length} blueprints`);
   * blueprints.forEach(bp => {
   *   console.log(`- ${bp.identifier}: ${bp.title}`);
   * });
   * ```
   */
  async list(options?: RequestOptions): Promise<Blueprint[]> {
    const response = await this.httpClient.get<ApiBlueprintsResponse>(this.basePath, options);
    return (response.blueprints || []).map((bp) => this.transformBlueprint(bp));
  }

  /**
   * Get blueprint permissions
   * 
   * @param identifier - Blueprint identifier
   * @param options - Optional request options
   * @returns The blueprint permissions
   */
  async getPermissions(identifier: string, options?: RequestOptions): Promise<BlueprintPermissions> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<ApiItemResponse<BlueprintPermissions>>(
      `${this.basePath}/${encodeURIComponent(identifier)}/permissions`,
      options
    );
    return (response.permissions || response) as BlueprintPermissions;
  }

  /**
   * Update blueprint permissions
   * 
   * @param identifier - Blueprint identifier
   * @param permissions - Permissions configuration
   * @param options - Optional request options
   * @returns The updated blueprint permissions
   */
  async updatePermissions(
    identifier: string,
    permissions: BlueprintPermissions,
    options?: RequestOptions
  ): Promise<BlueprintPermissions> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.patch<ApiItemResponse<BlueprintPermissions>>(
      `${this.basePath}/${encodeURIComponent(identifier)}/permissions`,
      permissions,
      options
    );
    return (response.permissions || response) as BlueprintPermissions;
  }

  /**
   * Rename a property in a blueprint
   */
  async renameProperty(
    blueprintIdentifier: string,
    propertyIdentifier: string,
    newPropertyName: string,
    options?: RequestOptions
  ): Promise<Blueprint> {
    this.validateIdentifier(blueprintIdentifier);
    const response = await this.httpClient.patch<ApiBlueprintResponse>(
      `${this.basePath}/${encodeURIComponent(blueprintIdentifier)}/properties/${encodeURIComponent(
        propertyIdentifier
      )}/rename`,
      { newPropertyName },
      options
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Rename a mirror property in a blueprint
   */
  async renameMirrorProperty(
    blueprintIdentifier: string,
    propertyIdentifier: string,
    newMirrorName: string,
    options?: RequestOptions
  ): Promise<Blueprint> {
    this.validateIdentifier(blueprintIdentifier);
    const response = await this.httpClient.patch<ApiBlueprintResponse>(
      `${this.basePath}/${encodeURIComponent(blueprintIdentifier)}/mirror/${encodeURIComponent(
        propertyIdentifier
      )}/rename`,
      { newMirrorName },
      options
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Rename a relation in a blueprint
   */
  async renameRelation(
    blueprintIdentifier: string,
    relationIdentifier: string,
    newRelationIdentifier: string,
    options?: RequestOptions
  ): Promise<Blueprint> {
    this.validateIdentifier(blueprintIdentifier);
    const response = await this.httpClient.patch<ApiBlueprintResponse>(
      `${this.basePath}/${encodeURIComponent(blueprintIdentifier)}/relations/${encodeURIComponent(
        relationIdentifier
      )}/rename`,
      { newRelationIdentifier },
      options
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Get relations for a blueprint
   */
  async getRelations(identifier: string, options?: RequestOptions): Promise<unknown[]> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<ApiBlueprintRelationsResponse>(
      `${this.basePath}/${identifier}/relations`,
      options
    );
    return response.relations;
  }

  /**
   * Validate blueprint identifier
   */
  private validateIdentifier(identifier: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError('Blueprint identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    // Validate format: alphanumeric, hyphens, underscores only
    if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
      throw new PortValidationError('Blueprint identifier has invalid format', [
        { field: 'identifier', message: 'Must contain only alphanumeric characters, hyphens, and underscores' },
      ]);
    }
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreateBlueprintInput): void {
    if (!data.identifier || data.identifier.trim() === '') {
      throw new PortValidationError('Blueprint identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(data.identifier)) {
      throw new PortValidationError('Blueprint identifier has invalid format', [
        { field: 'identifier', message: 'Must contain only alphanumeric characters, hyphens, and underscores' },
      ]);
    }

    if (!data.title || data.title.trim() === '') {
      throw new PortValidationError('Blueprint title is required', [
        { field: 'title', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API blueprint to SDK blueprint (convert date strings)
   */
  private transformBlueprint(blueprint: ApiBlueprint | Blueprint): Blueprint {
    const result: any = { ...blueprint };
    if (result.createdAt) {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt) {
      result.updatedAt = new Date(result.updatedAt);
    }
    return result as Blueprint;
  }
}

