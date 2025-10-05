/**
 * Audit log related types
 */

/**
 * Audit log action types
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE';

/**
 * Audit log status
 */
export type AuditStatus = 'SUCCESS' | 'FAILURE';

/**
 * Audit log resource types
 */
export type AuditResource = 
  | 'Entity'
  | 'Blueprint'
  | 'Action'
  | 'Scorecard'
  | 'Team'
  | 'User'
  | 'Integration'
  | 'Webhook';

/**
 * Audit log entry
 */
export interface AuditLog {
  /** Unique identifier for the audit log */
  identifier: string;
  /** Action performed */
  action: AuditAction;
  /** Resource type */
  resourceType?: AuditResource;
  /** Status of the action */
  status: AuditStatus;
  /** User who performed the action */
  userId?: string;
  /** User email */
  userEmail?: string;
  /** Origin of the action (UI, API, Integration name) */
  origin?: string;
  /** Integration/installation ID if applicable */
  installationId?: string;
  /** Entity identifier if applicable */
  entity?: string;
  /** Blueprint identifier if applicable */
  blueprint?: string;
  /** Action run ID if applicable */
  runId?: string;
  /** Webhook ID if applicable */
  webhookId?: string;
  /** Webhook event ID if applicable */
  webhookEventId?: string;
  /** Timestamp of the action */
  timestamp: Date;
  /** Additional context/details */
  context?: Record<string, unknown>;
  /** Changes made (for UPDATE actions) */
  diff?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}

/**
 * Options for querying audit logs
 */
export interface QueryAuditLogsOptions {
  /** Filter by specific log identifier */
  identifier?: string;
  /** Filter by entity identifier */
  entity?: string;
  /** Filter by blueprint identifier */
  blueprint?: string;
  /** Filter by action run ID */
  runId?: string;
  /** Filter by webhook ID */
  webhookId?: string;
  /** Filter by webhook event ID */
  webhookEventId?: string;
  /** Filter by origin (integration name or 'UI') */
  origin?: string | string[];
  /** Filter by installation/integration ID */
  installationId?: string;
  /** Filter by resource types */
  resources?: AuditResource | AuditResource[];
  /** Filter by action type */
  action?: AuditAction;
  /** Filter by status */
  status?: AuditStatus;
  /** Start timestamp (ISO 8601 format) */
  from?: string | Date;
  /** End timestamp (ISO 8601 format) */
  to?: string | Date;
  /** Fields to include in response */
  includes?: string[];
  /** Maximum number of logs to return */
  limit?: number;
  /** Action type filter */
  actionType?: string;
}

