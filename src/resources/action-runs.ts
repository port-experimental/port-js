/**
 * Action run resource operations
 */

import { BaseResource } from './base';
import type { HttpClient, RequestOptions } from '../http-client';
import type {
  ActionRun,
  ListActionRunsOptions,
  ActionRunLogs,
  UpdateActionRunApprovalInput,
  ActionRunStatus,
  ActionRunReference,
} from '../types/action-runs';
import { PortValidationError } from '../errors';

/**
 * API response wrappers
 */
interface ApiActionRunResponse {
  run: {
    id: string;
    status: ActionRunStatus;
    statusLabel?: string;
    action: ActionRunReference;
    blueprint?: ActionRunReference;
    entity?: ActionRunReference;
    properties?: Record<string, unknown>;
    rawProperties?: Record<string, unknown>;
    payload?: unknown;
    response?: unknown;
    summary?: string;
    link?: string;
    source?: string;
    approval?: {
      required: boolean;
      status?: string;
      approvers?: string[];
    };
    requiredApproval?: boolean;
    createdBy?: string;
    impersonatedBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
    endedAt?: string;
  };
  ok: boolean;
}

interface ApiActionRunsResponse {
  runs: Array<ApiActionRunResponse['run']>;
  ok: boolean;
}

interface ApiActionRunLogsResponse {
  logs: Array<{
    timestamp: string;
    message: string;
    level?: string;
  }>;
  ok: boolean;
}

/**
 * ActionRunResource handles action run operations
 * 
 * Action runs are created when actions are executed.
 * This resource provides read-only access to view and monitor runs.
 */
export class ActionRunResource extends BaseResource {
  private readonly basePath = '/v1/actions/runs';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   * Get an action run by ID
   * 
   * @param runId - Action run ID
   * @param options - Get options
   * @param requestOptions - Request options
   * @returns The action run
   * 
   * @example
   * ```typescript
   * const run = await client.actionRuns.get('run-123');
   * console.log(`Run status: ${run.status}`);
   * console.log(`Action: ${run.action.identifier}`);
   * ```
   */
  async get(
    runId: string,
    requestOptions?: RequestOptions
  ): Promise<ActionRun> {
    this.validateRunId(runId);

    const response = await this.httpClient.get<ApiActionRunResponse>(
      `${this.basePath}/${runId}`,
      requestOptions
    );

    return this.transformActionRun(response.run);
  }

  /**
   * List action runs with optional filtering
   * 
   * @param options - List options for filtering
   * @param requestOptions - Request options
   * @returns Array of action runs
   * 
   * @example
   * ```typescript
   * // List all runs
   * const runs = await client.actionRuns.list();
   * 
   * // List active runs
   * const activeRuns = await client.actionRuns.list({ active: true });
   * 
   * // List runs for a specific entity
   * const entityRuns = await client.actionRuns.list({
   *   entity: 'my-entity',
   *   blueprint: 'service'
   * });
   * ```
   */
  async list(
    options?: ListActionRunsOptions,
    requestOptions?: RequestOptions
  ): Promise<ActionRun[]> {
    const url = this.buildUrl(this.basePath, {
      entity: options?.entity,
      blueprint: options?.blueprint,
      active: options?.active,
      user_email: options?.userEmail,
      user_id: options?.userId,
      page: options?.page,
      pageSize: options?.pageSize,
    });

    const response = await this.httpClient.get<ApiActionRunsResponse>(
      url,
      requestOptions
    );

    return (response.runs || []).map((run) => this.transformActionRun(run));
  }

  /**
   * List action runs for a specific action
   * 
   * @param actionIdentifier - Action identifier
   * @param options - List options
   * @param requestOptions - Request options
   * @returns Array of action runs
   * 
   * @example
   * ```typescript
   * const runs = await client.actionRuns.listForAction('deploy_service');
   * console.log(`Found ${runs.length} runs for action`);
   * ```
   */
  async listForAction(
    actionIdentifier: string,
    options?: ListActionRunsOptions,
    requestOptions?: RequestOptions
  ): Promise<ActionRun[]> {
    this.validateIdentifier(actionIdentifier, 'actionIdentifier');

    const url = this.buildUrl(
      `/v1/actions/${encodeURIComponent(actionIdentifier)}/runs`,
      {
        entity: options?.entity,
        blueprint: options?.blueprint,
        active: options?.active,
        user_email: options?.userEmail,
        user_id: options?.userId,
        page: options?.page,
        pageSize: options?.pageSize,
      }
    );

    const response = await this.httpClient.get<ApiActionRunsResponse>(
      url,
      requestOptions
    );

    return (response.runs || []).map((run) => this.transformActionRun(run));
  }

  /**
   * Get logs for an action run
   * 
   * @param runId - Action run ID
   * @param options - Request options
   * @returns Action run logs
   * 
   * @example
   * ```typescript
   * const logs = await client.actionRuns.getLogs('run-123');
   * logs.logs.forEach(log => {
   *   console.log(`[${log.timestamp}] ${log.message}`);
   * });
   * ```
   */
  async getLogs(
    runId: string,
    options?: RequestOptions
  ): Promise<ActionRunLogs> {
    this.validateRunId(runId);

    const response = await this.httpClient.get<ApiActionRunLogsResponse>(
      `${this.basePath}/${runId}/logs`,
      options
    );

    return {
      runId,
      logs: response.logs || [],
    };
  }

  /**
   * Update action run approval status
   * 
   * @param runId - Action run ID
   * @param data - Approval decision
   * @param options - Request options
   * @returns Updated action run
   * 
   * @example
   * ```typescript
   * // Approve a run
   * await client.actionRuns.updateApproval('run-123', {
   *   approved: true,
   *   reason: 'Changes look good'
   * });
   * 
   * // Reject a run
   * await client.actionRuns.updateApproval('run-123', {
   *   approved: false,
   *   reason: 'Security concerns'
   * });
   * ```
   */
  async updateApproval(
    runId: string,
    data: UpdateActionRunApprovalInput,
    options?: RequestOptions
  ): Promise<ActionRun> {
    this.validateRunId(runId);

    const response = await this.httpClient.post<ApiActionRunResponse>(
      `${this.basePath}/${runId}/approval`,
      data,
      options
    );

    return this.transformActionRun(response.run);
  }

  /**
   * Transform API action run to SDK action run
   */
  private transformActionRun(apiRun: ApiActionRunResponse['run']): ActionRun {
    return {
      id: apiRun.id,
      status: apiRun.status,
      statusLabel: apiRun.statusLabel,
      action: apiRun.action,
      blueprint: apiRun.blueprint,
      entity: apiRun.entity,
      properties: apiRun.properties,
      rawProperties: apiRun.rawProperties,
      payload: apiRun.payload,
      response: apiRun.response,
      summary: apiRun.summary,
      link: apiRun.link,
      source: apiRun.source,
      approval: apiRun.approval,
      requiredApproval: apiRun.requiredApproval,
      createdBy: apiRun.createdBy,
      impersonatedBy: apiRun.impersonatedBy,
      updatedBy: apiRun.updatedBy,
      createdAt: new Date(apiRun.createdAt),
      updatedAt: new Date(apiRun.updatedAt),
      endedAt: apiRun.endedAt ? new Date(apiRun.endedAt) : undefined,
    };
  }

  /**
   * Validate run ID
   */
  private validateRunId(runId: string): void {
    if (!runId || runId.trim() === '') {
      throw new PortValidationError('Run ID is required', [
        { field: 'runId', message: 'Required field' },
      ]);
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
}

