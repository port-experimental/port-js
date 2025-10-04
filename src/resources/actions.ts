/**
 * Action resource for Port API
 * Handles action CRUD operations and execution
 */

import { BaseResource } from './base';
import { PortValidationError } from '../errors';
import type { Action, CreateActionInput, UpdateActionInput, ActionRun } from '../types/actions';
import type {
  ApiActionResponse,
  ApiActionsResponse,
  ApiActionRunResponse,
  ApiActionRunsResponse,
  ApiAction,
  ApiActionRun,
} from '../types/responses';
import type { RequestOptions } from '../http-client';

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
   * 
   * @param data - Action creation data
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The created action
   * 
   * @example
   * ```typescript
   * const action = await client.actions.create({
   *   identifier: 'deploy-to-prod',
   *   title: 'Deploy to Production',
   *   blueprint: 'service',
   *   trigger: 'DAY-2',
   *   invocationMethod: {
   *     type: 'WEBHOOK',
   *     url: 'https://example.com/deploy',
   *     agent: false
   *   }
   * });
   * console.log(`Created action: ${action.identifier}`);
   * ```
   */
  async create(data: CreateActionInput, options?: RequestOptions): Promise<Action> {
    this.validateCreateInput(data);
    
    // Remove blueprint from request body - API doesn't accept it as a property
    const { blueprint, ...actionData } = data;
    
    // Always use /v1/actions endpoint (blueprint-specific endpoint is deprecated)
    const response = await this.httpClient.post<ApiActionResponse>(this.basePath, actionData, options);
    return this.transformAction(response.action);
  }

  /**
   * Get an action by identifier
   */
  async get(identifier: string, options?: RequestOptions): Promise<Action> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.get<ApiActionResponse>(
      `${this.basePath}/${identifier}`,
      options
    );
    return this.transformAction(response.action);
  }

  /**
   * Update an action
   */
  async update(identifier: string, data: UpdateActionInput, options?: RequestOptions): Promise<Action> {
    this.validateIdentifier(identifier);
    const response = await this.httpClient.patch<ApiActionResponse>(
      `${this.basePath}/${identifier}`,
      data,
      options
    );
    return this.transformAction(response.action);
  }

  /**
   * Delete an action
   */
  async delete(identifier: string, options?: RequestOptions): Promise<void> {
    this.validateIdentifier(identifier);
    await this.httpClient.delete(`${this.basePath}/${identifier}`, options);
  }

  /**
   * List actions
   * @param options - Optional filter by blueprint
   */
  async list(options?: ListActionsOptions & { requestOptions?: RequestOptions }): Promise<Action[]> {
    // Always use /v1/actions endpoint, pass blueprint as query parameter
    let url = this.basePath;
    
    if (options?.blueprint) {
      url = `${url}?blueprint_identifier=${encodeURIComponent(options.blueprint)}`;
    }

    const response = await this.httpClient.get<ApiActionsResponse>(url, options?.requestOptions);
    return (response.actions || []).map((action) => this.transformAction(action));
  }

  /**
   * Execute an action
   * 
   * @param actionIdentifier - Action identifier
   * @param input - Execution input (entityIdentifier and/or properties)
   * @param options - Optional request options (timeout, headers, signal)
   * @returns The action run status
   * 
   * @example
   * ```typescript
   * // Execute action on an entity
   * const run = await client.actions.execute('deploy-to-prod', {
   *   entityIdentifier: 'user-service',
   *   properties: {
   *     environment: 'production',
   *     version: 'v1.2.3'
   *   }
   * });
   * console.log(`Run ID: ${run.id}, Status: ${run.status}`);
   * 
   * // Execute global action (no entity)
   * const globalRun = await client.actions.execute('backup-database', {
   *   properties: {
   *     timestamp: Date.now()
   *   }
   * });
   * ```
   */
  async execute(
    actionIdentifier: string,
    input: ExecuteActionInput,
    options?: RequestOptions
  ): Promise<ActionRun> {
    this.validateIdentifier(actionIdentifier);

    const payload: Record<string, unknown> = {
      properties: input.properties,
    };

    if (input.entityIdentifier) {
      payload.entity = input.entityIdentifier;
    }

    const response = await this.httpClient.post<ApiActionRunResponse>(
      `${this.basePath}/${actionIdentifier}/runs`,
      payload,
      options
    );

    return this.transformRun(response.run);
  }

  /**
   * Get action run status
   */
  async getRun(runId: string, options?: RequestOptions): Promise<ActionRun> {
    if (!runId || runId.trim() === '') {
      throw new PortValidationError('Run ID is required', [
        { field: 'runId', message: 'Required field' },
      ]);
    }

    const response = await this.httpClient.get<ApiActionRunResponse>(
      `${this.basePath}/runs/${runId}`,
      options
    );

    return this.transformRun(response.run);
  }

  /**
   * List runs for an action
   */
  async listRuns(actionIdentifier: string, options?: RequestOptions): Promise<ActionRun[]> {
    this.validateIdentifier(actionIdentifier);

    const response = await this.httpClient.get<ApiActionRunsResponse>(
      `${this.basePath}/${actionIdentifier}/runs`,
      options
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
  private transformAction(action: ApiAction | Action): Action {
    const result: any = { ...action };
    if (result.createdAt) {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.updatedAt) {
      result.updatedAt = new Date(result.updatedAt);
    }
    return result as Action;
  }

  /**
   * Transform API run to SDK run (convert date strings)
   */
  private transformRun(run: ApiActionRun | ActionRun): ActionRun {
    const result: any = { ...run };
    if (result.createdAt) {
      result.createdAt = new Date(result.createdAt);
    }
    if (result.triggeredAt) {
      result.triggeredAt = new Date(result.triggeredAt);
    }
    return result as ActionRun;
  }
}

