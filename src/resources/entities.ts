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
  EntityAggregationInput,
  EntityPropertiesHistoryInput,
  ApiEntity,
  ApiEntityResponse,
  ApiEntitiesResponse,
  ApiItemResponse,
} from '../types';
import type { RequestOptions } from '../http-client';

type EntityRequestOptions = RequestOptions & { blueprint?: string };

interface AggregationApiResponse {
  ok?: boolean;
  aggregation?: Record<string, unknown>;
  [key: string]: unknown;
}

interface PropertyHistoryApiResponse {
  ok?: boolean;
  history?: Record<string, unknown>[];
  [key: string]: unknown;
}

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
  async create(data: CreateEntityInput, options?: RequestOptions): Promise<Entity> {
    this.validateCreateInput(data);

    const response = await this.httpClient.post<ApiEntityResponse>(
      `${this.basePath}/${encodeURIComponent(data.blueprint)}/entities`,
      data,
      options
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
  async get(identifier: string, options?: EntityRequestOptions): Promise<Entity> {
    this.validateIdentifierFormat(identifier);
    const path = options?.blueprint
      ? `${this.basePath}/${encodeURIComponent(options.blueprint)}/entities/${encodeURIComponent(identifier)}`
      : `/v1/entities/${encodeURIComponent(identifier)}`;
    const response = await this.httpClient.get<ApiEntityResponse>(path, options);
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
    options?: EntityRequestOptions
  ): Promise<Entity> {
    this.validateIdentifierFormat(identifier);
    const path = options?.blueprint
      ? `${this.basePath}/${encodeURIComponent(options.blueprint)}/entities/${encodeURIComponent(identifier)}`
      : `/v1/entities/${encodeURIComponent(identifier)}`;
    const response = await this.httpClient.patch<ApiEntityResponse>(path, data, options);
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
  async delete(identifier: string, options?: EntityRequestOptions): Promise<void> {
    this.validateIdentifierFormat(identifier);
    const path = options?.blueprint
      ? `${this.basePath}/${encodeURIComponent(options.blueprint)}/entities/${encodeURIComponent(identifier)}`
      : `/v1/entities/${encodeURIComponent(identifier)}`;
    await this.httpClient.delete(path, options);
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
    const { blueprint, ...paginatorOptions } = options || {};
    const path = blueprint
      ? `${this.basePath}/${encodeURIComponent(blueprint)}/entities`
      : '/v1/entities';

    const response = await this.paginate<Entity>(path, paginatorOptions, 'entities');

    return {
      ...response,
      data: response.data.map(e => this.transformEntity(e)),
    };
  }

  /**
   * Stream all entities using an async generator
   * 
   * @param options - Filter and pagination options
   * @yields Entities one by one
   * 
   * @example
   * ```typescript
   * for await (const entity of client.entities.stream({ blueprint: 'service' })) {
   *   console.log(entity.identifier);
   * }
   * ```
   */
  async *stream(options?: ListEntityOptions): AsyncIterableIterator<Entity> {
    let path: string;
    const { blueprint, ...paginationOptions } = options || {};

    if (blueprint) {
      path = `${this.basePath}/${encodeURIComponent(blueprint)}/entities`;
    } else {
      path = '/v1/entities';
    }
    for await (const entity of super.streamPaginated<Entity>(path, paginationOptions, 'entities')) {
      yield this.transformEntity(entity);
    }
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
  async search(query: EntitySearchQuery, options?: RequestOptions): Promise<Entity[]> {
    const path = '/v1/entities/search';

    const response = await this.httpClient.post<ApiEntitiesResponse>(
      path,
      query,
      options
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
  async batchCreate(entities: CreateEntityInput[], options?: RequestOptions): Promise<Entity[]> {
    entities.forEach(entity => this.validateCreateInput(entity));

    const response = await this.httpClient.post<ApiEntitiesResponse>(
      '/v1/entities/batch',
      { entities },
      options
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
  async batchUpdate(updates: BatchUpdateEntityInput[], options?: RequestOptions): Promise<Entity[]> {
    updates.forEach(update => this.validateIdentifierFormat(update.identifier));

    const response = await this.httpClient.patch<ApiEntitiesResponse>(
      '/v1/entities/batch',
      { updates },
      options
    );

    return response.entities.map(e => this.transformEntity(e));
  }

  /**
   * Aggregate entities based on rules
   * 
   * @param input - Aggregation configuration
   * @param options - Optional request options
   * @returns Aggregation results
   */
  async aggregate(input: EntityAggregationInput, options?: RequestOptions): Promise<Record<string, unknown>> {
    const response = await this.httpClient.post<AggregationApiResponse>('/v1/entities/aggregate', input, options);
    return response.aggregation ?? response;
  }

  /**
   * Aggregate entities over time
   *
   * @param input - Aggregation configuration
   * @param options - Optional request options
   * @returns Aggregation over time results
   */
  async aggregateOverTime(input: EntityAggregationInput, options?: RequestOptions): Promise<Record<string, unknown>> {
    const response = await this.httpClient.post<AggregationApiResponse>(
      '/v1/entities/aggregate-over-time',
      input,
      options
    );
    return response.aggregation ?? response;
  }

  /**
   * Fetch history of entity properties
   *
   * @param input - History request configuration
   * @param options - Optional request options
   * @returns Historical property values
   */
  async getPropertiesHistory(
    input: EntityPropertiesHistoryInput,
    options?: RequestOptions
  ): Promise<Record<string, unknown>[] | Record<string, unknown>> {
    const response = await this.httpClient.post<PropertyHistoryApiResponse>(
      '/v1/entities/properties-history',
      input,
      options
    );
    return response.history ?? response;
  }

  /**
   * Get entity count for a blueprint
   * 
   * @param blueprintIdentifier - Blueprint identifier
   * @param options - Optional request options
   * @returns Number of entities in the blueprint
   */
  async getCount(blueprintIdentifier: string, options?: RequestOptions): Promise<number> {
    const response = await this.httpClient.get<ApiItemResponse<number>>(
      `/v1/blueprints/${encodeURIComponent(blueprintIdentifier)}/entities-count`,
      options
    );
    return response.count as number;
  }

  /**
   * Delete all entities of a blueprint
   * 
   * @param blueprintIdentifier - Blueprint identifier
   * @param options - Deletion options (run_id, delete_blueprint)
   */
  async deleteAll(
    blueprintIdentifier: string,
    options?: { run_id?: string; delete_blueprint?: boolean; requestOptions?: RequestOptions }
  ): Promise<void> {
    const url = this.buildUrl(
      `/v1/blueprints/${encodeURIComponent(blueprintIdentifier)}/all-entities`,
      {
        run_id: options?.run_id,
        delete_blueprint: options?.delete_blueprint,
      }
    );
    await this.httpClient.delete(url, options?.requestOptions);
  }

  /**
   * Bulk delete entities of a blueprint
   * 
   * @param blueprintIdentifier - Blueprint identifier
   * @param identifiers - Array of entity identifiers to delete
   * @param options - Deletion options (delete_dependents, run_id)
   * @returns Array of deleted entity identifiers
   */
  async bulkDelete(
    blueprintIdentifier: string,
    identifiers: string[],
    options?: { delete_dependents?: boolean; run_id?: string; requestOptions?: RequestOptions }
  ): Promise<string[]> {
    const url = this.buildUrl(
      `/v1/blueprints/${encodeURIComponent(blueprintIdentifier)}/bulk/entities/delete`,
      {
        delete_dependents: options?.delete_dependents ?? false,
        run_id: options?.run_id,
      }
    );
    const response = await this.httpClient.post<any>(
      url,
      { entities: identifiers },
      options?.requestOptions
    );
    return response.deletedEntities || [];
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
  async batchDelete(identifiers: string[], options?: RequestOptions): Promise<void> {
    identifiers.forEach(id => this.validateIdentifierFormat(id));

    await this.httpClient.post('/v1/entities/batch/delete', {
      identifiers,
    }, options);
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
    options?: EntityRequestOptions
  ): Promise<Entity[]> {
    this.validateIdentifierFormat(identifier);
    const path = options?.blueprint
      ? `${this.basePath}/${encodeURIComponent(options.blueprint)}/entities/${encodeURIComponent(identifier)}/relations/${encodeURIComponent(relation)}`
      : `/v1/entities/${encodeURIComponent(identifier)}/relations/${encodeURIComponent(relation)}`;
    const response = await this.httpClient.get<ApiEntitiesResponse>(path, options);
    return response.entities.map(e => this.transformEntity(e));
  }

  private validateIdentifierFormat(identifier: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError('Entity identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
      throw new PortValidationError(
        'Entity identifier must contain only alphanumeric characters, hyphens, and underscores',
        [{ field: 'identifier', message: 'Invalid format', value: identifier }]
      );
    }
  }

  private validateCreateInput(data: CreateEntityInput): void {
    this.validateIdentifierFormat(data.identifier);
    if (!data.blueprint || data.blueprint.trim() === '') {
      throw new PortValidationError('Entity blueprint is required', [
        { field: 'blueprint', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API entity to SDK entity
   */
  private transformEntity(entity: ApiEntity | Entity): Entity {
    return this.transformTimestamps(entity) as Entity;
  }
}

