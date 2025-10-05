/**
 * Action Run related types
 * 
 * Core types (ActionRun, ActionRunStatus, ActionRunReference, ActionRunApproval)
 * are defined in ./actions.ts and re-exported here.
 */

// Re-export core types from actions to avoid duplication
export type {
  ActionRun,
  ActionRunStatus,
  ActionRunReference,
  ActionRunApproval,
} from './actions';

/**
 * Options for listing action runs
 */
export interface ListActionRunsOptions {
  /** Filter by entity identifier */
  entity?: string;
  /** Filter by blueprint identifier */
  blueprint?: string;
  /** Filter by active/running status */
  active?: boolean;
  /** Filter by user email */
  userEmail?: string;
  /** Filter by user ID */
  userId?: string;
  /** Page number */
  page?: number;
  /** Page size */
  pageSize?: number;
}

/**
 * Options for getting an action run
 */
export interface GetActionRunOptions {
  /** Include logs in response */
  includeLogs?: boolean;
}

/**
 * Action run logs
 */
export interface ActionRunLogs {
  /** Run ID */
  runId: string;
  /** Log entries */
  logs: Array<{
    /** Timestamp */
    timestamp: string;
    /** Log message */
    message: string;
    /** Log level */
    level?: string;
  }>;
}

/**
 * Update action run approval
 */
export interface UpdateActionRunApprovalInput {
  /** Approval decision (true = approve, false = reject) */
  approved: boolean;
  /** Optional reason for the decision */
  reason?: string;
}

