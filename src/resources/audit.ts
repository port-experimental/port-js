/**
 * Audit log resource operations
 */

import { BaseResource } from './base';
import type { HttpClient, RequestOptions } from '../http-client';
import type {
  AuditLog,
  QueryAuditLogsOptions,
} from '../types/audit';

/**
 * API response wrapper
 */
interface ApiAuditLogsResponse {
  auditLogs: Array<{
    identifier: string;
    action: string;
    resourceType?: string;
    status: string;
    userId?: string;
    userEmail?: string;
    origin?: string;
    installationId?: string;
    entity?: string;
    blueprint?: string;
    runId?: string;
    webhookId?: string;
    webhookEventId?: string;
    timestamp: string;
    context?: Record<string, unknown>;
    diff?: {
      before?: Record<string, unknown>;
      after?: Record<string, unknown>;
    };
  }>;
  ok: boolean;
}

/**
 * AuditResource handles audit log query operations
 * 
 * Audit logs are read-only records of actions performed in Port.
 * This resource provides querying and filtering capabilities.
 */
export class AuditResource extends BaseResource {
  private readonly basePath = '/v1/audit-log';

  constructor(httpClient: HttpClient) {
    super(httpClient);
  }

  /**
   * Query audit logs with optional filtering
   * 
   * @param options - Query options for filtering logs
   * @param requestOptions - Request options
   * @returns Array of audit log entries
   * 
   * @example
   * ```typescript
   * // Get all audit logs
   * const logs = await client.audit.query();
   * 
   * // Filter by entity
   * const entityLogs = await client.audit.query({
   *   entity: 'my-service',
   *   blueprint: 'service'
   * });
   * 
   * // Filter by time range
   * const recentLogs = await client.audit.query({
   *   from: '2025-10-01T00:00:00Z',
   *   to: '2025-10-04T23:59:59Z',
   *   action: 'UPDATE'
   * });
   * 
   * // Filter by action run
   * const runLogs = await client.audit.query({
   *   runId: 'run-123'
   * });
   * ```
   */
  async query(
    options?: QueryAuditLogsOptions,
    requestOptions?: RequestOptions
  ): Promise<AuditLog[]> {
    const url = this.buildUrl(this.basePath, {
      identifier: options?.identifier,
      entity: options?.entity,
      blueprint: options?.blueprint,
      run_id: options?.runId,
      webhookId: options?.webhookId,
      webhookEventId: options?.webhookEventId,
      origin: Array.isArray(options?.origin) ? options.origin.join(',') : options?.origin,
      InstallationId: options?.installationId,
      resources: Array.isArray(options?.resources) ? options.resources.join(',') : options?.resources,
      action: options?.action,
      status: options?.status,
      from: options?.from instanceof Date ? options.from.toISOString() : options?.from,
      to: options?.to instanceof Date ? options.to.toISOString() : options?.to,
      includes: options?.includes?.join(','),
      limit: options?.limit,
      actionType: options?.actionType,
    });

    const response = await this.httpClient.get<ApiAuditLogsResponse>(
      url,
      requestOptions
    );

    return (response.auditLogs || []).map((log) => this.transformAuditLog(log));
  }

  /**
   * Get audit logs for a specific entity
   * 
   * @param entityIdentifier - Entity identifier
   * @param blueprintIdentifier - Blueprint identifier
   * @param options - Additional query options
   * @param requestOptions - Request options
   * @returns Array of audit logs for the entity
   * 
   * @example
   * ```typescript
   * const logs = await client.audit.getEntityLogs(
   *   'my-service',
   *   'service',
   *   { limit: 50 }
   * );
   * ```
   */
  async getEntityLogs(
    entityIdentifier: string,
    blueprintIdentifier: string,
    options?: Omit<QueryAuditLogsOptions, 'entity' | 'blueprint'>,
    requestOptions?: RequestOptions
  ): Promise<AuditLog[]> {
    return this.query(
      {
        ...options,
        entity: entityIdentifier,
        blueprint: blueprintIdentifier,
      },
      requestOptions
    );
  }

  /**
   * Get audit logs for a specific action run
   * 
   * @param runId - Action run ID
   * @param options - Additional query options
   * @param requestOptions - Request options
   * @returns Array of audit logs for the run
   * 
   * @example
   * ```typescript
   * const logs = await client.audit.getRunLogs('run-123');
   * ```
   */
  async getRunLogs(
    runId: string,
    options?: Omit<QueryAuditLogsOptions, 'runId'>,
    requestOptions?: RequestOptions
  ): Promise<AuditLog[]> {
    return this.query(
      {
        ...options,
        runId,
      },
      requestOptions
    );
  }

  /**
   * Get audit logs by user
   * 
   * @param userEmail - User email address
   * @param options - Additional query options
   * @param requestOptions - Request options
   * @returns Array of audit logs for the user
   * 
   * @example
   * ```typescript
   * const userLogs = await client.audit.getUserLogs('alice@company.com');
   * ```
   */
  async getUserLogs(
    userEmail: string,
    options?: QueryAuditLogsOptions,
    requestOptions?: RequestOptions
  ): Promise<AuditLog[]> {
    const allLogs = await this.query(options, requestOptions);
    // Filter client-side by user email since API doesn't have a direct filter
    return allLogs.filter(log => log.userEmail === userEmail);
  }

  /**
   * Transform API audit log to SDK audit log
   */
  private transformAuditLog(apiLog: ApiAuditLogsResponse['auditLogs'][0]): AuditLog {
    return {
      identifier: apiLog.identifier,
      action: apiLog.action as any,
      resourceType: apiLog.resourceType as any,
      status: apiLog.status as any,
      userId: apiLog.userId,
      userEmail: apiLog.userEmail,
      origin: apiLog.origin,
      installationId: apiLog.installationId,
      entity: apiLog.entity,
      blueprint: apiLog.blueprint,
      runId: apiLog.runId,
      webhookId: apiLog.webhookId,
      webhookEventId: apiLog.webhookEventId,
      timestamp: new Date(apiLog.timestamp),
      context: apiLog.context,
      diff: apiLog.diff,
    };
  }
}

