/**
 * Blueprint resource for Port API
 * Handles blueprint CRUD operations
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type { Blueprint, CreateBlueprintInput, UpdateBlueprintInput } from '../types/blueprints';
import type {
  ApiBlueprintResponse,
  ApiBlueprintsResponse,
  ApiBlueprintRelationsResponse,
  ApiBlueprint,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

/**
 * BlueprintResource provides methods for managing Port blueprints
 */
export class BlueprintResource extends BaseResource {
  private readonly basePath = '/v1/blueprints';

  /**
   * Create a new blueprint
   */
  async create(data: CreateBlueprintInput, options?: RequestOptions): Promise<Blueprint> {
    this.validateCreateInput(data);
    const response = await this.httpClient.post<ApiBlueprintResponse>(this.basePath, data, options);
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Get a blueprint by identifier
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
   */
  async delete(identifier: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(identifier);
    await this.httpClient.delete(`${this.basePath}/${identifier}`, options);
  }

  /**
   * List all blueprints
   */
  async list(options?: RequestOptions): Promise<Blueprint[]> {
    const response = await this.httpClient.get<ApiBlueprintsResponse>(this.basePath, options);
    return (response.blueprints || []).map((bp) => this.transformBlueprint(bp));
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

