/**
 * Entity resource operations
 * 
 * Provides methods for managing entities in Port:
 * - CRUD operations (create, read, update, delete)
 * - Search and filtering
 * - Batch operations
 * - Relation management
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Entity,
  CreateEntityInput,
  UpdateEntityInput,
  ListEntityOptions,
  EntitySearchQuery,
  PaginatedResponse,
  BatchUpdateEntityInput,
  ApiEntity,
  ApiEntityResponse,
  ApiEntitiesResponse,
} from '../types';

/**
 * Entity resource class
 * 
 * @example
 * ```typescript
 * const client = new PortClient({...});
 * 
 * // Create an entity
 * const entity = await client.entities.create({
 *   identifier: 'my-service',
 *   blueprint: 'service',
 *   title: 'My Service',
 * });
 * 
 * // Get an entity
 * const entity = await client.entities.get('my-service');
 * 
 * // Update an entity
 * await client.entities.update('my-service', {
 *   title: 'Updated Service',
 * });
 * 
 * // Delete an entity
 * await client.entities.delete('my-service');
 * ```
 */
export class EntityResource extends BaseResource {
  private readonly basePath = '/v1/blueprints';

  /**
   * Create a new entity
   * 
   * @param data - Entity data conforming to its blueprint schema
   * @returns The created entity
   * 
   * @throws {PortAuthError} If authentication fails
   * @throws {PortValidationError} If entity data is invalid
   * @throws {PortNotFoundError} If blueprint doesn't exist
   * 
   * @example
   * ```typescript
   * const entity = await client.entities.create({
   *   identifier: 'my-service',
   *   blueprint: 'service',
   *   title: 'My Service',
   *   properties: {
   *     stringProps: {
   *       environment: 'production',
   *     },
   *   },
   * });
   * ```
   */
  async create(data: CreateEntityInput): Promise<Entity> {
    this.validateCreateInput(data);
    
    const response = await this.httpClient.post<ApiEntityResponse>(
      `${this.basePath}/${data.blueprint}/entities`,
      data
    );

    return this.transformEntity(response.entity);
  }

  /**
   * Get an entity by identifier
   * 
   * @param identifier - Entity identifier
   * @param blueprint - Blueprint identifier (optional, for efficiency)
   * @returns The entity
   * 
   * @throws {PortNotFoundError} If entity doesn't exist
   * 
   * @example
   * ```typescript
   * const entity = await client.entities.get('my-service');
   * ```
   */
  async get(identifier: string, blueprint?: string): Promise<Entity> {
    this.validateIdentifier(identifier);

    let path: string;
    if (blueprint) {
      path = `${this.basePath}/${blueprint}/entities/${identifier}`;
    } else {
      // Search across all blueprints
      path = `/v1/entities/${identifier}`;
    }

    const response = await this.httpClient.get<ApiEntityResponse>(path);
    return this.transformEntity(response.entity);
  }

  /**
   * Update an entity
   * 
   * @param identifier - Entity identifier
   * @param data - Fields to update
   * @param blueprint - Blueprint identifier (optional)
   * @returns The updated entity
   * 
   * @throws {PortNotFoundError} If entity doesn't exist
   * @throws {PortValidationError} If update data is invalid
   * 
   * @example
   * ```typescript
   * const entity = await client.entities.update('my-service', {
   *   title: 'Updated Service',
   *   properties: {
   *     stringProps: {
   *       status: 'healthy',
   *     },
   *   },
   * });
   * ```
   */
  async update(
    identifier: string,
    data: UpdateEntityInput,
    blueprint?: string
  ): Promise<Entity> {
    this.validateIdentifier(identifier);

    let path: string;
    if (blueprint) {
      path = `${this.basePath}/${blueprint}/entities/${identifier}`;
    } else {
      path = `/v1/entities/${identifier}`;
    }

    const response = await this.httpClient.patch<ApiEntityResponse>(
      path,
      data
    );

    return this.transformEntity(response.entity);
  }

  /**
   * Delete an entity
   * 
   * @param identifier - Entity identifier
   * @param blueprint - Blueprint identifier (optional)
   * 
   * @throws {PortNotFoundError} If entity doesn't exist
   * 
   * @example
   * ```typescript
   * await client.entities.delete('my-service');
   * ```
   */
  async delete(identifier: string, blueprint?: string): Promise<void> {
    this.validateIdentifier(identifier);

    let path: string;
    if (blueprint) {
      path = `${this.basePath}/${blueprint}/entities/${identifier}`;
    } else {
      path = `/v1/entities/${identifier}`;
    }

    await this.httpClient.delete(path);
  }

  /**
   * List entities with optional filtering
   * 
   * @param options - Filter and pagination options
   * @returns Paginated list of entities
   * 
   * @example
   * ```typescript
   * // List all entities
   * const result = await client.entities.list();
   * 
   * // List entities of specific blueprint
   * const result = await client.entities.list({
   *   blueprint: 'service',
   *   limit: 50,
   * });
   * ```
   */
  async list(options?: ListEntityOptions): Promise<PaginatedResponse<Entity>> {
    let path: string;
    
    if (options?.blueprint) {
      path = this.buildUrl(
        `${this.basePath}/${options.blueprint}/entities`,
        {
          limit: options.limit,
          offset: options.offset,
          include: options.include?.join(','),
        }
      );
    } else {
      path = this.buildUrl('/v1/entities', {
        limit: options?.limit,
        offset: options?.offset,
        include: options?.include?.join(','),
      });
    }

    const response = await this.paginate<Entity>(path, options, 'entities');

    return {
      ...response,
      data: response.data.map(e => this.transformEntity(e)),
    };
  }

