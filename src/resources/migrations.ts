/**
 * Migration resource operations
 * 
 * Provides methods for managing bulk data transformations in Port:
 * - List and get migrations
 * - Create new migrations
 * - Cancel running migrations
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Migration,
  CreateMigrationInput,
  CancelMigrationInput,
  ListMigrationsOptions,
} from '../types/migrations';
import type {
  ApiMigrationsResponse,
  ApiMigrationResponse,
  ApiMigration,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * Migration resource class
 * 
 * @example
 * ```typescript
 * const client = new PortClient({...});
 * 
 * // List all migrations
 * const migrations = await client.migrations.list();
 * 
 * // Create a migration
 * const migration = await client.migrations.create({
 *   sourceBlueprint: 'old-service',
 *   mapping: {
 *     blueprint: 'new-service',
 *     entity: {
 *       identifier: '.identifier',
 *       title: '.title',
 *     },
 *   },
 * });
 * 
 * // Cancel a migration
 * await client.migrations.cancel('migration-id', { reason: 'No longer needed' });
 * ```
 */
export class MigrationResource extends BaseResource {
  private readonly basePath = '/v1/migrations';

  /**
   * List all migrations
   * 
   * @param options - Optional filtering options and request options
   * @returns Array of migrations
   * 
   * @throws {PortAuthError} If authentication fails
   * 
   * @example
   * ```typescript
   * // List all migrations
   * const migrations = await client.migrations.list();
 * 
 * // Filter by status
 * const runningMigrations = await client.migrations.list({
 *   status: ['RUNNING', 'PENDING'],
 * });
 * 
 * // Filter by blueprint
 * const blueprintMigrations = await client.migrations.list({
 *   blueprint: 'service',
 * });
 * ```
   */
  async list(
    options?: ListMigrationsOptions & { requestOptions?: RequestOptions }
  ): Promise<Migration[]> {
    const url = this.buildUrl(this.basePath, {
      status: options?.status?.join(','),
      actor: options?.actor,
      blueprint: options?.blueprint,
    });

    const response = await this.httpClient.get<ApiMigrationsResponse>(
      url,
      options?.requestOptions
    );

    return (response.migrations || []).map((m) => this.transformMigration(m));
  }

  /**
   * Get a migration by ID
   * 
   * @param migrationId - Migration identifier
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The migration
   * 
   * @throws {PortValidationError} If migration ID is empty
   * @throws {PortNotFoundError} If migration doesn't exist
   * 
   * @example
   * ```typescript
   * const migration = await client.migrations.get('migration-123');
   * console.log(`Status: ${migration.status}`);
   * console.log(`Progress: ${migration.progress || 0}%`);
   * ```
   */
  async get(migrationId: string, options?: RequestOptions): Promise<Migration> {
    this.validateMigrationId(migrationId);

    const response = await this.httpClient.get<ApiMigrationResponse>(
      `${this.basePath}/${encodeURIComponent(migrationId)}`,
      options
    );

    return this.transformMigration(response.migration);
  }

  /**
   * Create a new migration
   * 
   * @param data - Migration creation data
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The created migration
   * 
   * @throws {PortValidationError} If migration data is invalid
   * 
   * @example
   * ```typescript
   * const migration = await client.migrations.create({
   *   sourceBlueprint: 'old-service',
   *   mapping: {
   *     blueprint: 'new-service',
   *     filter: '.environment == "production"',
   *     entity: {
   *       identifier: '.identifier',
   *       title: '.title',
   *       properties: {
   *         environment: '.environment',
   *         region: '.region',
   *       },
   *     },
   *   },
   * });
   * ```
   */
  async create(
    data: CreateMigrationInput,
    options?: RequestOptions
  ): Promise<Migration> {
    this.validateCreateInput(data);

    const response = await this.httpClient.post<ApiMigrationResponse>(
      this.basePath,
      data,
      options
    );

    return this.transformMigration(response.migration);
  }

  /**
   * Cancel a running migration
   * 
   * @param migrationId - Migration identifier
   * @param data - Optional cancellation reason
   * @param options - Optional request options (timeout, headers, signal)
   * @returns Success indicator
   * 
   * @throws {PortValidationError} If migration ID is empty
   * @throws {PortNotFoundError} If migration doesn't exist
   * 
   * @example
   * ```typescript
   * await client.migrations.cancel('migration-123', {
   *   reason: 'Migration no longer needed',
   * });
   * ```
   */
  async cancel(
    migrationId: string,
    data?: CancelMigrationInput,
    options?: RequestOptions
  ): Promise<void> {
    this.validateMigrationId(migrationId);

    await this.httpClient.post<{ ok: boolean }>(
      `${this.basePath}/${encodeURIComponent(migrationId)}/cancel`,
      data || {},
      options
    );
  }

  /**
   * Validate migration ID
   */
  private validateMigrationId(migrationId: string): void {
    if (!migrationId || migrationId.trim() === '') {
      throw new PortValidationError('Migration ID is required', [
        { field: 'migrationId', message: 'Required field' },
      ]);
    }
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreateMigrationInput): void {
    if (!data.sourceBlueprint || data.sourceBlueprint.trim() === '') {
      throw new PortValidationError('Source blueprint is required', [
        { field: 'sourceBlueprint', message: 'Required field' },
      ]);
    }

    if (!data.mapping) {
      throw new PortValidationError('Mapping is required', [
        { field: 'mapping', message: 'Required field' },
      ]);
    }

    if (!data.mapping.entity) {
      throw new PortValidationError('Entity mapping is required', [
        { field: 'mapping.entity', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API migration to SDK migration
   */
  private transformMigration(
    apiMigration: ApiMigration | Migration
  ): Migration {
    const result: any = { ...apiMigration };

    // Transform date strings to Date objects
    if (result.createdAt && typeof result.createdAt === 'string') {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt && typeof result.updatedAt === 'string') {
      result.updatedAt = new Date(result.updatedAt);
    }
    if (result.completedAt && typeof result.completedAt === 'string') {
      result.completedAt = new Date(result.completedAt);
    }

    return result as Migration;
  }
}

