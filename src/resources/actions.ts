/**
 * Action resource for Port API
 * Handles action CRUD operations and execution
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type { Action, CreateActionInput, UpdateActionInput, ActionRun } from '../types/actions';

export interface ListActionsOptions {
  blueprint?: string;
}

export interface ExecuteActionInput {
  entityIdentifier?: string;
  properties?: Record<string, unknown>;
}

/**
 * ActionResource provides methods for managing Port actions
 */
export class ActionResource extends BaseResource {
  private readonly basePath = '/v1/actions';

  /**
   * Create a new action
   */
  async create(data: CreateActionInput): Promise<Action> {
    this.validateCreateInput(data);
    const response = await this.httpClient.post<{ action: any }>(this.basePath, data);
    return this.transformAction(response.action);
  }

  /**
   * Get an action by identifier
   */
  async get(identifier: string): Promise<Action> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<{ action: any }>(
      `${this.basePath}/${identifier}`
    );
    return this.transformAction(response.action);
  }

  /**
   * Update an action
   */
  async update(identifier: string, data: UpdateActionInput): Promise<Action> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.patch<{ action: any }>(
      `${this.basePath}/${identifier}`,
      data
    );
    return this.transformAction(response.action);
  }

  /**
   * Delete an action
   */
  async delete(identifier: string): Promise<void> {
    this.validateIdentifier(identifier);
    await this.httpClient.delete(`${this.basePath}/${identifier}`);
  }

  /**
   * List actions
   * @param options - Optional filter by blueprint
   */
  async list(options?: ListActionsOptions): Promise<Action[]> {
    let url: string;
    
    if (options?.blueprint) {
      url = `/v1/blueprints/${options.blueprint}/actions`;
    } else {
      url = this.basePath;
    }

    const response = await this.httpClient.get<{ actions: any[] }>(url);
    return (response.actions || []).map((action) => this.transformAction(action));
  }

  /**
   * Execute an action
   */
  async execute(
    actionIdentifier: string,
    input: ExecuteActionInput
  ): Promise<ActionRun> {
    this.validateIdentifier(actionIdentifier);

    const payload: any = {
      properties: input.properties,
    };

    if (input.entityIdentifier) {
      payload.entity = input.entityIdentifier;
    }

    const response = await this.httpClient.post<{ run: any }>(
      `${this.basePath}/${actionIdentifier}/runs`,
      payload
    );

    return this.transformRun(response.run);
  }

  /**
   * Get action run status
   */
  async getRun(runId: string): Promise<ActionRun> {
    if (!runId || runId.trim() === '') {
      throw new PortValidationError('Run ID is required', [
        { field: 'runId', message: 'Required field' },
      ]);
    }

    const response = await this.httpClient.get<{ run: any }>(
      `${this.basePath}/runs/${runId}`
    );

    return this.transformRun(response.run);
  }

  /**
   * List runs for an action
   */
  async listRuns(actionIdentifier: string): Promise<ActionRun[]> {
    this.validateIdentifier(actionIdentifier);

    const response = await this.httpClient.get<{ runs: any[] }>(
      `${this.basePath}/${actionIdentifier}/runs`
    );

    return (response.runs || []).map((run) => this.transformRun(run));
  }

  /**
   * Validate action identifier
   */
  private validateIdentifier(identifier: string): void {
    if (!identifier || identifier.trim() === '') {
      throw new PortValidationError('Action identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(identifier)) {
      throw new PortValidationError('Action identifier has invalid format', [
        { field: 'identifier', message: 'Must contain only alphanumeric characters, hyphens, and underscores' },
      ]);
    }
  }

  /**
   * Validate create input
   */
  private validateCreateInput(data: CreateActionInput): void {
    if (!data.identifier || data.identifier.trim() === '') {
      throw new PortValidationError('Action identifier is required', [
        { field: 'identifier', message: 'Required field' },
      ]);
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(data.identifier)) {
      throw new PortValidationError('Action identifier has invalid format', [
        { field: 'identifier', message: 'Must contain only alphanumeric characters, hyphens, and underscores' },
      ]);
    }

    if (!data.title || data.title.trim() === '') {
      throw new PortValidationError('Action title is required', [
        { field: 'title', message: 'Required field' },
      ]);
    }

    if (!data.blueprint || data.blueprint.trim() === '') {
      throw new PortValidationError('Action blueprint is required', [
        { field: 'blueprint', message: 'Required field' },
      ]);
    }
  }

  /**
   * Transform API action to SDK action (convert date strings)
   */
  private transformAction(action: any): Action {
    return {
      ...action,
      createdAt: action.createdAt ? new Date(action.createdAt) : undefined,
      updatedAt: action.updatedAt ? new Date(action.updatedAt) : undefined,
    };
  }

  /**
   * Transform API run to SDK run (convert date strings)
   */
  private transformRun(run: any): ActionRun {
    return {
      ...run,
      createdAt: run.createdAt ? new Date(run.createdAt) : undefined,
      updatedAt: run.updatedAt ? new Date(run.updatedAt) : undefined,
    };
  }
}