  /**
   * Search entities with advanced filtering
   * 
   * @param query - Search query with rules and filters
   * @returns Array of matching entities
   * 
   * @throws {PortValidationError} If query is invalid
   * 
   * @example
   * ```typescript
   * const entities = await client.entities.search({
   *   blueprint: 'service',
   *   rules: [
   *     { property: 'environment', operator: '=', value: 'production' },
   *     { property: 'status', operator: '=', value: 'healthy' },
   *   ],
   *   combinator: 'and',
   * });
   * ```
   */
  async search(query: EntitySearchQuery): Promise<Entity[]> {
    const path = '/v1/entities/search';
    
    const response = await this.httpClient.post<ApiEntitiesResponse>(
      path,
      query
    );

    return response.entities.map(e => this.transformEntity(e));
  }

  /**
   * Batch create entities
   * 
   * @param entities - Array of entities to create
   * @returns Array of created entities
   * 
   * @throws {PortValidationError} If any entity data is invalid
   * 
   * @example
   * ```typescript
   * const entities = await client.entities.batchCreate([
   *   { identifier: 'service-1', blueprint: 'service', title: 'Service 1' },
   *   { identifier: 'service-2', blueprint: 'service', title: 'Service 2' },
   * ]);
   * ```
   */
  async batchCreate(entities: CreateEntityInput[]): Promise<Entity[]> {
    entities.forEach(entity => this.validateCreateInput(entity));

    const response = await this.httpClient.post<ApiEntitiesResponse>(
      '/v1/entities/batch',
      { entities }
    );

    return response.entities.map(e => this.transformEntity(e));
  }

  /**
   * Batch update entities
   * 
   * @param updates - Array of entity updates
   * @returns Array of updated entities
   * 
   * @throws {PortValidationError} If any update is invalid
   * 
   * @example
   * ```typescript
   * const entities = await client.entities.batchUpdate([
   *   { identifier: 'service-1', data: { title: 'Updated 1' } },
   *   { identifier: 'service-2', data: { title: 'Updated 2' } },
   * ]);
   * ```
   */
  async batchUpdate(updates: BatchUpdateEntityInput[]): Promise<Entity[]> {
    updates.forEach(update => this.validateIdentifier(update.identifier));

    const response = await this.httpClient.patch<ApiEntitiesResponse>(
      '/v1/entities/batch',
      { updates }
    );

    return response.entities.map(e => this.transformEntity(e));
  }

  /**
   * Batch delete entities
   * 
   * @param identifiers - Array of entity identifiers to delete
   * 
   * @example
   * ```typescript
   * await client.entities.batchDelete(['service-1', 'service-2']);
   * ```
   */
  async batchDelete(identifiers: string[]): Promise<void> {
    identifiers.forEach(id => this.validateIdentifier(id));

    await this.httpClient.post('/v1/entities/batch/delete', {
      identifiers,
    });
  }

  /**
   * Get related entities
   * 
   * @param identifier - Entity identifier
   * @param relation - Relation name
   * @param blueprint - Blueprint identifier (optional)
   * @returns Array of related entities
   * 
   * @example
   * ```typescript
   * const dependencies = await client.entities.getRelated(
   *   'my-service',
   *   'dependencies'
   * );
   * ```
   */
  async getRelated(
    identifier: string,
    relation: string,
    blueprint?: string
  ): Promise<Entity[]> {
    this.validateIdentifier(identifier);

    let path: string;
    if (blueprint) {
      path = `${this.basePath}/${blueprint}/entities/${identifier}/relations/${relation}`;
    } else {
      path = `/v1/entities/${identifier}/relations/${relation}`;
    }

    const response = await this.httpClient.get<ApiEntitiesResponse>(path);
    return response.entities.map(e => this.transformEntity(e));
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreateEntityInput): void {
    if (!data.identifier || data.identifier.trim() === '') {
      throw new PortValidationError('Entity identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    if (!data.blueprint || data.blueprint.trim() === '') {
      throw new PortValidationError('Entity blueprint is required', [
        { field: 'blueprint', message: 'Required field' },
      ]);
    }

    // Validate identifier format
    if (!/^[a-zA-Z0-9_-]+$/.test(data.identifier)) {
      throw new PortValidationError(
        'Entity identifier must contain only alphanumeric characters, hyphens, and underscores',
        [
          {
            field: 'identifier',
            message: 'Invalid format',
            value: data.identifier,
          },
        ]
      );
    }
  }

  /**
   * Validate identifier
   */
  private validateIdentifier(identifier: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError('Entity identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
      throw new PortValidationError(
        'Entity identifier must contain only alphanumeric characters, hyphens, and underscores',
        [
          {
            field: 'identifier',
            message: 'Invalid format',
            value: identifier,
          },
        ]
      );
    }
  }

  /**
   * Transform API entity to SDK entity
   */
  private transformEntity(entity: ApiEntity | Entity): Entity {
    const result: any = { ...entity };
    if (result.createdAt) {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt) {
      result.updatedAt = new Date(result.updatedAt);
    }
    return result as Entity;
  }
}

