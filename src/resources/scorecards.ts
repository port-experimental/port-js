/**
 * Scorecard resource for Port API
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type {
  Scorecard,
  CreateScorecardInput,
  UpdateScorecardInput,
} from '../types/scorecards';

/**
 * Resource for managing Port scorecards
 */
export class ScorecardResource extends BaseResource {
  private readonly basePath = '/v1/blueprints';

  /**
   * Create a new scorecard
   */
  async create(data: CreateScorecardInput): Promise<Scorecard> {
    this.validateCreateInput(data);

    const response = await this.httpClient.post<Scorecard>(
      `${this.basePath}/${data.blueprint}/scorecards`,
      data
    );

    return this.transformScorecard(response);
  }

  /**
   * Get a scorecard by identifier
   */
  async get(blueprint: string, identifier: string): Promise<Scorecard> {
    this.validateIdentifier(blueprint, 'blueprint');
    this.validateIdentifier(identifier, 'identifier');

    const response = await this.httpClient.get<Scorecard>(
      `${this.basePath}/${blueprint}/scorecards/${identifier}`
    );

    return this.transformScorecard(response);
  }

  /**
   * Update a scorecard
   */
  async update(
    blueprint: string,
    identifier: string,
    data: UpdateScorecardInput
  ): Promise<Scorecard> {
    this.validateIdentifier(blueprint, 'blueprint');
    this.validateIdentifier(identifier, 'identifier');

    const response = await this.httpClient.patch<Scorecard>(
      `${this.basePath}/${blueprint}/scorecards/${identifier}`,
      data
    );

    return this.transformScorecard(response);
  }

  /**
   * Delete a scorecard
   */
  async delete(blueprint: string, identifier: string): Promise<void> {
    this.validateIdentifier(blueprint, 'blueprint');
    this.validateIdentifier(identifier, 'identifier');

    await this.httpClient.delete(
      `${this.basePath}/${blueprint}/scorecards/${identifier}`
    );
  }

  /**
   * List all scorecards for a blueprint
   */
  async list(blueprint: string): Promise<Scorecard[]> {
    this.validateIdentifier(blueprint, 'blueprint');

    const response = await this.httpClient.get<{ scorecards: Scorecard[] }>(
      `${this.basePath}/${blueprint}/scorecards`
    );

    return response.scorecards.map((scorecard) =>
      this.transformScorecard(scorecard)
    );
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreateScorecardInput): void {
    const errors: Array<{ field: string; message: string }> = [];

    if (!data.identifier || data.identifier.trim() === '') {
      errors.push({ field: 'identifier', message: 'Identifier is required' });
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.identifier)) {
      errors.push({
        field: 'identifier',
        message:
          'Identifier must contain only alphanumeric characters, hyphens, and underscores',
      });
    }

    if (!data.title || data.title.trim() === '') {
      errors.push({ field: 'title', message: 'Title is required' });
    }

    if (!data.blueprint || data.blueprint.trim() === '') {
      errors.push({ field: 'blueprint', message: 'Blueprint is required' });
    }

    if (errors.length > 0) {
      throw new PortValidationError('Scorecard validation failed', errors);
    }
  }

  /**
   * Validate identifier
   */
  private validateIdentifier(identifier: string, fieldName: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError(`${fieldName} is required`, [
        { field: fieldName, message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform scorecard response (convert date strings to Date objects)
   */
  private transformScorecard(scorecard: Scorecard): Scorecard {
    return {
      ...scorecard,
      createdAt:
        typeof scorecard.createdAt === 'string'
          ? new Date(scorecard.createdAt)
          : scorecard.createdAt,
      updatedAt:
        typeof scorecard.updatedAt === 'string'
          ? new Date(scorecard.updatedAt)
          : scorecard.updatedAt,
    };
  }
}

