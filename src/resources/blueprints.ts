/**
 * Blueprint resource for Port API
 * Handles blueprint CRUD operations
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type { Blueprint, CreateBlueprintInput, UpdateBlueprintInput } from '../types/blueprints';

/**
 * BlueprintResource provides methods for managing Port blueprints
 */
export class BlueprintResource extends BaseResource {
  private readonly basePath = '/v1/blueprints';

  /**
   * Create a new blueprint
   */
  async create(data: CreateBlueprintInput): Promise<Blueprint> {
    this.validateCreateInput(data);
    const response = await this.httpClient.post<{ blueprint: any }>(this.basePath, data);
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Get a blueprint by identifier
   */
  async get(identifier: string): Promise<Blueprint> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<{ blueprint: any }>(
      `${this.basePath}/${identifier}`
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Update a blueprint
   */
  async update(identifier: string, data: UpdateBlueprintInput): Promise<Blueprint> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.patch<{ blueprint: any }>(
      `${this.basePath}/${identifier}`,
      data
    );
    return this.transformBlueprint(response.blueprint);
  }

  /**
   * Delete a blueprint
   */
  async delete(identifier: string): Promise<void> {
    this.validateIdentifier(identifier);
    await this.httpClient.delete(`${this.basePath}/${identifier}`);
  }

  /**
   * List all blueprints
   */
  async list(): Promise<Blueprint[]> {
    const response = await this.httpClient.get<{ blueprints: any[] }>(this.basePath);
    return (response.blueprints || []).map((bp) => this.transformBlueprint(bp));
  }

  /**
   * Get relations for a blueprint
   */
  async getRelations(identifier: string): Promise<any[]> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<{ relations: any[] }>(
      `${this.basePath}/${identifier}/relations`
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
  private transformBlueprint(blueprint: any): Blueprint {
    return {
      ...blueprint,
      createdAt: blueprint.createdAt ? new Date(blueprint.createdAt) : undefined,
      updatedAt: blueprint.updatedAt ? new Date(blueprint.updatedAt) : undefined,
    };
  }
}

